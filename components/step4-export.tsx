"use client"
import type React from "react"
import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, FileImage, FileJson, FileIcon as FilePdf, FileText, Copy, Check, Share2 } from "lucide-react"
import { jsPDF } from "jspdf"

interface SelectedData {
  regions: { code: string; name: string }[]
  zones: { code: string; name: string }[]
  woredas: { code: string; name: string }[]
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

interface Step4ExportProps {
  metadata: MapMetadata
  mapContainerRef: React.RefObject<HTMLDivElement>
  selectedData: SelectedData
}

export default function Step4Export({ metadata, mapContainerRef, selectedData }: Step4ExportProps) {
  const linkRef = useRef<HTMLInputElement>(null)
  const [copied, setCopied] = useState(false)
  const [exportFormat, setExportFormat] = useState("png")
  const [exportInProgress, setExportInProgress] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [exportType, setExportType] = useState<"map" | "full">("full")

  const handleCopyLink = () => {
    if (metadata?.link) {
      navigator.clipboard.writeText(metadata.link).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  // Improved icon drawing function with better scaling and clarity
  const drawIconOnCanvas = (
    ctx: CanvasRenderingContext2D,
    icon: string,
    x: number,
    y: number,
    size: number,
    color: string,
    scaleFactor: number,
  ) => {
    ctx.fillStyle = color
    ctx.strokeStyle = "#333333"
    ctx.lineWidth = 1 * scaleFactor

    // Save context state
    ctx.save()

    // Move to icon center position
    ctx.translate(x, y)

    // Scale for high resolution
    const iconScale = size / 24

    switch (icon) {
      case "pin":
        // Draw pin with shadow for depth
        ctx.shadowColor = "rgba(0,0,0,0.3)"
        ctx.shadowBlur = 5 * scaleFactor
        ctx.shadowOffsetX = 2 * scaleFactor
        ctx.shadowOffsetY = 2 * scaleFactor

        // Pin head (circle)
        ctx.beginPath()
        ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()

        // Pin point (triangle)
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(-size * 0.4, size * 0.8)
        ctx.lineTo(size * 0.4, size * 0.8)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()

        // Add highlight for 3D effect
        ctx.fillStyle = "rgba(255,255,255,0.3)"
        ctx.beginPath()
        ctx.arc(-size * 0.2, -size * 0.2, size * 0.2, 0, Math.PI * 2)
        ctx.fill()
        break

      case "flag":
        // Draw flag pole
        ctx.shadowColor = "rgba(0,0,0,0.3)"
        ctx.shadowBlur = 3 * scaleFactor
        ctx.shadowOffsetX = 1 * scaleFactor
        ctx.shadowOffsetY = 1 * scaleFactor

        ctx.beginPath()
        ctx.moveTo(0, -size * 0.8)
        ctx.lineTo(0, size)
        ctx.lineWidth = size * 0.1
        ctx.stroke()

        // Draw flag
        ctx.beginPath()
        ctx.moveTo(0, -size * 0.8)
        ctx.lineTo(size * 0.8, -size * 0.5)
        ctx.lineTo(0, -size * 0.2)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        break

      case "circle":
        ctx.shadowColor = "rgba(0,0,0,0.3)"
        ctx.shadowBlur = 5 * scaleFactor
        ctx.shadowOffsetX = 2 * scaleFactor
        ctx.shadowOffsetY = 2 * scaleFactor

        ctx.beginPath()
        ctx.arc(0, 0, size * 0.6, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()

        // Add highlight
        ctx.fillStyle = "rgba(255,255,255,0.3)"
        ctx.beginPath()
        ctx.arc(-size * 0.3, -size * 0.3, size * 0.2, 0, Math.PI * 2)
        ctx.fill()
        break

      case "square":
        ctx.shadowColor = "rgba(0,0,0,0.3)"
        ctx.shadowBlur = 5 * scaleFactor
        ctx.shadowOffsetX = 2 * scaleFactor
        ctx.shadowOffsetY = 2 * scaleFactor

        ctx.beginPath()
        ctx.rect(-size * 0.6, -size * 0.6, size * 1.2, size * 1.2)
        ctx.fill()
        ctx.stroke()

        // Add highlight
        ctx.fillStyle = "rgba(255,255,255,0.3)"
        ctx.beginPath()
        ctx.rect(-size * 0.6, -size * 0.6, size * 0.6, size * 0.6)
        ctx.fill()
        break

      case "triangle":
        ctx.shadowColor = "rgba(0,0,0,0.3)"
        ctx.shadowBlur = 5 * scaleFactor
        ctx.shadowOffsetX = 2 * scaleFactor
        ctx.shadowOffsetY = 2 * scaleFactor

        ctx.beginPath()
        ctx.moveTo(0, -size * 0.7)
        ctx.lineTo(-size * 0.7, size * 0.5)
        ctx.lineTo(size * 0.7, size * 0.5)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()

        // Add highlight
        ctx.fillStyle = "rgba(255,255,255,0.3)"
        ctx.beginPath()
        ctx.moveTo(-size * 0.2, -size * 0.3)
        ctx.lineTo(-size * 0.4, 0)
        ctx.lineTo(0, 0)
        ctx.closePath()
        ctx.fill()
        break

      case "star":
        ctx.shadowColor = "rgba(0,0,0,0.3)"
        ctx.shadowBlur = 5 * scaleFactor
        ctx.shadowOffsetX = 2 * scaleFactor
        ctx.shadowOffsetY = 2 * scaleFactor

        const spikes = 5
        const outerRadius = size * 0.7
        const innerRadius = size * 0.3

        ctx.beginPath()
        for (let i = 0; i < spikes * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius
          const angle = (Math.PI * i) / spikes - Math.PI / 2
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius

          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.fill()
        ctx.stroke()

        // Add highlight
        ctx.fillStyle = "rgba(255,255,255,0.3)"
        ctx.beginPath()
        ctx.arc(-size * 0.2, -size * 0.2, size * 0.15, 0, Math.PI * 2)
        ctx.fill()
        break

      case "heart":
        ctx.shadowColor = "rgba(0,0,0,0.3)"
        ctx.shadowBlur = 5 * scaleFactor
        ctx.shadowOffsetX = 2 * scaleFactor
        ctx.shadowOffsetY = 2 * scaleFactor

        const topCurveHeight = size * 0.3

        ctx.beginPath()
        ctx.moveTo(0, size * 0.2)

        // Left curve
        ctx.bezierCurveTo(-size * 0.5, -size * 0.3, -size, 0, 0, size)

        // Right curve
        ctx.bezierCurveTo(size, 0, size * 0.5, -size * 0.3, 0, size * 0.2)

        ctx.closePath()
        ctx.fill()
        ctx.stroke()

        // Add highlight
        ctx.fillStyle = "rgba(255,255,255,0.3)"
        ctx.beginPath()
        ctx.arc(-size * 0.3, -size * 0.1, size * 0.2, 0, Math.PI * 2)
        ctx.fill()
        break

      case "home":
        ctx.shadowColor = "rgba(0,0,0,0.3)"
        ctx.shadowBlur = 5 * scaleFactor
        ctx.shadowOffsetX = 2 * scaleFactor
        ctx.shadowOffsetY = 2 * scaleFactor

        // Roof
        ctx.beginPath()
        ctx.moveTo(0, -size * 0.8)
        ctx.lineTo(-size * 0.8, 0)
        ctx.lineTo(size * 0.8, 0)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()

        // House body
        ctx.beginPath()
        ctx.rect(-size * 0.6, 0, size * 1.2, size * 0.8)
        ctx.fill()
        ctx.stroke()

        // Door
        ctx.fillStyle = "#333333"
        ctx.beginPath()
        ctx.rect(-size * 0.2, size * 0.3, size * 0.4, size * 0.5)
        ctx.fill()

        // Window
        ctx.beginPath()
        ctx.rect(-size * 0.4, size * 0.1, size * 0.2, size * 0.2)
        ctx.rect(size * 0.2, size * 0.1, size * 0.2, size * 0.2)
        ctx.fillStyle = "#87CEEB"
        ctx.fill()
        ctx.stroke()
        break

      case "building":
        ctx.shadowColor = "rgba(0,0,0,0.3)"
        ctx.shadowBlur = 5 * scaleFactor
        ctx.shadowOffsetX = 2 * scaleFactor
        ctx.shadowOffsetY = 2 * scaleFactor

        // Building body
        ctx.beginPath()
        ctx.rect(-size * 0.6, -size * 0.8, size * 1.2, size * 1.6)
        ctx.fill()
        ctx.stroke()

        // Windows
        ctx.fillStyle = "#87CEEB"
        const windowSize = size * 0.2
        const gap = size * 0.1

        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 2; col++) {
            ctx.beginPath()
            ctx.rect(
              -size * 0.4 + col * (windowSize + gap),
              -size * 0.6 + row * (windowSize + gap),
              windowSize,
              windowSize,
            )
            ctx.fill()
            ctx.stroke()
          }
        }

        // Door
        ctx.fillStyle = "#333333"
        ctx.beginPath()
        ctx.rect(-size * 0.2, size * 0.4, size * 0.4, size * 0.4)
        ctx.fill()
        ctx.stroke()
        break

      case "check":
        ctx.shadowColor = "rgba(0,0,0,0.3)"
        ctx.shadowBlur = 5 * scaleFactor
        ctx.shadowOffsetX = 2 * scaleFactor
        ctx.shadowOffsetY = 2 * scaleFactor

        // Circle background
        ctx.beginPath()
        ctx.arc(0, 0, size * 0.7, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()

        // Checkmark
        ctx.beginPath()
        ctx.moveTo(-size * 0.3, 0)
        ctx.lineTo(-size * 0.1, size * 0.3)
        ctx.lineTo(size * 0.4, -size * 0.3)
        ctx.strokeStyle = "#FFFFFF"
        ctx.lineWidth = size * 0.15
        ctx.stroke()
        break

      default:
        // Default circle
        ctx.beginPath()
        ctx.arc(0, 0, size * 0.6, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
    }

    // Restore context state
    ctx.restore()
  }

  // Improved text wrapping function
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number, lineHeight: number) => {
    const words = text.split(" ")
    const lines: string[] = []
    let currentLine = words[0]

    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + " " + words[i]
      const metrics = ctx.measureText(testLine)

      if (metrics.width > maxWidth) {
        lines.push(currentLine)
        currentLine = words[i]
      } else {
        currentLine = testLine
      }
    }

    lines.push(currentLine)
    return lines
  }

  // Improved SVG text wrapping
  const wrapTextSVG = (text: string, maxWidth: number, fontSize: number) => {
    const words = text.split(" ")
    const lines: string[] = []
    let currentLine = words[0]

    // Approximate character width based on font size
    const charWidth = fontSize * 0.6

    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + " " + words[i]
      const testWidth = testLine.length * charWidth

      if (testWidth > maxWidth) {
        lines.push(currentLine)
        currentLine = words[i]
      } else {
        currentLine = testLine
      }
    }

    lines.push(currentLine)
    return lines
  }

  const handleExport = () => {
    setExportInProgress(true)
    const mapContainer = mapContainerRef.current
    if (!mapContainer) {
      setExportInProgress(false)
      alert("Could not find map container for export")
      return
    }

    const mapCanvas = mapContainer.querySelector("canvas") as HTMLCanvasElement
    if (!mapCanvas) {
      setExportInProgress(false)
      alert("Could not find map canvas for export")
      return
    }

    // Higher scale factor for better quality
    const scaleFactor = 4
    const tempCanvas = document.createElement("canvas")
    const ctx = tempCanvas.getContext("2d", { alpha: false })

    if (!ctx) {
      setExportInProgress(false)
      alert("Could not create export canvas")
      return
    }

    // For map-only export, use a simpler approach
    if (exportType === "map") {
      tempCanvas.width = mapCanvas.width * scaleFactor
      tempCanvas.height = mapCanvas.height * scaleFactor

      // Draw white background to prevent transparency issues
      ctx.fillStyle = "#FFFFFF"
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)

      // Scale and draw the original canvas onto the temporary one
      ctx.drawImage(mapCanvas, 0, 0, tempCanvas.width, tempCanvas.height)

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
              dataUrl = tempCanvas.toDataURL("image/jpeg", 0.95) // Higher quality JPEG
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
                orientation: tempCanvas.width > tempCanvas.height ? "landscape" : "portrait",
                unit: "px",
                format: [tempCanvas.width, tempCanvas.height],
              })

              // Add the map image
              const imgData = tempCanvas.toDataURL("image/png")
              pdf.addImage(imgData, "PNG", 0, 0, tempCanvas.width, tempCanvas.height)
              pdf.save(`${filename}.pdf`)
              break

            case "geojson":
              alert("GeoJSON export would include the map features data")
              break

            case "shp":
              alert("Shapefile export requires server-side processing")
              break

            case "csv":
              alert("CSV export would include tabular data of the selected areas")
              break

            default:
              alert(`Export format ${exportFormat} is not fully implemented`)
          }

