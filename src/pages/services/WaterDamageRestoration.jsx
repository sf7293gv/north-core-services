import ServicePage from './ServicePage'

export default function WaterDamageRestoration() {
  return (
    <ServicePage
      serviceName="Water Damage Restoration"
      serviceKey="Water Damage Restoration"
      description="When water invades your home or business, every minute counts. Our certified technicians respond fast to extract water, dry affected areas, and restore your property to pre-damage condition — minimizing losses and preventing mold growth."
      whatWeDoItems={[
        'Emergency water extraction',
        'Industrial drying and dehumidification',
        'Moisture mapping and detection',
        'Structural drying',
        'Mold prevention treatment',
        'Full property restoration',
      ]}
    />
  )
}
