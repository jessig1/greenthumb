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

interface GardenFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  garden?: GardenResponse
}

const GARDEN_TYPES: GardenType[] = ['INDOOR', 'OUTDOOR']

export function GardenFormDialog({ open, onOpenChange, garden }: GardenFormDialogProps) {
  const isEditing = !!garden
  const navigate = useNavigate()
  const { register, control, handleSubmit, reset } = useForm<CreateGardenRequest>({
    defaultValues: garden
      ? { name: garden.name, type: garden.type, description: garden.description }
      : { name: '', type: 'OUTDOOR', description: '' },
  })

  const createGarden = useCreateGarden()
  const updateGarden = useUpdateGarden(garden?.id ?? '')
  const mutation = isEditing ? updateGarden : createGarden

  const onSubmit = (data: CreateGardenRequest) => {
    mutation.mutate(data, {
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
      <DialogContent>
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
