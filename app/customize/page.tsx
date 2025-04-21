"use client"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StepIndicator } from "@/components/step-indicator"
import GeoMap from "@/components/geo-map"
import Step2Customize from "@/components/step2-customize"
import { ArrowLeft, ArrowRight } from "lucide-react"
import type { GeoFeature } from "@/types/geo-types"
import { motion } from "framer-motion"

// Define the SelectedData type
interface SelectedData {
  regions: Array<{ code: string; name: string }>
  zones: Array<{ code: string; name: string }>
  woredas: Array<{ code: string; name: string }>
  features: GeoFeature[]
}

// Update the MapCustomization interface to include label customization
interface MapCustomization {
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

export default function CustomizePage() {
  const router = useRouter()
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [selectedData, setSelectedData] = useState<SelectedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("colors")
  const [clickPosition, setClickPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null)

  // Map customization options
  // Update the initial state to include featureOpacity
  const [mapCustomization, setMapCustomization] = useState<MapCustomization>({
    colors: {
      region: "#1a73e8", // Blue
      zone: "#34a853", // Green
      woreda: "#ea4335", // Red
    },
    featureColors: {},
    featureOpacity: {},
    opacity: {
      region: 0.7,
      zone: 0.7,
      woreda: 0.7,
    },
    borders: {
      width: 1,
      style: "solid",
      color: "#000000",
    },
    background: "#f8f9fa",
    showLabels: true,
    showTooltips: true,
    basemap: "dark",
    markers: [],
  })

  useEffect(() => {
    // Load selected data from localStorage
    const storedData = localStorage.getItem("selectedMapData")
    if (storedData) {
      setSelectedData(JSON.parse(storedData))
    }

    // Load customization if exists
    const storedCustomization = localStorage.getItem("mapCustomization")
    if (storedCustomization) {
      try {
        const customization = JSON.parse(storedCustomization)
        // Ensure featureOpacity exists
        if (!customization.featureOpacity) {
          customization.featureOpacity = {}
        }
        setMapCustomization(customization)
      } catch (error) {
        console.error("Error parsing stored customization:", error)
      }
    }

    setLoading(false)
  }, [])

  const handleBackClick = () => {
    router.push("/")
  }

  const handleNextClick = () => {
    // Store customization options
    if (selectedData) {
      localStorage.setItem("mapCustomization", JSON.stringify(mapCustomization))
      router.push("/data")
    }
  }

  const updateMapCustomization = (key: string, value: any) => {
    setMapCustomization((prev) => {
      const newState = { ...prev }

      // Handle nested properties
      if (key.includes(".")) {
        const [parent, child] = key.split(".") as [keyof MapCustomization, string]
        if (typeof newState[parent] === "object" && newState[parent] !== null) {
          // Create a new object for the parent to ensure state immutability
          newState[parent] = {
            ...(newState[parent] as Record<string, any>),
            [child]: value,
          } as never
        }
      } else {
        newState[key as keyof MapCustomization] = value as never
      }

      return newState
    })
  }

  const handleFeatureClick = (feature: GeoFeature) => {
    // Only set selected feature if in colors tab
    if (activeTab === "colors") {
      setSelectedFeature(feature.properties.code)
    }
  }

  // Update the handleMapClick function to set clickPosition based on active tab
  const handleMapClick = (lat: number, lng: number) => {
    // If in markers tab, set click position for marker placement
    if (activeTab === "markers") {
      setClickPosition({ lat, lng })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg">Loading customization options...</p>
        </motion.div>
      </div>
    )
  }

  if (!selectedData) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-2xl font-bold mb-4">No selection data found</h1>
          <p className="mb-6">Please go back and select areas first.</p>
          <Button onClick={handleBackClick}>Go Back to Selection</Button>
        </motion.div>
      </div>
    )
  }

  return (
    <main className="container mx-auto p-4 bg-background min-h-screen">
      <StepIndicator currentStep={2} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-1 space-y-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <Step2Customize
              selectedData={selectedData}
              mapCustomization={mapCustomization}
              updateMapCustomization={updateMapCustomization}
              onFeatureClick={handleFeatureClick}
              clickPosition={clickPosition}
              selectedFeature={selectedFeature}
              setSelectedFeature={setSelectedFeature}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              setClickPosition={setClickPosition}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-primary/20 shadow-lg">
              <CardHeader>
                <CardTitle>Selection Summary</CardTitle>
              </CardHeader>
              <CardContent className="max-h-80 overflow-y-auto custom-scrollbar">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-primary">Regions ({selectedData.regions.length})</h3>
                    <div className="mt-1">
                      {selectedData.regions.map((region) => (
                        <span
                          key={region.code}
                          className="inline-block bg-primary/10 text-primary text-xs rounded px-2 py-1 mr-1 mb-1"
                        >
                          {region.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-[#34a853]">Zones ({selectedData.zones.length})</h3>
                    <div className="mt-1">
                      {selectedData.zones.map((zone) => (
                        <span
                          key={zone.code}
                          className="inline-block bg-[#34a853]/10 text-[#34a853] text-xs rounded px-2 py-1 mr-1 mb-1"
                        >
                          {zone.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-[#ea4335]">Woredas ({selectedData.woredas.length})</h3>
                    <div className="mt-1">
                      {selectedData.woredas.map((woreda) => (
                        <span
                          key={woreda.code}
                          className="inline-block bg-[#ea4335]/10 text-[#ea4335] text-xs rounded px-2 py-1 mr-1 mb-1"
                        >
                          {woreda.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
            {/* Update the GeoMap component to pass featureOpacity */}
            <GeoMap
              features={selectedData.features}
              colors={mapCustomization.colors}
              featureColors={mapCustomization.featureColors}
              featureOpacity={mapCustomization.featureOpacity}
              opacity={mapCustomization.opacity}
              borders={mapCustomization.borders}
              showLabels={mapCustomization.showLabels}
              showTooltips={mapCustomization.showTooltips}
              basemap={mapCustomization.basemap}
              markers={mapCustomization.markers}
              onFeatureClick={handleFeatureClick}
              onMapClick={handleMapClick}
              highlightedFeature={selectedFeature}
              className="h-[600px]"
              step={2}
              activeTab={activeTab}
            />
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
              <ArrowLeft className="h-5 w-5" /> Back to Selection
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
