"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Option } from "@/components/multi-select"

interface SelectedItemsProps {
  regions: Option[]
  zones: Option[]
  woredas: Option[]
  selectedRegions: string[]
  selectedZones: string[]
  selectedWoredas: string[]
  onRegionClick?: (regionCode: string) => void
  onZoneClick?: (zoneCode: string) => void
  onWoredaClick?: (woredaCode: string) => void
}

export function SelectedItems({
  regions,
  zones,
  woredas,
  selectedRegions,
  selectedZones,
  selectedWoredas,
  onRegionClick,
  onZoneClick,
  onWoredaClick,
}: SelectedItemsProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Selected Areas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Regions</h3>
          <div className="flex flex-wrap gap-2">
            {selectedRegions.length > 0 ? (
              selectedRegions.map((code) => {
                const region = regions.find((r) => r.value === code)
                return (
                  <Badge
                    key={code}
                    variant="outline"
                    className={`px-3 py-1 ${
                      onRegionClick ? "cursor-pointer hover:bg-primary hover:text-primary-foreground" : ""
                    }`}
                    onClick={() => onRegionClick && onRegionClick(code)}
                  >
                    {region?.label || code}
                  </Badge>
                )
              })
            ) : (
              <span className="text-sm text-muted-foreground">No regions selected</span>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Zones</h3>
          <div className="flex flex-wrap gap-2">
            {selectedZones.length > 0 ? (
              selectedZones.map((code) => {
                const zone = zones.find((z) => z.value === code)
                return (
                  <Badge
                    key={code}
                    variant="outline"
                    className={`px-3 py-1 ${
                      onZoneClick ? "cursor-pointer hover:bg-primary hover:text-primary-foreground" : ""
                    }`}
                    onClick={() => onZoneClick && onZoneClick(code)}
                  >
                    {zone?.label || code}
                  </Badge>
                )
              })
            ) : (
              <span className="text-sm text-muted-foreground">No zones selected</span>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Woredas</h3>
          <div className="flex flex-wrap gap-2">
            {selectedWoredas.length > 0 ? (
              selectedWoredas.map((code) => {
                const woreda = woredas.find((w) => w.value === code)
                return (
                  <Badge
                    key={code}
                    variant="outline"
                    className={`px-3 py-1 ${
                      onWoredaClick ? "cursor-pointer hover:bg-primary hover:text-primary-foreground" : ""
                    }`}
                    onClick={() => onWoredaClick && onWoredaClick(code)}
                  >
                    {woreda?.label || code}
                  </Badge>
                )
              })
            ) : (
              <span className="text-sm text-muted-foreground">No woredas selected</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
