"use client"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { StepIndicator } from "@/components/step-indicator"
import GeoMap from "@/components/geo-map"
import Step4Metadata from "@/components/step4-metadata"
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
    shape?: "circle" | "line" | "polygon" | "square" | "pin" | "triangle" | "hexagon"
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

interface MapMetadata {
  title: string
  description: string
  author: string
  organization: string
  date: string
  link: string
  showLegend: boolean
  showTitle: boolean
  showDescription: boolean
  showAuthor: boolean
  showDate: boolean
}

export default function MetadataPage() {
  const router = useRouter()
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [selectedData, setSelectedData] = useState<SelectedData | null>(null)
  const [mapCustomization, setMapCustomization] = useState<MapCustomization | null>(null)
  const [dataLayers, setDataLayers] = useState<DataLayer[]>([])
  const [clipToSelection, setClipToSelection] = useState(true)
  const [loading, setLoading] = useState(true)

  // Map metadata
  const [metadata, setMetadata] = useState<MapMetadata>({
    title: "Ethiopia Administrative Map",
    description: "Custom map of selected administrative areas in Ethiopia",
    author: "",
    organization: "",
    date: new Date().toISOString().split("T")[0],
    link: "https://example.com/map/share/123456",
    showLegend: true,
    showTitle: true,
    showDescription: true,
    showAuthor: true,
    showDate: true,
  })

  useEffect(() => {
    // Load data from localStorage
    const storedData = localStorage.getItem("selectedMapData")
    const storedCustomization = localStorage.getItem("mapCustomization")
    const storedLayers = localStorage.getItem("dataLayers")
    const storedClipSetting = localStorage.getItem("clipToSelection")
    const storedMetadata = localStorage.getItem("mapMetadata")

    if (storedData) {
      setSelectedData(JSON.parse(storedData))
    }

    if (storedCustomization) {
      setMapCustomization(JSON.parse(storedCustomization))
    }

    if (storedLayers) {
      setDataLayers(JSON.parse(storedLayers))
    }

    if (storedClipSetting) {
      setClipToSelection(JSON.parse(storedClipSetting))
    }

    if (storedMetadata) {
      setMetadata(JSON.parse(storedMetadata))
    }

    setLoading(false)
  }, [])

  const handleBackClick = () => {
    router.push("/data")
  }

  const handleNextClick = () => {
    // Store metadata
    localStorage.setItem("mapMetadata", JSON.stringify(metadata))
    router.push("/export")
  }

  const handleMetadataChange = (key: keyof MapMetadata, value: any) => {
    setMetadata((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // Helper function to get active basemap
  const getActiveBasemap = (): string => {
    const activeBasemap = dataLayers.find((layer) => layer.category === "basemap" && layer.enabled)
    return activeBasemap ? activeBasemap.id : "streets"
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

  const steps = [
    { number: 1, label: "Select Areas", description: "Choose regions, zones, woredas", path: "/" },
    { number: 2, label: "Customize Map", description: "Style your map", path: "/customize" },
    { number: 3, label: "Add Data Layers", description: "Enrich with data", path: "/data" },
    { number: 4, label: "Add Metadata", description: "Title, legend, description", path: "/metadata" },
    { number: 5, label: "Export", description: "Preview and download", path: "/export" },
  ]

  return (
    <main className="container mx-auto p-4 bg-background min-h-screen">
      <StepIndicator currentStep={5} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-1 space-y-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <Step4Metadata metadata={metadata} handleMetadataChange={handleMetadataChange} />
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
            <div className="border-b pb-2">
              {metadata.showTitle && <h2 className="text-xl font-bold">{metadata.title}</h2>}
              {metadata.showDescription && <p className="text-sm text-muted-foreground mt-1">{metadata.description}</p>}
            </div>
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
              className="h-[500px]"
              step={4}
            />
            <div className="flex justify-between text-xs text-muted-foreground pt-2 px-2">
              <div className="flex items-center gap-1">
                <span>{metadata.link}</span>
              </div>
              {metadata.showAuthor && (
                <div>
                  {metadata.author && `${metadata.author}`}
                  {metadata.organization && metadata.author && " • "}
                  {metadata.organization && `${metadata.organization}`}
                  {(metadata.author || metadata.organization) && metadata.showDate && " • "}
                  {metadata.showDate && metadata.date}
                </div>
              )}
            </div>
          </motion.div>

          {metadata.showLegend && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-card rounded-lg p-4 border border-border"
            >
              <h3 className="font-medium mb-3">Legend</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="font-medium text-sm">Administrative Areas</p>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-sm"
                      style={{ backgroundColor: mapCustomization.colors.region }}
                    ></div>
                    <span className="text-sm">Regions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: mapCustomization.colors.zone }}></div>
                    <span className="text-sm">Zones</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-sm"
                      style={{ backgroundColor: mapCustomization.colors.woreda }}
                    ></div>
                    <span className="text-sm">Woredas</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-medium text-sm">Data Layers</p>
                  {dataLayers.filter((l) => l.enabled && l.category !== "basemap").length > 0 ? (
                    dataLayers
                      .filter((l) => l.enabled && l.category !== "basemap")
                      .map((layer) => (
                        <div key={layer.id} className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-sm bg-${
                              layer.category === "climate"
                                ? "blue"
                                : layer.category === "infrastructure"
                                  ? "yellow"
                                  : layer.category === "demographics"
                                    ? "purple"
                                    : layer.category === "land-use"
                                      ? "green"
                                      : "red"
                            }-500/80`}
                          ></div>
                          <span className="text-sm">{layer.name}</span>
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No data layers enabled</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

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
              <ArrowLeft className="h-5 w-5" /> Back to Data Layers
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
