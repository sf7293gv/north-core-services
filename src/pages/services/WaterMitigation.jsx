import ServicePage from './ServicePage'

export default function WaterMitigation() {
  return (
    <ServicePage
      serviceName="Water Mitigation"
      serviceKey="Water Mitigation"
      description="Water mitigation is about stopping damage before it spreads. We rapidly contain and control water intrusion to protect your structure, belongings, and air quality — reducing the overall cost of restoration."
      whatWeDoItems={[
        'Rapid containment of water spread',
        'Emergency board-up and tarping',
        'Content protection and pack-out',
        'Antimicrobial treatment',
        'Documentation for insurance claims',
        'Coordination with restoration teams',
      ]}
    />
  )
}
