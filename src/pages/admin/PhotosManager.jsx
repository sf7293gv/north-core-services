// Run this SQL in Supabase Dashboard → SQL Editor before using the controls below:
//
//   alter table public.photos add column if not exists visible       boolean default true;
//   alter table public.photos add column if not exists display_order integer default 0;
//   alter table public.photos add column if not exists size          text    default 'medium'
//     check (size in ('small', 'medium', 'large'));
//
// Also create a public Storage bucket named "photos":
//   Supabase Dashboard → Storage → New bucket → Name: photos → Public: ON

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import Toast from './Toast'

const CATEGORIES = [
  'Water Damage Restoration',
  'Water Mitigation',
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

function buildGrouped(photos) {
  const map = {}
  CATEGORIES.forEach(cat => { map[cat] = [] })
  photos.forEach(p => {
    const cat = p.category ?? 'Other'
    if (!map[cat]) map[cat] = []
    map[cat].push(p)
  })
  return map
}

export default function PhotosManager() {
  const [photos, setPhotos]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [uploading, setUploading]     = useState(false)
  const [uploadCount, setUploadCount] = useState(0)
  const [deleting, setDeleting]       = useState(null)
  const [updating, setUpdating]       = useState(new Set())
  const [uploadErr, setUploadErr]     = useState(null)
  const [toast, setToast]             = useState(null)
  const [category, setCategory]   = useState(CATEGORIES[0])
  const [collapsed, setCollapsed] = useState(new Set())
  const fileRef = useRef(null)

  useEffect(() => { fetchPhotos() }, [])

  function showToast(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  async function fetchPhotos() {
    setLoading(true)
    const { data } = await supabase
      .from('photos')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
    setPhotos(data ?? [])
    setLoading(false)
  }

  function toggleCollapse(cat) {
    setCollapsed(prev => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }

  function markUpdating(id)   { setUpdating(prev => new Set(prev).add(id)) }
  function unmarkUpdating(id) { setUpdating(prev => { const s = new Set(prev); s.delete(id); return s }) }

  async function handleToggleVisible(photo) {
    const newVisible = !photo.visible
    console.log('[Photos] toggleVisible → id:', photo.id, '| setting visible:', newVisible)
    markUpdating(photo.id)

    const { data, error } = await supabase
      .from('photos')
      .update({ visible: newVisible })
      .eq('id', photo.id)
      .select()

    console.log('[Photos] toggleVisible response → data:', data, '| error:', error, '| rows affected:', data?.length ?? 0)

    if (error) {
      console.error('[Photos] toggleVisible Supabase error:', error)
      showToast('Failed to update visibility', 'error')
    } else if (!data || data.length === 0) {
      // 0 rows updated with no error = RLS blocking the write silently
      console.warn('[Photos] toggleVisible: 0 rows updated — RLS may be blocking authenticated updates on the photos table. Run: create policy "Allow auth updates" on public.photos for update using (auth.role() = \'authenticated\') with check (auth.role() = \'authenticated\');')
      showToast('Visibility not saved — RLS policy may need updating', 'warning')
    } else {
      setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, visible: newVisible } : p))
    }

    unmarkUpdating(photo.id)
  }

  async function handleSetSize(photo, size) {
    if ((photo.size ?? 'medium') === size) return
    console.log('[Photos] setSize → id:', photo.id, '| size:', size)
    markUpdating(photo.id)

    const { data, error } = await supabase
      .from('photos').update({ size }).eq('id', photo.id).select()

    console.log('[Photos] setSize response → data:', data, '| error:', error)

    if (error) {
      console.error('[Photos] setSize error:', error)
      showToast('Failed to update size', 'error')
    } else if (!data || data.length === 0) {
      console.warn('[Photos] setSize: 0 rows updated — RLS may be blocking')
      showToast('Size not saved — check RLS policy', 'warning')
    } else {
      setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, size } : p))
    }

    unmarkUpdating(photo.id)
  }

  async function handleSetOrder(photo, raw) {
    const val = parseInt(raw, 10)
    if (isNaN(val) || val === (photo.display_order ?? 0)) return
    console.log('[Photos] setOrder → id:', photo.id, '| display_order:', val)
    markUpdating(photo.id)

    const { data, error } = await supabase
      .from('photos').update({ display_order: val }).eq('id', photo.id).select()

    console.log('[Photos] setOrder response → data:', data, '| error:', error)

    if (error) {
      console.error('[Photos] setOrder error:', error)
      showToast('Failed to update order', 'error')
    } else if (!data || data.length === 0) {
      console.warn('[Photos] setOrder: 0 rows updated — RLS may be blocking')
      showToast('Order not saved — check RLS policy', 'warning')
    } else {
      setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, display_order: val } : p))
    }

    unmarkUpdating(photo.id)
  }

  async function handleUpload(e) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    setUploading(true)
    setUploadCount(files.length)
    setUploadErr(null)

    const catSlug = category.toLowerCase().replace(/\s+/g, '-')
    const base    = Date.now()

    const results = await Promise.all(
      files.map(async (file, idx) => {
        try {
          const ext  = file.name.split('.').pop()
          const path = `${catSlug}/${base}-${idx}.${ext}`

          const { data: storageData, error: storageErr } = await supabase.storage
            .from('photos').upload(path, file, { upsert: false })
          if (storageErr) throw storageErr

          const { data: { publicUrl } } = supabase.storage
            .from('photos').getPublicUrl(storageData.path)

          const { data: dbData, error: dbErr } = await supabase
            .from('photos')
            .insert([{ url: publicUrl, category, visible: true, display_order: 0, size: 'medium' }])
            .select()
          if (dbErr) {
            await supabase.storage.from('photos').remove([storageData.path])
            throw dbErr
          }

          return { ok: true, photo: dbData[0] }
        } catch (err) {
          console.error(`Failed to upload "${file.name}":`, err)
          return { ok: false, name: file.name }
        }
      })
    )

    const succeeded = results.filter(r => r.ok).map(r => r.photo)
    const failCount = results.filter(r => !r.ok).length

    if (succeeded.length > 0) {
      setPhotos(prev => [...succeeded, ...prev])
      setCollapsed(prev => { const next = new Set(prev); next.delete(category); return next })
    }

    if (failCount === 0) {
      showToast(
        `${succeeded.length} photo${succeeded.length !== 1 ? 's' : ''} uploaded successfully`,
        'success'
      )
    } else if (succeeded.length === 0) {
      showToast('Upload failed — check console for details', 'error')
    } else {
      showToast(
        `${succeeded.length} of ${files.length} photos uploaded. Some failed — check console.`,
        'warning'
      )
    }

    setUploading(false)
    setUploadCount(0)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleDelete(photo) {
    if (!window.confirm('Delete this photo?')) return
    setDeleting(photo.id)
    await supabase.storage.from('photos').remove([getStoragePath(photo.url)])
    await supabase.from('photos').delete().eq('id', photo.id)
    setPhotos(prev => prev.filter(p => p.id !== photo.id))
    setDeleting(null)
  }

  const grouped    = buildGrouped(photos)
  const totalCount = photos.length
  const catCount   = Object.values(grouped).filter(arr => arr.length > 0).length

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-4xl tracking-widest text-brand-white mb-1">PHOTOS</h1>
        <p className="text-brand-silver/60 text-sm">
          {loading
            ? 'Loading…'
            : `${totalCount} photo${totalCount !== 1 ? 's' : ''} across ${catCount} categor${catCount !== 1 ? 'ies' : 'y'}`}
        </p>
      </div>

      {/* Upload card */}
      <div className="rounded-xl border border-brand-electric/15 p-6 mb-8" style={{ background: '#0d1435' }}>
        <p className="font-display tracking-widest text-brand-white text-sm mb-4">UPLOAD PHOTO</p>
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-4">
          <div className="flex flex-col gap-1.5 w-full sm:w-auto">
            <label className="text-xs font-semibold tracking-wider uppercase text-brand-silver/60">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full sm:w-auto px-3 py-2.5 rounded-lg bg-brand-navy border border-brand-electric/20 text-brand-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-electric/40 transition-colors duration-200"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c} style={{ background: '#0d1435' }}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <label className="text-xs font-semibold tracking-wider uppercase text-brand-silver/60">Choose Images</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              disabled={uploading}
              className="block w-full text-sm text-brand-silver/70 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand-electric file:text-white file:text-sm file:font-semibold file:cursor-pointer hover:file:bg-[#2570e8] file:transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          {uploading && (
            <div className="flex items-center gap-2 text-brand-electric text-sm pb-0.5">
              <Spinner />
              Uploading {uploadCount} photo{uploadCount !== 1 ? 's' : ''}…
            </div>
          )}
        </div>
        {uploadErr && <p className="mt-3 text-red-400 text-xs">{uploadErr}</p>}
      </div>

      {/* Category sections */}
      {loading ? (
        <div className="flex items-center justify-center gap-3 py-16 text-brand-silver/50 text-sm">
          <Spinner /> Loading photos…
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {Object.entries(grouped).map(([cat, items]) => {
            const isCollapsed = collapsed.has(cat)
            return (
              <div key={cat} className="rounded-xl border border-brand-electric/12 overflow-hidden" style={{ background: '#0d1435' }}>

                {/* Section header */}
                <button
                  onClick={() => toggleCollapse(cat)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-brand-electric/5 transition-colors duration-150 text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-semibold text-sm text-brand-white truncate">{cat}</span>
                    <span className="text-xs text-brand-silver/60 shrink-0">({items.length})</span>
                  </div>
                  <ChevronIcon collapsed={isCollapsed} />
                </button>

                {/* Photos grid */}
                {!isCollapsed && (
                  <div className="px-5 pb-5 pt-1">
                    {items.length === 0 ? (
                      <p className="py-8 text-center text-sm text-brand-silver/40">
                        No photos yet — upload one above with category{' '}
                        <em className="not-italic text-brand-silver/60">{cat}</em>
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {items.map(photo => (
                          <PhotoCard
                            key={photo.id}
                            photo={photo}
                            isUpdating={updating.has(photo.id)}
                            isDeleting={deleting === photo.id}
                            onToggleVisible={handleToggleVisible}
                            onSetSize={handleSetSize}
                            onSetOrder={handleSetOrder}
                            onDelete={handleDelete}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}

/* ── PhotoCard ─────────────────────────────────────────────── */
function PhotoCard({ photo, isUpdating, isDeleting, onToggleVisible, onSetSize, onSetOrder, onDelete }) {
  const currentSize = photo.size ?? 'medium'
  const isBusy = isUpdating || isDeleting

  return (
    <div className="rounded-lg border border-brand-electric/10 overflow-hidden flex flex-col" style={{ background: '#070b1f' }}>

      {/* Image area */}
      <div className="relative h-36 shrink-0">
        <img
          src={photo.url}
          alt={photo.category}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Dim overlay when hidden */}
        {!photo.visible && !isUpdating && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
            <span className="text-white/70 text-[10px] font-bold tracking-widest uppercase">Hidden</span>
          </div>
        )}
        {/* Spinner overlay during any update */}
        {isUpdating && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none">
            <Spinner />
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div className="px-3 py-2.5 flex items-center justify-between gap-2 border-t border-brand-electric/10">

        {/* Left: visible toggle + S/M/L size */}
        <div className="flex items-center gap-2">
          {/* Toggle switch */}
          <button
            onClick={() => onToggleVisible(photo)}
            disabled={isBusy}
            title={photo.visible ? 'Visible — click to hide' : 'Hidden — click to show'}
            className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors duration-200 disabled:opacity-40 ${
              photo.visible ? 'bg-green-500' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-3 w-3 rounded-full bg-white shadow transition-transform duration-200 ${
                photo.visible ? 'translate-x-3.5' : 'translate-x-0.5'
              }`}
            />
          </button>

          {/* Size buttons */}
          <div className="flex overflow-hidden rounded border border-brand-electric/20">
            {['small', 'medium', 'large'].map(s => (
              <button
                key={s}
                onClick={() => onSetSize(photo, s)}
                disabled={isBusy}
                title={`Size: ${s}`}
                className={`px-1.5 py-0.5 text-[10px] font-bold transition-colors duration-150 disabled:opacity-40 ${
                  currentSize === s
                    ? 'bg-brand-electric text-white'
                    : 'text-brand-silver/50 hover:text-brand-electric hover:bg-brand-electric/10'
                }`}
              >
                {s[0].toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Right: order input + delete */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            defaultValue={photo.display_order ?? 0}
            onBlur={e => onSetOrder(photo, e.target.value)}
            disabled={isBusy}
            title="Display order — lower number shows first"
            className="w-10 text-center text-xs bg-brand-navy border border-brand-electric/20 rounded px-1 py-0.5 text-brand-silver focus:outline-none focus:ring-1 focus:ring-brand-electric/40 disabled:opacity-40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            onClick={() => onDelete(photo)}
            disabled={isBusy}
            aria-label="Delete photo"
            className="text-brand-silver/40 hover:text-red-400 transition-colors duration-150 disabled:opacity-30"
          >
            {isDeleting ? <Spinner /> : <TrashIcon />}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Icons ─────────────────────────────────────────────────── */
function ChevronIcon({ collapsed }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className={`text-brand-silver/50 shrink-0 transition-transform duration-200 ${collapsed ? '-rotate-90' : ''}`}
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
    </svg>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  )
}
