function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export const gardenTypeLabel = titleCase
export const containerTypeLabel = titleCase
export const plantCategoryLabel = titleCase
export const lightRequirementLabel = titleCase
export const plantingStatusLabel = titleCase
export const gardenLightSourceLabel = titleCase
export const gardenLightExposureLabel = titleCase
export const climateZoneLabel = titleCase
