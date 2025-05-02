"use client"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { StepIndicator } from "@/components/step-indicator"
import GeoMap from "@/components/geo-map"
import Step3Metadata from "@/components/step3-metadata"
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
  legendItems: Array<{
    label: string
    color: string
    icon: string
    iconColor: string
  }>
}

export default function MetadataPage() {
  const router = useRouter()
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [selectedData, setSelectedData] = useState<SelectedData | null>(null)
  const [mapCustomization, setMapCustomization] = useState<MapCustomization | null>(null)
  const [dataLayers, setDataLayers] = useState<DataLayer[]>([])
  const [clipToSelection, setClipToSelection] = useState(true)
  const [loading, setLoading] = useState(true)

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
    legendItems: [],
  })

  useEffect(() => {
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
      const parsedMetadata = JSON.parse(storedMetadata)
      setMetadata({
        ...parsedMetadata,
        legendItems: parsedMetadata.legendItems || [],
      })
    }

    setLoading(false)
  }, [])

  const handleBackClick = () => {
    router.push("/customize")
  }

  const handleNextClick = () => {
    localStorage.setItem("mapMetadata", JSON.stringify(metadata))
    router.push("/export")
  }

  const handleMetadataChange = (key: keyof MapMetadata, value: any) => {
    setMetadata((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const getActiveBasemap = (): string => {
    if (mapCustomization?.basemap) {
      return mapCustomization.basemap
    }
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
    { number: 3, label: "Add Metadata", description: "Title, legend, description", path: "/metadata" },
    { number: 4, label: "Export", description: "Preview and download", path: "/export" },
  ]

  // Split legend items into two columns (alternating)
  const leftLegendItems = metadata.legendItems.filter((_, index) => index % 2 === 0)
  const rightLegendItems = metadata.legendItems.filter((_, index) => index % 2 !== 0)

  return (
    <main className="container mx-auto p-4 bg-background min-h-screen">
      <StepIndicator currentStep={3} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-1 space-y-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <Step3Metadata metadata={metadata} handleMetadataChange={handleMetadataChange} />
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
              className="h-[615px]"
              step={3}
            />
            <div className="flex justify-between text-xs text-muted-foreground pt-2 px-2">
              <div className="flex items-center gap-1">
                <span>{metadata.link}</span>
              </div>
              <div>
                {metadata.showAuthor && (
                  <>
                    {metadata.author && `${metadata.author}`}
                    {metadata.organization && metadata.author && " • "}
                    {metadata.organization && `${metadata.organization}`}
                  </>
                )}
                {(metadata.showAuthor && (metadata.author || metadata.organization) && metadata.showDate) && " • "}
                {metadata.showDate && metadata.date}
              </div>
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
              {metadata.legendItems.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {leftLegendItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <svg
                          width="32"
                          height="32"
                          fill={item.iconColor}
                          viewBox="0 0 24 24"
                          className="flex-shrink-0"
                        >
                          {item.icon === "pin" && (
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
                          )}
                          {item.icon === "flag" && (
                            <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z" />
                          )}
                          {item.icon === "circle" && (
                            <circle cx="12" cy="12" r="10" />
                          )}
                          {item.icon === "square" && (
                            <rect x="4" y="4" width="16" height="16" />
                          )}
                          {item.icon === "triangle" && (
                            <path d="M12 2L2 22h20L12 2z" />
                          )}
                          {item.icon === "star" && (
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          )}
                          {item.icon === "heart" && (
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          )}
                          {item.icon === "home" && (
                            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                          )}
                          {item.icon === "building" && (
                            <path d="M4 2h16v20H4V2zm3 4h2v2H7V6zm0 4h2v2H7v-2zm0 4h2v2H7v-2zm6-8h2v2h-2V6zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z" />
                          )}
                          {item.icon === "check" && (
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          )}
                        </svg>
                        <span className="text-sm break-words max-w-[200px]">{item.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {rightLegendItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <svg
                          width="32"
                          height="32"
                          fill={item.iconColor}
                          viewBox="0 0 24 24"
                          className="flex-shrink-0"
                        >
                          {item.icon === "pin" && (
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-2.5-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
                          )}
                          {item.icon === "flag" && (
                            <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z" />
                          )}
                          {item.icon === "circle" && (
                            <circle cx="12" cy="12" r="10" />
                          )}
                          {item.icon === "square" && (
                            <rect x="4" y="4" width="16" height="16" />
                          )}
                          {item.icon === "triangle" && (
                            <path d="M12 2L2 22h20L12 2z" />
                          )}
                          {item.icon === "star" && (
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          )}
                          {item.icon === "heart" && (
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          )}
                          {item.icon === "home" && (
                            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                          )}
                          {item.icon === "building" && (
                            <path d="M4 2h16v20H4V2zm3 4h2v2H7V6zm0 4h2v2H7v-2zm0 4h2v2H7v-2zm6-8h2v2h-2V6zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z" />
                          )}
                          {item.icon === "check" && (
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          )}
                        </svg>
                        <span className="text-sm break-words max-w-[200px]">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No legend items defined</p>
              )}
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