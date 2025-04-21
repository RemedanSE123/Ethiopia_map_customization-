"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Map, Layers } from "lucide-react"
import type { Option } from "@/components/enhanced-multi-select"

interface SelectedSummaryProps {
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

export function SelectedSummary({
  regions,
  zones,
  woredas,
  selectedRegions,
  selectedZones,
  selectedWoredas,
  onRegionClick,
  onZoneClick,
  onWoredaClick,
}: SelectedSummaryProps) {
  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-transparent">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Selected Areas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="all" className="font-medium">
              All Selections
            </TabsTrigger>
            <TabsTrigger value="by-type" className="font-medium">
              By Type
            </TabsTrigger>
            <TabsTrigger value="stats" className="font-medium">
              Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <div className="space-y-4">
              {selectedRegions.length === 0 && selectedZones.length === 0 && selectedWoredas.length === 0 ? (
                <div className="text-center py-8 bg-muted/20 rounded-lg">
                  <p className="text-muted-foreground text-lg">No areas selected yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Use the selection panels on the left to choose areas
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedRegions.map((code) => {
                    const region = regions.find((r) => r.value === code)
                    return (
                      <Badge
                        key={code}
                        variant="outline"
                        className={`px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary font-medium border-primary/30 ${
                          onRegionClick ? "cursor-pointer" : ""
                        }`}
                        onClick={() => onRegionClick && onRegionClick(code)}
                      >
                        {region?.label || code}
                      </Badge>
                    )
                  })}
                  {selectedZones.map((code) => {
                    const zone = zones.find((z) => z.value === code)
                    return (
                      <Badge
                        key={code}
                        variant="outline"
                        className={`px-3 py-1.5 bg-[#34a853]/10 hover:bg-[#34a853]/20 text-[#34a853] font-medium border-[#34a853]/30 ${
                          onZoneClick ? "cursor-pointer" : ""
                        }`}
                        onClick={() => onZoneClick && onZoneClick(code)}
                      >
                        {zone?.label || code}
                      </Badge>
                    )
                  })}
                  {selectedWoredas.map((code) => {
                    const woreda = woredas.find((w) => w.value === code)
                    return (
                      <Badge
                        key={code}
                        variant="outline"
                        className={`px-3 py-1.5 bg-[#ea4335]/10 hover:bg-[#ea4335]/20 text-[#ea4335] font-medium border-[#ea4335]/30 ${
                          onWoredaClick ? "cursor-pointer" : ""
                        }`}
                        onClick={() => onWoredaClick && onWoredaClick(code)}
                      >
                        {woreda?.label || code}
                      </Badge>
                    )
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="by-type" className="mt-0">
            <div className="space-y-6">
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <h3 className="text-base font-medium mb-3 text-primary flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Regions ({selectedRegions.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedRegions.length > 0 ? (
                    selectedRegions.map((code) => {
                      const region = regions.find((r) => r.value === code)
                      return (
                        <Badge
                          key={code}
                          variant="outline"
                          className={`px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary font-medium border-primary/30 ${
                            onRegionClick ? "cursor-pointer" : ""
                          }`}
                          onClick={() => onRegionClick && onRegionClick(code)}
                        >
                          {region?.label || code}
                        </Badge>
                      )
                    })
                  ) : (
                    <p className="text-muted-foreground text-sm">No regions selected</p>
                  )}
                </div>
              </div>

              <div className="bg-[#34a853]/5 p-4 rounded-lg border border-[#34a853]/20">
                <h3 className="text-base font-medium mb-3 text-[#34a853] flex items-center gap-2">
                  <Map className="h-4 w-4" />
                  Zones ({selectedZones.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedZones.length > 0 ? (
                    selectedZones.map((code) => {
                      const zone = zones.find((z) => z.value === code)
                      return (
                        <Badge
                          key={code}
                          variant="outline"
                          className={`px-3 py-1.5 bg-[#34a853]/10 hover:bg-[#34a853]/20 text-[#34a853] font-medium border-[#34a853]/30 ${
                            onZoneClick ? "cursor-pointer" : ""
                          }`}
                          onClick={() => onZoneClick && onZoneClick(code)}
                        >
                          {zone?.label || code}
                        </Badge>
                      )
                    })
                  ) : (
                    <p className="text-muted-foreground text-sm">No zones selected</p>
                  )}
                </div>
              </div>

              <div className="bg-[#ea4335]/5 p-4 rounded-lg border border-[#ea4335]/20">
                <h3 className="text-base font-medium mb-3 text-[#ea4335] flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Woredas ({selectedWoredas.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedWoredas.length > 0 ? (
                    selectedWoredas.map((code) => {
                      const woreda = woredas.find((w) => w.value === code)
                      return (
                        <Badge
                          key={code}
                          variant="outline"
                          className={`px-3 py-1.5 bg-[#ea4335]/10 hover:bg-[#ea4335]/20 text-[#ea4335] font-medium border-[#ea4335]/30 ${
                            onWoredaClick ? "cursor-pointer" : ""
                          }`}
                          onClick={() => onWoredaClick && onWoredaClick(code)}
                        >
                          {woreda?.label || code}
                        </Badge>
                      )
                    })
                  ) : (
                    <p className="text-muted-foreground text-sm">No woredas selected</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="mt-0">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-primary/10 rounded-lg p-6 text-center shadow-sm">
                <p className="text-4xl font-bold text-primary">{selectedRegions.length}</p>
                <p className="text-sm font-medium mt-2">Regions</p>
              </div>
              <div className="bg-[#34a853]/10 rounded-lg p-6 text-center shadow-sm">
                <p className="text-4xl font-bold text-[#34a853]">{selectedZones.length}</p>
                <p className="text-sm font-medium mt-2">Zones</p>
              </div>
              <div className="bg-[#ea4335]/10 rounded-lg p-6 text-center shadow-sm">
                <p className="text-4xl font-bold text-[#ea4335]">{selectedWoredas.length}</p>
                <p className="text-sm font-medium mt-2">Woredas</p>
              </div>

              <div className="col-span-3 mt-4 bg-secondary/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Total Selected Areas</h3>
                <p className="text-2xl font-bold">
                  {selectedRegions.length + selectedZones.length + selectedWoredas.length}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
