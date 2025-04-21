"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { EnhancedMultiSelect, type Option } from "@/components/enhanced-multi-select"
import GeoMap from "@/components/geo-map"
import { SelectedSummary } from "@/components/selected-summary"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
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
          const newZones = data.filter(
            (zone) => !prevZones.some((z) => z.adm2_pcode === zone.adm2_pcode)
          )
          return [...prevZones, ...newZones]
        })

        // Update zone options
        setZoneOptions((prevZones) => {
          const newZones = data.filter(
            (zone) => !prevZones.some((z) => z.value === zone.adm2_pcode)
          )
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
    []
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
          const newWoredas = data.filter(
            (woreda) => !prevWoredas.some((w) => w.adm3_pcode === woreda.adm3_pcode)
          )
          return [...prevWoredas, ...newWoredas]
        })

        // Update woreda options
        setWoredaOptions((prevWoredas) => {
          const newWoredas = data.filter(
            (woreda) => !prevWoredas.some((w) => w.value === woreda.adm3_pcode)
          )
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
    []
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

  // Handle next button click
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

    localStorage.setItem("selectedMapData", JSON.stringify(selectedData))

    // Navigate to step 2
    router.push("/customize")
  }

  return (
    <main className="container mx-auto p-4 bg-background min-h-screen">
      <StepIndicator currentStep={1} />

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
    </main>
  )
}