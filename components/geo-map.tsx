"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import type { GeoFeature } from "@/types/geo-types"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Plus, Minus } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

// Update the GeoMapProps interface to include new marker properties
interface GeoMapProps {
  features: GeoFeature[]
  colors?: {
    region: string
    zone: string
    woreda: string
  }
  featureColors?: Record<string, string>
  featureOpacity?: Record<string, number>
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
  showRegionLabels?: boolean
  showZoneLabels?: boolean
  showWoredaLabels?: boolean
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
      | "pin-rounded"
      | "pin-flat"
      | "pin-pulse"
      | "arrow-up"
      | "arrow-down"
      | "arrow-left"
      | "arrow-right"
      | "double-arrow-up"
      | "double-arrow-down"
      | "arrow-up-right"
      | "arrow-down-right"
      | "arrow-up-left"
      | "arrow-down-left"
      | "star"
      | "flag"
      | "dot"
      | "alert"
      | "check"
      | "x-mark"
      | "bookmark"
      | "heart"
      | "home"
      | "building"
      | "landmark"
      | "tent"
      | "food"
      | "shopping"
      | "car"
      | "bus"
      | "plane"
      | "ship"
      | "anchor"
      | "bike"
      | "lightning"
      | "water"
      | "fire"
      | "snow"
      | "cloud"
      | "sun"
      | "moon"
      | "phone"
      | "wifi"
      | "radio"
      | "camera"
      | "image"
      | "music"
      | "video"
      | "file"
      | "mail"
      | "call"
      | "message"
      | "people"
      | "person"
      | "add-person"
      | "work"
      | "clipboard"
      | "calendar"
      | "clock"
      | "award"
      | "gift"
      | "coffee"
      | "tools"
      | "settings"
      | "lock"
      | "key"
      | "search"
      | "filter"
      | "share"
      | "download"
      | "upload"
      | "link"
      | "trash"
      | "save"
      | "edit"
      | "more"
      | "numbered"
    points?: Array<{ lat: number; lng: number }>
    number?: number
    hasShadow?: boolean
    hasBorder?: boolean
    borderColor?: string
    borderWidth?: number
    rotation?: number
    scale?: number
    pulseEffect?: boolean
    bounceEffect?: boolean
    glowEffect?: boolean
    glowColor?: string
    iconSize?: number
    labelFont?: string
    labelBold?: boolean
    labelItalic?: boolean
    labelUnderline?: boolean
    labelOpacity?: number
  }>
  clipToSelection?: boolean
  onMapClick?: (lat: number, lng: number) => void
  step?: number
  activeTab?: string
  customBgColor?: string
}

