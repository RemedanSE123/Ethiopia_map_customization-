"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { EnhancedMultiSelect, type Option } from "@/components/enhanced-multi-select"
import GeoMap from "@/components/geo-map"
import { SelectedSummary } from "@/components/selected-summary"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowRight, Sparkles, X } from "lucide-react"
import type { Region, Zone, Woreda, GeoFeature } from "@/types/geo-types"
import { StepIndicator } from "@/components/step-indicator"
import { clearStorageOnRefresh } from "@/lib/clear-storage"
import debounce from "lodash/debounce" // Add lodash for debouncing

export default function Home() {
  const router = useRouter()

  // Clear localStorage on page refresh
  useEffect(() => {
    clearStorageOnRefresh()
  }, [])

  // State for data
  const [regions, setRegions] = useState<Region[]>([])
  const [zones, setZones] = useState<Zone[]>([])
  const [woredas, setWoredas] = useState<Woreda[]>([])

  // State for selections
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [selectedZones, setSelectedZones] = useState<string[]>([])
  const [selectedWoredas, setSelectedWoredas] = useState<string[]>([])

  // State for options
  const [regionOptions, setRegionOptions] = useState<Option[]>([])
  const [zoneOptions, setZoneOptions] = useState<Option[]>([])
  const [woredaOptions, setWoredaOptions] = useState<Option[]>([])

  // State for features to display
  const [features, setFeatures] = useState<GeoFeature[]>([])

  // Loading states
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [modalMessage, setModalMessage] = useState("")

  // Fetch regions on component mount
  useEffect(() => {
    async function fetchRegions() {
      setIsLoading(true)
      try {
        const response = await fetch("/api/regions")
        if (!response.ok) throw new Error("Failed to fetch regions")

        const data: Region[] = await response.json()
        setRegions(data)

        const options = data.map((region) => ({
          value: region.adm1_pcode,
          label: region.adm1_en,
        }))

        setRegionOptions(options)
      } catch (error) {
        console.error("Error fetching regions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRegions()
  }, [])

  // Debounced fetch zones function
  const fetchZones = useCallback(
    debounce(async (regionCodes: string[]) => {
      if (regionCodes.length === 0) {
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/zones?regionCodes=${regionCodes.join(",")}`)
        if (!response.ok) throw new Error("Failed to fetch zones")

        const data: Zone[] = await response.json()

        // Update zones, keeping only zones for current selected regions
        setZones((prevZones) => {
          const newZones = data.filter((zone) => !prevZones.some((z) => z.adm2_pcode === zone.adm2_pcode))
          return [...prevZones, ...newZones]
        })

        // Update zone options
        setZoneOptions((prevZones) => {
          const newZones = data.filter((zone) => !prevZones.some((z) => z.value === zone.adm2_pcode))
          return [
            ...prevZones,
            ...newZones.map((zone) => ({
              value: zone.adm2_pcode,
              label: zone.adm2_en,
            })),
          ]
        })
      } catch (error) {
        console.error("Error fetching zones:", error)
      } finally {
        setIsLoading(false)
      }
    }, 500), // Debounce for 500ms
    [],
  )

  // Fetch zones when selectedRegions change
  useEffect(() => {
    fetchZones(selectedRegions)
    return () => fetchZones.cancel() // Cleanup debounce on unmount
  }, [selectedRegions, fetchZones])

  // Debounced fetch woredas function
  const fetchWoredas = useCallback(
    debounce(async (zoneCodes: string[]) => {
      if (zoneCodes.length === 0) {
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/woredas?zoneCodes=${zoneCodes.join(",")}`)
        if (!response.ok) throw new Error("Failed to fetch woredas")

        const data: Woreda[] = await response.json()

        // Update woredas, keeping only woredas for current selected zones
        setWoredas((prevWoredas) => {
          const newWoredas = data.filter((woreda) => !prevWoredas.some((w) => w.adm3_pcode === woreda.adm3_pcode))
          return [...prevWoredas, ...newWoredas]
        })

        // Update woreda options
        setWoredaOptions((prevWoredas) => {
          const newWoredas = data.filter((woreda) => !prevWoredas.some((w) => w.value === woreda.adm3_pcode))
          return [
            ...prevWoredas,
            ...newWoredas.map((woreda) => ({
              value: woreda.adm3_pcode,
              label: woreda.adm3_en,
            })),
          ]
        })
      } catch (error) {
        console.error("Error fetching woredas:", error)
      } finally {
        setIsLoading(false)
      }
    }, 500), // Debounce for 500ms
    [],
  )

  // Fetch woredas when selectedZones change
  useEffect(() => {
    fetchWoredas(selectedZones)
    return () => fetchWoredas.cancel() // Cleanup debounce on unmount
  }, [selectedZones, fetchWoredas])

  // Update features for map display
  useEffect(() => {
    const newFeatures: GeoFeature[] = []

    // Add selected regions (bottom layer)
    selectedRegions.forEach((regionCode) => {
      const region = regions.find((r) => r.adm1_pcode === regionCode)
      if (region) {
        const geojson = JSON.parse(region.geojson)
        newFeatures.push({
          type: "Feature",
          properties: {
            name: region.adm1_en,
            code: region.adm1_pcode,
            level: "region",
          },
          geometry: geojson,
        })
      }
    })

    // Add selected zones (middle layer)
    selectedZones.forEach((zoneCode) => {
      const zone = zones.find((z) => z.adm2_pcode === zoneCode)
      if (zone) {
        const geojson = JSON.parse(zone.geojson)
        newFeatures.push({
          type: "Feature",
          properties: {
            name: zone.adm2_en,
            code: zone.adm2_pcode,
            level: "zone",
          },
          geometry: geojson,
        })
      }
    })

    // Add selected woredas (top layer)
    selectedWoredas.forEach((woredaCode) => {
      const woreda = woredas.find((w) => w.adm3_pcode === woredaCode)
      if (woreda) {
        const geojson = JSON.parse(woreda.geojson)
        newFeatures.push({
          type: "Feature",
          properties: {
            name: woreda.adm3_en,
            code: woreda.adm3_pcode,
            level: "woreda",
          },
          geometry: geojson,
        })
      }
    })

    setFeatures(newFeatures)
  }, [selectedRegions, selectedZones, selectedWoredas, regions, zones, woredas])

  const handleNextClick = () => {
    // Store selected data in localStorage
    const selectedData = {
      regions: selectedRegions.map((code) => {
        const region = regionOptions.find((r) => r.value === code)
        return { code, name: region?.label || code }
      }),
      zones: selectedZones.map((code) => {
        const zone = zoneOptions.find((z) => z.value === code)
        return { code, name: zone?.label || code }
      }),
      woredas: selectedWoredas.map((code) => {
        const woreda = woredaOptions.find((w) => w.value === code)
        return { code, name: woreda?.label || code }
      }),
      features,
    }

    try {
      localStorage.setItem("selectedMapData", JSON.stringify(selectedData))
      // Navigate to step 2
      router.push("/customize")
    } catch (error) {
      if (error instanceof DOMException && error.name === "QuotaExceededError") {
        setModalMessage(
          "You've exceeded the 5MB storage limit. Please unselect some data or upgrade to our premium version for more storage."
        )
      } else {
        setModalMessage("An unexpected error occurred. Please try again.")
        console.error("Error saving to localStorage:", error)
      }
      setIsModalOpen(true)
    }
  }

  const handleCloseModal = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsModalOpen(false)
      setIsClosing(false)
    }, 300) // Match the exit animation duration
  }

  const handleUpgradeClick = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsModalOpen(false)
      setIsClosing(false)
      router.push("/premium")
    }, 300) // Match the exit animation duration
  }

  const handleLearnMoreClick = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsModalOpen(false)
      setIsClosing(false)
      router.push("/premium")
    }, 300) // Match the exit animation duration
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCloseModal()
    }
  }

  return (
    <main className="container mx-auto p-4 bg-background min-h-screen">
      <StepIndicator currentStep={1} />

      <Card className="relative mb-8 border border-white/10 bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] shadow-lg rounded-xl overflow-hidden">
        {/* Decorative Glows */}
        <div className="absolute top-0 right-0 w-32 h-32 -mt-10 -mr-10 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 -mb-6 -ml-6 bg-white/5 rounded-full blur-2xl"></div>

        {/* Ribbon */}
        <div className="absolute top-0 left-0 bg-cyan-600 text-white px-3 py-1 text-xs font-semibold rounded-br-md z-10">
          FREE PLAN
        </div>

        <CardContent className="p-6 relative">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 bg-white/5 p-3 rounded-full shadow">
              <Sparkles className="h-8 w-8 text-cyan-300" />
            </div>

            <div className="flex-grow">
              <h3 className="text-xl font-bold text-[hsl(var(--card-foreground))] mb-1 flex items-center">
                Free Version Limitations
                <span className="ml-2 px-2 py-0.5 text-xs bg-white/10 text-white rounded-full">
                  FREE
                </span>
              </h3>

              <p className="text-[hsl(var(--card-foreground))]/80 mb-2">
                The free plan lets you select areas up to <strong>5MB</strong> in total. Some powerful tools are only available in the premium version.
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-white/10 rounded-full h-2 mt-2 mb-3 overflow-hidden">
                <div className="bg-cyan-500 h-full w-3/5"></div>
              </div>
              <p className="text-xs text-cyan-300">60% of your selection limit used</p>

              {/* Buttons */}
              <div className="flex flex-wrap gap-2 mt-4">
                <Button
                  variant="outline"
                  className="bg-transparent border border-cyan-400 text-cyan-300 hover:bg-cyan-400/10"
                >
                  Learn More
                </Button>
                <Button className="bg-cyan-600 hover:bg-cyan-700 text-white border-none shadow-md hover:shadow-lg transition-all duration-200">
                  Upgrade to Premium
                </Button>
              </div>
            </div>

            {/* Premium Features */}
            <div className="hidden md:block border-l border-white/10 pl-4 ml-2">
              <ul className="text-sm text-[hsl(var(--card-foreground))]/80 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
                  <strong>Unlimited</strong> area selections
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
                  Advanced export options
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
                  Custom styling & branding
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
                  Team sharing & collaboration
                </li>
              </ul>
            </div>
          </div>

          {/* Testimonial */}
          <div className="mt-6 bg-white/5 p-4 rounded-md text-sm italic text-[hsl(var(--card-foreground))]/70 border-l-4 border-cyan-500">
            "Upgrading gave us so much flexibility — exports, styling, and team access! Worth every penny." — Happy User
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-primary/20 shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3 bg-primary/5">
              <CardTitle className="text-lg font-semibold text-primary">Region Selection</CardTitle>
              <CardDescription>Select one or more regions to display</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <EnhancedMultiSelect
                options={regionOptions}
                selected={selectedRegions}
                onChange={setSelectedRegions}
                placeholder="Select regions"
              />
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3 bg-[#34a853]/5">
              <CardTitle className="text-lg font-semibold text-[#34a853]">Zone Selection</CardTitle>
              <CardDescription>Select zones within the chosen regions</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <EnhancedMultiSelect
                options={zoneOptions}
                selected={selectedZones}
                onChange={setSelectedZones}
                placeholder="Select zones"
              />
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3 bg-[#ea4335]/5">
              <CardTitle className="text-lg font-semibold text-[#ea4335]">Woreda Selection</CardTitle>
              <CardDescription>Select woredas within the chosen zones</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <EnhancedMultiSelect
                options={woredaOptions}
                selected={selectedWoredas}
                onChange={setSelectedWoredas}
                placeholder="Select woredas"
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="map-container rounded-lg overflow-hidden shadow-lg">
            <GeoMap
              features={features}
              colors={{
                region: "#1a73e8",
                zone: "#34a853",
                woreda: "#ea4335",
              }}
              className="h-[600px]"
              step={1}
            />
            <div className="map-overlay"></div>
          </div>

          <SelectedSummary
            regions={regionOptions}
            zones={zoneOptions}
            woredas={woredaOptions}
            selectedRegions={selectedRegions}
            selectedZones={selectedZones}
            selectedWoredas={selectedWoredas}
          />

          <div className="flex justify-end mt-6">
            <Button
              onClick={handleNextClick}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-md shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 text-lg"
              disabled={selectedRegions.length === 0 && selectedZones.length === 0 && selectedWoredas.length === 0}
            >
              Next Step <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Custom Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          role="dialog"
          aria-labelledby="modal-title"
          aria-modal="true"
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div
            className={`bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] rounded-lg p-6 max-w-md w-full shadow-xl border border-white/10 transform transition-all hover:scale-105 ${
              isClosing ? 'animate-modal-exit' : 'animate-modal-enter'
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 id="modal-title" className="text-xl font-semibold text-red-500">
                Storage Limit Exceeded
              </h2>
              <button
                onClick={handleCloseModal}
                aria-label="Close modal"
                className="text-[hsl(var(--card-foreground))]/60 hover:text-[hsl(var(--card-foreground))] transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-[hsl(var(--card-foreground))]/80 mb-6">{modalMessage}</p>
            <p className="text-sm mb-4">
              <a
                onClick={handleLearnMoreClick}
                className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
              >
                Learn more
              </a>{' '}
              about our premium features.
            </p>
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={handleCloseModal}
                className="border border-white/20 text-[hsl(var(--card-foreground))] hover:bg-white/10 modal-close-button"
              >
                Close
              </Button>
              <Button
                onClick={handleUpgradeClick}
                className="bg-cyan-600 hover:bg-cyan-700 text-white animate-pulse-button"
              >
                Upgrade to Premium
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}