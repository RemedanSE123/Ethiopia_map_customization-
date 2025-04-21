"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, FileImage, FileJson, FileIcon as FilePdf, FileText, Copy, Check, Share2 } from "lucide-react"
import { jsPDF } from "jspdf"

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

interface Step5ExportProps {
  metadata: MapMetadata
  mapContainerRef: React.RefObject<HTMLDivElement>
}

export default function Step5Export({ metadata, mapContainerRef }: Step5ExportProps) {
  const linkRef = useRef<HTMLInputElement>(null)
  const [copied, setCopied] = useState(false)
  const [exportFormat, setExportFormat] = useState("png")
  const [exportResolution, setExportResolution] = useState("medium")
  const [exportInProgress, setExportInProgress] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [exportType, setExportType] = useState<"map" | "full">("map")

  const handleCopyLink = () => {
    if (metadata?.link) {
      navigator.clipboard.writeText(metadata.link).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  const handleExport = () => {
    setExportInProgress(true)

    // Get the map container element
    const mapContainer = mapContainerRef.current
    if (!mapContainer) {
      setExportInProgress(false)
      alert("Could not find map container for export")
      return
    }

    // Get the canvas element from the GeoMap component
    const mapCanvas = mapContainer.querySelector("canvas") as HTMLCanvasElement
    if (!mapCanvas) {
      setExportInProgress(false)
      alert("Could not find map canvas for export")
      return
    }

    // Create a temporary canvas with the desired resolution
    const tempCanvas = document.createElement("canvas")
    const ctx = tempCanvas.getContext("2d")

    if (!ctx) {
      setExportInProgress(false)
      alert("Could not create export canvas")
      return
    }

    // Set resolution based on user selection
    const scaleFactor = exportResolution === "high" ? 4 : exportResolution === "medium" ? 2 : 1

    tempCanvas.width = mapCanvas.width * scaleFactor
    tempCanvas.height = mapCanvas.height * scaleFactor

    // Scale and draw the original canvas onto the temporary one
    ctx.drawImage(mapCanvas, 0, 0, tempCanvas.width, tempCanvas.height)

    // Add metadata if needed and if exporting full data
    if (exportType === "full" && metadata?.showTitle) {
      ctx.font = `bold ${24 * scaleFactor}px Arial`
      ctx.fillStyle = "#ffffff"
      ctx.textAlign = "center"
      ctx.fillText(metadata.title, tempCanvas.width / 2, 40 * scaleFactor)
    }

    // Export based on selected format
    setTimeout(() => {
      try {
        let dataUrl
        let filename = `${metadata?.title || "ethiopia-map"}`
        const link = document.createElement("a")

        switch (exportFormat) {
          case "png":
            dataUrl = tempCanvas.toDataURL("image/png")
            filename += ".png"
            link.href = dataUrl
            link.download = filename
            link.click()
            break

          case "jpg":
            dataUrl = tempCanvas.toDataURL("image/jpeg", 0.9)
            filename += ".jpg"
            link.href = dataUrl
            link.download = filename
            link.click()
            break

          case "svg":
            // For SVG, create a simple SVG with an embedded image
            const svgData = `
              <svg xmlns="http://www.w3.org/2000/svg" width="${tempCanvas.width}" height="${tempCanvas.height}">
                <image width="100%" height="100%" href="${tempCanvas.toDataURL("image/png")}"/>
              </svg>
            `
            const svgBlob = new Blob([svgData], { type: "image/svg+xml" })
            const svgUrl = URL.createObjectURL(svgBlob)
            link.href = svgUrl
            link.download = `${filename}.svg`
            link.click()
            URL.revokeObjectURL(svgUrl)
            break

          case "pdf":
            // Create PDF with jsPDF
            const pdf = new jsPDF({
              orientation: "landscape",
              unit: "px",
              format: [tempCanvas.width, tempCanvas.height],
            })

            // Add the map image
            const imgData = tempCanvas.toDataURL("image/png")
            pdf.addImage(imgData, "PNG", 0, 0, tempCanvas.width, tempCanvas.height)

            // Add metadata if exporting full data
            if (exportType === "full" && metadata) {
              pdf.setFontSize(24)
              pdf.text(metadata.title, 30, 30)

              if (metadata.description) {
                pdf.setFontSize(12)
                pdf.text(metadata.description, 30, 50, { maxWidth: 500 })
              }

              if (metadata.author || metadata.organization) {
                pdf.setFontSize(10)
                pdf.text(
                  `Created by: ${metadata.author}${metadata.organization ? ` (${metadata.organization})` : ""}`,
                  30,
                  tempCanvas.height - 20,
                )
              }

              if (metadata.date) {
                pdf.setFontSize(10)
                pdf.text(`Date: ${metadata.date}`, tempCanvas.width - 100, tempCanvas.height - 20)
              }
            }

            pdf.save(`${filename}.pdf`)
            break

          case "geojson":
            // Alert that this would normally export GeoJSON
            alert("GeoJSON export would include the map features data")
            break

          case "shp":
            alert("Shapefile export requires server-side processing. This is a simplified demo.")
            break

          case "csv":
            alert("CSV export would include tabular data of the selected areas")
            break

          default:
            alert(`Export format ${exportFormat} is not fully implemented in this demo`)
        }

        setExportSuccess(true)
        setTimeout(() => setExportSuccess(false), 3000)
      } catch (error) {
        console.error("Export error:", error)
        alert("An error occurred during export")
      } finally {
        setExportInProgress(false)
      }
    }, 1000) // Simulate processing time
  }

  return (
    <>
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="pb-2 bg-gradient-to-r from-primary/10 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" /> Export Options
          </CardTitle>
          <CardDescription>Choose format and download your map</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Export Type</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={exportType === "map" ? "default" : "outline"}
                onClick={() => setExportType("map")}
                className="flex items-center justify-center gap-2"
              >
                <FileImage className="h-4 w-4" />
                Map Only
              </Button>
              <Button
                variant={exportType === "full" ? "default" : "outline"}
                onClick={() => setExportType("full")}
                className="flex items-center justify-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Full Data
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {exportType === "map" ? "Export just the map visualization" : "Export with metadata, legend and all data"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Export Format</label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">
                  <div className="flex items-center gap-2">
                    <FileImage className="h-4 w-4" />
                    <span>PNG Image</span>
                  </div>
                </SelectItem>
                <SelectItem value="jpg">
                  <div className="flex items-center gap-2">
                    <FileImage className="h-4 w-4" />
                    <span>JPG Image</span>
                  </div>
                </SelectItem>
                <SelectItem value="svg">
                  <div className="flex items-center gap-2">
                    <FileImage className="h-4 w-4" />
                    <span>SVG Vector</span>
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FilePdf className="h-4 w-4" />
                    <span>PDF Document</span>
                  </div>
                </SelectItem>
                <SelectItem value="geojson">
                  <div className="flex items-center gap-2">
                    <FileJson className="h-4 w-4" />
                    <span>GeoJSON</span>
                  </div>
                </SelectItem>
                <SelectItem value="shp">
                  <div className="flex items-center gap-2">
                    <FileJson className="h-4 w-4" />
                    <span>Shapefile</span>
                  </div>
                </SelectItem>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>CSV Data</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Resolution</label>
            <Select value={exportResolution} onValueChange={setExportResolution}>
              <SelectTrigger>
                <SelectValue placeholder="Select resolution" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (1x)</SelectItem>
                <SelectItem value="medium">Medium (2x)</SelectItem>
                <SelectItem value="high">High (4x)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-2">
            <Button
              onClick={handleExport}
              className="w-full bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
              disabled={exportInProgress}
            >
              {exportInProgress ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Exporting...
                </>
              ) : exportSuccess ? (
                <>
                  <Check className="h-5 w-5" /> Downloaded!
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" /> Export Map
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 shadow-lg mt-6">
        <CardHeader className="pb-2 bg-gradient-to-r from-primary/10 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" /> Share
          </CardTitle>
          <CardDescription>Share your map with others</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Share Link</label>
            <div className="flex mt-1">
              <input
                type="text"
                value={metadata.link}
                readOnly
                className="flex-1 px-3 py-2 border border-r-0 rounded-l-md bg-secondary text-foreground"
                ref={linkRef}
              />
              <Button variant="outline" className="rounded-l-none border-l-0" onClick={handleCopyLink}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
              <svg className="h-4 w-4 text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
              Twitter
            </Button>
            <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
              <svg className="h-4 w-4 text-[#4267B2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 shadow-lg mt-6">
        <CardHeader className="pb-2 bg-gradient-to-r from-primary/10 to-transparent">
          <CardTitle>Map Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium">Title:</p>
              <p>{metadata.title}</p>
            </div>
            {metadata.description && (
              <div>
                <p className="font-medium">Description:</p>
                <p className="text-muted-foreground">{metadata.description}</p>
              </div>
            )}
            {(metadata.author || metadata.organization) && (
              <div>
                <p className="font-medium">Created by:</p>
                <p>
                  {metadata.author}
                  {metadata.organization && metadata.author && " • "}
                  {metadata.organization}
                </p>
              </div>
            )}
            {metadata.date && (
              <div>
                <p className="font-medium">Date:</p>
                <p>{metadata.date}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
