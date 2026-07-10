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
import { usePlants } from '@/features/plants/api'
import { plantingStatusLabel } from '@/lib/labels'
import { useCreatePlanting } from './api'

interface AddPlantsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  containerId: string
}

interface DraftPlanting {
  key: string
  plantId: string
  plantName: string
  status: PlantingStatus
  quantity: number
}

const STATUSES: PlantingStatus[] = ['PLANNED', 'PLANTED', 'HARVESTED', 'REMOVED']

function todayIsoDate(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export function AddPlantsDialog({ open, onOpenChange, containerId }: AddPlantsDialogProps) {
  const { data: plants } = usePlants()
  const createPlanting = useCreatePlanting(containerId)
  const plantOptions = plants?.map((plant) => ({ value: plant.id, label: plant.commonName })) ?? []

  const [drafts, setDrafts] = useState<DraftPlanting[]>([])
  const [plantId, setPlantId] = useState('')
  const [status, setStatus] = useState<PlantingStatus>('PLANNED')
  const [quantity, setQuantity] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetAll = () => {
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

    const today = todayIsoDate()
    const total = allDrafts.length
    const remaining = [...allDrafts]

    try {
      while (remaining.length > 0) {
        const draft = remaining[0]
        const isPlanned = draft.status === 'PLANNED'
        await createPlanting.mutateAsync({
          plantId: draft.plantId,
          nickname: null,
          quantity: draft.quantity,
          plannedDate: isPlanned ? today : null,
          plantedDate: isPlanned ? null : today,
          status: draft.status,
          notes: null,
        })
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
          <DialogTitle>Add Plants</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
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
            {isSubmitting ? 'Adding…' : 'Add Plants'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
