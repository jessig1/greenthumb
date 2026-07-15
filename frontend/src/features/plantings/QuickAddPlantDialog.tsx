import { useState } from 'react'
import { toast } from 'sonner'
import { XIcon } from 'lucide-react'
import type { PlantingStatus } from '@/api/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Combobox } from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useContainers } from '@/features/containers/api'
import { useGardens } from '@/features/gardens/api'
import { usePlants } from '@/features/plants/api'
import { plantingStatusLabel } from '@/lib/labels'
import { useAllPlantings, useQuickAddPlanting, useUpdateInventoryPlanting } from './api'
import { findMatchingPlanting } from './duplicates'

interface QuickAddPlantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface DraftPlanting {
  key: string
  plantId: string
  plantName: string
  status: PlantingStatus
  quantity: number
}

const STATUSES: PlantingStatus[] = ['PLANNED', 'PLANTED', 'HARVESTED', 'REMOVED']
const NO_SELECTION = '__none__'

export function QuickAddPlantDialog({ open, onOpenChange }: QuickAddPlantDialogProps) {
  const { data: gardens } = useGardens()
  const { data: plants } = usePlants()
  const { data: existingPlantings } = useAllPlantings()
  const quickAddPlanting = useQuickAddPlanting()
  const updatePlanting = useUpdateInventoryPlanting()
  const plantOptions = plants?.map((plant) => ({ value: plant.id, label: plant.commonName })) ?? []

  const [gardenId, setGardenId] = useState('')
  const { data: containers } = useContainers(gardenId)
  const [containerId, setContainerId] = useState('')

  const [drafts, setDrafts] = useState<DraftPlanting[]>([])
  const [plantId, setPlantId] = useState('')
  const [status, setStatus] = useState<PlantingStatus>('PLANNED')
  const [quantity, setQuantity] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetAll = () => {
    setGardenId('')
    setContainerId('')
    setDrafts([])
    setPlantId('')
    setStatus('PLANNED')
    setQuantity(1)
    setIsSubmitting(false)
  }

  const handleDialogOpenChange = (next: boolean) => {
    onOpenChange(next)
    if (!next) resetAll()
  }

  const handleGardenChange = (value: string) => {
    setGardenId(value === NO_SELECTION ? '' : value)
    setContainerId('')
  }

  const buildDraftFromForm = (): DraftPlanting | null => {
    const plant = plants?.find((p) => p.id === plantId)
    if (!plant) return null
    return { key: crypto.randomUUID(), plantId, plantName: plant.commonName, status, quantity }
  }

  const addToList = () => {
    const draft = buildDraftFromForm()
    if (!draft) return
    setDrafts((prev) => [...prev, draft])
    setPlantId('')
    setStatus('PLANNED')
    setQuantity(1)
  }

  const removeFromList = (key: string) => {
    setDrafts((prev) => prev.filter((d) => d.key !== key))
  }

  // Submitted one at a time (not Promise.all) so a mid-batch failure leaves the remaining drafts
  // to retry, instead of risking duplicates by resubmitting already-created plantings.
  const handleSubmit = async () => {
    // If the form still has a plant selected, it hasn't been added to the list yet - fold it in
    // rather than silently dropping the last thing the user picked.
    const pendingFormDraft = buildDraftFromForm()
    const allDrafts = pendingFormDraft ? [...drafts, pendingFormDraft] : drafts
    if (allDrafts.length === 0) return

    setIsSubmitting(true)
    setDrafts(allDrafts)
    setPlantId('')
    setStatus('PLANNED')
    setQuantity(1)

    const total = allDrafts.length
    const remaining = [...allDrafts]
    const targetContainerId = containerId || null
    // Snapshot of the caller's plantings, kept in sync locally as drafts are submitted so that
    // adding the same plant/status twice in one batch also merges into a single row rather than
    // the second draft missing the first draft's not-yet-refetched update.
    const working = [...(existingPlantings ?? [])]

    try {
      while (remaining.length > 0) {
        const draft = remaining[0]
        const match = findMatchingPlanting(working, {
          plantId: draft.plantId,
          containerId: targetContainerId,
          status: draft.status,
          nickname: null,
          notes: null,
        })

        if (match) {
          const updated = await updatePlanting.mutateAsync({
            id: match.id,
            request: {
              nickname: match.nickname,
              quantity: match.quantity + draft.quantity,
              plannedDate: match.plannedDate,
              plantedDate: match.plantedDate,
              status: match.status,
              notes: match.notes,
            },
          })
          const index = working.findIndex((p) => p.id === match.id)
          working[index] = updated
        } else {
          const created = await quickAddPlanting.mutateAsync({
            plantId: draft.plantId,
            containerId: targetContainerId,
            status: draft.status,
            quantity: draft.quantity,
          })
          working.push(created)
        }

        remaining.shift()
        setDrafts((prev) => prev.filter((d) => d.key !== draft.key))
      }
      toast.success(total === 1 ? 'Plant added' : `${total} plants added`)
      onOpenChange(false)
      resetAll()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong'
      toast.error(`${message} - added what succeeded so far; fix and try again for the rest.`)
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add plants</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Garden (optional)</Label>
              <Select value={gardenId || NO_SELECTION} onValueChange={handleGardenChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_SELECTION}>No garden yet</SelectItem>
                  {gardens?.map((garden) => (
                    <SelectItem key={garden.id} value={garden.id}>
                      {garden.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Container (optional)</Label>
              <Select
                value={containerId || NO_SELECTION}
                onValueChange={(value) => setContainerId(value === NO_SELECTION ? '' : value)}
                disabled={!gardenId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_SELECTION}>No container yet</SelectItem>
                  {containers?.map((container) => (
                    <SelectItem key={container.id} value={container.id}>
                      {container.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {drafts.length > 0 && (
            <div className="flex flex-col gap-2">
              {drafts.map((d) => (
                <div key={d.key} className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {d.quantity}x {d.plantName}
                    </span>
                    <Badge variant="secondary">{plantingStatusLabel(d.status)}</Badge>
                  </div>
                  <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeFromList(d.key)}>
                    <XIcon />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label>Plant</Label>
            <Combobox
              options={plantOptions}
              value={plantId}
              onValueChange={setPlantId}
              placeholder="Choose a plant"
              searchPlaceholder="Search plants..."
              emptyText="No matching plants."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as PlantingStatus)}>
                <SelectTrigger className="w-full">
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
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? 1 : Number(e.target.value))}
              />
            </div>
          </div>

          <Button type="button" variant="outline" onClick={addToList} disabled={!plantId}>
            Add to list
          </Button>
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={(drafts.length === 0 && !plantId) || isSubmitting}
          >
            {isSubmitting ? 'Adding…' : 'Add plants'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
