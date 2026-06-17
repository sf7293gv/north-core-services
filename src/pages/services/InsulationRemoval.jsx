import ServicePage from './ServicePage'

export default function InsulationRemoval() {
  return (
    <ServicePage
      serviceName="Insulation Removal & Restoration"
      serviceKey="Insulation"
      description="Damaged, wet, or contaminated insulation needs to be removed quickly and safely. Our team handles full insulation removal and reinstallation — improving your home's energy efficiency and air quality after disaster damage."
      whatWeDoItems={[
        'Safe removal of damaged insulation',
        'Attic and crawlspace cleanup',
        'Contamination and mold treatment',
        'New insulation installation',
        'Energy efficiency improvement',
        'Post-removal air quality check',
      ]}
    />
  )
}
