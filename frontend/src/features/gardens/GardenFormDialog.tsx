import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import type { CreateGardenRequest, GardenResponse, GardenType } from '@/api/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { gardenTypeLabel } from '@/lib/labels'
import { useCreateGarden, useUpdateGarden } from './api'
import { GardenEnvironmentFields } from './GardenEnvironmentFields'

interface GardenFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  garden?: GardenResponse
}

const GARDEN_TYPES: GardenType[] = ['INDOOR', 'OUTDOOR']

function emptyDefaults(): CreateGardenRequest {
  return {
    name: '',
    type: 'OUTDOOR',
    description: '',
    lightSource: null,
    lightHoursPerDay: null,
    lightExposure: null,
    city: null,
    state: null,
    zipCode: null,
    climateZone: null,
    lastFrostDate: null,
    firstFrostDate: null,
  }
}

function defaultsFromGarden(garden: GardenResponse): CreateGardenRequest {
  return {
    name: garden.name,
    type: garden.type,
    description: garden.description,
    lightSource: garden.lightSource,
    lightHoursPerDay: garden.lightHoursPerDay,
    lightExposure: garden.lightExposure,
    city: garden.city,
    state: garden.state,
    zipCode: garden.zipCode,
    climateZone: garden.climateZone,
    lastFrostDate: garden.lastFrostDate,
    firstFrostDate: garden.firstFrostDate,
  }
}

export function GardenFormDialog({ open, onOpenChange, garden }: GardenFormDialogProps) {
  const isEditing = !!garden
  const navigate = useNavigate()
  const { register, control, handleSubmit, reset, setValue } = useForm<CreateGardenRequest>({
    defaultValues: garden ? defaultsFromGarden(garden) : emptyDefaults(),
  })

  const createGarden = useCreateGarden()
  const updateGarden = useUpdateGarden(garden?.id ?? '')
  const mutation = isEditing ? updateGarden : createGarden

  const onSubmit = (data: CreateGardenRequest) => {
    const payload: CreateGardenRequest = {
      ...data,
      lightHoursPerDay:
        data.lightHoursPerDay === null || Number.isNaN(data.lightHoursPerDay) ? null : data.lightHoursPerDay,
      city: data.city || null,
      state: data.state || null,
      zipCode: data.zipCode || null,
      lastFrostDate: data.lastFrostDate || null,
      firstFrostDate: data.firstFrostDate || null,
    }
    mutation.mutate(payload, {
      onSuccess: (result) => {
        toast.success(isEditing ? 'Garden updated' : 'Garden created')
        onOpenChange(false)
        reset()
        if (!isEditing) {
          navigate(`/gardens/${result.id}`)
        }
      },
      onError: (error) => toast.error(error.message),
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) reset()
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit garden' : 'New garden'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register('name', { required: true })} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Type</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GARDEN_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {gardenTypeLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} />
          </div>

          <GardenEnvironmentFields register={register} control={control} setValue={setValue} />

          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {isEditing ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
