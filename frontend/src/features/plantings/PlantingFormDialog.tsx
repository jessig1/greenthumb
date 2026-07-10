import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { PlantedPlantResponse, PlantingStatus } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { plantingStatusLabel } from '@/lib/labels'
import { useUpdatePlanting } from './api'

interface PlantingFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  containerId: string
  planting: PlantedPlantResponse
}

interface FormValues {
  nickname: string
  quantity: number
  plannedDate: string
  plantedDate: string
  status: PlantingStatus
  notes: string
}

const STATUSES: PlantingStatus[] = ['PLANNED', 'PLANTED', 'HARVESTED', 'REMOVED']

export function PlantingFormDialog({ open, onOpenChange, containerId, planting }: PlantingFormDialogProps) {
  const { register, control, handleSubmit, watch, reset } = useForm<FormValues>({
    defaultValues: {
      nickname: planting.nickname ?? '',
      quantity: planting.quantity,
      plannedDate: planting.plannedDate ?? '',
      plantedDate: planting.plantedDate ?? '',
      status: planting.status,
      notes: planting.notes ?? '',
    },
  })

  const status = watch('status')
  const plantedDateRequired = status !== 'PLANNED'

  const updatePlanting = useUpdatePlanting(planting.id, containerId)

  const onSubmit = (data: FormValues) => {
    const payload = {
      nickname: data.nickname || null,
      quantity: Number(data.quantity),
      plannedDate: data.plannedDate || null,
      plantedDate: data.plantedDate || null,
      status: data.status,
      notes: data.notes || null,
    }

    updatePlanting
      .mutateAsync(payload)
      .then(() => {
        toast.success('Planting updated')
        onOpenChange(false)
        reset()
      })
      .catch((error: Error) => toast.error(error.message))
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) reset()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit planting</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Plant</Label>
            <p className="font-medium">{planting.plant.commonName}</p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="nickname">Nickname</Label>
            <Input id="nickname" placeholder="e.g. Cherry tomatoes" {...register('nickname')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" min={1} {...register('quantity', { valueAsNumber: true })} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {plantingStatusLabel(s)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="plannedDate">Planned date</Label>
              <Input id="plannedDate" type="date" {...register('plannedDate')} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="plantedDate">
                Planted date {plantedDateRequired && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id="plantedDate"
                type="date"
                {...register('plantedDate', { required: plantedDateRequired })}
              />
              {plantedDateRequired && (
                <p className="text-xs text-muted-foreground">Required once status isn't "Planned".</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register('notes')} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={updatePlanting.isPending}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
