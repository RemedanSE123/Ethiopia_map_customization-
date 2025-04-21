"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Map,
  Cloud,
  Thermometer,
  Droplets,
  Mountain,
  RouteIcon as Road,
  Building,
  Users,
  Landmark,
  Wheat,
  Leaf,
  Layers,
  AlertTriangle,
} from "lucide-react"

const dataLayerSources = {
  temperature: {
    url: "https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=your_openweathermap_key",
    attribution: "© OpenWeatherMap",
    maxZoom: 19,
  },
  rainfall: {
    url: "https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=your_openweathermap_key",
    attribution: "© OpenWeatherMap",
    maxZoom: 19,
  },
  "climate-zones": {
    // No direct tile service for climate zones; consider WMS or GeoJSON
    // Example: Use a WMS service from a provider like NOAA or Copernicus
    url: "https://geo.weather.gov/arcgis/rest/services/climate/climate_zones/MapServer/tile/{z}/{y}/{x}", // Hypothetical
    attribution: "© NOAA",
    maxZoom: 18,
  },
  roads: {
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap contributors",
    maxZoom: 19,
  },
  buildings: {
    // Use OpenStreetMap-based building tiles or a dedicated service
    url: "https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", // HOT style includes buildings
    attribution: "© OpenStreetMap contributors",
    maxZoom: 19,
  },
  "water-bodies": {
    // Use OpenStreetMap or a dedicated water layer
    url: "https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", // HOT style includes water
    attribution: "© OpenStreetMap contributors",
    maxZoom: 19,
  },
  population: {
    // Use a population density tile service, e.g., from WorldPop or CIESIN
    url: "https://data.humdata.org/mapserver/wms/population_density/{z}/{x}/{y}.png", // Hypothetical
    attribution: "© WorldPop",
    maxZoom: 18,
  },
  "urban-areas": {
    // Use OpenStreetMap or a land-use layer
    url: "https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", // HOT style includes urban areas
    attribution: "© OpenStreetMap contributors",
    maxZoom: 19,
  },
  administrative: {
    // Use OpenStreetMap or a dedicated admin boundary layer
    url: "https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", // HOT style includes boundaries
    attribution: "© OpenStreetMap contributors",
    maxZoom: 19,
  },
  agriculture: {
    // Use a land-use layer from Copernicus or USGS
    url: "https://glcfs.cis.rit.edu/landcover/tile/{z}/{x}/{y}.png", // Hypothetical
    attribution: "© USGS",
    maxZoom: 18,
  },
  forests: {
    // Use a forest cover layer from Global Forest Watch
    url: "https://tiles.globalforestwatch.org/gfw_2019_tree_cover/{z}/{x}/{y}.png", // Hypothetical
    attribution: "© Global Forest Watch",
    maxZoom: 18,
  },
  "protected-areas": {
    // Use a protected areas layer from WDPA
    url: "https://tiles.protectedplanet.net/wdpa/{z}/{x}/{y}.png", // Hypothetical
    attribution: "© WDPA",
    maxZoom: 18,
  },
  "flood-risk": {
    // Use a flood hazard layer from Aqueduct or DFO
    url: "https://tiles.aqueduct.global/floods/{z}/{x}/{y}.png", // Hypothetical
    attribution: "© WRI Aqueduct",
    maxZoom: 18,
  },
  "drought-risk": {
    // Use a drought risk layer from NOAA or IRI
    url: "https://iri.columbia.edu/drought/{z}/{x}/{y}.png", // Hypothetical
    attribution: "© IRI",
    maxZoom: 18,
  },
  "landslide-risk": {
    // Use a landslide susceptibility layer from NASA or USGS
    url: "https://nasa.gov/landslides/tile/{z}/{x}/{y}.png", // Hypothetical
    attribution: "© NASA",
    maxZoom: 18,
  },
};

// Define basemap types and URLs
const basemapSources = {
  streets: {
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap contributors",
    maxZoom: 19,
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "© Esri",
    maxZoom: 19,
  },
  topographic: {
    url: "https://tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: "© OpenTopoMap",
    maxZoom: 17,
  },
  dark: {
    url: "https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "© CARTO",
    maxZoom: 19,
  },
  light: {
    url: "https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: "© CARTO",
    maxZoom: 19,
  },
  terrain: {
    url: "https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png",
    attribution: "© Stadia Maps",
    maxZoom: 18,
  },
}

