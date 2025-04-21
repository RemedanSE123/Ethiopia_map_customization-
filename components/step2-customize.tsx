"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Palette, PenTool, Layers, RotateCcw, MapPin, Info } from "lucide-react"
import { MarkerEditor } from "@/components/marker-editor"
import type { GeoFeature } from "@/types/geo-types"

// Update the MapCustomization interface to include label customization
interface Step2CustomizeProps {
  selectedData: {
    regions: { code: string; name: string }[]
    zones: { code: string; name: string }[]
    woredas: { code: string; name: string }[]
    features: GeoFeature[]
  }
  mapCustomization: {
    colors: {
      region: string
      zone: string
      woreda: string
    }
    featureColors: Record<string, string>
    featureOpacity?: Record<string, number>
    opacity: {
      region: number
      zone: number
      woreda: number
    }
    borders: {
      width: number
      style: string
      color: string
    }
    background: string
    showLabels: boolean
    showTooltips: boolean
    basemap: string
    markers: Array<{
      lat: number
      lng: number
      color: string
      size: number
      opacity?: number
      label?: string
      labelColor?: string
      labelSize?: number
      shape?: "pin" | "circle" | "square" | "triangle" | "hexagon" | "polygon" | "line"
      points?: Array<{ lat: number; lng: number }>
    }>
  }
  updateMapCustomization: (key: string, value: any) => void
  onFeatureClick: (feature: GeoFeature) => void
  clickPosition: { lat: number; lng: number } | null
  selectedFeature: string | null
  setSelectedFeature: (feature: string | null) => void
  activeTab: string
  setActiveTab: (tab: string) => void
  setClickPosition: (position: { lat: number; lng: number } | null) => void
}

