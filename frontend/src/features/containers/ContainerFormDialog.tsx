import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import type { ContainerResponse, ContainerType, CreateContainerRequest } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { containerTypeLabel } from '@/lib/labels'
import { useCreateContainer, useUpdateContainer } from './api'

interface ContainerFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gardenId: string
  container?: ContainerResponse
}

const CONTAINER_TYPES: ContainerType[] = ['RAISED_BED', 'POT', 'IN_GROUND', 'WINDOW_BOX', 'HANGING', 'OTHER']

export function ContainerFormDialog({ open, onOpenChange, gardenId, container }: ContainerFormDialogProps) {
  const isEditing = !!container
  const navigate = useNavigate()
  const { register, control, handleSubmit, reset } = useForm<CreateContainerRequest>({
    defaultValues: container
      ? { name: container.name, containerType: container.containerType, sizeDescription: container.sizeDescription }
      : { name: '', containerType: 'RAISED_BED', sizeDescription: '' },
  })

  const createContainer = useCreateContainer(gardenId)
  const updateContainer = useUpdateContainer(container?.id ?? '', gardenId)
  const mutation = isEditing ? updateContainer : createContainer

  const onSubmit = (data: CreateContainerRequest) => {
    mutation.mutate(data, {
      onSuccess: (result) => {
        toast.success(isEditing ? 'Container updated' : 'Container added')
        onOpenChange(false)
        reset()
        if (!isEditing) {
          navigate(`/gardens/${gardenId}/containers/${result.id}`)
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
          <DialogTitle>{isEditing ? 'Edit container' : 'New container'}</DialogTitle>
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
              name="containerType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTAINER_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {containerTypeLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="sizeDescription">Size</Label>
            <Textarea id="sizeDescription" placeholder="e.g. 4x8 ft" {...register('sizeDescription')} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {isEditing ? 'Save' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
