import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { XIcon } from 'lucide-react'
import { api } from '@/api/client'
import type {
  ContainerResponse,
  ContainerType,
  CreateGardenRequest,
  GardenResponse,
  GardenType,
  PlantResponse,
} from '@/api/types'
import { Badge } from '@/components/ui/badge'
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
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { usePlants } from '@/features/plants/api'
import { containerTypeLabel, gardenTypeLabel } from '@/lib/labels'

interface NewGardenWizardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type WizardStep = 'garden' | 'containers' | 'plants' | 'review'

interface DraftPlanting {
  key: string
  plantId: string
  plantName: string
  nickname: string
  quantity: number
}

interface DraftContainer {
  key: string
  name: string
  containerType: ContainerType
  sizeDescription: string
  plantings: DraftPlanting[]
}

type ContainerDraftFields = Omit<DraftContainer, 'key' | 'plantings'>

const GARDEN_TYPES: GardenType[] = ['INDOOR', 'OUTDOOR']
const CONTAINER_TYPES: ContainerType[] = ['RAISED_BED', 'POT', 'IN_GROUND', 'WINDOW_BOX', 'HANGING', 'OTHER']

const STEPS: { id: WizardStep; label: string }[] = [
  { id: 'garden', label: 'Garden' },
  { id: 'containers', label: 'Containers' },
  { id: 'plants', label: 'Plants' },
  { id: 'review', label: 'Review' },
]

function emptyContainerDraft(): ContainerDraftFields {
  return { name: '', containerType: 'RAISED_BED', sizeDescription: '' }
}

