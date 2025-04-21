"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import type { GeoFeature } from "@/types/geo-types"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Plus, Minus, Maximize, Layers } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

// Update the GeoMapWithLayersProps interface to include label positioning
interface GeoMapWithLayersProps {
  features: GeoFeature[]
  colors?: {
    region: string
    zone: string
    woreda: string
  }
  featureColors?: Record<string, string>
  opacity?: {
    region: number
    zone: number
    woreda: number
  }
  borders?: {
    width: number
    style: string
    color: string
  }
  onFeatureClick?: (feature: GeoFeature) => void
  className?: string
  highlightedFeature?: string | null
  showLabels?: boolean
  showTooltips?: boolean
  basemap?: string
  markers?: Array<{
    lat: number
    lng: number
    color: string
    size: number
    opacity?: number
    label?: string
    labelColor?: string
    labelSize?: number
    labelPosition?: "top" | "bottom" | "left" | "right"
    shape?:
      | "pin"
      | "circle"
      | "square"
      | "triangle"
      | "hexagon"
      | "polygon"
      | "line"
      | "pin-solid"
      | "arrow-up"
      | "arrow-down"
    points?: Array<{ lat: number; lng: number }>
  }>
  clipToSelection?: boolean
  onMapClick?: (lat: number, lng: number) => void
  dataLayers?: DataLayer[]
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

export default function GeoMapWithLayers({
  features,
  colors = { region: "#1a73e8", zone: "#34a853", woreda: "#ea4335" },
  featureColors = {},
  opacity = { region: 0.7, zone: 0.7, woreda: 0.7 },
  borders = { width: 1, style: "solid", color: "#000000" },
  onFeatureClick,
  className,
  highlightedFeature,
  showLabels = false,
  showTooltips = true,
  basemap = "streets",
  markers = [],
  clipToSelection = true,
  onMapClick,
  dataLayers = [],
}: GeoMapWithLayersProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredFeature, setHoveredFeature] = useState<GeoFeature | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [startPanPosition, setStartPanPosition] = useState({ x: 0, y: 0 })
  const [mapLoaded, setMapLoaded] = useState(false)
  const [layerImages, setLayerImages] = useState<Map<string, HTMLImageElement>>(new Map())

  const boundsRef = useRef<{
    minX: number
    minY: number
    maxX: number
    maxY: number
    scale: number
  } | null>(null)
  const featuresMapRef = useRef<Map<string, GeoFeature>>(new Map())
  const mapImageCache = useRef<Map<string, HTMLImageElement>>(new Map())

