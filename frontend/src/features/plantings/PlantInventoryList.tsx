import { Link } from 'react-router'
import { XIcon } from 'lucide-react'
import type { PlantedPlantResponse } from '@/api/types'
import type { InventoryItem } from './inventory'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { plantCategoryLabel, plantingStatusLabel } from '@/lib/labels'

function CareRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value ?? 'No schedule set'}</dd>
    </div>
  )
}

export function PlantInventoryList({
  inventory,
  onRemoveTag,
}: {
  inventory: InventoryItem[]
  onRemoveTag: (plantings: PlantedPlantResponse[]) => void
}) {
  return (
    <Accordion type="single" collapsible>
      {inventory.map((item) => (
        <AccordionItem key={item.plantId} value={item.plantId}>
          <AccordionTrigger>
            <div className="flex flex-1 items-center justify-between gap-2 pr-2">
              <div className="flex items-center gap-2">
                <span>{item.plantName}</span>
                <Badge variant="secondary">{plantCategoryLabel(item.plant.category)}</Badge>
              </div>
              <Badge variant="secondary">{item.totalQuantity} total</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-medium">Gardens & containers</h4>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <div
                    key={`${tag.label}::${tag.status}`}
                    className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
                  >
                    {tag.gardenId && tag.containerId ? (
                      <Link
                        to={`/gardens/${tag.gardenId}/containers/${tag.containerId}`}
                        className="hover:underline"
                      >
                        {tag.label}
                      </Link>
                    ) : (
                      <span>{tag.label}</span>
                    )}
                    <span className="text-muted-foreground">×{tag.quantity}</span>
                    <Badge variant="secondary">{plantingStatusLabel(tag.status)}</Badge>
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => onRemoveTag(tag.plantings)}
                    >
                      <XIcon className="size-3" />
                      <span className="sr-only">Remove</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-medium">Care schedule</h4>
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <CareRow
                  label="Watering"
                  value={item.plant.wateringIntervalDays ? `Every ${item.plant.wateringIntervalDays} days` : null}
                />
                <CareRow label="Fertilizing" value={item.plant.feedingNotes} />
                <CareRow label="Pruning" value={item.plant.pruningNotes} />
              </dl>
            </div>

            <Button asChild variant="outline" size="sm" className="self-start">
              <Link to={`/plants/${item.plantId}`} state={{ from: '/dashboard', fromLabel: 'inventory' }}>
                View plant guide
              </Link>
            </Button>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
