import type { ClimateZone } from '@/api/types'

export interface Coordinates {
  latitude: number
  longitude: number
}

export function getCurrentLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      (error) => {
        reject(
          new Error(
            error.code === error.PERMISSION_DENIED
              ? 'Location access was denied - enter your location manually'
              : 'Could not determine your location - enter it manually',
          ),
        )
      },
      { timeout: 10000 },
    )
  })
}

// Full state name -> USPS abbreviation, since Nominatim returns the full name (e.g. "Texas") but
// the rest of the app treats state as a short free-text field (e.g. "TX").
const US_STATE_ABBREVIATIONS: Record<string, string> = {
  Alabama: 'AL',
  Alaska: 'AK',
  Arizona: 'AZ',
  Arkansas: 'AR',
  California: 'CA',
  Colorado: 'CO',
  Connecticut: 'CT',
  Delaware: 'DE',
  Florida: 'FL',
  Georgia: 'GA',
  Hawaii: 'HI',
  Idaho: 'ID',
  Illinois: 'IL',
  Indiana: 'IN',
  Iowa: 'IA',
  Kansas: 'KS',
  Kentucky: 'KY',
  Louisiana: 'LA',
  Maine: 'ME',
  Maryland: 'MD',
  Massachusetts: 'MA',
  Michigan: 'MI',
  Minnesota: 'MN',
  Mississippi: 'MS',
  Missouri: 'MO',
  Montana: 'MT',
  Nebraska: 'NE',
  Nevada: 'NV',
  'New Hampshire': 'NH',
  'New Jersey': 'NJ',
  'New Mexico': 'NM',
  'New York': 'NY',
  'North Carolina': 'NC',
  'North Dakota': 'ND',
  Ohio: 'OH',
  Oklahoma: 'OK',
  Oregon: 'OR',
  Pennsylvania: 'PA',
  'Rhode Island': 'RI',
  'South Carolina': 'SC',
  'South Dakota': 'SD',
  Tennessee: 'TN',
  Texas: 'TX',
  Utah: 'UT',
  Vermont: 'VT',
  Virginia: 'VA',
  Washington: 'WA',
  'West Virginia': 'WV',
  Wisconsin: 'WI',
  Wyoming: 'WY',
  'District of Columbia': 'DC',
}

export interface GeocodedAddress {
  city: string | null
  state: string | null
  zipCode: string | null
}

// Reverse geocodes via OpenStreetMap's Nominatim - free, no API key, but a third-party service:
// the browser sends the user's coordinates to it. Confirmed with the user before adding this.
export async function reverseGeocode(latitude: number, longitude: number): Promise<GeocodedAddress> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`
  const response = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error("Couldn't look up your address")
  const data = await response.json()
  const address = data.address ?? {}
  const city: string | null = address.city ?? address.town ?? address.village ?? address.hamlet ?? null
  const stateName: string | undefined = address.state
  const state = stateName ? (US_STATE_ABBREVIATIONS[stateName] ?? stateName) : null
  const zipCode: string | null = address.postcode ?? null
  return { city, state, zipCode }
}

// Looks up the USDA hardiness zone for a zip code via phzmapi.org - a free, unofficial community
// dataset (not a government service). Returns null on any failure so callers can fall back to
// manual zone selection without surfacing an error for what's a "nice to have" auto-fill.
export async function lookupClimateZoneByZip(zipCode: string): Promise<ClimateZone | null> {
  try {
    const response = await fetch(`https://phzmapi.org/${encodeURIComponent(zipCode)}.json`)
    if (!response.ok) return null
    const data = await response.json()
    const zone: string | undefined = data.zone
    if (!zone) return null
    const match = /^(\d{1,2})([ab])$/i.exec(zone.trim())
    if (!match) return null
    return `ZONE_${match[1]}${match[2].toUpperCase()}` as ClimateZone
  } catch {
    return null
  }
}