interface DataLayer {
  id: string
  name: string
  description: string
  iconName: string
  enabled: boolean
  category: string
  type: string
  source?: {
    url: string
    attribution: string
    maxZoom: number
  }
}

interface Step3DataLayersProps {
  dataLayers: DataLayer[]
  setDataLayers: (layers: DataLayer[]) => void
  clipToSelection: boolean
  setClipToSelection: (clip: boolean) => void
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function Step3DataLayers({
  dataLayers,
  setDataLayers,
  clipToSelection,
  setClipToSelection,
  activeTab,
  setActiveTab,
}: Step3DataLayersProps) {
  const [selectedBasemap, setSelectedBasemap] = useState(() => {
    const activeBasemap = dataLayers.find((layer) => layer.category === "basemap" && layer.enabled)
    return activeBasemap ? activeBasemap.id : "streets"
  })

  // Add source information to data layers if not already present
  useEffect(() => {
    const updatedLayers = dataLayers.map((layer) => {
      if (layer.source) return layer

      if (layer.category === "basemap") {
        return {
          ...layer,
          source: basemapSources[layer.id as keyof typeof basemapSources],
        }
      } else {
        return {
          ...layer,
          source: dataLayerSources[layer.id as keyof typeof dataLayerSources],
        }
      }
    })

    if (JSON.stringify(updatedLayers) !== JSON.stringify(dataLayers)) {
      setDataLayers(updatedLayers)
    }
  }, [dataLayers, setDataLayers])

  const toggleLayer = (id: string) => {
    const newLayers = [...dataLayers]

    // If toggling a basemap, disable all other basemaps
    const layer = newLayers.find((l) => l.id === id)
    if (layer && layer.category === "basemap") {
      newLayers.forEach((l) => {
        if (l.category === "basemap") {
          l.enabled = l.id === id
        }
      })
      setSelectedBasemap(id)
    } else {
      // For other layers, just toggle the selected one
      const index = newLayers.findIndex((l) => l.id === id)
      if (index !== -1) {
        newLayers[index].enabled = !newLayers[index].enabled
      }
    }

    setDataLayers(newLayers)
  }

  // Helper function to render the appropriate icon
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "map":
        return <Map className="h-5 w-5" />
      case "cloud":
        return <Cloud className="h-5 w-5" />
      case "thermometer":
        return <Thermometer className="h-5 w-5" />
      case "droplets":
        return <Droplets className="h-5 w-5" />
      case "mountain":
        return <Mountain className="h-5 w-5" />
      case "road":
        return <Road className="h-5 w-5" />
      case "building":
        return <Building className="h-5 w-5" />
      case "users":
        return <Users className="h-5 w-5" />
      case "landmark":
        return <Landmark className="h-5 w-5" />
      case "wheat":
        return <Wheat className="h-5 w-5" />
      case "leaf":
        return <Leaf className="h-5 w-5" />
      case "layers":
        return <Layers className="h-5 w-5" />
      case "alert-triangle":
        return <AlertTriangle className="h-5 w-5" />
      default:
        return <Layers className="h-5 w-5" />
    }
  }

  return (
    <>
      <Tabs defaultValue="basemaps" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="basemaps" className="flex items-center gap-1">
            <Map className="h-4 w-4" /> Base
          </TabsTrigger>
          <TabsTrigger value="climate" className="flex items-center gap-1">
            <Cloud className="h-4 w-4" /> Climate
          </TabsTrigger>
          <TabsTrigger value="infrastructure" className="flex items-center gap-1">
            <Road className="h-4 w-4" /> Infra
          </TabsTrigger>
          <TabsTrigger value="demographics" className="flex items-center gap-1">
            <Users className="h-4 w-4" /> Demo
          </TabsTrigger>
          <TabsTrigger value="land-use" className="flex items-center gap-1">
            <Layers className="h-4 w-4" /> Land
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basemaps" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Base Maps</CardTitle>
              <CardDescription>Select the base map style</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedBasemap} onValueChange={(value) => toggleLayer(value)} className="space-y-3">
                {dataLayers
                  .filter((layer) => layer.category === "basemap")
                  .map((layer) => (
                    <div
                      key={layer.id}
                      className="flex items-center space-x-2 border p-3 rounded-md hover:bg-secondary/50 transition-colors"
                    >
                      <RadioGroupItem value={layer.id} id={layer.id} />
                      <Label htmlFor={layer.id} className="flex items-center gap-2 cursor-pointer flex-1">
                        {renderIcon(layer.iconName)}
                        <div>
                          <p className="font-medium">{layer.name}</p>
                          <p className="text-xs text-muted-foreground">{layer.description}</p>
                        </div>
                      </Label>
                    </div>
                  ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Layer Display Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="clip-to-selection" className="text-sm font-medium">
                  Clip layers to selected areas
                </Label>
                <Switch id="clip-to-selection" checked={clipToSelection} onCheckedChange={setClipToSelection} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                When enabled, data layers will only be shown within your selected regions, zones, and woredas.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="climate" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Climate Layers</CardTitle>
              <CardDescription>Weather and climate data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dataLayers
                  .filter((layer) => layer.category === "climate")
                  .map((layer) => (
                    <div
                      key={layer.id}
                      className="flex items-center justify-between border p-3 rounded-md hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {renderIcon(layer.iconName)}
                        <div>
                          <p className="font-medium">{layer.name}</p>
                          <p className="text-xs text-muted-foreground">{layer.description}</p>
                        </div>
                      </div>
                      <Switch checked={layer.enabled} onCheckedChange={() => toggleLayer(layer.id)} />
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="infrastructure" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Infrastructure Layers</CardTitle>
              <CardDescription>Roads, buildings, and facilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dataLayers
                  .filter((layer) => layer.category === "infrastructure")
                  .map((layer) => (
                    <div
                      key={layer.id}
                      className="flex items-center justify-between border p-3 rounded-md hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {renderIcon(layer.iconName)}
                        <div>
                          <p className="font-medium">{layer.name}</p>
                          <p className="text-xs text-muted-foreground">{layer.description}</p>
                        </div>
                      </div>
                      <Switch checked={layer.enabled} onCheckedChange={() => toggleLayer(layer.id)} />
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Demographic Layers</CardTitle>
              <CardDescription>Population and settlement data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dataLayers
                  .filter((layer) => layer.category === "demographics")
                  .map((layer) => (
                    <div
                      key={layer.id}
                      className="flex items-center justify-between border p-3 rounded-md hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {renderIcon(layer.iconName)}
                        <div>
                          <p className="font-medium">{layer.name}</p>
                          <p className="text-xs text-muted-foreground">{layer.description}</p>
                        </div>
                      </div>
                      <Switch checked={layer.enabled} onCheckedChange={() => toggleLayer(layer.id)} />
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="land-use" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Land Use Layers</CardTitle>
              <CardDescription>Agriculture, forests, and protected areas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dataLayers
                  .filter((layer) => layer.category === "land-use")
                  .map((layer) => (
                    <div
                      key={layer.id}
                      className="flex items-center justify-between border p-3 rounded-md hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {renderIcon(layer.iconName)}
                        <div>
                          <p className="font-medium">{layer.name}</p>
                          <p className="text-xs text-muted-foreground">{layer.description}</p>
                        </div>
                      </div>
                      <Switch checked={layer.enabled} onCheckedChange={() => toggleLayer(layer.id)} />
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Risk Layers</CardTitle>
              <CardDescription>Hazard and risk assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dataLayers
                  .filter((layer) => layer.category === "risk")
                  .map((layer) => (
                    <div
                      key={layer.id}
                      className="flex items-center justify-between border p-3 rounded-md hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {renderIcon(layer.iconName)}
                        <div>
                          <p className="font-medium">{layer.name}</p>
                          <p className="text-xs text-muted-foreground">{layer.description}</p>
                        </div>
                      </div>
                      <Switch checked={layer.enabled} onCheckedChange={() => toggleLayer(layer.id)} />
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Active Layers</CardTitle>
          <CardDescription>Currently enabled data layers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {dataLayers.filter((layer) => layer.enabled).length === 0 ? (
              <p className="text-sm text-muted-foreground">No layers enabled</p>
            ) : (
              dataLayers
                .filter((layer) => layer.enabled)
                .map((layer) => (
                  <div key={layer.id} className="flex items-center justify-between text-sm p-2 border rounded-md">
                    <div className="flex items-center gap-2">
                      {renderIcon(layer.iconName)}
                      <span>{layer.name}</span>
                    </div>
                    <button
                      className="h-6 w-6 p-0 flex items-center justify-center rounded-full hover:bg-secondary"
                      onClick={() => toggleLayer(layer.id)}
                    >
                      ×
                    </button>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