export function NewGardenWizardDialog({ open, onOpenChange }: NewGardenWizardDialogProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: plants } = usePlants()

  const [step, setStep] = useState<WizardStep>('garden')
  const [containers, setContainers] = useState<DraftContainer[]>([])
  const [containerDraft, setContainerDraft] = useState<ContainerDraftFields>(emptyContainerDraft())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register: registerGarden,
    control: gardenControl,
    handleSubmit: handleGardenSubmit,
    reset: resetGardenForm,
    getValues: getGardenValues,
  } = useForm<CreateGardenRequest>({
    defaultValues: { name: '', type: 'OUTDOOR', description: '' },
  })

  const resetAll = () => {
    setStep('garden')
    setContainers([])
    setContainerDraft(emptyContainerDraft())
    setIsSubmitting(false)
    resetGardenForm({ name: '', type: 'OUTDOOR', description: '' })
  }

  const handleDialogOpenChange = (next: boolean) => {
    onOpenChange(next)
    if (!next) resetAll()
  }

  const addContainer = () => {
    if (!containerDraft.name.trim()) return
    setContainers((prev) => [...prev, { ...containerDraft, key: crypto.randomUUID(), plantings: [] }])
    setContainerDraft(emptyContainerDraft())
  }

  const removeContainer = (key: string) => {
    setContainers((prev) => prev.filter((c) => c.key !== key))
  }

  const addPlanting = (containerKey: string, planting: Omit<DraftPlanting, 'key'>) => {
    setContainers((prev) =>
      prev.map((c) =>
        c.key === containerKey
          ? { ...c, plantings: [...c.plantings, { ...planting, key: crypto.randomUUID() }] }
          : c,
      ),
    )
  }

  const removePlanting = (containerKey: string, plantingKey: string) => {
    setContainers((prev) =>
      prev.map((c) =>
        c.key === containerKey ? { ...c, plantings: c.plantings.filter((p) => p.key !== plantingKey) } : c,
      ),
    )
  }

  const goToContainersStep = handleGardenSubmit(() => setStep('containers'))
  const goToPlantsOrReview = () => setStep(containers.length > 0 ? 'plants' : 'review')
  const goBackFromReview = () => setStep(containers.length > 0 ? 'plants' : 'containers')

  const handleCreateAll = async () => {
    setIsSubmitting(true)
    let garden: GardenResponse | undefined

    try {
      garden = await api.post<GardenResponse>('/api/v1/gardens', getGardenValues())

      for (const draftContainer of containers) {
        const container = await api.post<ContainerResponse>(`/api/v1/gardens/${garden.id}/containers`, {
          name: draftContainer.name,
          containerType: draftContainer.containerType,
          sizeDescription: draftContainer.sizeDescription,
        })

        for (const planting of draftContainer.plantings) {
          await api.post(`/api/v1/containers/${container.id}/plantings`, {
            plantId: planting.plantId,
            nickname: planting.nickname || null,
            quantity: planting.quantity,
            plannedDate: null,
            plantedDate: null,
            status: 'PLANNED',
            notes: null,
          })
        }
      }

      queryClient.invalidateQueries({ queryKey: ['gardens'] })
      toast.success('Garden created')
      onOpenChange(false)
      resetAll()
      navigate(`/gardens/${garden.id}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong'
      if (!garden) {
        toast.error(message)
        setIsSubmitting(false)
        return
      }
      toast.error(`Garden created, but didn't finish: ${message}. Finish up from the garden page.`)
      onOpenChange(false)
      resetAll()
      navigate(`/gardens/${garden.id}`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New garden</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2 text-xs">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              {i > 0 && <span className="text-muted-foreground">/</span>}
              <span className={s.id === step ? 'font-medium text-foreground' : 'text-muted-foreground'}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {step === 'garden' && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...registerGarden('name', { required: true })} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Type</Label>
              <Controller
                control={gardenControl}
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
              <Textarea id="description" {...registerGarden('description')} />
            </div>
          </div>
        )}

        {step === 'containers' && (
          <div className="flex flex-col gap-4">
            {containers.length > 0 && (
              <div className="flex flex-col gap-2">
                {containers.map((c) => (
                  <div key={c.key} className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{c.name}</span>
                      <Badge variant="secondary">{containerTypeLabel(c.containerType)}</Badge>
                    </div>
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeContainer(c.key)}>
                      <XIcon />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                ))}
                <Separator />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="containerName">Container name</Label>
              <Input
                id="containerName"
                value={containerDraft.name}
                onChange={(e) => setContainerDraft((d) => ({ ...d, name: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Type</Label>
              <Select
                value={containerDraft.containerType}
                onValueChange={(value) => setContainerDraft((d) => ({ ...d, containerType: value as ContainerType }))}
              >
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
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="containerSize">Size</Label>
              <Textarea
                id="containerSize"
                placeholder="e.g. 4x8 ft"
                value={containerDraft.sizeDescription}
                onChange={(e) => setContainerDraft((d) => ({ ...d, sizeDescription: e.target.value }))}
              />
            </div>
            <Button type="button" variant="outline" onClick={addContainer} disabled={!containerDraft.name.trim()}>
              Add container
            </Button>
          </div>
        )}

        {step === 'plants' && (
          <div className="flex flex-col gap-4">
            {containers.map((c) => (
              <ContainerPlantingsEditor
                key={c.key}
                draftContainer={c}
                plants={plants ?? []}
                onAdd={(planting) => addPlanting(c.key, planting)}
                onRemove={(plantingKey) => removePlanting(c.key, plantingKey)}
              />
            ))}
          </div>
        )}

        {step === 'review' && (
          <div className="flex flex-col gap-4">
            <div>
              <p className="font-medium">{getGardenValues('name')}</p>
              <p className="text-sm text-muted-foreground">{gardenTypeLabel(getGardenValues('type'))}</p>
              {getGardenValues('description') && (
                <p className="mt-1 text-sm text-muted-foreground">{getGardenValues('description')}</p>
              )}
            </div>

            {containers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No containers yet — you can add these later.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {containers.map((c) => (
                  <div key={c.key} className="rounded-lg border px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{c.name}</span>
                      <Badge variant="secondary">{containerTypeLabel(c.containerType)}</Badge>
                    </div>
                    {c.plantings.length === 0 ? (
                      <p className="mt-1 text-sm text-muted-foreground">No plants yet</p>
                    ) : (
                      <ul className="mt-1 flex flex-col gap-0.5 text-sm text-muted-foreground">
                        {c.plantings.map((p) => (
                          <li key={p.key}>
                            {p.quantity}x {p.plantName}
                            {p.nickname && ` (${p.nickname})`}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {step !== 'garden' && (
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => {
                if (step === 'containers') setStep('garden')
                else if (step === 'plants') setStep('containers')
                else if (step === 'review') goBackFromReview()
              }}
            >
              Back
            </Button>
          )}
          {step === 'garden' && (
            <Button type="button" onClick={goToContainersStep}>
              Next
            </Button>
          )}
          {step === 'containers' && (
            <Button type="button" onClick={goToPlantsOrReview}>
              Next
            </Button>
          )}
          {step === 'plants' && (
            <Button type="button" onClick={() => setStep('review')}>
              Next
            </Button>
          )}
          {step === 'review' && (
            <Button type="button" onClick={handleCreateAll} disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create garden'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface ContainerPlantingsEditorProps {
  draftContainer: DraftContainer
  plants: PlantResponse[]
  onAdd: (planting: Omit<DraftPlanting, 'key'>) => void
  onRemove: (plantingKey: string) => void
}

function ContainerPlantingsEditor({ draftContainer, plants, onAdd, onRemove }: ContainerPlantingsEditorProps) {
  const [plantId, setPlantId] = useState('')
  const [nickname, setNickname] = useState('')
  const [quantity, setQuantity] = useState(1)

  const handleAdd = () => {
    const plant = plants.find((p) => p.id === plantId)
    if (!plant) return
    onAdd({ plantId, plantName: plant.commonName, nickname, quantity })
    setPlantId('')
    setNickname('')
    setQuantity(1)
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-3">
      <div className="flex items-center gap-2">
        <span className="font-medium">{draftContainer.name}</span>
        <Badge variant="secondary">{containerTypeLabel(draftContainer.containerType)}</Badge>
      </div>

      {draftContainer.plantings.length > 0 && (
        <div className="flex flex-col gap-1">
          {draftContainer.plantings.map((p) => (
            <div key={p.key} className="flex items-center justify-between gap-2 text-sm">
              <span>
                {p.quantity}x {p.plantName}
                {p.nickname && ` (${p.nickname})`}
              </span>
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => onRemove(p.key)}>
                <XIcon />
                <span className="sr-only">Remove</span>
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-[1fr_5rem] gap-2">
        <Select value={plantId} onValueChange={setPlantId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a plant" />
          </SelectTrigger>
          <SelectContent>
            {plants.map((plant) => (
              <SelectItem key={plant.id} value={plant.id}>
                {plant.commonName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value === '' ? 1 : Number(e.target.value))}
        />
      </div>
      <Input placeholder="Nickname (optional)" value={nickname} onChange={(e) => setNickname(e.target.value)} />
      <Button type="button" variant="outline" onClick={handleAdd} disabled={!plantId}>
        Add plant
      </Button>
    </div>
  )
}
