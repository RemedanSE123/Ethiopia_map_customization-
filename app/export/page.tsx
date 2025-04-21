"use client"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StepIndicator } from "@/components/step-indicator"
import GeoMap from "@/components/geo-map"
import Step5Export from "@/components/step5-export"
import { ArrowLeft } from "lucide-react"
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
    shape?: string
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

export default function ExportPage() {
  const router = useRouter()
  const mapContainerRef = useRef<HTMLDivElement>(null!) // Non-null assertion
  const [selectedData, setSelectedData] = useState<SelectedData | null>(null)
  const [mapCustomization, setMapCustomization] = useState<MapCustomization | null>(null)
  const [dataLayers, setDataLayers] = useState<DataLayer[]>([])
  const [metadata, setMetadata] = useState<MapMetadata | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load data from localStorage
    const storedData = localStorage.getItem("selectedMapData")
    const storedCustomization = localStorage.getItem("mapCustomization")
    const storedLayers = localStorage.getItem("dataLayers")
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

    if (storedMetadata) {
      setMetadata(JSON.parse(storedMetadata))
    }

    setLoading(false)
  }, [])

  const handleBackClick = () => {
    router.push("/metadata")
  }

  // Helper function to get active basemap
  const getActiveBasemap = (): string => {
    const activeBasemap = dataLayers.find((layer) => layer.category === "basemap" && layer.enabled)
    return activeBasemap ? activeBasemap.id : "streets"
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg">Loading export options...</p>
        </motion.div>
      </div>
    )
  }

  if (!selectedData || !mapCustomization || !metadata) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-2xl font-bold mb-4">No data found</h1>
          <p className="mb-6">Please go back and complete the previous steps first.</p>
          <Button onClick={() => router.push("/")}>Go Back to Selection</Button>
        </motion.div>
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
            <Step5Export metadata={metadata} mapContainerRef={mapContainerRef} />
          </motion.div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="border-primary/20 shadow-lg rounded-lg overflow-hidden"
            ref={mapContainerRef}
          >
            <div className="bg-card border-b border-border p-4">
              {metadata.showTitle && <h2 className="text-xl font-bold">{metadata.title}</h2>}
              {metadata.showDescription && <p className="text-sm text-muted-foreground mt-1">{metadata.description}</p>}
            </div>

            <div className="map-container rounded-b-lg overflow-hidden">
              <GeoMap
                features={selectedData.features}
                colors={mapCustomization.colors}
                featureColors={mapCustomization.featureColors}
                opacity={mapCustomization.opacity}
                borders={mapCustomization.borders}
                showLabels={mapCustomization.showLabels}
                showTooltips={mapCustomization.showTooltips}
                basemap={getActiveBasemap()}
                markers={mapCustomization.markers.map((marker) => ({
                  ...marker,
                  shape: ["circle", "line", "polygon", "square", "pin", "triangle", "hexagon"].includes(
                    marker.shape ?? "",
                  )
                    ? (marker.shape as "circle" | "line" | "polygon" | "square" | "pin" | "triangle" | "hexagon")
                    : undefined,
                }))}
                className="h-[500px]"
                step={5}
              />
            </div>

            <CardFooter className="bg-card border-t border-border p-2 flex justify-between text-xs text-muted-foreground">
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
            </CardFooter>
          </motion.div>

          {metadata.showLegend && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="border-primary/20 shadow-lg">
                <CardHeader className="pb-2 bg-gradient-to-r from-primary/10 to-transparent">
                  <CardTitle>Legend</CardTitle>
                </CardHeader>
                <CardContent>
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
                        <div
                          className="w-4 h-4 rounded-sm"
                          style={{ backgroundColor: mapCustomization.colors.zone }}
                        ></div>
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
                                className={`w-4 h-4 rounded-sm`}
                                style={{
                                  backgroundColor:
                                    layer.category === "climate"
                                      ? "#3b82f6"
                                      : layer.category === "infrastructure"
                                        ? "#f59e0b"
                                        : layer.category === "demographics"
                                          ? "#8b5cf6"
                                          : layer.category === "land-use"
                                            ? "#10b981"
                                            : "#ef4444",
                                }}
                              ></div>
                              <span className="text-sm">{layer.name}</span>
                            </div>
                          ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No data layers enabled</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-start mt-6"
          >
            <Button
              onClick={handleBackClick}
              variant="outline"
              className="px-6 py-2 rounded-md flex items-center gap-2"
            >
              <ArrowLeft className="h-5 w-5" /> Back to Metadata
            </Button>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
