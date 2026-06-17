import ServicePage from './ServicePage'

export default function CarpetCleaning() {
  return (
    <ServicePage
      serviceName="Carpet Cleaning"
      serviceKey="Carpet Cleaning"
      description="Our professional carpet cleaning removes deep-set dirt, stains, allergens, and odors using industrial-grade equipment. Whether it's routine maintenance or post-disaster cleanup, we leave your carpets fresh, sanitized, and restored."
      whatWeDoItems={[
        'Hot water extraction (steam cleaning)',
        'Stain and spot treatment',
        'Odor elimination',
        'Allergen and bacteria removal',
        'Carpet grooming and protection',
        'Post-water damage carpet restoration',
      ]}
    />
  )
}
