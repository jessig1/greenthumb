import { useState } from 'react'
import { Link } from 'react-router'
import { usePlants } from './api'
import type { PlantCategory } from '@/api/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { lightRequirementLabel, plantCategoryLabel } from '@/lib/labels'

const CATEGORIES: PlantCategory[] = ['VEGETABLE', 'HERB', 'FLOWER', 'FRUIT', 'HOUSEPLANT', 'OTHER']

export function PlantsListPage() {
  const [category, setCategory] = useState<PlantCategory | 'ALL'>('ALL')
  const { data: plants, isLoading } = usePlants(category === 'ALL' ? undefined : category)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Plant catalog</h1>
        <Select value={category} onValueChange={(value) => setCategory(value as PlantCategory | 'ALL')}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {plantCategoryLabel(c)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {plants?.map((plant) => (
            <Link key={plant.id} to={`/plants/${plant.id}`}>
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2">
                    <span>{plant.commonName}</span>
                    <Badge variant="secondary">{plantCategoryLabel(plant.category)}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {plant.scientificName && <p className="italic">{plant.scientificName}</p>}
                  <p>{lightRequirementLabel(plant.lightRequirement)}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
