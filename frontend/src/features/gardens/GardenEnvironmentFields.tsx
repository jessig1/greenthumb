import { useState } from 'react'
import type { Control, UseFormRegister, UseFormSetValue } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { Loader2Icon, LocateFixedIcon } from 'lucide-react'
import { toast } from 'sonner'
import type { ClimateZone, CreateGardenRequest, GardenLightExposure, GardenLightSource } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { climateZoneLabel, gardenLightExposureLabel, gardenLightSourceLabel } from '@/lib/labels'
import { getCurrentLocation, lookupClimateZoneByZip, reverseGeocode } from '@/lib/geocode'

const GARDEN_LIGHT_SOURCES: GardenLightSource[] = ['GROW_LAMP', 'WINDOW', 'FULL_SUN', 'PARTIAL_SUN', 'OTHER']
const GARDEN_LIGHT_EXPOSURES: GardenLightExposure[] = [
  'NORTH_FACING',
  'SOUTH_FACING',
  'EAST_FACING',
  'WEST_FACING',
  'DIRECT',
  'INDIRECT',
  'OTHER',
]
const CLIMATE_ZONES: ClimateZone[] = (
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const
).flatMap((n) => [`ZONE_${n}A`, `ZONE_${n}B`]) as ClimateZone[]
const UNSET = '__unset__'
const ZIP_PATTERN = /^\d{5}$/

interface GardenEnvironmentFieldsProps {
  register: UseFormRegister<CreateGardenRequest>
  control: Control<CreateGardenRequest>
  setValue: UseFormSetValue<CreateGardenRequest>
}

export function GardenEnvironmentFields({ register, control, setValue }: GardenEnvironmentFieldsProps) {
  const [locating, setLocating] = useState(false)
  const zipField = register('zipCode')

  const applyZipCode = async (zipCode: string) => {
    if (!ZIP_PATTERN.test(zipCode)) return
    const zone = await lookupClimateZoneByZip(zipCode)
    if (zone) setValue('climateZone', zone)
  }

  const handleUseMyLocation = async () => {
    setLocating(true)
    try {
      const { latitude, longitude } = await getCurrentLocation()
      const address = await reverseGeocode(latitude, longitude)
      if (address.city) setValue('city', address.city)
      if (address.state) setValue('state', address.state)
      if (address.zipCode) {
        setValue('zipCode', address.zipCode)
        await applyZipCode(address.zipCode)
      }
      toast.success('Location filled in from your device')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't get your location")
    } finally {
      setLocating(false)
    }
  }

  return (
    <>
      <div className="border-t pt-4">
        <h3 className="text-sm font-medium">Light</h3>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label>Source</Label>
          <Controller
            control={control}
            name="lightSource"
            render={({ field }) => (
              <Select
                value={field.value ?? UNSET}
                onValueChange={(value) => field.onChange(value === UNSET ? null : (value as GardenLightSource))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNSET}>Not set</SelectItem>
                  {GARDEN_LIGHT_SOURCES.map((source) => (
                    <SelectItem key={source} value={source}>
                      {gardenLightSourceLabel(source)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Exposure</Label>
          <Controller
            control={control}
            name="lightExposure"
            render={({ field }) => (
              <Select
                value={field.value ?? UNSET}
                onValueChange={(value) => field.onChange(value === UNSET ? null : (value as GardenLightExposure))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNSET}>Not set</SelectItem>
                  {GARDEN_LIGHT_EXPOSURES.map((exposure) => (
                    <SelectItem key={exposure} value={exposure}>
                      {gardenLightExposureLabel(exposure)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="lightHoursPerDay">Hours of light per day</Label>
        <Input
          id="lightHoursPerDay"
          type="number"
          min={0}
          max={24}
          {...register('lightHoursPerDay', { valueAsNumber: true })}
        />
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <h3 className="text-sm font-medium">Location</h3>
        <Button type="button" variant="outline" size="sm" onClick={handleUseMyLocation} disabled={locating}>
          {locating ? <Loader2Icon className="animate-spin" /> : <LocateFixedIcon />}
          Use my location
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register('city')} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="state">State</Label>
          <Input id="state" {...register('state')} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="zipCode">Zip code</Label>
          <Input
            id="zipCode"
            {...zipField}
            onBlur={(e) => {
              zipField.onBlur(e)
              void applyZipCode(e.target.value.trim())
            }}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label>Climate zone</Label>
        <Controller
          control={control}
          name="climateZone"
          render={({ field }) => (
            <Select
              value={field.value ?? UNSET}
              onValueChange={(value) => field.onChange(value === UNSET ? null : (value as ClimateZone))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNSET}>Not set</SelectItem>
                {CLIMATE_ZONES.map((zone) => (
                  <SelectItem key={zone} value={zone}>
                    {climateZoneLabel(zone)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <p className="text-xs text-muted-foreground">Filled in automatically from the zip code when known.</p>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-sm font-medium">Frost dates</h3>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="lastFrostDate">Last spring frost</Label>
          <Input id="lastFrostDate" type="date" {...register('lastFrostDate')} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="firstFrostDate">First fall frost</Label>
          <Input id="firstFrostDate" type="date" {...register('firstFrostDate')} />
        </div>
      </div>
    </>
  )
}