// Update the default props
export default function GeoMap({
  features,
  colors = { region: "#1a73e8", zone: "#34a853", woreda: "#ea4335" },
  featureColors = {},
  featureOpacity = {},
  opacity = { region: 0.7, zone: 0.7, woreda: 0.7 },
  borders = { width: 1, style: "solid", color: "#000000" },
  onFeatureClick,
  className,
  highlightedFeature,
  showLabels = false,
  showRegionLabels = true,
  showZoneLabels = true,
  showWoredaLabels = true,
  showTooltips = true,
  basemap = "streets",
  markers = [],
  clipToSelection = true,
  onMapClick,
  step = 1,
  activeTab = "colors",
  ...props
}: GeoMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredFeature, setHoveredFeature] = useState<GeoFeature | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [startPanPosition, setStartPanPosition] = useState({ x: 0, y: 0 })
  const [mapLoaded, setMapLoaded] = useState(false)
  const [animationFrame, setAnimationFrame] = useState(0)

  const boundsRef = useRef<{
    minX: number
    minY: number
    maxX: number
    maxY: number
    scale: number
  } | null>(null)
  const featuresMapRef = useRef<Map<string, GeoFeature>>(new Map())
  const mapImageCache = useRef<Map<string, HTMLImageElement>>(new Map())
  const animationTimerRef = useRef<number | null>(null)

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

    // Set up animation loop for marker effects
    const animateMarkers = () => {
      setAnimationFrame((prev) => (prev + 1) % 60)
      animationTimerRef.current = requestAnimationFrame(animateMarkers)
    }

    animationTimerRef.current = requestAnimationFrame(animateMarkers)

    return () => {
      if (animationTimerRef.current) {
        cancelAnimationFrame(animationTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!canvasRef.current || features.length === 0 || !mapLoaded) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw basemap background
    drawBasemapBackground(ctx, canvas.width, canvas.height, basemap, props.customBgColor)

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

      // Check if this feature has a custom color and opacity
      if (featureColors[featureCode]) {
        const customOpacity =
          featureOpacity[featureCode] !== undefined
            ? featureOpacity[featureCode]
            : opacity[level as keyof typeof opacity]

        ctx.fillStyle =
          featureColors[featureCode] +
          Math.floor(customOpacity * 255)
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

      // Add labels if enabled - check specific level controls
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

          // Check if we should show labels for this specific level
          const shouldShowLabel =
            (level === "region" && showRegionLabels) ||
            (level === "zone" && showZoneLabels && scale > 0.5) ||
            (level === "woreda" && showWoredaLabels && scale > 1)

          if (shouldShowLabel) {
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

    // Draw markers
    if (markers && markers.length > 0 && boundsRef.current) {
      markers.forEach((marker) => {
        const { minX, minY, scale } = boundsRef.current!
        const x = (marker.lng - minX) * scale + 30
        const y = canvas.height - ((marker.lat - minY) * scale + 30)

        // Draw marker based on shape
        drawMarker(ctx, x, y, marker, animationFrame)
      })
    }

    // Draw zoom controls
    drawZoomControls(ctx, canvas.width, canvas.height)
  }, [
    features,
    colors,
    featureColors,
    featureOpacity,
    opacity,
    borders,
    highlightedFeature,
    showLabels,
    showRegionLabels,
    showZoneLabels,
    showWoredaLabels,
    showTooltips,
    basemap,
    markers,
    zoomLevel,
    panOffset,
    hoveredFeature, // Add this to ensure updates when hovering
    mapLoaded,
    activeTab,
    animationFrame, // Add animation frame to trigger redraws for animations
    props.customBgColor,
  ])

  function drawZoomControls(ctx: CanvasRenderingContext2D, width: number, height: number) {}

  // Update the drawMarker function to handle new marker types and effects
  function drawMarker(ctx: CanvasRenderingContext2D, x: number, y: number, marker: any, animationFrame: number) {
    const size = marker.size || 8
    const color = marker.color || "#ff0000"
    const shape = marker.shape || "pin"
    const markerOpacity = marker.opacity !== undefined ? marker.opacity : 0.8
    const labelPosition = marker.labelPosition || "top"
    const scale = marker.scale || 1
    const rotation = marker.rotation || 0
    const hasShadow = marker.hasShadow !== undefined ? marker.hasShadow : true
    const hasBorder = marker.hasBorder !== undefined ? marker.hasBorder : true
    const borderColor = marker.borderColor || "#ffffff"
    const borderWidth = marker.borderWidth || 1
    const pulseEffect = marker.pulseEffect || false
    const bounceEffect = marker.bounceEffect || false
    const glowEffect = marker.glowEffect || false
    const glowColor = marker.glowColor || "#ffff00"
    const iconSize = marker.iconSize || 12
    const number = marker.number || 1

    // Calculate animation effects
    let effectiveSize = size * scale
    let effectiveY = y

    // Apply pulse effect (size pulsing)
    if (pulseEffect) {
      const pulseScale = 1 + 0.2 * Math.sin(animationFrame * 0.1)
      effectiveSize *= pulseScale
    }

    // Apply bounce effect (vertical movement)
    if (bounceEffect) {
      const bounceOffset = 3 * Math.sin(animationFrame * 0.15)
      effectiveY -= bounceOffset
    }

    // Apply glow effect
    if (glowEffect) {
      ctx.shadowColor = glowColor
      ctx.shadowBlur = 10 + 5 * Math.sin(animationFrame * 0.1)
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
    }

    // Apply shadow if enabled
    if (hasShadow && !glowEffect) {
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
      ctx.shadowBlur = 5
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2
    }

    // Set the global alpha for the marker based on its opacity
    ctx.globalAlpha = markerOpacity
    ctx.fillStyle = color

    // Apply rotation if needed
    if (rotation !== 0) {
      ctx.save()
      ctx.translate(x, effectiveY)
      ctx.rotate((rotation * Math.PI) / 180)
      x = 0
      effectiveY = 0
    }

    // Draw the marker based on shape
    switch (shape) {
      case "pin":
        // Draw a map pin similar to the image provided
        ctx.beginPath()
        ctx.arc(x, effectiveY - effectiveSize, effectiveSize, 0, Math.PI * 2)
        ctx.fill()

        if (hasBorder) {
          ctx.strokeStyle = borderColor
          ctx.lineWidth = borderWidth
          ctx.stroke()
        }

        // Draw the pin point
        ctx.beginPath()
        ctx.moveTo(x, effectiveY - effectiveSize)
        ctx.lineTo(x - effectiveSize / 2, effectiveY)
        ctx.lineTo(x + effectiveSize / 2, effectiveY)
        ctx.closePath()
        ctx.fill()

        if (hasBorder) {
          ctx.stroke()
        }
        break

      case "pin-solid":
        // Set the fill color for the pin head
        ctx.fillStyle = color

        // Draw the pin head (circle)
        ctx.beginPath()
        ctx.arc(x, y, size * 1.2, 0, Math.PI * 2) // Circle at (x, y)
        ctx.fill()

        // Add highlight to the pin head
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
        ctx.beginPath()
        ctx.arc(x - size * 0.4, y - size * 0.3, size * 0.4, 0, Math.PI * 2)
        ctx.fill()

        // Reset fill color to original
        ctx.fillStyle = color

        // Draw the pin stem (a vertical solid line)
        ctx.beginPath()
        ctx.moveTo(x, y + size * 1.2) // Start from bottom of circle
        ctx.lineTo(x, y + size * 2.5) // Go down vertically
        ctx.lineWidth = size * 0.3
        ctx.strokeStyle = color
        ctx.stroke()

        // Add stroke around the pin head
        ctx.strokeStyle = "rgba(0, 0, 0, 0.3)"
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(x, y, size * 1.2, 0, Math.PI * 2)
        ctx.stroke()
        break

      case "circle":
        ctx.beginPath()
        ctx.arc(x, effectiveY, effectiveSize, 0, Math.PI * 2)
        ctx.fill()

        if (hasBorder) {
          ctx.strokeStyle = borderColor
          ctx.lineWidth = borderWidth
          ctx.stroke()
        }
        break

      case "square":
        ctx.beginPath()
        ctx.rect(x - effectiveSize, effectiveY - effectiveSize, effectiveSize * 2, effectiveSize * 2)
        ctx.fill()

        if (hasBorder) {
          ctx.strokeStyle = borderColor
          ctx.lineWidth = borderWidth
          ctx.stroke()
        }
        break

      case "triangle":
        ctx.beginPath()
        ctx.moveTo(x, effectiveY - effectiveSize)
        ctx.lineTo(x - effectiveSize, effectiveY + effectiveSize)
        ctx.lineTo(x + effectiveSize, effectiveY + effectiveSize)
        ctx.closePath()
        ctx.fill()

        if (hasBorder) {
          ctx.strokeStyle = borderColor
          ctx.lineWidth = borderWidth
          ctx.stroke()
        }
        break

      case "hexagon":
        ctx.beginPath()
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i
          const px = x + effectiveSize * Math.cos(angle)
          const py = effectiveY + effectiveSize * Math.sin(angle)
          if (i === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }
        ctx.closePath()
        ctx.fill()

        if (hasBorder) {
          ctx.strokeStyle = borderColor
          ctx.lineWidth = borderWidth
          ctx.stroke()
        }
        break

      case "star":
        // Draw a star
        ctx.beginPath()
        for (let i = 0; i < 5; i++) {
          const outerAngle = (Math.PI * 2 * i) / 5 - Math.PI / 2
          const innerAngle = outerAngle + Math.PI / 5

          const outerX = x + effectiveSize * Math.cos(outerAngle)
          const outerY = effectiveY + effectiveSize * Math.sin(outerAngle)
          const innerX = x + effectiveSize * 0.4 * Math.cos(innerAngle)
          const innerY = effectiveY + effectiveSize * 0.4 * Math.sin(innerAngle)

          if (i === 0) {
            ctx.moveTo(outerX, outerY)
          } else {
            ctx.lineTo(outerX, outerY)
          }

          ctx.lineTo(innerX, innerY)
        }
        ctx.closePath()
        ctx.fill()

        if (hasBorder) {
          ctx.strokeStyle = borderColor
          ctx.lineWidth = borderWidth
          ctx.stroke()
        }
        break

      case "flag":
        // Draw a flag with horizontal stripes and a star in the middle
        const flagpoleHeight = effectiveSize * 2
        const flagHeight = effectiveSize
        const stripeHeight = flagHeight / 3
        const flagWidth = effectiveSize * 1.5

        // Draw flagpole
        ctx.beginPath()
        ctx.moveTo(x, effectiveY - flagpoleHeight)
        ctx.lineTo(x, effectiveY)
        ctx.lineWidth = effectiveSize * 0.2
        ctx.strokeStyle = "#888888"
        ctx.stroke()

        // Coordinates for top-left corner of the flag
        const flagTopY = effectiveY - flagpoleHeight
        const flagLeftX = x

        // Draw green stripe (top)
        ctx.fillStyle = "#008000" // green
        ctx.fillRect(flagLeftX, flagTopY, flagWidth, stripeHeight)

        // Draw yellow stripe (middle)
        ctx.fillStyle = "#FFD700" // yellow
        ctx.fillRect(flagLeftX, flagTopY + stripeHeight, flagWidth, stripeHeight)

        // Draw red stripe (bottom)
        ctx.fillStyle = "#FF0000" // red
        ctx.fillRect(flagLeftX, flagTopY + 2 * stripeHeight, flagWidth, stripeHeight)

        // Draw star in the middle of the yellow stripe
        const starCenterX = flagLeftX + flagWidth / 2
        const starCenterY = flagTopY + stripeHeight + stripeHeight / 2
        const starOuterRadius = stripeHeight * 0.4
        const starInnerRadius = starOuterRadius * 0.4
        const spikes = 5

        ctx.beginPath()
        for (let i = 0; i < spikes * 2; i++) {
          const angle = (i * Math.PI) / spikes
          const radius = i % 2 === 0 ? starOuterRadius : starInnerRadius
          const sx = starCenterX + Math.cos(angle - Math.PI / 2) * radius
          const sy = starCenterY + Math.sin(angle - Math.PI / 2) * radius
          if (i === 0) {
            ctx.moveTo(sx, sy)
          } else {
            ctx.lineTo(sx, sy)
          }
        }
        ctx.closePath()
        ctx.fillStyle = "#0000FF" // blue star, like Ethiopia's flag
        ctx.fill()

        if (hasBorder) {
          ctx.strokeStyle = borderColor
          ctx.lineWidth = borderWidth
          ctx.strokeRect(flagLeftX, flagTopY, flagWidth, flagHeight)
        }
        break

      case "numbered":
        // Draw a numbered marker
        ctx.beginPath()
        ctx.arc(x, effectiveY, effectiveSize * 1.2, 0, Math.PI * 2)
        ctx.fill()

        if (hasBorder) {
          ctx.strokeStyle = borderColor
          ctx.lineWidth = borderWidth
          ctx.stroke()
        }

        // Draw number
        ctx.fillStyle = "#ffffff"
        ctx.font = `bold ${Math.max(8, effectiveSize)}px Arial`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(number.toString(), x, effectiveY)
        break

      case "arrow-up":
        // Draw an up arrow
        ctx.beginPath()
        // Arrow head
        ctx.moveTo(x, effectiveY - effectiveSize * 1.5)
        ctx.lineTo(x - effectiveSize, effectiveY - effectiveSize * 0.5)
        ctx.lineTo(x + effectiveSize, effectiveY - effectiveSize * 0.5)
        ctx.closePath()
        ctx.fill()

        if (hasBorder) {
          ctx.strokeStyle = borderColor
          ctx.lineWidth = borderWidth
          ctx.stroke()
        }

        // Arrow stem
        ctx.beginPath()
        ctx.rect(x - effectiveSize * 0.3, effectiveY - effectiveSize * 0.5, effectiveSize * 0.6, effectiveSize * 1.5)
        ctx.fill()

        if (hasBorder) {
          ctx.stroke()
        }
        break

      case "arrow-down":
        // Draw a down arrow
        ctx.beginPath()
        // Arrow head (pointing down)
        ctx.moveTo(x, effectiveY + effectiveSize * 1.5)
        ctx.lineTo(x - effectiveSize, effectiveY + effectiveSize * 0.5)
        ctx.lineTo(x + effectiveSize, effectiveY + effectiveSize * 0.5)
        ctx.closePath()
        ctx.fill()

        if (hasBorder) {
          ctx.strokeStyle = borderColor
          ctx.lineWidth = borderWidth
          ctx.stroke()
        }

        // Arrow stem
        ctx.beginPath()
        ctx.rect(x - effectiveSize * 0.3, effectiveY - effectiveSize * 1.0, effectiveSize * 0.6, effectiveSize * 1.5)
        ctx.fill()

        if (hasBorder) {
          ctx.stroke()
        }
        break

      case "arrow-left":
        // Draw a left arrow
        ctx.beginPath()
        // Arrow head
        ctx.moveTo(x - effectiveSize * 1.5, effectiveY)
        ctx.lineTo(x - effectiveSize * 0.5, effectiveY - effectiveSize)
        ctx.lineTo(x - effectiveSize * 0.5, effectiveY + effectiveSize)
        ctx.closePath()
        ctx.fill()

        if (hasBorder) {
          ctx.strokeStyle = borderColor
          ctx.lineWidth = borderWidth
          ctx.stroke()
        }

        // Arrow stem
        ctx.beginPath()
        ctx.rect(x - effectiveSize * 0.5, effectiveY - effectiveSize * 0.3, effectiveSize * 1.5, effectiveSize * 0.6)
        ctx.fill()

        if (hasBorder) {
          ctx.stroke()
        }
        break

      case "arrow-right":
        // Draw a right arrow
        ctx.beginPath()
        // Arrow head
        ctx.moveTo(x + effectiveSize * 1.5, effectiveY)
        ctx.lineTo(x + effectiveSize * 0.5, effectiveY - effectiveSize)
        ctx.lineTo(x + effectiveSize * 0.5, effectiveY + effectiveSize)
        ctx.closePath()
        ctx.fill()

        if (hasBorder) {
          ctx.strokeStyle = borderColor
          ctx.lineWidth = borderWidth
          ctx.stroke()
        }

        // Arrow stem
        ctx.beginPath()
        ctx.rect(x - effectiveSize, effectiveY - effectiveSize * 0.3, effectiveSize * 1.5, effectiveSize * 0.6)
        ctx.fill()

        if (hasBorder) {
          ctx.stroke()
        }
        break

      case "double-arrow-up":
        // Draw a double up arrow
        for (let i = 0; i < 2; i++) {
          const offset = i * effectiveSize * 0.8

          ctx.beginPath()
          // Arrow head
          ctx.moveTo(x, effectiveY - effectiveSize * 1.5 + offset)
          ctx.lineTo(x - effectiveSize * 0.8, effectiveY - effectiveSize * 0.7 + offset)
          ctx.lineTo(x + effectiveSize * 0.8, effectiveY - effectiveSize * 0.7 + offset)
          ctx.closePath()
          ctx.fill()

          if (hasBorder) {
            ctx.strokeStyle = borderColor
            ctx.lineWidth = borderWidth
            ctx.stroke()
          }
        }
        break

      case "double-arrow-down":
        // Draw a double down arrow
        for (let i = 0; i < 2; i++) {
          const offset = i * effectiveSize * 0.8

          ctx.beginPath()
          // Arrow head
          ctx.moveTo(x, effectiveY + effectiveSize * 1.5 - offset)
          ctx.lineTo(x - effectiveSize * 0.8, effectiveY + effectiveSize * 0.7 - offset)
          ctx.lineTo(x + effectiveSize * 0.8, effectiveY + effectiveSize * 0.7 - offset)
          ctx.closePath()
          ctx.fill()

          if (hasBorder) {
            ctx.strokeStyle = borderColor
            ctx.lineWidth = borderWidth
            ctx.stroke()
          }
        }
        break

      case "arrow-up-right":
        // Draw an up-right arrow
        ctx.beginPath()
        ctx.moveTo(x + effectiveSize * 1.2, effectiveY - effectiveSize * 1.2)
        ctx.lineTo(x + effectiveSize * 0.2, effectiveY - effectiveSize * 1.2)
        ctx.lineTo(x + effectiveSize * 1.2, effectiveY - effectiveSize * 0.2)
        ctx.closePath()
        ctx.fill()

        // Arrow stem
        ctx.beginPath()
        ctx.moveTo(x, effectiveY)
        ctx.lineTo(x + effectiveSize * 0.8, effectiveY - effectiveSize * 0.8)
        ctx.lineWidth = effectiveSize * 0.3
        ctx.strokeStyle = color
        ctx.stroke()

        if (hasBorder) {
          ctx.strokeStyle = borderColor
          ctx.lineWidth = borderWidth
          ctx.beginPath()
          ctx.moveTo(x + effectiveSize * 1.2, effectiveY - effectiveSize * 1.2)
          ctx.lineTo(x + effectiveSize * 0.2, effectiveY - effectiveSize * 1.2)
          ctx.lineTo(x + effectiveSize * 1.2, effectiveY - effectiveSize * 0.2)
          ctx.closePath()
          ctx.stroke()
        }
        break

      case "arrow-up-left":
        // Draw an up-left arrow
        ctx.beginPath()
        ctx.moveTo(x - effectiveSize * 1.2, effectiveY - effectiveSize * 1.2)
        ctx.lineTo(x - effectiveSize * 0.2, effectiveY - effectiveSize * 1.2)
        ctx.lineTo(x - effectiveSize * 1.2, effectiveY - effectiveSize * 0.2)
        ctx.closePath()
        ctx.fill()

        // Arrow stem
        ctx.beginPath()
        ctx.moveTo(x, effectiveY)
        ctx.lineTo(x - effectiveSize * 0.8, effectiveY - effectiveSize * 0.8)
        ctx.lineWidth = effectiveSize * 0.3
        ctx.strokeStyle = color
        ctx.stroke()

        if (hasBorder) {
          ctx.strokeStyle = borderColor
          ctx.lineWidth = borderWidth
          ctx.beginPath()
          ctx.moveTo(x - effectiveSize * 1.2, effectiveY - effectiveSize * 1.2)
          ctx.lineTo(x - effectiveSize * 0.2, effectiveY - effectiveSize * 1.2)
          ctx.lineTo(x - effectiveSize * 1.2, effectiveY - effectiveSize * 0.2)
          ctx.closePath()
          ctx.stroke()
        }
        break

      case "arrow-down-right":
        // Draw a down-right arrow
        ctx.beginPath()
        ctx.moveTo(x + effectiveSize * 1.2, effectiveY + effectiveSize * 1.2)
        ctx.lineTo(x + effectiveSize * 0.2, effectiveY + effectiveSize * 1.2)
        ctx.lineTo(x + effectiveSize * 1.2, effectiveY + effectiveSize * 0.2)
        ctx.closePath()
        ctx.fill()

        // Arrow stem
        ctx.beginPath()
        ctx.moveTo(x, effectiveY)
        ctx.lineTo(x + effectiveSize * 0.8, effectiveY + effectiveSize * 0.8)
        ctx.lineWidth = effectiveSize * 0.3
        ctx.strokeStyle = color
        ctx.stroke()

        if (hasBorder) {
          ctx.strokeStyle = borderColor
          ctx.lineWidth = borderWidth
          ctx.beginPath()
          ctx.moveTo(x + effectiveSize * 1.2, effectiveY + effectiveSize * 1.2)
          ctx.lineTo(x + effectiveSize * 0.2, effectiveY + effectiveSize * 1.2)
          ctx.lineTo(x + effectiveSize * 1.2, effectiveY + effectiveSize * 0.2)
          ctx.closePath()
          ctx.stroke()
        }
        break

      case "arrow-down-left":
        // Draw a down-left arrow
        ctx.beginPath()
        ctx.moveTo(x - effectiveSize * 1.2, effectiveY + effectiveSize * 1.2)
        ctx.lineTo(x - effectiveSize * 0.2, effectiveY + effectiveSize * 1.2)
        ctx.lineTo(x - effectiveSize * 1.2, effectiveY + effectiveSize * 0.2)
        ctx.closePath()
        ctx.fill()

        // Arrow stem
        ctx.beginPath()
        ctx.moveTo(x, effectiveY)
        ctx.lineTo(x - effectiveSize * 0.8, effectiveY + effectiveSize * 0.8)
        ctx.lineWidth = effectiveSize * 0.3
        ctx.strokeStyle = color
        ctx.stroke()

        if (hasBorder) {
          ctx.strokeStyle = borderColor
          ctx.lineWidth = borderWidth
          ctx.beginPath()
          ctx.moveTo(x - effectiveSize * 1.2, effectiveY + effectiveSize * 1.2)
          ctx.lineTo(x - effectiveSize * 0.2, effectiveY + effectiveSize * 1.2)
          ctx.lineTo(x - effectiveSize * 1.2, effectiveY + effectiveSize * 0.2)
          ctx.closePath()
          ctx.stroke()
        }
        break

      case "home":
        // Roof (triangle)
        ctx.beginPath()
        ctx.moveTo(x, effectiveY - effectiveSize * 1.5) // Top point
        ctx.lineTo(x - effectiveSize, effectiveY - effectiveSize * 0.5)
        ctx.lineTo(x + effectiveSize, effectiveY - effectiveSize * 0.5)
        ctx.closePath()
        ctx.fill()

        if (hasBorder) {
          ctx.strokeStyle = borderColor
          ctx.lineWidth = borderWidth
          ctx.stroke()
        }

        // Body (rectangle)
        ctx.beginPath()
        ctx.rect(x - effectiveSize * 0.8, effectiveY - effectiveSize * 0.5, effectiveSize * 1.6, effectiveSize * 1.5)
        ctx.fill()

        if (hasBorder) {
          ctx.stroke()
        }
        break

      case "building":
        // Main building structure
        ctx.beginPath()
        ctx.rect(x - effectiveSize * 0.8, effectiveY - effectiveSize * 1.5, effectiveSize * 1.6, effectiveSize * 2)
        ctx.fill()

        if (hasBorder) {
          ctx.strokeStyle = borderColor
          ctx.lineWidth = borderWidth
          ctx.stroke()
        }

        // Optional: Add simple "windows"
        ctx.fillStyle = "#ffffff"
        const rows = 3,
          cols = 2
        const winWidth = effectiveSize * 0.3
        const winHeight = effectiveSize * 0.3
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            ctx.beginPath()
            ctx.rect(
              x - effectiveSize * 0.6 + c * (winWidth + 4),
              effectiveY - effectiveSize * 1.3 + r * (winHeight + 4),
              winWidth,
              winHeight,
            )
            ctx.fill()
          }
        }

        break

      case "landmark":
        // Base of the landmark (a wide pedestal)
        ctx.beginPath()
        ctx.rect(x - effectiveSize, effectiveY + effectiveSize * 0.5, effectiveSize * 2, effectiveSize * 0.3)
        ctx.fill()

        if (hasBorder) {
          ctx.strokeStyle = borderColor
          ctx.lineWidth = borderWidth
          ctx.stroke()
        }

        // Column
        ctx.beginPath()
        ctx.rect(x - effectiveSize * 0.3, effectiveY - effectiveSize * 1.5, effectiveSize * 0.6, effectiveSize * 2)
        ctx.fill()

        if (hasBorder) {
          ctx.stroke()
        }

        // Top part (like a torch or detail)
        ctx.beginPath()
        ctx.arc(x, effectiveY - effectiveSize * 1.6, effectiveSize * 0.4, 0, Math.PI * 2)
        ctx.fill()

        if (hasBorder) {
          ctx.stroke()
        }
        break

      case "tent":
        ctx.beginPath()
        ctx.moveTo(x, y - size)
        ctx.lineTo(x - size, y + size)
        ctx.lineTo(x + size, y + size)
        ctx.closePath()
        ctx.fill()
        break

      case "food": // fork & knife icon
        ctx.beginPath()
        ctx.rect(x - size * 0.6, y - size, size * 0.2, size * 2)
        ctx.rect(x + size * 0.4, y - size, size * 0.2, size * 2)
        ctx.fill()
        break

      case "shopping": // shopping bag
        ctx.beginPath()
        ctx.rect(x - size, y - size * 0.5, size * 2, size * 1.5)
        ctx.moveTo(x - size * 0.6, y - size * 0.5)
        ctx.lineTo(x - size * 0.6, y - size * 1.2)
        ctx.moveTo(x + size * 0.6, y - size * 0.5)
        ctx.lineTo(x + size * 0.6, y - size * 1.2)
        ctx.stroke()
        break

      case "car":
        ctx.beginPath()
        ctx.rect(x - size, y - size * 0.5, size * 2, size)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(x - size * 0.6, y + size * 0.5, size * 0.3, 0, Math.PI * 2)
        ctx.arc(x + size * 0.6, y + size * 0.5, size * 0.3, 0, Math.PI * 2)
        ctx.fill()
        break

      case "bus":
        ctx.beginPath()
        ctx.rect(x - size, y - size * 0.8, size * 2, size * 1.6)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(x - size * 0.6, y + size * 0.8, size * 0.3, 0, Math.PI * 2)
        ctx.arc(x + size * 0.6, y + size * 0.8, size * 0.3, 0, Math.PI * 2)
        ctx.fill()
        break

      case "plane":
        ctx.beginPath()
        ctx.moveTo(x, y - size)
        ctx.lineTo(x - size * 0.3, y + size * 0.5)
        ctx.lineTo(x, y + size * 0.2)
        ctx.lineTo(x + size * 0.3, y + size * 0.5)
        ctx.closePath()
        ctx.fill()
        break

      case "ship":
        ctx.beginPath()
        ctx.rect(x - size * 0.4, y - size, size * 0.8, size * 1.2)
        ctx.fill()
        ctx.beginPath()
        ctx.moveTo(x - size, y + size * 0.2)
        ctx.lineTo(x + size, y + size * 0.2)
        ctx.lineTo(x, y + size)
        ctx.closePath()
        ctx.fill()
        break

      case "anchor":
        ctx.beginPath()
        ctx.arc(x, y - size * 0.8, size * 0.2, 0, Math.PI * 2)
        ctx.moveTo(x, y - size * 0.6)
        ctx.lineTo(x, y + size)
        ctx.moveTo(x - size, y + size * 0.6)
        ctx.arc(x, y + size, size, Math.PI, 0)
        ctx.stroke()
        break

      case "lightning":
        ctx.beginPath()
        ctx.moveTo(x, y - size)
        ctx.lineTo(x - size * 0.3, y)
        ctx.lineTo(x + size * 0.1, y)
        ctx.lineTo(x - size * 0.2, y + size)
        ctx.lineTo(x + size * 0.4, y)
        ctx.lineTo(x, y)
        ctx.closePath()
        ctx.fill()
        break

      case "water":
        ctx.beginPath()
        ctx.arc(x, y, size, Math.PI, 2 * Math.PI)
        ctx.fill()
        break

      case "fire":
        ctx.beginPath()
        ctx.moveTo(x, y + size * 0.5)
        ctx.bezierCurveTo(x - size, y, x - size * 0.5, y - size, x, y - size * 0.5)
        ctx.bezierCurveTo(x + size * 0.5, y - size, x + size, y, x, y + size * 0.5)
        ctx.fill()
        break

      case "snow": {
        // Draw a snowflake with radiating arms, glow, and subtle rotation
        ctx.save()
        ctx.shadowColor = color
        ctx.shadowBlur = 15

        // Optional rotation animation (requires requestAnimationFrame)
        // const rotation = Date.now() * 0.001
        // ctx.translate(x, effectiveY)
        // ctx.rotate(rotation)
        // ctx.translate(-x, -effectiveY)

        const arms = 6
        const armLength = effectiveSize * 1.2
        const innerLength = effectiveSize * 0.4

        ctx.beginPath()
        for (let i = 0; i < arms; i++) {
          const angle = (i * Math.PI) / (arms / 2)
          // Main arm
          ctx.moveTo(x, effectiveY)
          ctx.lineTo(x + Math.cos(angle) * armLength, effectiveY + Math.sin(angle) * armLength)
          // Side branches
          ctx.moveTo(x + Math.cos(angle) * innerLength, effectiveY + Math.sin(angle) * innerLength)
          ctx.lineTo(
            x + Math.cos(angle + Math.PI / 6) * innerLength * 0.5,
            effectiveY + Math.sin(angle + Math.PI / 6) * innerLength * 0.5,
          )
          ctx.moveTo(x + Math.cos(angle) * innerLength, effectiveY + Math.sin(angle) * innerLength)
          ctx.lineTo(
            x + Math.cos(angle - Math.PI / 6) * innerLength * 0.5,
            effectiveY + Math.sin(angle - Math.PI / 6) * innerLength * 0.5,
          )
        }
        ctx.strokeStyle = color
        ctx.lineWidth = effectiveSize * 0.15
        ctx.stroke()

        // Central glow
        const snowGradient = ctx.createRadialGradient(x, effectiveY, 0, x, effectiveY, effectiveSize * 0.5)
        snowGradient.addColorStop(0, "#ffffffcc")
        snowGradient.addColorStop(1, `${color}66`)
        ctx.beginPath()
        ctx.arc(x, effectiveY, effectiveSize * 0.3, 0, Math.PI * 2)
        ctx.fillStyle = snowGradient
        ctx.fill()

        if (hasBorder) {
          ctx.strokeStyle = borderColor
          ctx.lineWidth = borderWidth
          ctx.stroke()
        }

        ctx.restore()
        break
      }

      case "cloud": {
        // Draw a fluffy cloud with glowing edges and subtle pulse
        ctx.save()
        ctx.shadowColor = color
        ctx.shadowBlur = 20

        // Optional pulse animation
        // const pulse = 1 + 0.05 * Math.sin(Date.now() * 0.005)
        // ctx.translate(x, effectiveY)
        // ctx.scale(pulse, pulse)
        // ctx.translate(-x, -effectiveY)

        const cloudWidth = effectiveSize * 2
        const cloudHeight = effectiveSize * 1.2

        ctx.beginPath()
        ctx.arc(x - cloudWidth * 0.3, effectiveY - cloudHeight * 0.2, effectiveSize * 0.6, Math.PI, 0)
        ctx.arc(x, effectiveY - cloudHeight * 0.3, effectiveSize * 0.7, Math.PI, 0)
        ctx.arc(x + cloudWidth * 0.3, effectiveY - cloudHeight * 0.2, effectiveSize * 0.6, Math.PI, 0)
        ctx.arc(x, effectiveY + cloudHeight * 0.2, effectiveSize * 0.8, 0, Math.PI)
        ctx.closePath()

        const cloudGradient = ctx.createLinearGradient(x, effectiveY - cloudHeight, x, effectiveY + cloudHeight)
        cloudGradient.addColorStop(0, `${color}ff`)
        cloudGradient.addColorStop(1, `${color}99`)
        ctx.fillStyle = cloudGradient
        ctx.fill()

        if (hasBorder) {
          ctx.strokeStyle = borderColor
          ctx.lineWidth = borderWidth
          ctx.stroke()
        }

        ctx.restore()
        break
      }

      case "sun": {
        // Draw a radiant sun with glowing rays and rotation
        ctx.save()
        ctx.shadowColor = color
        ctx.shadowBlur = 25

        // Optional rotation animation
        // const rotation = Date.now() * 0.002
        // ctx.translate(x, effectiveY)
        // ctx.rotate(rotation)
        // ctx.translate(-x, -effectiveY)

        const rays = 12
        const rayLength = effectiveSize * 1.5
        const innerRadius = effectiveSize * 0.6

        ctx.beginPath()
        for (let i = 0; i < rays; i++) {
          const angle = (i * Math.PI) / (rays / 2)
          ctx.moveTo(x + Math.cos(angle) * innerRadius, effectiveY + Math.sin(angle) * innerRadius)
          ctx.lineTo(x + Math.cos(angle) * rayLength, effectiveY + Math.sin(angle) * rayLength)
        }
        ctx.strokeStyle = color
        ctx.lineWidth = effectiveSize * 0.1
        ctx.stroke()

        const sunGradient = ctx.createRadialGradient(x, effectiveY, 0, x, effectiveY, innerRadius)
        sunGradient.addColorStop(0, "#ffffffcc")
        sunGradient.addColorStop(1, `${color}ff`)
        ctx.beginPath()
        ctx.arc(x, effectiveY, innerRadius, 0, Math.PI * 2)
        ctx.fillStyle = sunGradient
        ctx.fill()

        if (hasBorder) {
          ctx.strokeStyle = borderColor
          ctx.lineWidth = borderWidth
          ctx.stroke()
        }

        ctx.restore()
        break
      }

      case "moon": {
        // Draw a crescent moon with a glowing halo
        ctx.save()
        ctx.shadowColor = color
        ctx.shadowBlur = 20

        const radius = effectiveSize * 0.8
        ctx.beginPath()
        ctx.arc(x, effectiveY, radius, 0, Math.PI * 2)
        ctx.arc(x + radius * 0.4, effectiveY, radius * 0.9, Math.PI, 2 * Math.PI, true)
        ctx.closePath()

        const moonGradient = ctx.createRadialGradient(x, effectiveY, 0, x, effectiveY, radius)
        moonGradient.addColorStop(0, `${color}ff`)
        moonGradient.addColorStop(1, `${color}66`)
        ctx.fillStyle = moonGradient
        ctx.fill()

        if (hasBorder) {
          ctx.strokeStyle = borderColor
          ctx.lineWidth = borderWidth
          ctx.stroke()
        }

        ctx.restore()
        break
      }

      case "phone": {
        // Draw a smartphone with a glowing screen and subtle pulse
        ctx.save()
        ctx.shadowColor = color
        ctx.shadowBlur = 15

        // Optional pulse animation
        // const pulse = 1 + 0.05 * Math.sin(Date.now() * 0.005)
        // ctx.translate(x, effectiveY)
        // ctx.scale(pulse, pulse)
        // ctx.translate(-x, -effectiveY)

        const phoneWidth = effectiveSize * 0.8
        const phoneHeight = effectiveSize * 1.6
        ctx.beginPath()
        ctx.rect(x - phoneWidth, effectiveY - phoneHeight, phoneWidth * 2, phoneHeight * 2)
        ctx.fillStyle = color
        ctx.fill()

        // Screen glow
        const phoneGradient = ctx.createLinearGradient(x, effectiveY - phoneHeight, x, effectiveY + phoneHeight)
        phoneGradient.addColorStop(0, "#ffffffcc")
        phoneGradient.addColorStop(1, `${color}66`)
        ctx.beginPath()
        ctx.rect(x - phoneWidth * 0.8, effectiveY - phoneHeight * 0.8, phoneWidth * 1.6, phoneHeight * 1.6)
        ctx.fillStyle = phoneGradient
        ctx.fill()

        if (hasBorder) {
          ctx.strokeStyle = borderColor
          ctx.lineWidth = borderWidth
          ctx.stroke()
        }

        ctx.restore()
        break
      }

      case "wifi": {
        // Draw a Wi-Fi signal with glowing arcs and pulsing dot
        ctx.save()
        ctx.shadowColor = color
        ctx.shadowBlur = 20

        const arcs = 3
        ctx.beginPath()
        for (let i = 0; i < arcs; i++) {
          const radius = effectiveSize * (0.5 + i * 0.4)
          ctx.arc(x, effectiveY + effectiveSize * 0.5, radius, Math.PI * 0.75, Math.PI * 1.25)
        }
        ctx.strokeStyle = color
        ctx.lineWidth = effectiveSize * 0.15
        ctx.stroke()

        // Central dot
        const wifiGradient = ctx.createRadialGradient(
          x,
          effectiveY + effectiveSize * 0.5,
          0,
          x,
          effectiveY + effectiveSize * 0.5,
          effectiveSize * 0.3,
        )
        wifiGradient.addColorStop(0, "#ffffffcc")
        wifiGradient.addColorStop(1, `${color}66`)
        ctx.beginPath()
        ctx.arc(x, effectiveY + effectiveSize * 0.5, effectiveSize * 0.2, 0, Math.PI * 2)
        ctx.fillStyle = wifiGradient
        ctx.fill()

        if (hasBorder) {
          ctx.strokeStyle = borderColor
          ctx.lineWidth = borderWidth
          ctx.stroke()
        }

        ctx.restore()
        break
      }

      case "alert": {
        // Draw an alert triangle with a glowing exclamation and pulse
        ctx.save()
        ctx.shadowColor = color
        ctx.shadowBlur = 20

        // Optional pulse animation
        // const pulse = 1 + 0.05 * Math.sin(Date.now() * 0.005)
        // ctx.translate(x, effectiveY)
        // ctx.scale(pulse, pulse)
        // ctx.translate(-x, -effectiveY)

        const side = effectiveSize * 1.5
        ctx.beginPath()
        ctx.moveTo(x, effectiveY - side)
        ctx.lineTo(x - side * 0.866, effectiveY + side * 0.5)
        ctx.lineTo(x + side * 0.866, effectiveY + side * 0.5)
        ctx.closePath()

        const alertGradient = ctx.createLinearGradient(x, effectiveY - side, x, effectiveY + side)
        alertGradient.addColorStop(0, `${color}ff`)
        alertGradient.addColorStop(1, `${color}99`)
        ctx.fillStyle = alertGradient
        ctx.fill()

        // Exclamation mark
        ctx.beginPath()
        ctx.rect(x - effectiveSize * 0.1, effectiveY - side * 0.5, effectiveSize * 0.2, side * 0.6)
        ctx.arc(x, effectiveY + side * 0.3, effectiveSize * 0.1, 0, Math.PI * 2)
        ctx.fillStyle = "#ffffffcc"
        ctx.fill()

        if (hasBorder) {
          ctx.strokeStyle = borderColor
          ctx.lineWidth = borderWidth
          ctx.stroke()
        }

        ctx.restore()
        break
      }

      case "check": {
        // Draw a checkmark with a glowing effect and pulse
        ctx.save()
        ctx.shadowColor = color
        ctx.shadowBlur = 15

        // Optional pulse animation
        // const pulse = 1 + 0.05 * Math.sin(Date.now() * 0.005)
        // ctx.translate(x, effectiveY)
        // ctx.scale(pulse, pulse)
        // ctx.translate(-x, -effectiveY)

        ctx.beginPath()
        ctx.moveTo(x - effectiveSize * 0.8, effectiveY)
        ctx.lineTo(x - effectiveSize * 0.2, effectiveY + effectiveSize * 0.8)
        ctx.lineTo(x + effectiveSize * 0.8, effectiveY - effectiveSize * 0.8)
        ctx.lineWidth = effectiveSize * 0.3
        ctx.strokeStyle = color
        ctx.stroke()

        // Glow effect
        const checkGradient = ctx.createRadialGradient(x, effectiveY, 0, x, effectiveY, effectiveSize)
        checkGradient.addColorStop(0, "#ffffffcc")
        checkGradient.addColorStop(1, `${color}66`)
        ctx.beginPath()
        ctx.arc(x, effectiveY, effectiveSize * 0.4, 0, Math.PI * 2)
        ctx.fillStyle = checkGradient
        ctx.fill()

        if (hasBorder) {
          ctx.strokeStyle = borderColor
          ctx.lineWidth = borderWidth
          ctx.stroke()
        }

        ctx.restore()
        break
      }

      case "x-mark": {
        // Draw an X with a glowing cross and pulse
        ctx.save()
        ctx.shadowColor = color
        ctx.shadowBlur = 15

        // Optional pulse animation
        // const pulse = 1 + 0.05 * Math.sin(Date.now() * 0.005)
        // ctx.translate(x, effectiveY)
        // ctx.scale(pulse, pulse)
        // ctx.translate(-x, -effectiveY)

        ctx.beginPath()
        ctx.moveTo(x - effectiveSize * 0.8, effectiveY - effectiveSize * 0.8)
        ctx.lineTo(x + effectiveSize * 0.8, effectiveY + effectiveSize * 0.8)
        ctx.moveTo(x + effectiveSize * 0.8, effectiveY - effectiveSize * 0.8)
        ctx.lineTo(x - effectiveSize * 0.8, effectiveY + effectiveSize * 0.8)
        ctx.lineWidth = effectiveSize * 0.3
        ctx.strokeStyle = color
        ctx.stroke()

        // Central glow
        const xMarkGradient = ctx.createRadialGradient(x, effectiveY, 0, x, effectiveY, effectiveSize * 0.5)
        xMarkGradient.addColorStop(0, "#ffffffcc")
        xMarkGradient.addColorStop(1, `${color}66`)
        ctx.beginPath()
        ctx.arc(x, effectiveY, effectiveSize * 0.3, 0, Math.PI * 2)
        ctx.fillStyle = xMarkGradient
        ctx.fill()

        if (hasBorder) {
          ctx.strokeStyle = borderColor
          ctx.lineWidth = borderWidth
          ctx.stroke()
        }

        ctx.restore()
        break
      }

      case "bookmark": {
        // Draw a bookmark with a glowing ribbon and star pulse
        ctx.save()
        ctx.shadowColor = color
        ctx.shadowBlur = 20

        // Optional pulse animation for star
        // const pulse = 1 + 0.05 * Math.sin(Date.now() * 0.005)
        // ctx.translate(x, effectiveY - effectiveSize * 0.8)
        // ctx.scale(pulse, pulse)
        // ctx.translate(-x, -(effectiveY - effectiveSize * 0.8))

        ctx.beginPath()
        ctx.moveTo(x - effectiveSize * 0.8, effectiveY - effectiveSize * 1.5)
        ctx.lineTo(x - effectiveSize * 0.8, effectiveY + effectiveSize * 0.5)
        ctx.lineTo(x, effectiveY + effectiveSize * 0.8)
        ctx.lineTo(x + effectiveSize * 0.8, effectiveY + effectiveSize * 0.5)
        ctx.lineTo(x + effectiveSize * 0.8, effectiveY - effectiveSize * 1.5)
        ctx.closePath()

        const bookmarkGradient = ctx.createLinearGradient(
          x,
          effectiveY - effectiveSize * 1.5,
          x,
          effectiveY + effectiveSize * 0.8,
        )
        bookmarkGradient.addColorStop(0, `${color}ff`)
        bookmarkGradient.addColorStop(1, `${color}99`)
        ctx.fillStyle = bookmarkGradient
        ctx.fill()

        // Star detail
        ctx.beginPath()
        ctx.moveTo(x, effectiveY - effectiveSize * 0.8)
        for (let i = 0; i < 5; i++) {
          const angle = (i * Math.PI * 2) / 5 - Math.PI / 2
          const radius = i % 2 === 0 ? effectiveSize * 0.3 : effectiveSize * 0.15
          ctx.lineTo(x + Math.cos(angle) * radius, effectiveY - effectiveSize * 0.8 + Math.sin(angle) * radius)
        }
        ctx.closePath()
        ctx.fillStyle = "#ffffffcc"
        ctx.fill()

        if (hasBorder) {
          ctx.strokeStyle = borderColor
          ctx.lineWidth = borderWidth
          ctx.stroke()
        }

        ctx.restore()
        break
      }

      // ... other cases ...

      case "heart":
        // Draw a circle background for icon
        ctx.beginPath()
        ctx.arc(x, effectiveY, effectiveSize * 1.2, 0, Math.PI * 2)
        ctx.fill()

        if (hasBorder) {
          ctx.strokeStyle = borderColor
          ctx.lineWidth = borderWidth
          ctx.stroke()
        }

        // Draw a simple icon representation in white
        ctx.fillStyle = "#ffffff"

        // Draw specific icon shapes based on type
        if (shape === "home") {
          // Home icon
          ctx.beginPath()
          ctx.moveTo(x, effectiveY - effectiveSize * 0.7)
          ctx.lineTo(x - effectiveSize * 0.7, effectiveY)
          ctx.lineTo(x - effectiveSize * 0.5, effectiveY)
          ctx.lineTo(x - effectiveSize * 0.5, effectiveY + effectiveSize * 0.5)
          ctx.lineTo(x + effectiveSize * 0.5, effectiveY + effectiveSize * 0.5)
          ctx.lineTo(x + effectiveSize * 0.5, effectiveY)
          ctx.lineTo(x + effectiveSize * 0.7, effectiveY)
          ctx.closePath()
          ctx.fill()
        } else if (shape === "heart") {
          ctx.lineTo(x + effectiveSize * 0.5, effectiveY)
          ctx.lineTo(x + effectiveSize * 0.7, effectiveY)
          ctx.closePath()
          ctx.fill()
        } else if (shape === "heart") {
          // Heart icon
          const heartSize = effectiveSize * 0.6
          ctx.beginPath()
          ctx.moveTo(x, effectiveY + heartSize * 0.7)
          ctx.bezierCurveTo(
            x,
            effectiveY + heartSize * 0.7,
            x - heartSize,
            effectiveY - heartSize * 0.5,
            x - heartSize,
            effectiveY - heartSize * 0.5,
          )
          ctx.bezierCurveTo(
            x - heartSize,
            effectiveY - heartSize,
            x,
            effectiveY - heartSize * 0.3,
            x,
            effectiveY - heartSize * 0.3,
          )
          ctx.bezierCurveTo(
            x,
            effectiveY - heartSize * 0.3,
            x + heartSize,
            effectiveY - heartSize,
            x + heartSize,
            effectiveY - heartSize * 0.5,
          )
          ctx.bezierCurveTo(
            x + heartSize,
            effectiveY - heartSize * 0.5,
            x,
            effectiveY + heartSize * 0.7,
            x,
            effectiveY + heartSize * 0.7,
          )
          ctx.fill()
        } else {
          // Generic icon (dot in the middle)
          ctx.beginPath()
          ctx.arc(x, effectiveY, effectiveSize * 0.5, 0, Math.PI * 2)
          ctx.fill()
        }
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

          if (hasBorder) {
            ctx.strokeStyle = borderColor
            ctx.lineWidth = borderWidth
            ctx.stroke()
          }
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
          ctx.lineWidth = effectiveSize
          ctx.stroke()
        }
        break

      default:
        ctx.beginPath()
        ctx.arc(x, effectiveY, effectiveSize, 0, Math.PI * 2)
        ctx.fill()

        if (hasBorder) {
          ctx.strokeStyle = borderColor
          ctx.lineWidth = borderWidth
          ctx.stroke()
        }
    }

    // Reset rotation if applied
    if (rotation !== 0) {
      ctx.restore()
      x = x // Original x
      effectiveY = y // Original y
    }

    // Draw label if provided with positioning
    if (marker.label) {
      const labelSize = marker.labelSize || 12
      const labelColor = marker.labelColor || "#ffffff"
      const labelFont = marker.labelFont || "Arial"
      const labelBold = marker.labelBold ? "bold " : ""
      const labelItalic = marker.labelItalic ? "italic " : ""
      const labelOpacity = marker.labelOpacity !== undefined ? marker.labelOpacity : 1.0

      // Set label position based on the labelPosition property
      let labelX = x
      let labelY = effectiveY
      let textBaseline = "bottom"
      let textAlign = "center"

      switch (labelPosition) {
        case "top":
          labelY = effectiveY - (shape === "pin" || shape === "pin-solid" ? effectiveSize * 2 : effectiveSize) - 10
          textBaseline = "bottom"
          textAlign = "center"
          break
        case "bottom":
          labelY = effectiveY + effectiveSize + 20
          textBaseline = "top"
          textAlign = "center"
          break
        case "left":
          labelX = x - effectiveSize - 10
          labelY = effectiveY
          textBaseline = "middle"
          textAlign = "right"
          break
        case "right":
          labelX = x + effectiveSize + 10
          labelY = effectiveY
          textBaseline = "middle"
          textAlign = "left"
          break
      }

      // Set up text rendering with high quality settings
      ctx.textAlign = textAlign as CanvasTextAlign
      ctx.textBaseline = textBaseline as CanvasTextBaseline
      ctx.font = `${labelBold}${labelItalic}${labelSize}px ${labelFont}`

      // First draw a solid background/halo around the text for maximum contrast
      ctx.lineWidth = 5
      ctx.strokeStyle = "rgba(0, 0, 0, 0.9)"
      ctx.lineJoin = "round"
      ctx.miterLimit = 2
      ctx.strokeText(marker.label, labelX, labelY)

      // Then draw a second, lighter outline
      ctx.lineWidth = 3
      ctx.strokeStyle = "rgba(0, 0, 0, 0.7)"
      ctx.strokeText(marker.label, labelX, labelY)

      // Draw the main text with full opacity regardless of the opacity setting
      // This ensures the text itself is always clear
      ctx.fillStyle = labelColor
      ctx.globalAlpha = 1.0
      ctx.fillText(marker.label, labelX, labelY)

      // Draw underline if enabled
      if (marker.labelUnderline) {
        const textWidth = ctx.measureText(marker.label).width
        const underlineY = labelY + (textBaseline === "top" ? labelSize + 3 : 3)

        ctx.beginPath()
        ctx.lineWidth = Math.max(2, labelSize / 6) // Thicker underline for better visibility

        if (textAlign === "center") {
          ctx.moveTo(labelX - textWidth / 2, underlineY)
          ctx.lineTo(labelX + textWidth / 2, underlineY)
        } else if (textAlign === "right") {
          ctx.moveTo(labelX, underlineY)
          ctx.lineTo(labelX - textWidth, underlineY)
        } else {
          ctx.moveTo(labelX, underlineY)
          ctx.lineTo(labelX + textWidth, underlineY)
        }

        // Draw a thicker black underline first for contrast
        ctx.strokeStyle = "rgba(0, 0, 0, 0.8)"
        ctx.lineWidth = Math.max(3, labelSize / 5)
        ctx.stroke()

        // Then draw the colored underline on top
        ctx.strokeStyle = labelColor
        ctx.lineWidth = Math.max(2, labelSize / 6)
        ctx.stroke()
      }

      // Reset shadow and opacity
      ctx.shadowColor = "transparent"
      ctx.shadowBlur = 0
      ctx.globalAlpha = 1.0
    }

    // Reset global alpha and shadow
    ctx.globalAlpha = 1.0
    ctx.shadowColor = "transparent"
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }

  function drawBasemapBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    basemap: string,
    customBgColor?: string,
  ) {
    // If a custom background color is provided, use it
    if (customBgColor) {
      ctx.fillStyle = customBgColor
      ctx.fillRect(0, 0, width, height)
      return
    }

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

  // Update the handleClick function to immediately call onMapClick
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

    // If hovering over a feature and in colors tab, trigger feature click
    if (hoveredFeature && onFeatureClick && activeTab === "colors") {
      onFeatureClick(hoveredFeature)
    }

    // If in markers tab, always trigger map click with coordinates
    if (onMapClick && activeTab === "markers") {
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
        {features.length === 0 ? (
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
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 9 }}
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
              onContextMenu={(e) => e.preventDefault()}
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
        </div>
      </CardContent>
    </Card>
  )
}