          setExportSuccess(true)
          setTimeout(() => setExportSuccess(false), 3000)
        } catch (error) {
          console.error("Export error:", error)
          alert("An error occurred during export")
        } finally {
          setExportInProgress(false)
        }
      }, 1000)
      return
    }

    // If we're here, we're doing a full export with all metadata
    // Calculate dimensions
    const mapWidth = mapCanvas.width * scaleFactor
    const mapHeight = mapCanvas.height * scaleFactor
    const padding = 60 * scaleFactor
    const canvasWidth = mapWidth + 2 * padding
    let canvasHeight = padding
    let currentY = padding

    // Title
    const titleHeight = metadata.showTitle ? 60 * scaleFactor : 0
    if (metadata.showTitle) {
      canvasHeight += titleHeight
      currentY += titleHeight
    }

    // Space after title
    canvasHeight += 30 * scaleFactor
    currentY += 30 * scaleFactor

    // Map
    const mapY = currentY
    canvasHeight += mapHeight
    currentY += mapHeight

    // Space after map
    canvasHeight += 30 * scaleFactor
    currentY += 30 * scaleFactor

    // Description
    let descriptionHeight = 0
    if (metadata.showDescription && metadata.description) {
      ctx.font = `${18 * scaleFactor}px 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
      const descriptionLines = wrapText(ctx, metadata.description, canvasWidth * 0.8, 24 * scaleFactor)
      descriptionHeight = descriptionLines.length * 24 * scaleFactor
      canvasHeight += descriptionHeight
      currentY += descriptionHeight
    }

    // Space after description
    canvasHeight += 50 * scaleFactor
    currentY += 50 * scaleFactor

    // Legend table
    let legendHeight = 0
    if (metadata.showLegend && metadata.legendItems.length > 0) {
      // Title + header + items + padding
      legendHeight = 40 * scaleFactor + (metadata.legendItems.length + 1) * 50 * scaleFactor
      canvasHeight += legendHeight
      currentY += legendHeight
    }

    // Space after legend
    canvasHeight += 50 * scaleFactor
    currentY += 50 * scaleFactor

    // Selection summary table
    const summaryHeight = 40 * scaleFactor + 4 * 50 * scaleFactor // Title + header + 3 rows
    canvasHeight += summaryHeight
    currentY += summaryHeight

    // Space after summary
    canvasHeight += 50 * scaleFactor
    currentY += 50 * scaleFactor

    // Metadata
    const metadataHeight = metadata.showAuthor || metadata.showDate ? 40 * scaleFactor : 0
    canvasHeight += metadataHeight + padding

    tempCanvas.width = canvasWidth
    tempCanvas.height = canvasHeight

    // Draw beautiful gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight)
    gradient.addColorStop(0, "#FFFFFF")
    gradient.addColorStop(1, "#F5F7FA")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Add subtle grid pattern for visual interest
    ctx.strokeStyle = "rgba(200, 200, 200, 0.3)"
    ctx.lineWidth = 1 * scaleFactor

    // Horizontal grid lines
    for (let y = 0; y < canvasHeight; y += 50 * scaleFactor) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvasWidth, y)
      ctx.stroke()
    }

    // Vertical grid lines
    for (let x = 0; x < canvasWidth; x += 50 * scaleFactor) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvasHeight)
      ctx.stroke()
    }

    // Draw title with shadow for depth
    if (metadata.showTitle) {
      ctx.shadowColor = "rgba(0, 0, 0, 0.2)"
      ctx.shadowBlur = 10 * scaleFactor
      ctx.shadowOffsetX = 2 * scaleFactor
      ctx.shadowOffsetY = 2 * scaleFactor
      ctx.font = `bold ${36 * scaleFactor}px 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
      ctx.fillStyle = "#1A3552"
      ctx.textAlign = "center"
      ctx.fillText(metadata.title, canvasWidth / 2, padding + 36 * scaleFactor)

      // Reset shadow
      ctx.shadowColor = "transparent"
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
    }

    // Draw map with border and shadow
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
    ctx.shadowBlur = 15 * scaleFactor
    ctx.shadowOffsetX = 5 * scaleFactor
    ctx.shadowOffsetY = 5 * scaleFactor

    // Draw white background for map (prevents transparency issues)
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(
      padding - 2 * scaleFactor,
      mapY - 2 * scaleFactor,
      mapWidth + 4 * scaleFactor,
      mapHeight + 4 * scaleFactor,
    )

    // Draw map
    ctx.drawImage(mapCanvas, padding, mapY, mapWidth, mapHeight)

    // Draw border around map
    ctx.shadowColor = "transparent"
    ctx.lineWidth = 2 * scaleFactor
    ctx.strokeStyle = "#1A3552"
    ctx.strokeRect(padding, mapY, mapWidth, mapHeight)

    // Draw description with improved styling
    if (metadata.showDescription && metadata.description) {
      ctx.font = `${18 * scaleFactor}px 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
      ctx.fillStyle = "#4B5563"
      ctx.textAlign = "center"
      const lines = wrapText(ctx, metadata.description, canvasWidth * 0.8, 24 * scaleFactor)
      lines.forEach((line, index) => {
        ctx.fillText(line, canvasWidth / 2, mapY + mapHeight + 30 * scaleFactor + (index + 1) * 24 * scaleFactor)
      })
    }

    // Draw legend table with improved styling
    if (metadata.showLegend && metadata.legendItems.length > 0) {
      const legendY = mapY + mapHeight + 30 * scaleFactor + descriptionHeight + 50 * scaleFactor

      // Draw legend section with background
      ctx.fillStyle = "#F3F4F6"
      ctx.strokeStyle = "#D1D5DB"
      ctx.lineWidth = 2 * scaleFactor
      ctx.shadowColor = "rgba(0, 0, 0, 0.1)"
      ctx.shadowBlur = 10 * scaleFactor
      ctx.shadowOffsetX = 2 * scaleFactor
      ctx.shadowOffsetY = 2 * scaleFactor

      // Legend background
      const legendBoxHeight = 40 * scaleFactor + (metadata.legendItems.length + 1) * 50 * scaleFactor
      ctx.fillRect(padding, legendY - 30 * scaleFactor, canvasWidth - 2 * padding, legendBoxHeight)
      ctx.strokeRect(padding, legendY - 30 * scaleFactor, canvasWidth - 2 * padding, legendBoxHeight)

      // Reset shadow
      ctx.shadowColor = "transparent"
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      // Legend title
      ctx.font = `bold ${24 * scaleFactor}px 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
      ctx.fillStyle = "#1A3552"
      ctx.textAlign = "left"
      ctx.fillText("Legend", padding + 20 * scaleFactor, legendY)

      const rowHeight = 50 * scaleFactor
      const col1Width = 80 * scaleFactor
      const col2Width = canvasWidth - 2 * padding - col1Width - 40 * scaleFactor

      // Draw header with gradient
      const headerGradient = ctx.createLinearGradient(
        padding,
        legendY + 20 * scaleFactor,
        padding,
        legendY + 70 * scaleFactor,
      )
      headerGradient.addColorStop(0, "#1A3552")
      headerGradient.addColorStop(1, "#2A4562")
      ctx.fillStyle = headerGradient
      ctx.fillRect(padding, legendY + 20 * scaleFactor, canvasWidth - 2 * padding, rowHeight)

      ctx.fillStyle = "#FFFFFF"
      ctx.font = `bold ${18 * scaleFactor}px 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
      ctx.fillText("Icon", padding + 20 * scaleFactor, legendY + 55 * scaleFactor)
      ctx.fillText("Name", padding + col1Width + 20 * scaleFactor, legendY + 55 * scaleFactor)

      // Draw rows with alternating colors
      metadata.legendItems.forEach((item, index) => {
        const rowY = legendY + 20 * scaleFactor + (index + 1) * rowHeight

        // Row background
        ctx.fillStyle = index % 2 === 0 ? "#FFFFFF" : "#F9FAFB"
        ctx.fillRect(padding, rowY, canvasWidth - 2 * padding, rowHeight)

        // Icon
        drawIconOnCanvas(
          ctx,
          item.icon,
          padding + 40 * scaleFactor,
          rowY + 25 * scaleFactor,
          32 * scaleFactor,
          item.iconColor,
          scaleFactor,
        )

        // Label
        ctx.font = `${18 * scaleFactor}px 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
        ctx.fillStyle = "#4B5563"
        ctx.textAlign = "left"
        ctx.fillText(item.label, padding + col1Width + 20 * scaleFactor, rowY + 32 * scaleFactor)

        // Bottom border
        ctx.strokeStyle = "#E5E7EB"
        ctx.lineWidth = 1 * scaleFactor
        ctx.beginPath()
        ctx.moveTo(padding, rowY + rowHeight)
        ctx.lineTo(canvasWidth - padding, rowY + rowHeight)
        ctx.stroke()
      })

      // Vertical divider
      ctx.beginPath()
      ctx.moveTo(padding + col1Width, legendY + 20 * scaleFactor)
      ctx.lineTo(padding + col1Width, legendY + 20 * scaleFactor + (metadata.legendItems.length + 1) * rowHeight)
      ctx.stroke()
    }

    // Draw selection summary table with improved styling
    const summaryY =
      mapY +
      mapHeight +
      30 * scaleFactor +
      descriptionHeight +
      (metadata.showLegend ? legendHeight : 0) +
      50 * scaleFactor

    // Draw summary section with background
    ctx.fillStyle = "#F3F4F6"
    ctx.strokeStyle = "#D1D5DB"
    ctx.lineWidth = 2 * scaleFactor
    ctx.shadowColor = "rgba(0, 0, 0, 0.1)"
    ctx.shadowBlur = 10 * scaleFactor
    ctx.shadowOffsetX = 2 * scaleFactor
    ctx.shadowOffsetY = 2 * scaleFactor

    // Summary background
    const summaryBoxHeight = 40 * scaleFactor + 4 * 50 * scaleFactor
    ctx.fillRect(padding, summaryY - 30 * scaleFactor, canvasWidth - 2 * padding, summaryBoxHeight)
    ctx.strokeRect(padding, summaryY - 30 * scaleFactor, canvasWidth - 2 * padding, summaryBoxHeight)

    // Reset shadow
    ctx.shadowColor = "transparent"
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    // Summary title
    ctx.font = `bold ${24 * scaleFactor}px 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
    ctx.fillStyle = "#1A3552"
    ctx.textAlign = "left"
    ctx.fillText("Selection Summary", padding + 20 * scaleFactor, summaryY)

    const summaryRowHeight = 50 * scaleFactor
    const summaryCol1Width = 150 * scaleFactor
    const summaryCol2Width = canvasWidth - 2 * padding - summaryCol1Width - 40 * scaleFactor

    // Draw header with gradient
    const summaryHeaderGradient = ctx.createLinearGradient(
      padding,
      summaryY + 20 * scaleFactor,
      padding,
      summaryY + 70 * scaleFactor,
    )
    summaryHeaderGradient.addColorStop(0, "#1A3552")
    summaryHeaderGradient.addColorStop(1, "#2A4562")
    ctx.fillStyle = summaryHeaderGradient
    ctx.fillRect(padding, summaryY + 20 * scaleFactor, canvasWidth - 2 * padding, summaryRowHeight)

    ctx.fillStyle = "#FFFFFF"
    ctx.font = `bold ${18 * scaleFactor}px 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
    ctx.fillText("Type", padding + 20 * scaleFactor, summaryY + 55 * scaleFactor)
    ctx.fillText("Names", padding + summaryCol1Width + 20 * scaleFactor, summaryY + 55 * scaleFactor)

    // Draw rows with alternating colors and improved styling
    const summaryData = [
      { type: "Regions", names: selectedData.regions.map((r) => r.name).join(", "), color: "#1a73e8" },
      { type: "Zones", names: selectedData.zones.map((z) => z.name).join(", "), color: "#34a853" },
      { type: "Woredas", names: selectedData.woredas.map((w) => w.name).join(", "), color: "#ea4335" },
    ]

    summaryData.forEach((row, index) => {
      const rowY = summaryY + 20 * scaleFactor + (index + 1) * summaryRowHeight

      // Row background
      ctx.fillStyle = index % 2 === 0 ? "#FFFFFF" : "#F9FAFB"
      ctx.fillRect(padding, rowY, canvasWidth - 2 * padding, summaryRowHeight)

      // Type column with color indicator
      ctx.fillStyle = row.color
      ctx.fillRect(padding + 10 * scaleFactor, rowY + 15 * scaleFactor, 10 * scaleFactor, 20 * scaleFactor)

      ctx.font = `${18 * scaleFactor}px 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
      ctx.fillStyle = "#4B5563"
      ctx.textAlign = "left"
      ctx.fillText(row.type, padding + 30 * scaleFactor, rowY + 32 * scaleFactor)

      // Names with proper wrapping
      const namesLines = wrapText(ctx, row.names || "None", summaryCol2Width - 40 * scaleFactor, 20 * scaleFactor)
      namesLines.forEach((line, i) => {
        ctx.fillText(
          line,
          padding + summaryCol1Width + 20 * scaleFactor,
          rowY + 20 * scaleFactor + i * 22 * scaleFactor,
        )
      })

      // Bottom border
      ctx.strokeStyle = "#E5E7EB"
      ctx.lineWidth = 1 * scaleFactor
      ctx.beginPath()
      ctx.moveTo(padding, rowY + summaryRowHeight)
      ctx.lineTo(canvasWidth - padding, rowY + summaryRowHeight)
      ctx.stroke()
    })

    // Vertical divider
    ctx.beginPath()
    ctx.moveTo(padding + summaryCol1Width, summaryY + 20 * scaleFactor)
    ctx.lineTo(padding + summaryCol1Width, summaryY + 20 * scaleFactor + 4 * summaryRowHeight)
    ctx.stroke()

    // Draw metadata footer with improved styling
    if (metadata.showAuthor || metadata.showDate) {
      const footerY = summaryY + 4 * summaryRowHeight + 50 * scaleFactor

      // Footer background with subtle gradient
      const footerGradient = ctx.createLinearGradient(0, footerY - 10 * scaleFactor, 0, footerY + 40 * scaleFactor)
      footerGradient.addColorStop(0, "#F9FAFB")
      footerGradient.addColorStop(1, "#F3F4F6")
      ctx.fillStyle = footerGradient
      ctx.fillRect(padding, footerY - 10 * scaleFactor, canvasWidth - 2 * padding, 40 * scaleFactor)

      ctx.font = `${16 * scaleFactor}px 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
      ctx.fillStyle = "#4B5563"
      ctx.textAlign = "left"

      let footerText = ""
      if (metadata.showAuthor && (metadata.author || metadata.organization)) {
        footerText += `Created by: ${metadata.author}${metadata.organization ? ` (${metadata.organization})` : ""}`
      }
      if (metadata.showDate && metadata.date) {
        footerText += (footerText ? " • " : "") + `Date: ${metadata.date}`
      }
      ctx.fillText(footerText, padding + 20 * scaleFactor, footerY + 20 * scaleFactor)
    }

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
            dataUrl = tempCanvas.toDataURL("image/jpeg", 0.95) // Higher quality JPEG
            filename += ".jpg"
            link.href = dataUrl
            link.download = filename
            link.click()
            break

          case "svg":
            // Create an enhanced SVG with better styling and proper text handling
            const svgData = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}" style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
              <defs>
                <linearGradient id="bgGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFFFFF"/>
                  <stop offset="100%" stopColor="#F5F7FA"/>
                </linearGradient>
                <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="${3 * scaleFactor}"/>
                  <feOffset dx="${2 * scaleFactor}" dy="${2 * scaleFactor}" result="offsetblur"/>
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.3"/>
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <pattern id="grid" width="${50 * scaleFactor}" height="${50 * scaleFactor}" patternUnits="userSpaceOnUse">
                  <path d="M ${50 * scaleFactor} 0 L 0 0 0 ${50 * scaleFactor}" fill="none" stroke="rgba(200, 200, 200, 0.3)" strokeWidth="${1 * scaleFactor}"/>
                </pattern>
              </defs>
              
              <!-- Background -->
              <rect width="100%" height="100%" fill="url(#bgGradient)"/>
              <rect width="100%" height="100%" fill="url(#grid)"/>
              
              <!-- Title -->
              ${
                metadata.showTitle
                  ? `<text x="50%" y="${padding + 36 * scaleFactor}" fontSize="${36 * scaleFactor}" fontWeight="bold" fill="#1A3552" textAnchor="middle" filter="url(#dropShadow)">${metadata.title}</text>`
                  : ""
              }
              
              <!-- Map with border and shadow -->
              <rect x="${padding}" y="${mapY}" width="${mapWidth}" height="${mapHeight}" fill="white" stroke="#1A3552" strokeWidth="${2 * scaleFactor}" filter="url(#dropShadow)"/>
              <image x="${padding}" y="${mapY}" width="${mapWidth}" height="${mapHeight}" href="${mapCanvas.toDataURL("image/png")}"/>
              
              <!-- Description -->
              ${
                metadata.showDescription && metadata.description
                  ? wrapTextSVG(metadata.description, canvasWidth * 0.8, 18 * scaleFactor)
                      .map(
                        (line, i) =>
                          `<text x="50%" y="${mapY + mapHeight + 30 * scaleFactor + (i + 1) * 24 * scaleFactor}" fontSize="${18 * scaleFactor}" fill="#4B5563" textAnchor="middle">${line}</text>`,
                      )
                      .join("")
                  : ""
              }
              
              <!-- Legend Section -->
              ${
                metadata.showLegend && metadata.legendItems.length > 0
                  ? `
                    <g transform="translate(0, ${mapY + mapHeight + 30 * scaleFactor + descriptionHeight + 50 * scaleFactor})">
                      <!-- Legend Box -->
                      <rect x="${padding}" y="-30" width="${canvasWidth - 2 * padding}" height="${40 * scaleFactor + (metadata.legendItems.length + 1) * 50 * scaleFactor}" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="${2 * scaleFactor}" filter="url(#dropShadow)"/>
                      
                      <!-- Legend Title -->
                      <text x="${padding + 20 * scaleFactor}" y="0" fontSize="${24 * scaleFactor}" fontWeight="bold" fill="#1A3552">Legend</text>
                      
                      <!-- Header -->
                      <rect x="${padding}" y="${20 * scaleFactor}" width="${canvasWidth - 2 * padding}" height="${50 * scaleFactor}" fill="#1A3552"/>
                      <text x="${padding + 20 * scaleFactor}" y="${55 * scaleFactor}" fontSize="${18 * scaleFactor}" fontWeight="bold" fill="#FFFFFF">Icon</text>
                      <text x="${padding + 80 * scaleFactor + 20 * scaleFactor}" y="${55 * scaleFactor}" fontSize="${18 * scaleFactor}" fontWeight="bold" fill="#FFFFFF">Name</text>
                      
                      <!-- Legend Items -->
                      ${metadata.legendItems
                        .map(
                          (item, i) => `
                          <rect x="${padding}" y="${20 * scaleFactor + (i + 1) * 50 * scaleFactor}" width="${canvasWidth - 2 * padding}" height="${50 * scaleFactor}" fill="${i % 2 === 0 ? "#FFFFFF" : "#F9FAFB"}"/>
                          <path fill="${item.iconColor}" transform="translate(${padding + 40 * scaleFactor}, ${20 * scaleFactor + (i + 1) * 50 * scaleFactor + 25 * scaleFactor}) scale(${scaleFactor / 6})" d="${
                            item.icon === "pin"
                              ? "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"
                              : item.icon === "flag"
                                ? "M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"
                                : item.icon === "circle"
                                  ? "M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0 -20 0"
                                  : item.icon === "square"
                                    ? "M4 4h16v16H4z"
                                    : item.icon === "triangle"
                                      ? "M12 2L2 22h20L12 2z"
                                      : item.icon === "star"
                                        ? "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                                        : item.icon === "heart"
                                          ? "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                                          : item.icon === "home"
                                            ? "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
                                            : item.icon === "building"
                                              ? "M4 2h16v20H4V2zm3 4h2v2H7V6zm0 4h2v2H7v-2zm0 4h2v2H7v-2zm6-8h2v2h-2V6zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z"
                                              : "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                          }"/>
                          <text x="${padding + 80 * scaleFactor + 20 * scaleFactor}" y="${20 * scaleFactor + (i + 1) * 50 * scaleFactor + 32 * scaleFactor}" fontSize="${18 * scaleFactor}" fill="#4B5563">${item.label}</text>
                        `,
                        )
                        .join("")}
                      
                      <!-- Vertical Divider -->
                      <line x1="${padding + 80 * scaleFactor}" y1="${20 * scaleFactor}" x2="${padding + 80 * scaleFactor}" y2="${20 * scaleFactor + (metadata.legendItems.length + 1) * 50 * scaleFactor}" stroke="#E5E7EB" strokeWidth="${1 * scaleFactor}"/>
                    </g>
                  `
                  : ""
              }
              
              <!-- Summary Section -->
              <g transform="translate(0, ${summaryY})">
                <!-- Summary Box -->
                <rect x="${padding}" y="-30" width="${canvasWidth - 2 * padding}" height="${40 * scaleFactor + 4 * 50 * scaleFactor}" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="${2 * scaleFactor}" filter="url(#dropShadow)"/>
                
                <!-- Summary Title -->
                <text x="${padding + 20 * scaleFactor}" y="0" fontSize="${24 * scaleFactor}" fontWeight="bold" fill="#1A3552">Selection Summary</text>
                
                <!-- Header -->
                <rect x="${padding}" y="${20 * scaleFactor}" width="${canvasWidth - 2 * padding}" height="${50 * scaleFactor}" fill="#1A3552"/>
                <text x="${padding + 20 * scaleFactor}" y="${55 * scaleFactor}" fontSize="${18 * scaleFactor}" fontWeight="bold" fill="#FFFFFF">Type</text>
                <text x="${padding + 150 * scaleFactor + 20 * scaleFactor}" y="${55 * scaleFactor}" fontSize="${18 * scaleFactor}" fontWeight="bold" fill="#FFFFFF">Names</text>
                
                <!-- Summary Items -->
                ${summaryData
                  .map(
                    (row, i) => `
                  <rect x="${padding}" y="${20 * scaleFactor + (i + 1) * 50 * scaleFactor}" width="${canvasWidth - 2 * padding}" height="${50 * scaleFactor}" fill="${i % 2 === 0 ? "#FFFFFF" : "#F9FAFB"}"/>
                  <rect x="${padding + 10 * scaleFactor}" y="${20 * scaleFactor + (i + 1) * 50 * scaleFactor + 15 * scaleFactor}" width="${10 * scaleFactor}" height="${20 * scaleFactor}" fill="${row.color}"/>
                  <text x="${padding + 30 * scaleFactor}" y="${20 * scaleFactor + (i + 1) * 50 * scaleFactor + 32 * scaleFactor}" fontSize="${18 * scaleFactor}" fill="#4B5563">${row.type}</text>
                  ${wrapTextSVG(row.names || "None", summaryCol2Width - 40 * scaleFactor, 18 * scaleFactor)
                    .map(
                      (line, j) =>
                        `<text x="${padding + 150 * scaleFactor + 20 * scaleFactor}" y="${20 * scaleFactor + (i + 1) * 50 * scaleFactor + 20 * scaleFactor + j * 22 * scaleFactor}" fontSize="${18 * scaleFactor}" fill="#4B5563">${line}</text>`,
                    )
                    .join("")}
                `,
                  )
                  .join("")}
                
                <!-- Vertical Divider -->
                <line x1="${padding + 150 * scaleFactor}" y1="${20 * scaleFactor}" x2="${padding + 150 * scaleFactor}" y2="${20 * scaleFactor + 4 * 50 * scaleFactor}" stroke="#E5E7EB" strokeWidth="${1 * scaleFactor}"/>
              </g>
              
              <!-- Footer -->
              ${
                metadata.showAuthor || metadata.showDate
                  ? `
                    <g transform="translate(0, ${summaryY + 4 * 50 * scaleFactor + 50 * scaleFactor})">
                      <rect x="${padding}" y="-10" width="${canvasWidth - 2 * padding}" height="${40 * scaleFactor}" fill="url(#bgGradient)"/>
                      <text x="${padding + 20 * scaleFactor}" y="${20 * scaleFactor}" fontSize="${16 * scaleFactor}" fill="#4B5563">${
                        (metadata.showAuthor && (metadata.author || metadata.organization)
                          ? `Created by: ${metadata.author}${metadata.organization ? ` (${metadata.organization})` : ""}`
                          : "") +
                        (metadata.showDate && metadata.date
                          ? (metadata.showAuthor && (metadata.author || metadata.organization) ? " • " : "") +
                            `Date: ${metadata.date}`
                          : "")
                      }</text>
                    </g>
                  `
                  : ""
              }
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
            const pdf = new jsPDF({
              orientation: canvasWidth > canvasHeight ? "landscape" : "portrait",
              unit: "px",
              format: [canvasWidth / scaleFactor, canvasHeight / scaleFactor],
            })
            const imgData = tempCanvas.toDataURL("image/png")
            pdf.addImage(imgData, "PNG", 0, 0, canvasWidth / scaleFactor, canvasHeight / scaleFactor)
            pdf.save(`${filename}.pdf`)
            break

          case "geojson":
            alert("GeoJSON export would include the map features data")
            break

          case "shp":
            alert("Shapefile export requires server-side processing")
            break

          case "csv":
            alert("CSV export would include tabular data of the selected areas")
            break

          default:
            alert(`Export format ${exportFormat} is not fully implemented`)
        }

        setExportSuccess(true)
        setTimeout(() => setExportSuccess(false), 3000)
      } catch (error) {
        console.error("Export error:", error)
        alert("An error occurred during export")
      } finally {
        setExportInProgress(false)
      }
    }, 1000)
  }

  return (
    <>
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="pb-2 bg-gradient-to-r from-primary/10 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" /> Export Options
          </CardTitle>
          <CardDescription>Choose format and download your map (High Quality)</CardDescription>
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
              {exportType === "map"
                ? "Export just the map visualization"
                : "Export with metadata, legend, and selection summary"}
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