export default function Step2Customize({
  selectedData,
  mapCustomization,
  updateMapCustomization,
  onFeatureClick,
  clickPosition,
  selectedFeature,
  setSelectedFeature,
  activeTab,
  setActiveTab,
  setClickPosition,
}: Step2CustomizeProps) {
  const [selectedFeatureType, setSelectedFeatureType] = useState<"region" | "zone" | "woreda" | null>(null)
  const [selectedFeatureName, setSelectedFeatureName] = useState<string | null>(null)

  // Effect to update the selected feature info when it changes
  useEffect(() => {
    if (selectedFeature) {
      // Find the feature in the data
      const feature = selectedData.features.find((f) => f.properties.code === selectedFeature)
      if (feature) {
        setSelectedFeatureType(feature.properties.level || getFeatureLevelFromCode(feature.properties.code))
        setSelectedFeatureName(feature.properties.name)
      }
    } else {
      setSelectedFeatureType(null)
      setSelectedFeatureName(null)
    }
  }, [selectedFeature, selectedData.features])

  // Effect to clear selected feature when changing tabs
  useEffect(() => {
    if (activeTab !== "colors") {
      setSelectedFeature(null)
    }
  }, [activeTab, setSelectedFeature])

  const getFeatureLevelFromCode = (code: string): "region" | "zone" | "woreda" => {
    if (code.startsWith("ET") && code.length === 3) return "region" // Region
    if (code.length === 5) return "zone" // Zone
    return "woreda" // Woreda
  }

  const updateFeatureColor = (color: string) => {
    if (selectedFeature) {
      const newFeatureColors = {
        ...mapCustomization.featureColors,
        [selectedFeature]: color,
      }
      updateMapCustomization("featureColors", newFeatureColors)
    }
  }

  const updateFeatureOpacity = (opacity: number) => {
    if (selectedFeature) {
      const newFeatureOpacity = {
        ...mapCustomization.featureOpacity,
        [selectedFeature]: opacity,
      }
      updateMapCustomization("featureOpacity", newFeatureOpacity)
    }
  }

  const resetFeatureColor = () => {
    if (selectedFeature) {
      // Create new objects without the selected feature
      const newFeatureColors = { ...mapCustomization.featureColors }
      const newFeatureOpacity = { ...mapCustomization.featureOpacity }

      // Delete the properties for this feature
      delete newFeatureColors[selectedFeature]
      delete newFeatureOpacity[selectedFeature]

      // Update both at once
      updateMapCustomization("featureColors", newFeatureColors)
      updateMapCustomization("featureOpacity", newFeatureOpacity)
    }
  }

  // Update the resetAllCustomizations function to include label customization defaults
  const resetAllCustomizations = () => {
    updateMapCustomization("colors", {
      region: "#1a73e8", // Blue
      zone: "#34a853", // Green
      woreda: "#ea4335", // Red
    })
    updateMapCustomization("featureColors", {})
    updateMapCustomization("featureOpacity", {})
    updateMapCustomization("opacity", {
      region: 0.7,
      zone: 0.7,
      woreda: 0.7,
    })
    updateMapCustomization("borders", {
      width: 1,
      style: "solid",
      color: "#000000",
    })
    updateMapCustomization("background", "#f8f9fa")
    updateMapCustomization("showLabels", true)
    updateMapCustomization("showTooltips", true)
    updateMapCustomization("basemap", "dark")
    updateMapCustomization("markers", [])
    setSelectedFeature(null)
  }

  const handleAddMarker = (marker: any) => {
    updateMapCustomization("markers", [...mapCustomization.markers, marker])
  }

  const handleUpdateMarker = (index: number, marker: any) => {
    const newMarkers = [...mapCustomization.markers]
    newMarkers[index] = marker
    updateMapCustomization("markers", newMarkers)
  }

  const handleRemoveMarker = (index: number) => {
    updateMapCustomization(
      "markers",
      mapCustomization.markers.filter((_: any, i: number) => i !== index),
    )
  }

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader className="pb-2 bg-gradient-to-r from-primary/10 to-transparent">
        <CardTitle className="flex justify-between items-center">
          <span className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Map Customization
          </span>
          <Button variant="ghost" size="sm" onClick={resetAllCustomizations} className="flex items-center gap-1">
            <RotateCcw className="h-4 w-4" /> Reset All
          </Button>
        </CardTitle>
        <CardDescription>
          {activeTab === "colors"
            ? "Click on the map to select and customize individual areas"
            : activeTab === "markers"
              ? "Click on the map to place markers"
              : "Customize your map appearance"}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="colors" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full rounded-none">
            <TabsTrigger value="colors" className="flex items-center gap-1">
              <Palette className="h-4 w-4" /> Colors
            </TabsTrigger>
            <TabsTrigger value="borders" className="flex items-center gap-1">
              <PenTool className="h-4 w-4" /> Borders
            </TabsTrigger>
            <TabsTrigger value="display" className="flex items-center gap-1">
              <Layers className="h-4 w-4" /> Display
            </TabsTrigger>
            <TabsTrigger value="markers" className="flex items-center gap-1">
              <MapPin className="h-4 w-4" /> Markers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="colors" className="p-4 space-y-6">
            {selectedFeature ? (
              <div className="space-y-4">
                <div className="bg-secondary/50 p-3 rounded-md">
                  <h3 className="font-medium mb-1">Selected Area</h3>
                  <p className="text-sm">
                    {selectedFeatureName} ({selectedFeatureType})
                  </p>
                </div>

                <div>
                  <Label className="block text-sm font-medium mb-1">Custom Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={
                        mapCustomization.featureColors[selectedFeature] ||
                        mapCustomization.colors[selectedFeatureType as keyof typeof mapCustomization.colors]
                      }
                      onChange={(e) => updateFeatureColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={
                        mapCustomization.featureColors[selectedFeature] ||
                        mapCustomization.colors[selectedFeatureType as keyof typeof mapCustomization.colors]
                      }
                      onChange={(e) => updateFeatureColor(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <Label className="block text-sm font-medium mb-1">
                    Opacity:{" "}
                    {Math.round(
                      (mapCustomization.featureOpacity?.[selectedFeature] ||
                        mapCustomization.opacity[selectedFeatureType as keyof typeof mapCustomization.opacity] ||
                        0.7) * 100,
                    )}
                    %
                  </Label>
                  <Slider
                    value={[
                      mapCustomization.featureOpacity?.[selectedFeature] ||
                        mapCustomization.opacity[selectedFeatureType as keyof typeof mapCustomization.opacity] ||
                        0.7,
                    ]}
                    min={0}
                    max={1}
                    step={0.05}
                    onValueChange={(value) => updateFeatureOpacity(value[0])}
                  />
                </div>

                <Button variant="outline" className="w-full" onClick={() => setSelectedFeature(null)}>
                  Clear Selection
                </Button>

                <Button variant="secondary" className="w-full" onClick={resetFeatureColor}>
                  Reset to Default Color
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-secondary/50 p-3 rounded-md flex items-start gap-2">
                  <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">
                    Click on a region, zone, or woreda on the map to customize its color individually. Changes will
                    appear instantly.
                  </p>
                </div>

                <div>
                  <Label className="block text-sm font-medium mb-1">Region Default Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={mapCustomization.colors.region}
                      onChange={(e) => {
                        const newColors = { ...mapCustomization.colors, region: e.target.value }
                        updateMapCustomization("colors", newColors)
                      }}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={mapCustomization.colors.region}
                      onChange={(e) => updateMapCustomization("colors.region", e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <Label className="block text-sm font-medium mb-1">Zone Default Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={mapCustomization.colors.zone}
                      onChange={(e) => {
                        const newColors = { ...mapCustomization.colors, zone: e.target.value }
                        updateMapCustomization("colors", newColors)
                      }}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={mapCustomization.colors.zone}
                      onChange={(e) => updateMapCustomization("colors.zone", e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <Label className="block text-sm font-medium mb-1">Woreda Default Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={mapCustomization.colors.woreda}
                      onChange={(e) => {
                        const newColors = { ...mapCustomization.colors, woreda: e.target.value }
                        updateMapCustomization("colors", newColors)
                      }}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={mapCustomization.colors.woreda}
                      onChange={(e) => updateMapCustomization("colors.woreda", e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <Label className="block text-sm font-medium mb-1">
                    Region Opacity: {Math.round(mapCustomization.opacity.region * 100)}%
                  </Label>
                  <Slider
                    value={[mapCustomization.opacity.region]}
                    min={0}
                    max={1}
                    step={0.05}
                    onValueChange={(value) => updateMapCustomization("opacity.region", value[0])}
                  />
                </div>

                <div>
                  <Label className="block text-sm font-medium mb-1">
                    Zone Opacity: {Math.round(mapCustomization.opacity.zone * 100)}%
                  </Label>
                  <Slider
                    value={[mapCustomization.opacity.zone]}
                    min={0}
                    max={1}
                    step={0.05}
                    onValueChange={(value) => updateMapCustomization("opacity.zone", value[0])}
                  />
                </div>

                <div>
                  <Label className="block text-sm font-medium mb-1">
                    Woreda Opacity: {Math.round(mapCustomization.opacity.woreda * 100)}%
                  </Label>
                  <Slider
                    value={[mapCustomization.opacity.woreda]}
                    min={0}
                    max={1}
                    step={0.05}
                    onValueChange={(value) => updateMapCustomization("opacity.woreda", value[0])}
                  />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="borders" className="p-4 space-y-6">
            <div>
              <Label className="block text-sm font-medium mb-1">Border Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={mapCustomization.borders.color}
                  onChange={(e) => updateMapCustomization("borders.color", e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <Input
                  value={mapCustomization.borders.color}
                  onChange={(e) => updateMapCustomization("borders.color", e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <Label className="block text-sm font-medium mb-1">Border Width: {mapCustomization.borders.width}px</Label>
              <Slider
                value={[mapCustomization.borders.width]}
                min={0.5}
                max={3}
                step={0.5}
                onValueChange={(value) => updateMapCustomization("borders.width", value[0])}
              />
            </div>

            <div>
              <Label className="block text-sm font-medium mb-1">Border Style</Label>
              <Select
                value={mapCustomization.borders.style}
                onValueChange={(value) => updateMapCustomization("borders.style", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select border style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Solid</SelectItem>
                  <SelectItem value="dashed">Dashed</SelectItem>
                  <SelectItem value="dotted">Dotted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="display" className="p-4 space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-labels" className="text-sm font-medium">
                Show Labels
              </Label>
              <Switch
                id="show-labels"
                checked={mapCustomization.showLabels}
                onCheckedChange={(checked) => updateMapCustomization("showLabels", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-tooltips" className="text-sm font-medium">
                Show Tooltips
              </Label>
              <Switch
                id="show-tooltips"
                checked={mapCustomization.showTooltips}
                onCheckedChange={(checked) => updateMapCustomization("showTooltips", checked)}
              />
            </div>

            <div>
              <Label className="block text-sm font-medium mb-1">Base Map</Label>
              <Select
                value={mapCustomization.basemap}
                onValueChange={(value) => updateMapCustomization("basemap", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select base map" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="streets">Street Map</SelectItem>
                  <SelectItem value="satellite">Satellite Imagery</SelectItem>
                  <SelectItem value="topographic">Topographic Map</SelectItem>
                  <SelectItem value="dark">Dark Mode</SelectItem>
                  <SelectItem value="light">Light Mode</SelectItem>
                  <SelectItem value="terrain">Terrain</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="markers" className="p-4 space-y-6">
            <div className="space-y-2">
              <h3 className="font-medium">Map Markers</h3>
              <div className="bg-secondary/50 p-3 rounded-md flex items-start gap-2">
                <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  Click anywhere on the map to place a marker. Then customize its appearance below and click "Add
                  Marker".
                </p>
              </div>
            </div>

            <MarkerEditor
              markers={mapCustomization.markers}
              onAddMarker={handleAddMarker}
              onUpdateMarker={handleUpdateMarker}
              onRemoveMarker={handleRemoveMarker}
              clickPosition={clickPosition}
              setClickPosition={setClickPosition}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
