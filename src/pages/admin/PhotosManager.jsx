// NOTE: Before uploading photos, create a public Storage bucket named "photos" in your
// Supabase Dashboard → Storage → New bucket → Name: "photos" → Public: ON
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'

const CATEGORIES = [
  'Water Damage',
  'Fire Damage',
  'Mold Remediation',
  'Storm Damage',
  'Carpet Cleaning',
  'Insulation',
  'Before & After',
  'Other',
]

function getStoragePath(publicUrl) {
  const marker = '/storage/v1/object/public/photos/'
  const idx = publicUrl.indexOf(marker)
  return idx >= 0 ? publicUrl.slice(idx + marker.length) : publicUrl
}

export default function PhotosManager() {
  const [photos, setPhotos]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting]   = useState(null)
  const [uploadErr, setUploadErr] = useState(null)
  const [category, setCategory]   = useState(CATEGORIES[0])
  const fileRef = useRef(null)

  useEffect(() => {
    fetchPhotos()
  }, [])

  async function fetchPhotos() {
    setLoading(true)
    const { data } = await supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false })
    setPhotos(data ?? [])
    setLoading(false)
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadErr(null)

    const ext  = file.name.split('.').pop()
    const path = `${category.toLowerCase().replace(/\s+/g, '-')}/${Date.now()}.${ext}`

    const { data: storageData, error: storageErr } = await supabase.storage
      .from('photos')
      .upload(path, file, { upsert: false })

    if (storageErr) {
      setUploadErr(storageErr.message)
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(storageData.path)

    const { error: dbErr } = await supabase
      .from('photos')
      .insert([{ url: publicUrl, category }])

    if (dbErr) {
      setUploadErr(dbErr.message)
      await supabase.storage.from('photos').remove([storageData.path])
    } else {
      await fetchPhotos()
    }

    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleDelete(photo) {
    if (!window.confirm(`Delete this photo?`)) return
    setDeleting(photo.id)

    const path = getStoragePath(photo.url)
    await supabase.storage.from('photos').remove([path])
    await supabase.from('photos').delete().eq('id', photo.id)

    setPhotos(prev => prev.filter(p => p.id !== photo.id))
    setDeleting(null)
  }

  // Group by category
  const grouped = photos.reduce((acc, p) => {
    const cat = p.category ?? 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(p)
    return acc
  }, {})

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-4xl tracking-widest text-brand-white mb-1">PHOTOS</h1>
        <p className="text-brand-silver/60 text-sm">
          {loading ? 'Loading…' : `${photos.length} photo${photos.length !== 1 ? 's' : ''} across ${Object.keys(grouped).length} categories`}
        </p>
      </div>

      {/* Upload card */}
      <div
        className="rounded-xl border border-brand-electric/15 p-6 mb-8"
        style={{ background: '#0d1435' }}
      >
        <p className="font-display tracking-widest text-brand-white text-sm mb-4">UPLOAD PHOTO</p>

        <div className="flex flex-wrap items-end gap-4">
          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider uppercase text-brand-silver/60">
              Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="px-3 py-2.5 rounded-lg bg-brand-navy border border-brand-electric/20 text-brand-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-electric/40 transition-colors duration-200"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c} style={{ background: '#0d1435' }}>{c}</option>
              ))}
            </select>
          </div>

          {/* File input */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <label className="text-xs font-semibold tracking-wider uppercase text-brand-silver/60">
              Image File
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="block w-full text-sm text-brand-silver/70 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand-electric file:text-white file:text-sm file:font-semibold file:cursor-pointer hover:file:bg-[#2570e8] file:transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {uploading && (
            <div className="flex items-center gap-2 text-brand-electric text-sm pb-0.5">
              <Spinner />
              Uploading…
            </div>
          )}
        </div>

        {uploadErr && (
          <p className="mt-3 text-red-400 text-xs">{uploadErr}</p>
        )}
      </div>

      {/* Photo grid by category */}
      {loading ? (
        <div className="flex items-center justify-center gap-3 py-16 text-brand-silver/50 text-sm">
          <Spinner />
          Loading photos…
        </div>
      ) : photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-brand-silver/40">
          <ImageIcon size={32} />
          <span className="text-sm">No photos yet — upload your first one above</span>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <div className="flex items-center gap-3 mb-4">
                <span className="font-display tracking-widest text-brand-white text-sm">{cat.toUpperCase()}</span>
                <span className="text-xs text-brand-silver/40 bg-brand-electric/10 px-2 py-0.5 rounded-full">
                  {items.length}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {items.map(photo => (
                  <div
                    key={photo.id}
                    className="relative group rounded-lg overflow-hidden border border-brand-electric/10 aspect-square"
                    style={{ background: '#0d1435' }}
                  >
                    <img
                      src={photo.url}
                      alt={photo.category}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <button
                      onClick={() => handleDelete(photo)}
                      disabled={deleting === photo.id}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:cursor-wait"
                      aria-label="Delete photo"
                    >
                      {deleting === photo.id ? (
                        <Spinner />
                      ) : (
                        <TrashIcon />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Icons ─────────────────────────────────────────────────── */
function ImageIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
    </svg>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  )
}