  // Load map tile images
  useEffect(() => {
    // Updated map tile URLs to match Leaflet style URLs
    const mapTypes = {
      streets: "https://a.tile.openstreetmap.org/10/512/512.png",
      satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/10/512/512",
      topographic: "https://a.tile.opentopomap.org/10/512/512.png",
      dark: "https://a.basemaps.cartocdn.com/dark_all/10/512/512.png",
      light: "https://a.basemaps.cartocdn.com/light_all/10/512/512.png",
      terrain: "https://tiles.stadiamaps.com/tiles/stamen_terrain/10/512/512.png",
    }

    Object.entries(mapTypes).forEach(([type, url]) => {
      if (!mapImageCache.current.has(type)) {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          mapImageCache.current.set(type, img)
          if (mapImageCache.current.size === Object.keys(mapTypes).length) {
            setMapLoaded(true)
          }
        }
        img.onerror = (err) => {
          console.error(`Failed to load map tile for ${type}:`, err)
          // Create a fallback colored canvas
          const canvas = document.createElement("canvas")
          canvas.width = 512
          canvas.height = 512
          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.fillStyle =
              type === "dark"
                ? "#121212"
                : type === "satellite"
                  ? "#143d6b"
                  : type === "topographic"
                    ? "#c5dea2"
                    : type === "terrain"
                      ? "#c5dea2"
                      : type === "light"
                        ? "#f8f9fa"
                        : "#e9e5dc"
            ctx.fillRect(0, 0, 512, 512)

            // Add some grid lines
            ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
            ctx.lineWidth = 1
            for (let i = 0; i < 512; i += 64) {
              ctx.beginPath()
              ctx.moveTo(0, i)
              ctx.lineTo(512, i)
              ctx.stroke()

              ctx.beginPath()
              ctx.moveTo(i, 0)
              ctx.lineTo(i, 512)
              ctx.stroke()
            }
          }

          const img = new Image()
          img.src = canvas.toDataURL()
          mapImageCache.current.set(type, img)

          if (mapImageCache.current.size === Object.keys(mapTypes).length) {
            setMapLoaded(true)
          }
        }
        img.src = url
      }
    })
  }, [])

  // Load data layer images
  useEffect(() => {
    const enabledLayers = dataLayers.filter(
      (layer) => layer.enabled && layer.category !== "basemap" && layer.source?.url,
    )

    enabledLayers.forEach((layer) => {
      if (!layerImages.has(layer.id) && layer.source?.url) {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          setLayerImages((prev) => {
            const newMap = new Map(prev)
            newMap.set(layer.id, img)
            return newMap
          })
        }
        img.onerror = (err) => {
          console.error(`Failed to load layer image for ${layer.id}:`, err)
        }
        img.src = layer.source.url.replace("{z}", "10").replace("{x}", "512").replace("{y}", "512").replace("{r}", "")
      }
    })
  }, [dataLayers])

  useEffect(() => {
    if (!canvasRef.current || features.length === 0 || !mapLoaded) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Get active basemap from dataLayers
    const activeBasemap = dataLayers.find((layer) => layer.category === "basemap" && layer.enabled)
    const basemapToUse = activeBasemap ? activeBasemap.id : basemap

    // Draw basemap background
    drawBasemapBackground(ctx, canvas.width, canvas.height, basemapToUse)

    // Find bounds of all features
    let minX = Number.POSITIVE_INFINITY
    let minY = Number.POSITIVE_INFINITY
    let maxX = Number.NEGATIVE_INFINITY
    let maxY = Number.NEGATIVE_INFINITY

    // Update features map for hover detection
    featuresMapRef.current.clear()
    features.forEach((feature) => {
      featuresMapRef.current.set(feature.properties.code, feature)

      if (feature.geometry.type === "Polygon") {
        feature.geometry.coordinates[0].forEach((coord: number[]) => {
          minX = Math.min(minX, coord[0])
          minY = Math.min(minY, coord[1])
          maxX = Math.max(maxX, coord[0])
          maxY = Math.max(maxY, coord[1])
        })
      } else if (feature.geometry.type === "MultiPolygon") {
        feature.geometry.coordinates.forEach((polygon: number[][][]) => {
          polygon[0].forEach((coord: number[]) => {
            minX = Math.min(minX, coord[0])
            minY = Math.min(minY, coord[1])
            maxX = Math.max(maxX, coord[0])
            maxY = Math.max(maxY, coord[1])
          })
        })
      }
    })

    // Calculate scale to fit canvas
    const width = maxX - minX
    const height = maxY - minY
    const scaleX = (canvas.width - 60) / width
    const scaleY = (canvas.height - 60) / height
    const scale = Math.min(scaleX, scaleY) * zoomLevel

    // Apply pan offset
    const effectiveMinX = minX - panOffset.x / scale
    const effectiveMinY = minY - panOffset.y / scale

    // Store bounds for hover detection
    boundsRef.current = {
      minX: effectiveMinX,
      minY: effectiveMinY,
      maxX,
      maxY,
      scale,
    }

    // Sort features by level (region, zone, woreda) to ensure proper layering
    const sortedFeatures = [...features].sort((a, b) => {
      const aLevel = getFeatureLevel(a)
      const bLevel = getFeatureLevel(b)
      return aLevel - bLevel
    })

    // Draw features
    sortedFeatures.forEach((feature) => {
      ctx.beginPath()

      if (feature.geometry.type === "Polygon") {
        drawPolygon(ctx, feature.geometry.coordinates[0], effectiveMinX, effectiveMinY, scale, canvas.height)
      } else if (feature.geometry.type === "MultiPolygon") {
        feature.geometry.coordinates.forEach((polygon: number[][][]) => {
          drawPolygon(ctx, polygon[0], effectiveMinX, effectiveMinY, scale, canvas.height)
        })
      }

      // Set color based on feature type or individual feature color
      const level = feature.properties.level || getFeatureLevelFromCode(feature.properties.code)
      const featureCode = feature.properties.code

      // Check if this feature has a custom color
      if (featureColors[featureCode]) {
        ctx.fillStyle =
          featureColors[featureCode] +
          Math.floor(opacity[level as keyof typeof opacity] * 255)
            .toString(16)
            .padStart(2, "0")
      } else if (level === "region") {
        // Region - Blue
        ctx.fillStyle =
          colors.region +
          Math.floor(opacity.region * 255)
            .toString(16)
            .padStart(2, "0") // with opacity
      } else if (level === "zone") {
        // Zone - Green
        ctx.fillStyle =
          colors.zone +
          Math.floor(opacity.zone * 255)
            .toString(16)
            .padStart(2, "0") // with opacity
      } else {
        // Woreda - Red/Orange
        ctx.fillStyle =
          colors.woreda +
          Math.floor(opacity.woreda * 255)
            .toString(16)
            .padStart(2, "0") // with opacity
      }
      ctx.strokeStyle = borders.color

      // Highlight hovered feature
      if (hoveredFeature && hoveredFeature.properties.code === feature.properties.code) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
        ctx.strokeStyle = "#fff"
        ctx.lineWidth = borders.width + 1
      } else if (highlightedFeature && highlightedFeature === feature.properties.code) {
        // Highlight selected feature
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)"
        ctx.strokeStyle = "#000"
        ctx.lineWidth = borders.width + 2
      } else {
        ctx.lineWidth = borders.width
      }

      // Apply border style
      if (borders.style === "dashed") {
        ctx.setLineDash([5, 3])
      } else if (borders.style === "dotted") {
        ctx.setLineDash([2, 2])
      } else {
        ctx.setLineDash([])
      }

      ctx.fill()
      ctx.stroke()

      // Add labels if enabled
      if (showLabels) {
        // Calculate center of feature for label placement
        let centerX = 0
        let centerY = 0
        let pointCount = 0

        if (feature.geometry.type === "Polygon") {
          feature.geometry.coordinates[0].forEach((coord: number[]) => {
            const x = (coord[0] - effectiveMinX) * scale + 30
            const y = canvas.height - ((coord[1] - effectiveMinY) * scale + 30)
            centerX += x
            centerY += y
            pointCount++
          })
        } else if (feature.geometry.type === "MultiPolygon") {
          feature.geometry.coordinates.forEach((polygon: number[][][]) => {
            polygon[0].forEach((coord: number[]) => {
              const x = (coord[0] - effectiveMinX) * scale + 30
              const y = canvas.height - ((coord[1] - effectiveMinY) * scale + 30)
              centerX += x
              centerY += y
              pointCount++
            })
          })
        }

        if (pointCount > 0) {
          centerX /= pointCount
          centerY /= pointCount

          // Only draw labels for larger features
          if (level === "region" || (level === "zone" && scale > 0.5) || (level === "woreda" && scale > 1)) {
            ctx.font = level === "region" ? "bold 12px Arial" : "10px Arial"
            ctx.fillStyle = "#fff"
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"

            // Add text shadow for better readability
            ctx.shadowColor = "rgba(0, 0, 0, 0.7)"
            ctx.shadowBlur = 3
            ctx.shadowOffsetX = 1
            ctx.shadowOffsetY = 1

            ctx.fillText(feature.properties.name, centerX, centerY)

            // Reset shadow
            ctx.shadowColor = "transparent"
            ctx.shadowBlur = 0
            ctx.shadowOffsetX = 0
            ctx.shadowOffsetY = 0
          }
        }
      }
    })

    // Draw data layers if enabled
    const enabledLayers = dataLayers.filter((layer) => layer.enabled && layer.category !== "basemap")
    if (enabledLayers.length > 0 && clipToSelection) {
      // Create a clipping path from the features
      ctx.save()
      ctx.beginPath()

      sortedFeatures.forEach((feature) => {
        if (feature.geometry.type === "Polygon") {
          drawPolygon(ctx, feature.geometry.coordinates[0], effectiveMinX, effectiveMinY, scale, canvas.height)
        } else if (feature.geometry.type === "MultiPolygon") {
          feature.geometry.coordinates.forEach((polygon: number[][][]) => {
            drawPolygon(ctx, polygon[0], effectiveMinX, effectiveMinY, scale, canvas.height)
          })
        }
      })

      ctx.clip()

      // Draw each enabled data layer
      enabledLayers.forEach((layer) => {
        const img = layerImages.get(layer.id)
        if (img) {
          // Draw the layer with some transparency
          ctx.globalAlpha = 0.7
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          ctx.globalAlpha = 1.0
        }
      })

      ctx.restore()
    } else if (enabledLayers.length > 0) {
      // Draw data layers without clipping
      enabledLayers.forEach((layer) => {
        const img = layerImages.get(layer.id)
        if (img) {
          // Draw the layer with some transparency
          ctx.globalAlpha = 0.7
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          ctx.globalAlpha = 1.0
        }
      })
    }

    // Draw markers
    if (markers && markers.length > 0 && boundsRef.current) {
      markers.forEach((marker) => {
        const { minX, minY, scale } = boundsRef.current!
        const x = (marker.lng - minX) * scale + 30
        const y = canvas.height - ((marker.lat - minY) * scale + 30)

        // Draw marker based on shape
        drawMarker(ctx, x, y, marker)
      })
    }

    // Draw zoom controls
    drawZoomControls(ctx, canvas.width, canvas.height)
  }, [
    features,
    colors,
    featureColors,
    opacity,
    borders,
    highlightedFeature,
    showLabels,
    basemap,
    markers,
    zoomLevel,
    panOffset,
    mousePosition,
    mapLoaded,
    dataLayers,
    layerImages,
    clipToSelection,
  ])

  function drawZoomControls(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Draw zoom in button
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
    ctx.beginPath()
    ctx.arc(width - 30, height - 90, 15, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 16px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("+", width - 30, height - 90)

    // Draw zoom out button
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
    ctx.beginPath()
    ctx.arc(width - 30, height - 50, 15, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 16px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("-", width - 30, height - 50)
  }

  // Update the drawMarker function to handle new marker types and label positioning
  function drawMarker(ctx: CanvasRenderingContext2D, x: number, y: number, marker: any) {
    const size = marker.size || 8
    const color = marker.color || "#ff0000"
    const shape = marker.shape || "pin"
    const markerOpacity = marker.opacity !== undefined ? marker.opacity : 0.8
    const labelPosition = marker.labelPosition || "top"

    // Set the global alpha for the marker based on its opacity
    ctx.globalAlpha = markerOpacity
    ctx.fillStyle = color
    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 1.5

    switch (shape) {
      case "pin":
        // Draw a map pin similar to the image provided
        ctx.beginPath()
        ctx.arc(x, y - size, size, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()

        // Draw the pin point
        ctx.beginPath()
        ctx.moveTo(x, y - size)
        ctx.lineTo(x - size / 2, y)
        ctx.lineTo(x + size / 2, y)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        break

      case "pin-solid":
        // Draw a solid pin like in the image
        // Draw the pin head (circle)
        ctx.beginPath()
        ctx.arc(x, y - size * 1.5, size * 1.2, 0, Math.PI * 2)
        ctx.fill()

        // Add highlight to the pin head
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
        ctx.beginPath()
        ctx.arc(x - size * 0.4, y - size * 1.8, size * 0.4, 0, Math.PI * 2)
        ctx.fill()

        // Reset fill color
        ctx.fillStyle = color

        // Draw the pin stem
        ctx.beginPath()
        ctx.moveTo(x, y - size * 1.5)
        ctx.lineTo(x - size * 0.4, y)
        ctx.lineTo(x + size * 0.4, y)
        ctx.closePath()
        ctx.fill()

        // Add a stroke around the entire pin
        ctx.strokeStyle = "rgba(0, 0, 0, 0.3)"
        ctx.lineWidth = 1

        // Stroke the head
        ctx.beginPath()
        ctx.arc(x, y - size * 1.5, size * 1.2, 0, Math.PI * 2)
        ctx.stroke()

        // Stroke the stem
        ctx.beginPath()
        ctx.moveTo(x, y - size * 1.5)
        ctx.lineTo(x - size * 0.4, y)
        ctx.lineTo(x + size * 0.4, y)
        ctx.closePath()
        ctx.stroke()
        break

      case "circle":
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        break

      case "square":
        ctx.beginPath()
        ctx.rect(x - size, y - size, size * 2, size * 2)
        ctx.fill()
        ctx.stroke()
        break

      case "triangle":
        ctx.beginPath()
        ctx.moveTo(x, y - size)
        ctx.lineTo(x - size, y + size)
        ctx.lineTo(x + size, y + size)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        break

      case "hexagon":
        ctx.beginPath()
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i
          const px = x + size * Math.cos(angle)
          const py = y + size * Math.sin(angle)
          if (i === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        break

      case "arrow-up":
        // Draw an up arrow
        ctx.beginPath()
        // Arrow head
        ctx.moveTo(x, y - size * 1.5)
        ctx.lineTo(x - size, y - size * 0.5)
        ctx.lineTo(x + size, y - size * 0.5)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()

        // Arrow stem
        ctx.beginPath()
        ctx.rect(x - size * 0.3, y - size * 0.5, size * 0.6, size * 1.5)
        ctx.fill()
        ctx.stroke()
        break

      case "arrow-down":
        // Draw a down arrow
        ctx.beginPath()
        // Arrow head
        ctx.moveTo(x, y + size * 1.5)
        ctx.lineTo(x - size, y + size * 0.5)
        ctx.lineTo(x + size, y + size * 0.5)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()

        // Arrow stem
        ctx.beginPath()
        ctx.rect(x - size * 0.3, y - size, size * 0.6, size * 1.5)
        ctx.fill()
        ctx.stroke()
        break

      case "polygon":
        if (marker.points && marker.points.length > 2 && boundsRef.current) {
          const { minX, minY, scale } = boundsRef.current

          ctx.beginPath()
          marker.points.forEach((point: { lat: number; lng: number }, index: number) => {
            const px = (point.lng - minX) * scale + 30
            const py = (canvasRef.current?.height || 0) - ((point.lat - minY) * scale + 30)

            if (index === 0) {
              ctx.moveTo(px, py)
            } else {
              ctx.lineTo(px, py)
            }
          })

          ctx.closePath()
          ctx.fill()
          ctx.stroke()
        }
        break

      case "line":
        if (marker.points && marker.points.length > 1 && boundsRef.current) {
          const { minX, minY, scale } = boundsRef.current

          ctx.beginPath()
          marker.points.forEach((point: { lat: number; lng: number }, index: number) => {
            const px = (point.lng - minX) * scale + 30
            const py = (canvasRef.current?.height || 0) - ((point.lat - minY) * scale + 30)

            if (index === 0) {
              ctx.moveTo(px, py)
            } else {
              ctx.lineTo(px, py)
            }
          })

          ctx.strokeStyle = color
          ctx.lineWidth = size
          ctx.stroke()
        }
        break

      default:
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
    }

    // Draw label if provided with positioning
    if (marker.label) {
      const labelSize = marker.labelSize || 12
      const labelColor = marker.labelColor || "#ffffff"

      // Set label position based on the labelPosition property
      let labelX = x
      let labelY = y
      let textBaseline = "bottom"
      let textAlign = "center"

      switch (labelPosition) {
        case "top":
          labelY = y - (shape === "pin" || shape === "pin-solid" ? size * 2 : size) - 10
          textBaseline = "bottom"
          textAlign = "center"
          break
        case "bottom":
          labelY = y + size + 20
          textBaseline = "top"
          textAlign = "center"
          break
        case "left":
          labelX = x - size - 10
          labelY = y
          textBaseline = "middle"
          textAlign = "right"
          break
        case "right":
          labelX = x + size + 10
          labelY = y
          textBaseline = "middle"
          textAlign = "left"
          break
      }

      ctx.font = `${labelSize}px Arial`
      ctx.fillStyle = labelColor
      ctx.textAlign = textAlign as CanvasTextAlign
      ctx.textBaseline = textBaseline as CanvasTextBaseline
      ctx.shadowColor = "rgba(0, 0, 0, 0.7)"
      ctx.shadowBlur = 3
      ctx.shadowOffsetX = 1
      ctx.shadowOffsetY = 1
      ctx.fillText(marker.label, labelX, labelY)
      ctx.shadowColor = "transparent"
      ctx.shadowBlur = 0
    }

    // Reset global alpha
    ctx.globalAlpha = 1.0
  }

  function drawBasemapBackground(ctx: CanvasRenderingContext2D, width: number, height: number, basemap: string) {
    // Use cached map tiles if available
    if (mapImageCache.current.has(basemap)) {
      const img = mapImageCache.current.get(basemap)!

      // Create a pattern from the tile
      const pattern = ctx.createPattern(img, "repeat")
      if (pattern) {
        ctx.fillStyle = pattern
        ctx.fillRect(0, 0, width, height)
        return
      }
    }

    // Fallback if image not loaded
    switch (basemap) {
      case "satellite":
        // Satellite-like background
        const satelliteGradient = ctx.createLinearGradient(0, 0, 0, height)
        satelliteGradient.addColorStop(0, "#143d6b")
        satelliteGradient.addColorStop(1, "#0f2d4e")
        ctx.fillStyle = satelliteGradient
        ctx.fillRect(0, 0, width, height)

        // Add some "cloud" effects
        ctx.fillStyle = "rgba(255, 255, 255, 0.05)"
        for (let i = 0; i < 20; i++) {
          const x = Math.random() * width
          const y = Math.random() * height
          const radius = Math.random() * 50 + 20
          ctx.beginPath()
          ctx.arc(x, y, radius, 0, Math.PI * 2)
          ctx.fill()
        }
        break

      case "terrain":
      case "topographic":
        // Terrain-like background
        const terrainGradient = ctx.createLinearGradient(0, 0, 0, height)
        terrainGradient.addColorStop(0, "#c5dea2")
        terrainGradient.addColorStop(1, "#8db36d")
        ctx.fillStyle = terrainGradient
        ctx.fillRect(0, 0, width, height)

        // Add some terrain texture
        ctx.strokeStyle = "rgba(139, 195, 74, 0.3)"
        ctx.lineWidth = 0.5

        for (let i = 0; i < 100; i++) {
          const x = Math.random() * width
          const y = Math.random() * height
          const length = Math.random() * 30 + 10
          const angle = Math.random() * Math.PI

          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length)
          ctx.stroke()
        }
        break

      case "dark":
        // Dark mode background
        ctx.fillStyle = "#121212"
        ctx.fillRect(0, 0, width, height)

        // Add grid lines
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
        ctx.lineWidth = 0.5

        const gridSize = 50
        for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x, height)
          ctx.stroke()
        }

        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(width, y)
          ctx.stroke()
        }
        break

      case "light":
        // Light mode background
        ctx.fillStyle = "#f8f9fa"
        ctx.fillRect(0, 0, width, height)

        // Add grid lines
        ctx.strokeStyle = "rgba(0, 0, 0, 0.1)"
        ctx.lineWidth = 0.5

        const lightGridSize = 50
        for (let x = 0; x < width; x += lightGridSize) {
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x, height)
          ctx.stroke()
        }

        for (let y = 0; y < height; y += lightGridSize) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(width, y)
          ctx.stroke()
        }
        break

      case "streets":
      default:
        // Light street map background
        ctx.fillStyle = "#e9e5dc"
        ctx.fillRect(0, 0, width, height)

        // Add grid lines for "streets"
        ctx.strokeStyle = "rgba(255, 255, 255, 0.7)"
        ctx.lineWidth = 1

        const streetGridSize = 80
        for (let x = 0; x < width; x += streetGridSize) {
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x, height)
          ctx.stroke()
        }

        for (let y = 0; y < height; y += streetGridSize) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(width, y)
          ctx.stroke()
        }

        // Add some "road" effects
        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)"
        ctx.lineWidth = 3

        for (let i = 0; i < 5; i++) {
          const x1 = Math.random() * width
          const y1 = Math.random() * height
          const x2 = Math.random() * width
          const y2 = Math.random() * height

          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.bezierCurveTo(
            (x1 + x2) / 2 + (Math.random() - 0.5) * 100,
            (y1 + y2) / 2 + (Math.random() - 0.5) * 100,
            (x1 + x2) / 2 + (Math.random() - 0.5) * 100,
            (y1 + y2) / 2 + (Math.random() - 0.5) * 100,
            x2,
            y2,
          )
          ctx.stroke()
        }
        break
    }
  }

  function getFeatureLevel(feature: GeoFeature): number {
    if (feature.properties.level) {
      if (feature.properties.level === "region") return 1
      if (feature.properties.level === "zone") return 2
      if (feature.properties.level === "woreda") return 3
    }
    return getFeatureLevelFromCode(feature.properties.code) === "region"
      ? 1
      : getFeatureLevelFromCode(feature.properties.code) === "zone"
        ? 2
        : 3
  }

  function getFeatureLevelFromCode(code: string): "region" | "zone" | "woreda" {
    if (code.startsWith("ET") && code.length === 3) return "region" // Region
    if (code.length === 5) return "zone" // Zone
    return "woreda" // Woreda
  }

  function drawPolygon(
    ctx: CanvasRenderingContext2D,
    coordinates: number[][],
    minX: number,
    minY: number,
    scale: number,
    canvasHeight: number,
  ) {
    coordinates.forEach((coord, i) => {
      const x = (coord[0] - minX) * scale + 30
      // Fix the inverted y-coordinate by flipping it
      const y = canvasHeight - ((coord[1] - minY) * scale + 30)

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.closePath()
  }

  // Handle mouse move for hover effect
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !boundsRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setMousePosition({ x, y })

    // Check if mouse is over zoom controls
    if (x > canvas.width - 45 && x < canvas.width - 15) {
      if (y > canvas.height - 105 && y < canvas.height - 75) {
        // Over zoom in button
        return
      }
      if (y > canvas.height - 65 && y < canvas.height - 35) {
        // Over zoom out button
        return
      }
    }

    // Handle panning
    if (isPanning) {
      const dx = x - startPanPosition.x
      const dy = y - startPanPosition.y

      setPanOffset((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }))

      setStartPanPosition({ x, y })
      return
    }

    // Check if mouse is over a feature
    const { minX, minY, scale } = boundsRef.current

    // Convert canvas coordinates back to geo coordinates
    const geoX = (x - 30) / scale + minX
    const geoY = (canvas.height - y - 30) / scale + minY

    // Find feature at this point
    let found = false
    for (const feature of features) {
      if (isPointInFeature(geoX, geoY, feature)) {
        setHoveredFeature(feature)
        found = true
        break
      }
    }

    if (!found) {
      setHoveredFeature(null)
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if clicking on zoom controls
    if (x > canvas.width - 45 && x < canvas.width - 15) {
      if (y > canvas.height - 105 && y < canvas.height - 75) {
        // Zoom in
        setZoomLevel((prev) => Math.min(prev * 1.2, 5))
        return
      }
      if (y > canvas.height - 65 && y < canvas.height - 35) {
        // Zoom out
        setZoomLevel((prev) => Math.max(prev / 1.2, 0.5))
        return
      }
    }

    // Start panning if right mouse button or middle mouse button
    if (e.button === 2 || e.button === 1) {
      e.preventDefault()
      setIsPanning(true)
      setStartPanPosition({ x, y })
      return
    }
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setIsPanning(false)
      return
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !boundsRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if clicking on zoom controls
    if (x > canvas.width - 45 && x < canvas.width - 15) {
      if (y > canvas.height - 105 && y < canvas.height - 75) {
        // Zoom in button already handled in mousedown
        return
      }
      if (y > canvas.height - 65 && y < canvas.height - 35) {
        // Zoom out button already handled in mousedown
        return
      }
    }

    // Convert canvas coordinates back to geo coordinates
    const { minX, minY, scale } = boundsRef.current
    const geoX = (x - 30) / scale + minX
    const geoY = (canvas.height - y - 30) / scale + minY

    // If hovering over a feature, trigger feature click
    if (hoveredFeature && onFeatureClick) {
      onFeatureClick(hoveredFeature)
    }
    // Otherwise, handle as a map click
    else if (onMapClick) {
      onMapClick(geoY, geoX)
    }
  }

  // Check if a point is inside a feature
  const isPointInFeature = (x: number, y: number, feature: GeoFeature): boolean => {
    // Simple bounding box check for demo purposes
    // A real implementation would use point-in-polygon algorithm
    if (feature.geometry.type === "Polygon") {
      const coords = feature.geometry.coordinates[0]
      let minX = Number.POSITIVE_INFINITY,
        minY = Number.POSITIVE_INFINITY,
        maxX = Number.NEGATIVE_INFINITY,
        maxY = Number.NEGATIVE_INFINITY

      for (const coord of coords) {
        minX = Math.min(minX, coord[0])
        minY = Math.min(minY, coord[1])
        maxX = Math.max(maxX, coord[0])
        maxY = Math.max(maxY, coord[1])
      }

      return x >= minX && x <= maxX && y >= minY && y <= maxY
    }

    return false
  }

  return (
    <Card className={`overflow-hidden border-primary/20 ${className || ""}`}>
      <CardContent className="p-0 relative">
        {features.length === 0 && !mapLoaded ? (
          <div className="w-full h-[600px] flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <motion.div
                className="w-24 h-24 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center"
                animate={{
                  scale: [1, 1.1, 1],
                  backgroundColor: ["rgba(59, 130, 246, 0.2)", "rgba(59, 130, 246, 0.3)", "rgba(59, 130, 246, 0.2)"],
                }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
              >
                <MapPin className="h-12 w-12 text-blue-500" />
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">No Areas Selected</h3>
              <p className="text-gray-400 max-w-md">
                Select regions, zones, or woredas from the selection panels to visualize them on the map.
              </p>
            </motion.div>
          </div>
        ) : (
          <>
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className={`w-full h-full cursor-${isPanning ? "grabbing" : "pointer"}`}
              onMouseMove={handleMouseMove}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => {
                setHoveredFeature(null)
                setIsPanning(false)
              }}
              onClick={handleClick}
              onContextMenu={(e) => e.preventDefault()} // Prevent context menu on right-click
            />

            {hoveredFeature && showTooltips && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bg-card p-2 rounded shadow-md text-sm z-10 pointer-events-none border border-primary/20"
                style={{
                  left: mousePosition.x + 10,
                  top: mousePosition.y + 10,
                  maxWidth: "200px",
                }}
              >
                <strong>{hoveredFeature.properties.name}</strong>
                <div className="text-xs text-muted-foreground">{hoveredFeature.properties.code}</div>
              </motion.div>
            )}
          </>
        )}

        {/* Zoom and pan controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full bg-black/50 hover:bg-black/70"
            onClick={() => setZoomLevel((prev) => Math.min(prev * 1.2, 5))}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full bg-black/50 hover:bg-black/70"
            onClick={() => setZoomLevel((prev) => Math.max(prev / 1.2, 0.5))}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full bg-black/50 hover:bg-black/70"
            onClick={() => {
              setZoomLevel(1)
              setPanOffset({ x: 0, y: 0 })
            }}
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>

        {/* Data layer indicator */}
        {dataLayers && dataLayers.filter((layer) => layer.enabled && layer.category !== "basemap").length > 0 && (
          <div className="absolute top-4 left-4 bg-black/50 p-2 rounded text-white text-xs flex items-center gap-1">
            <Layers className="h-4 w-4" />
            <span>
              {dataLayers.filter((layer) => layer.enabled && layer.category !== "basemap").length} layers active
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
