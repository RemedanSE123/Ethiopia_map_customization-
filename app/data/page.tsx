"use client"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { StepIndicator } from "@/components/step-indicator"
import GeoMap from "@/components/geo-map"
import Step3DataLayers from "@/components/step3-data-layers"
import { ArrowLeft, ArrowRight } from "lucide-react"
import type { GeoFeature } from "@/types/geo-types"
import { motion } from "framer-motion"

interface SelectedData {
  regions: { code: string; name: string }[]
  zones: { code: string; name: string }[]
  woredas: { code: string; name: string }[]
  features: GeoFeature[]
}

interface MapCustomization {
  colors: {
    region: string
    zone: string
    woreda: string
  }
  featureColors: Record<string, string>
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
    label?: string
    shape?: "polygon" | "line" | "circle" | "square" | "pin" | "triangle" | "hexagon"
    points?: Array<{ lat: number; lng: number }>
  }>
}

interface DataLayer {
  id: string
  name: string
  description: string
  iconName: string
  enabled: boolean
  category: string
  type: string
}

export default function DataLayersPage() {
  const router = useRouter()
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [selectedData, setSelectedData] = useState<SelectedData | null>(null)
  const [mapCustomization, setMapCustomization] = useState<MapCustomization | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("basemaps")
  const [clipToSelection, setClipToSelection] = useState(true)

  // Data layers - using iconName instead of React components to avoid circular JSON
  const [dataLayers, setDataLayers] = useState<DataLayer[]>([
    // Basemaps
    {
      id: "streets",
      name: "Street Map",
      description: "Standard street map with roads and landmarks",
      iconName: "map",
      enabled: true,
      category: "basemap",
      type: "streets",
    },
    {
      id: "satellite",
      name: "Satellite Imagery",
      description: "High-resolution satellite imagery",
      iconName: "cloud",
      enabled: false,
      category: "basemap",
      type: "satellite",
    },
    {
      id: "topographic",
      name: "Topographic Map",
      description: "Topographic map showing elevation",
      iconName: "mountain",
      enabled: false,
      category: "basemap",
      type: "topographic",
    },
    {
      id: "dark",
      name: "Dark Mode",
      description: "Dark-themed map for low light conditions",
      iconName: "map",
      enabled: false,
      category: "basemap",
      type: "dark",
    },
    {
      id: "light",
      name: "Light Mode",
      description: "Light-themed map for high contrast",
      iconName: "map",
      enabled: false,
      category: "basemap",
      type: "light",
    },
    {
      id: "terrain",
      name: "Terrain",
      description: "Detailed terrain visualization",
      iconName: "mountain",
      enabled: false,
      category: "basemap",
      type: "terrain",
    },

    // Climate layers
    {
      id: "temperature",
      name: "Temperature",
      description: "Average temperature distribution",
      iconName: "thermometer",
      enabled: false,
      category: "climate",
      type: "heatmap",
    },
    {
      id: "rainfall",
      name: "Rainfall",
      description: "Annual precipitation levels",
      iconName: "droplets",
      enabled: false,
      category: "climate",
      type: "choropleth",
    },
    {
      id: "climate-zones",
      name: "Climate Zones",
      description: "Climate classification zones",
      iconName: "cloud",
      enabled: false,
      category: "climate",
      type: "polygon",
    },

    // Infrastructure layers
    {
      id: "roads",
      name: "Road Network",
      description: "Major and minor roads",
      iconName: "road",
      enabled: false,
      category: "infrastructure",
      type: "line",
    },
    {
      id: "buildings",
      name: "Buildings",
      description: "Major buildings and structures",
      iconName: "building",
      enabled: false,
      category: "infrastructure",
      type: "polygon",
    },
    {
      id: "water-bodies",
      name: "Water Bodies",
      description: "Lakes, rivers, and reservoirs",
      iconName: "droplets",
      enabled: false,
      category: "infrastructure",
      type: "polygon",
    },

    // Demographics layers
    {
      id: "population",
      name: "Population Density",
      description: "Population distribution",
      iconName: "users",
      enabled: false,
      category: "demographics",
      type: "choropleth",
    },
    {
      id: "urban-areas",
      name: "Urban Areas",
      description: "Cities and urban settlements",
      iconName: "building",
      enabled: false,
      category: "demographics",
      type: "polygon",
    },
    {
      id: "administrative",
      name: "Administrative Boundaries",
      description: "Political boundaries",
      iconName: "landmark",
      enabled: false,
      category: "demographics",
      type: "polygon",
    },

    // Land use layers
    {
      id: "agriculture",
      name: "Agricultural Areas",
      description: "Farming and agricultural lands",
      iconName: "wheat",
      enabled: false,
      category: "land-use",
      type: "polygon",
    },
    {
      id: "forests",
      name: "Forests",
      description: "Forest coverage and types",
      iconName: "leaf",
      enabled: false,
      category: "land-use",
      type: "polygon",
    },
    {
      id: "protected-areas",
      name: "Protected Areas",
      description: "National parks and reserves",
      iconName: "leaf",
      enabled: false,
      category: "land-use",
      type: "polygon",
    },

    // Risk layers
    {
      id: "flood-risk",
      name: "Flood Risk",
      description: "Areas prone to flooding",
      iconName: "alert-triangle",
      enabled: false,
      category: "risk",
      type: "choropleth",
    },
    {
      id: "drought-risk",
      name: "Drought Risk",
      description: "Areas prone to drought",
      iconName: "alert-triangle",
      enabled: false,
      category: "risk",
      type: "choropleth",
    },
    {
      id: "landslide-risk",
      name: "Landslide Risk",
      description: "Areas prone to landslides",
      iconName: "alert-triangle",
      enabled: false,
      category: "risk",
      type: "choropleth",
    },
  ])

  useEffect(() => {
    // Load selected data from localStorage
    const storedData = localStorage.getItem("selectedMapData")
    const storedCustomization = localStorage.getItem("mapCustomization")
    const storedLayers = localStorage.getItem("dataLayers")

    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData)
        console.log("Loaded selected data:", parsedData)
        setSelectedData(parsedData)
      } catch (error) {
        console.error("Error parsing stored data:", error)
      }
    } else {
      console.warn("No selected data found in localStorage")
    }

    if (storedCustomization) {
      try {
        const parsedCustomization = JSON.parse(storedCustomization)
        console.log("Loaded map customization:", parsedCustomization)
        setMapCustomization(parsedCustomization)
      } catch (error) {
        console.error("Error parsing stored customization:", error)
      }
    } else {
      console.warn("No map customization found in localStorage")
    }

    if (storedLayers) {
      try {
        const parsedLayers = JSON.parse(storedLayers)
        console.log("Loaded data layers:", parsedLayers)
        setDataLayers(parsedLayers)

        // Set active basemap
        const activeBasemap = parsedLayers.find((layer: DataLayer) => layer.category === "basemap" && layer.enabled)
        if (activeBasemap) {
          setActiveTab(activeBasemap.id)
        }
      } catch (error) {
        console.error("Error parsing stored layers:", error)
      }
    }

    setLoading(false)
  }, [])

  const handleBackClick = () => {
    router.push("/customize")
  }

  const handleNextClick = () => {
    // Store data layers
    localStorage.setItem("dataLayers", JSON.stringify(dataLayers))
    localStorage.setItem("clipToSelection", JSON.stringify(clipToSelection))
    router.push("/metadata")
  }

  if (loading) {
    return <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!selectedData || !mapCustomization) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">No data found</h1>
        <p className="mb-6">Please go back and complete the previous steps first.</p>
        <Button onClick={() => router.push("/")}>Go Back to Selection</Button>
      </div>
    )
  }

  // Helper function to get active basemap
  const getActiveBasemap = (): string => {
    const activeBasemap = dataLayers.find((layer) => layer.category === "basemap" && layer.enabled)
    return activeBasemap ? activeBasemap.id : "streets"
  }

  return (
    <main className="container mx-auto p-4 bg-background min-h-screen">
      <StepIndicator currentStep={3} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-1 space-y-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <Step3DataLayers
              dataLayers={dataLayers}
              setDataLayers={setDataLayers}
              clipToSelection={clipToSelection}
              setClipToSelection={setClipToSelection}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </motion.div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="map-container rounded-lg overflow-hidden shadow-lg"
            ref={mapContainerRef}
          >
            <GeoMap
              features={selectedData.features}
              colors={mapCustomization.colors}
              featureColors={mapCustomization.featureColors}
              opacity={mapCustomization.opacity}
              borders={mapCustomization.borders}
              showLabels={mapCustomization.showLabels}
              showTooltips={mapCustomization.showTooltips}
              basemap={getActiveBasemap()}
              markers={mapCustomization.markers}
              className="h-[600px]"
              step={3}
            />
            <div className="absolute bottom-4 left-4 bg-background/80 p-2 rounded-md border border-border text-xs">
              <p className="font-medium">Active Layers:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {dataLayers
                  .filter((layer) => layer.enabled)
                  .map((layer) => (
                    <span key={layer.id} className="bg-primary/20 text-primary px-2 py-0.5 rounded-sm">
                      {layer.name}
                    </span>
                  ))}
                {dataLayers.filter((layer) => layer.enabled).length === 0 && (
                  <span className="text-muted-foreground">None</span>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-between mt-6"
          >
            <Button
              onClick={handleBackClick}
              variant="outline"
              className="px-6 py-2 rounded-md flex items-center gap-2"
            >
              <ArrowLeft className="h-5 w-5" /> Back to Customization
            </Button>

            <Button
              onClick={handleNextClick}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-md shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 text-lg"
            >
              Next Step <ArrowRight className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
