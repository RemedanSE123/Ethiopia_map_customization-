"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  MapPin,
  Circle,
  Square,
  Triangle,
  Hexagon,
  Pencil,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Info,
  HelpCircle,
  Flag,
  Star,
  Navigation,
  Map,
  Locate,
  AlertCircle,
  CheckCircle,
  XCircle,
  Bookmark,
  Heart,
  Home,
  Building,
  Landmark,
  Tent,
  Utensils,
  ShoppingBag,
  Car,
  Bus,
  Plane,
  Ship,
  Anchor,
  Bike,
  Zap,
  Droplet,
  Flame,
  Snowflake,
  Cloud,
  Sun,
  Moon,
  Smartphone,
  Wifi,
  Radio,
  Camera,
  ImageIcon,
  Music,
  Video,
  FileText,
  Mail,
  Phone,
  MessageCircle,
  Users,
  User,
  UserPlus,
  Briefcase,
  Clipboard,
  Calendar,
  Clock,
  Award,
  Gift,
  Coffee,
  PenTool,
  Settings,
  Lock,
  Key,
  Search,
  Filter,
  Share,
  Download,
  Upload,
  Link,
  Trash,
  Save,
  Edit,
  MoreHorizontal,
  ChevronsUp,
  ChevronsDown,
  ArrowUpRight,
  ArrowUpLeft,
  ArrowDownRight,
  ArrowDownLeft,
} from "lucide-react"
import { motion } from "framer-motion"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"

interface MarkerEditorProps {
  markers: Array<{
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
  }>
  onAddMarker: (marker: any) => void
  onUpdateMarker: (index: number, marker: any) => void
  onRemoveMarker: (index: number) => void
  clickPosition: { lat: number; lng: number } | null
  setClickPosition?: (position: { lat: number; lng: number } | null) => void
}

export function MarkerEditor({
  markers,
  onAddMarker,
  onUpdateMarker,
  onRemoveMarker,
  clickPosition,
  setClickPosition,
}: MarkerEditorProps) {
  const [newMarker, setNewMarker] = useState<{
    lat: number
    lng: number
    color: string
    size: number
    opacity: number
    label: string
    labelColor: string
    labelSize: number
    labelPosition: "top" | "bottom" | "left" | "right"
    shape: string
    number?: number
    hasShadow: boolean
    hasBorder: boolean
    borderColor: string
    borderWidth: number
    rotation: number
    scale: number
    pulseEffect: boolean
    bounceEffect: boolean
    glowEffect: boolean
    glowColor: string
    iconSize: number
  }>({
    lat: clickPosition?.lat || 0,
    lng: clickPosition?.lng || 0,
    color: "#ff0000",
    size: 8,
    opacity: 0.8,
    label: "",
    labelColor: "#ffffff",
    labelSize: 12,
    labelPosition: "top",
    shape: "pin",
    number: 1,
    hasShadow: true,
    hasBorder: true,
    borderColor: "#ffffff",
    borderWidth: 1,
    rotation: 0,
    scale: 1,
    pulseEffect: false,
    bounceEffect: false,
    glowEffect: false,
    glowColor: "#ffff00",
    iconSize: 12,
  })

  const [editingMarkerIndex, setEditingMarkerIndex] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [manualCoordinates, setManualCoordinates] = useState({ lat: "", lng: "" })
  const [activeTab, setActiveTab] = useState<"map" | "manual">("map")
  const [markerCategory, setMarkerCategory] = useState<
    "basic" | "arrows" | "places" | "transport" | "nature" | "tech" | "business" | "misc"
  >("basic")
  const markersPerPage = 3
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)

  // Update new marker when click position changes
  useEffect(() => {
    if (clickPosition && (newMarker.lat !== clickPosition.lat || newMarker.lng !== clickPosition.lng)) {
      setNewMarker((prev) => ({
        ...prev,
        lat: clickPosition.lat,
        lng: clickPosition.lng,
      }))
    }
  }, [clickPosition, newMarker.lat, newMarker.lng])

  const handleAddMarker = () => {
    onAddMarker(newMarker)
    setNewMarker({
      ...newMarker,
      label: "",
    })
    // Clear the click position after adding a marker
    if (setClickPosition) {
      setClickPosition(null)
    }
  }

  const handleUpdateMarker = () => {
    if (editingMarkerIndex !== null) {
      onUpdateMarker(editingMarkerIndex, newMarker)
      setEditingMarkerIndex(null)
    }
  }

  const handleEditMarker = (index: number) => {
    const marker = markers[index]
    setNewMarker({
      lat: marker.lat,
      lng: marker.lng,
      color: marker.color,
      size: marker.size,
      opacity: marker.opacity || 0.8,
      label: marker.label || "",
      labelColor: marker.labelColor || "#ffffff",
      labelSize: marker.labelSize || 12,
      labelPosition: marker.labelPosition || "top",
      shape: marker.shape || "pin",
      number: marker.number || 1,
      hasShadow: marker.hasShadow !== undefined ? marker.hasShadow : true,
      hasBorder: marker.hasBorder !== undefined ? marker.hasBorder : true,
      borderColor: marker.borderColor || "#ffffff",
      borderWidth: marker.borderWidth || 1,
      rotation: marker.rotation || 0,
      scale: marker.scale || 1,
      pulseEffect: marker.pulseEffect || false,
      bounceEffect: marker.bounceEffect || false,
      glowEffect: marker.glowEffect || false,
      glowColor: marker.glowColor || "#ffff00",
      iconSize: marker.iconSize || 12,
    })
    setEditingMarkerIndex(index)
    setShowAdvancedOptions(true)

    // Set the marker category based on the shape
    const shape = marker.shape || "pin"
    if (
      [
        "pin",
        "pin-solid",
        "pin-rounded",
        "pin-flat",
        "pin-pulse",
        "circle",
        "square",
        "triangle",
        "hexagon",
        "polygon",
        "line",
        "star",
        "flag",
        "dot",
        "numbered",
      ].includes(shape)
    ) {
      setMarkerCategory("basic")
    } else if (shape.startsWith("arrow") || shape.startsWith("double-arrow")) {
      setMarkerCategory("arrows")
    } else if (["home", "building", "landmark", "tent", "food", "shopping"].includes(shape)) {
      setMarkerCategory("places")
    } else if (["car", "bus", "plane", "ship", "anchor", "bike"].includes(shape)) {
      setMarkerCategory("transport")
    } else if (["lightning", "water", "fire", "snow", "cloud", "sun", "moon"].includes(shape)) {
      setMarkerCategory("nature")
    } else if (
      ["phone", "wifi", "radio", "camera", "image", "music", "video", "file", "mail", "call", "message"].includes(shape)
    ) {
      setMarkerCategory("tech")
    } else if (["people", "person", "add-person", "work", "clipboard", "calendar", "clock"].includes(shape)) {
      setMarkerCategory("business")
    } else {
      setMarkerCategory("misc")
    }
  }

  const handleManualCoordinates = () => {
    const lat = Number.parseFloat(manualCoordinates.lat)
    const lng = Number.parseFloat(manualCoordinates.lng)

    if (!isNaN(lat) && !isNaN(lng)) {
      setNewMarker((prev) => ({
        ...prev,
        lat,
        lng,
      }))

      // If we're in manual mode, we need to simulate a click position
      if (setClickPosition) {
        setClickPosition({ lat, lng })
      }
    }
  }

  const totalPages = Math.ceil(markers.length / markersPerPage)
  const displayedMarkers = markers.slice(currentPage * markersPerPage, (currentPage + 1) * markersPerPage)

  // Helper function to get shape icon
  const getShapeIcon = (shape: string, size = 4) => {
    const iconProps = { className: `h-${size} w-${size}` }

    switch (shape) {
      case "pin":
        return <MapPin className={`h-${size} w-${size}`} />
      case "pin-solid":
        return <div className={`h-${size} w-${size} flex items-center justify-center`}>📍</div>
      case "pin-rounded":
        return <Locate className={`h-${size} w-${size}`} />
      case "pin-flat":
        return <Map className={`h-${size} w-${size}`} />
      case "pin-pulse":
        return <Navigation className={`h-${size} w-${size}`} />
      case "circle":
        return <Circle className={`h-${size} w-${size}`} />
      case "square":
        return <Square className={`h-${size} w-${size}`} />
      case "triangle":
        return <Triangle className={`h-${size} w-${size}`} />
      case "hexagon":
        return <Hexagon className={`h-${size} w-${size}`} />
      case "polygon":
        return <Pencil className={`h-${size} w-${size}`} />
      case "arrow-up":
        return <ArrowUp className={`h-${size} w-${size}`} />
      case "arrow-down":
        return <ArrowDown className={`h-${size} w-${size}`} />
      case "arrow-left":
        return <ArrowLeft className={`h-${size} w-${size}`} />
      case "arrow-right":
        return <ArrowRight className={`h-${size} w-${size}`} />
      case "double-arrow-up":
        return <ChevronsUp className={`h-${size} w-${size}`} />
      case "double-arrow-down":
        return <ChevronsDown className={`h-${size} w-${size}`} />
      case "arrow-up-right":
        return <ArrowUpRight className={`h-${size} w-${size}`} />
      case "arrow-down-right":
        return <ArrowDownRight className={`h-${size} w-${size}`} />
      case "arrow-up-left":
        return <ArrowUpLeft className={`h-${size} w-${size}`} />
      case "arrow-down-left":
        return <ArrowDownLeft className={`h-${size} w-${size}`} />
      case "star":
        return <Star className={`h-${size} w-${size}`} />
      case "flag":
        return <Flag className={`h-${size} w-${size}`} />
      case "dot":
        return <div className={`h-${size} w-${size} rounded-full bg-current`}></div>
      case "alert":
        return <AlertCircle className={`h-${size} w-${size}`} />
      case "check":
        return <CheckCircle className={`h-${size} w-${size}`} />
      case "x-mark":
        return <XCircle className={`h-${size} w-${size}`} />
      case "bookmark":
        return <Bookmark className={`h-${size} w-${size}`} />
      case "heart":
        return <Heart className={`h-${size} w-${size}`} />
      case "home":
        return <Home className={`h-${size} w-${size}`} />
      case "building":
        return <Building className={`h-${size} w-${size}`} />
      case "landmark":
        return <Landmark className={`h-${size} w-${size}`} />
      case "tent":
        return <Tent className={`h-${size} w-${size}`} />
      case "food":
        return <Utensils className={`h-${size} w-${size}`} />
      case "shopping":
        return <ShoppingBag className={`h-${size} w-${size}`} />
      case "car":
        return <Car className={`h-${size} w-${size}`} />
      case "bus":
        return <Bus className={`h-${size} w-${size}`} />
      case "plane":
        return <Plane className={`h-${size} w-${size}`} />
      case "ship":
        return <Ship className={`h-${size} w-${size}`} />
      case "anchor":
        return <Anchor className={`h-${size} w-${size}`} />
      case "bike":
        return <Bike className={`h-${size} w-${size}`} />
      case "lightning":
        return <Zap className={`h-${size} w-${size}`} />
      case "water":
        return <Droplet className={`h-${size} w-${size}`} />
      case "fire":
        return <Flame className={`h-${size} w-${size}`} />
      case "snow":
        return <Snowflake className={`h-${size} w-${size}`} />
      case "cloud":
        return <Cloud className={`h-${size} w-${size}`} />
      case "sun":
        return <Sun className={`h-${size} w-${size}`} />
      case "moon":
        return <Moon className={`h-${size} w-${size}`} />
      case "phone":
        return <Smartphone className={`h-${size} w-${size}`} />
      case "wifi":
        return <Wifi className={`h-${size} w-${size}`} />
      case "radio":
        return <Radio className={`h-${size} w-${size}`} />
      case "camera":
        return <Camera className={`h-${size} w-${size}`} />
      case "image":
        return <ImageIcon className={`h-${size} w-${size}`} />
      case "music":
        return <Music className={`h-${size} w-${size}`} />
      case "video":
        return <Video className={`h-${size} w-${size}`} />
      case "file":
        return <FileText className={`h-${size} w-${size}`} />
      case "mail":
        return <Mail className={`h-${size} w-${size}`} />
      case "call":
        return <Phone className={`h-${size} w-${size}`} />
      case "message":
        return <MessageCircle className={`h-${size} w-${size}`} />
      case "people":
        return <Users className={`h-${size} w-${size}`} />
      case "person":
        return <User className={`h-${size} w-${size}`} />
      case "add-person":
        return <UserPlus className={`h-${size} w-${size}`} />
      case "work":
        return <Briefcase className={`h-${size} w-${size}`} />
      case "clipboard":
        return <Clipboard className={`h-${size} w-${size}`} />
      case "calendar":
        return <Calendar className={`h-${size} w-${size}`} />
      case "clock":
        return <Clock className={`h-${size} w-${size}`} />
      case "award":
        return <Award className={`h-${size} w-${size}`} />
      case "gift":
        return <Gift className={`h-${size} w-${size}`} />
      case "coffee":
        return <Coffee className={`h-${size} w-${size}`} />
      case "tools":
        return <PenTool className={`h-${size} w-${size}`} />
      case "settings":
        return <Settings className={`h-${size} w-${size}`} />
      case "lock":
        return <Lock className={`h-${size} w-${size}`} />
      case "key":
        return <Key className={`h-${size} w-${size}`} />
      case "search":
        return <Search className={`h-${size} w-${size}`} />
      case "filter":
        return <Filter className={`h-${size} w-${size}`} />
      case "share":
        return <Share className={`h-${size} w-${size}`} />
      case "download":
        return <Download className={`h-${size} w-${size}`} />
      case "upload":
        return <Upload className={`h-${size} w-${size}`} />
      case "link":
        return <Link className={`h-${size} w-${size}`} />
      case "trash":
        return <Trash className={`h-${size} w-${size}`} />
      case "save":
        return <Save className={`h-${size} w-${size}`} />
      case "edit":
        return <Edit className={`h-${size} w-${size}`} />
      case "more":
        return <MoreHorizontal className={`h-${size} w-${size}`} />
      case "numbered":
        return (
          <div className={`h-${size} w-${size} flex items-center justify-center font-bold`}>
            {newMarker.number || 1}
          </div>
        )
      default:
        return <MapPin className={`h-${size} w-${size}`} />
    }
  }

  // Helper function to get label position icon
  const getLabelPositionIcon = (position: string) => {
    switch (position) {
      case "top":
        return <ArrowUp className="h-4 w-4" />
      case "bottom":
        return <ArrowDown className="h-4 w-4" />
      case "left":
        return <ArrowLeft className="h-4 w-4" />
      case "right":
        return <ArrowRight className="h-4 w-4" />
      default:
        return <ArrowUp className="h-4 w-4" />
    }
  }

  // Render marker shape options based on category
  const renderMarkerShapeOptions = () => {
    switch (markerCategory) {
      case "basic":
        return (
          <div className="grid grid-cols-5 gap-2 mt-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "pin" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "pin" })}
                    className="flex-1"
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Standard Pin</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "pin-solid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "pin-solid" })}
                    className="flex-1"
                  >
                    <div className="h-4 w-4 flex items-center justify-center">📍</div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Solid Pin</TooltipContent>
              </Tooltip>
            </TooltipProvider>

           

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "circle" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "circle" })}
                    className="flex-1"
                  >
                    <Circle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Circle</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "square" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "square" })}
                    className="flex-1"
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Square</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "triangle" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "triangle" })}
                    className="flex-1"
                  >
                    <Triangle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Triangle</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "hexagon" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "hexagon" })}
                    className="flex-1"
                  >
                    <Hexagon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Hexagon</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "star" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "star" })}
                    className="flex-1"
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Star</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "flag" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "flag" })}
                    className="flex-1"
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Flag</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "dot" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "dot" })}
                    className="flex-1"
                  >
                    <div className="h-4 w-4 rounded-full bg-current"></div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Dot</TooltipContent>
              </Tooltip>
            </TooltipProvider>

         

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "numbered" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "numbered" })}
                    className="flex-1"
                  >
                    <div className="h-4 w-4 flex items-center justify-center font-bold">1</div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Numbered Marker</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )

      case "arrows":
        return (
          <div className="grid grid-cols-5 gap-2 mt-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "arrow-up" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "arrow-up" })}
                    className="flex-1"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Up Arrow</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "arrow-down" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "arrow-down" })}
                    className="flex-1"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Down Arrow</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "arrow-left" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "arrow-left" })}
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Left Arrow</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "arrow-right" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "arrow-right" })}
                    className="flex-1"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Right Arrow</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "double-arrow-up" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "double-arrow-up" })}
                    className="flex-1"
                  >
                    <ChevronsUp className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Double Up Arrow</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "double-arrow-down" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "double-arrow-down" })}
                    className="flex-1"
                  >
                    <ChevronsDown className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Double Down Arrow</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "arrow-up-right" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "arrow-up-right" })}
                    className="flex-1"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Up-Right Arrow</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "arrow-up-left" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "arrow-up-left" })}
                    className="flex-1"
                  >
                    <ArrowUpLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Up-Left Arrow</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "arrow-down-right" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "arrow-down-right" })}
                    className="flex-1"
                  >
                    <ArrowDownRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Down-Right Arrow</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "arrow-down-left" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "arrow-down-left" })}
                    className="flex-1"
                  >
                    <ArrowDownLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Down-Left Arrow</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )

      case "places":
        return (
          <div className="grid grid-cols-5 gap-2 mt-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "home" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "home" })}
                    className="flex-1"
                  >
                    <Home className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Home</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "building" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "building" })}
                    className="flex-1"
                  >
                    <Building className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Building</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "landmark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "landmark" })}
                    className="flex-1"
                  >
                    <Landmark className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Landmark</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "tent" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "tent" })}
                    className="flex-1"
                  >
                    <Tent className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Tent/Camping</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "food" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "food" })}
                    className="flex-1"
                  >
                    <Utensils className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Food/Restaurant</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "shopping" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "shopping" })}
                    className="flex-1"
                  >
                    <ShoppingBag className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Shopping</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )

      case "transport":
        return (
          <div className="grid grid-cols-5 gap-2 mt-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "car" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "car" })}
                    className="flex-1"
                  >
                    <Car className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Car</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "bus" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "bus" })}
                    className="flex-1"
                  >
                    <Bus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Bus</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "plane" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "plane" })}
                    className="flex-1"
                  >
                    <Plane className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Plane</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "ship" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "ship" })}
                    className="flex-1"
                  >
                    <Ship className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ship</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "anchor" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "anchor" })}
                    className="flex-1"
                  >
                    <Anchor className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Anchor/Port</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "bike" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "bike" })}
                    className="flex-1"
                  >
                    <Bike className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Bike</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )

      case "nature":
        return (
          <div className="grid grid-cols-5 gap-2 mt-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "lightning" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "lightning" })}
                    className="flex-1"
                  >
                    <Zap className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Lightning</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "water" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "water" })}
                    className="flex-1"
                  >
                    <Droplet className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Water</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "fire" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "fire" })}
                    className="flex-1"
                  >
                    <Flame className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Fire</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "snow" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "snow" })}
                    className="flex-1"
                  >
                    <Snowflake className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Snow</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "cloud" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "cloud" })}
                    className="flex-1"
                  >
                    <Cloud className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Cloud</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "sun" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "sun" })}
                    className="flex-1"
                  >
                    <Sun className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Sun</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "moon" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "moon" })}
                    className="flex-1"
                  >
                    <Moon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Moon</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )

      case "tech":
        return (
          <div className="grid grid-cols-5 gap-2 mt-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "phone" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "phone" })}
                    className="flex-1"
                  >
                    <Smartphone className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Phone</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "wifi" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "wifi" })}
                    className="flex-1"
                  >
                    <Wifi className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>WiFi</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "camera" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "camera" })}
                    className="flex-1"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Camera</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "mail" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "mail" })}
                    className="flex-1"
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Mail</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "call" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "call" })}
                    className="flex-1"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Call</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )

      case "business":
        return (
          <div className="grid grid-cols-5 gap-2 mt-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "people" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "people" })}
                    className="flex-1"
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>People</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "person" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "person" })}
                    className="flex-1"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Person</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "work" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "work" })}
                    className="flex-1"
                  >
                    <Briefcase className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Work</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "calendar" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "calendar" })}
                    className="flex-1"
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Calendar</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "clock" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "clock" })}
                    className="flex-1"
                  >
                    <Clock className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clock</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )

      case "misc":
        return (
          <div className="grid grid-cols-5 gap-2 mt-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "alert" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "alert" })}
                    className="flex-1"
                  >
                    <AlertCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Alert</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "check" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "check" })}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Check</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "x-mark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "x-mark" })}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>X Mark</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "heart" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "heart" })}
                    className="flex-1"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Heart</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={newMarker.shape === "bookmark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMarker({ ...newMarker, shape: "bookmark" })}
                    className="flex-1"
                  >
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Bookmark</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )

      default:
        return (
          <div className="grid grid-cols-5 gap-2 mt-1">
            <Button
              variant={newMarker.shape === "pin" ? "default" : "outline"}
              size="sm"
              onClick={() => setNewMarker({ ...newMarker, shape: "pin" })}
              className="flex-1"
            >
              <MapPin className="h-4 w-4" />
            </Button>
            <Button
              variant={newMarker.shape === "circle" ? "default" : "outline"}
              size="sm"
              onClick={() => setNewMarker({ ...newMarker, shape: "circle" })}
              className="flex-1"
            >
              <Circle className="h-4 w-4" />
            </Button>
            <Button
              variant={newMarker.shape === "square" ? "default" : "outline"}
              size="sm"
              onClick={() => setNewMarker({ ...newMarker, shape: "square" })}
              className="flex-1"
            >
              <Square className="h-4 w-4" />
            </Button>
            <Button
              variant={newMarker.shape === "triangle" ? "default" : "outline"}
              size="sm"
              onClick={() => setNewMarker({ ...newMarker, shape: "triangle" })}
              className="flex-1"
            >
              <Triangle className="h-4 w-4" />
            </Button>
            <Button
              variant={newMarker.shape === "hexagon" ? "default" : "outline"}
              size="sm"
              onClick={() => setNewMarker({ ...newMarker, shape: "hexagon" })}
              className="flex-1"
            >
              <Hexagon className="h-4 w-4" />
            </Button>
          </div>
        )
    }
  }

  // Render advanced options if enabled
  const renderAdvancedOptions = () => {
    if (!showAdvancedOptions) return null

    return (
      <div className="space-y-3 mt-4 pt-4 border-t">
        <h3 className="text-sm font-medium">Advanced Options</h3>

        {newMarker.shape === "numbered" && (
          <div>
            <Label className="text-xs">Number</Label>
            <Input
              type="number"
              value={newMarker.number || 1}
              onChange={(e) => setNewMarker({ ...newMarker, number: Number(e.target.value) })}
              min="1"
              max="99"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="shadow"
              checked={newMarker.hasShadow}
              onCheckedChange={(checked) => setNewMarker({ ...newMarker, hasShadow: checked })}
            />
            <Label htmlFor="shadow" className="text-xs">
              Shadow
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="border"
              checked={newMarker.hasBorder}
              onCheckedChange={(checked) => setNewMarker({ ...newMarker, hasBorder: checked })}
            />
            <Label htmlFor="border" className="text-xs">
              Border
            </Label>
          </div>
        </div>

        {newMarker.hasBorder && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Border Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={newMarker.borderColor}
                  onChange={(e) => setNewMarker({ ...newMarker, borderColor: e.target.value })}
                  className="w-10 h-8 rounded cursor-pointer"
                />
                <Input
                  value={newMarker.borderColor}
                  onChange={(e) => setNewMarker({ ...newMarker, borderColor: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Border Width</Label>
              <Input
                type="number"
                value={newMarker.borderWidth}
                onChange={(e) => setNewMarker({ ...newMarker, borderWidth: Number(e.target.value) })}
                min="1"
                max="5"
              />
            </div>
          </div>
        )}

        <div>
          <Label className="text-xs">Rotation (degrees)</Label>
          <div className="flex items-center gap-2">
            <Slider
              value={[newMarker.rotation]}
              min={0}
              max={360}
              step={15}
              onValueChange={(value) => setNewMarker({ ...newMarker, rotation: value[0] })}
              className="flex-1"
            />
            <span className="text-xs w-10 text-right">{newMarker.rotation}°</span>
          </div>
        </div>

        <div>
          <Label className="text-xs">Scale</Label>
          <div className="flex items-center gap-2">
            <Slider
              value={[newMarker.scale]}
              min={0.5}
              max={2}
              step={0.1}
              onValueChange={(value) => setNewMarker({ ...newMarker, scale: value[0] })}
              className="flex-1"
            />
            <span className="text-xs w-10 text-right">{newMarker.scale.toFixed(1)}x</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="pulse"
              checked={newMarker.pulseEffect}
              onCheckedChange={(checked) => setNewMarker({ ...newMarker, pulseEffect: checked })}
            />
            <Label htmlFor="pulse" className="text-xs">
              Pulse
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="bounce"
              checked={newMarker.bounceEffect}
              onCheckedChange={(checked) => setNewMarker({ ...newMarker, bounceEffect: checked })}
            />
            <Label htmlFor="bounce" className="text-xs">
              Bounce
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="glow"
              checked={newMarker.glowEffect}
              onCheckedChange={(checked) => setNewMarker({ ...newMarker, glowEffect: checked })}
            />
            <Label htmlFor="glow" className="text-xs">
              Glow
            </Label>
          </div>
        </div>

        {newMarker.glowEffect && (
          <div>
            <Label className="text-xs">Glow Color</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={newMarker.glowColor}
                onChange={(e) => setNewMarker({ ...newMarker, glowColor: e.target.value })}
                className="w-10 h-8 rounded cursor-pointer"
              />
              <Input
                value={newMarker.glowColor}
                onChange={(e) => setNewMarker({ ...newMarker, glowColor: e.target.value })}
                className="w-full"
              />
            </div>
          </div>
        )}

        <div>
          <Label className="text-xs">Icon Size</Label>
          <Input
            type="number"
            value={newMarker.iconSize}
            onChange={(e) => setNewMarker({ ...newMarker, iconSize: Number(e.target.value) })}
            min="8"
            max="24"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4 space-y-4">
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="pb-2 bg-gradient-to-r from-primary/10 to-transparent">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {editingMarkerIndex !== null ? "Edit Marker" : "Add New Marker"}
          </CardTitle>
          <CardDescription>
            {activeTab === "map"
              ? "Click on the map to place a marker or switch to manual input"
              : "Enter exact coordinates to place a marker"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "map" | "manual")} className="mb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="map">Map Click</TabsTrigger>
              <TabsTrigger value="manual">Manual Coordinates</TabsTrigger>
            </TabsList>
            <TabsContent value="map">
              <div className="bg-secondary/30 p-3 rounded-md mb-4">
                <p className="text-sm">Click anywhere on the map to set the marker position. Current position:</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="flex items-center">
                    <span className="text-xs font-medium mr-1">Lat:</span>
                    <span className="text-xs">{newMarker.lat.toFixed(6)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs font-medium mr-1">Lng:</span>
                    <span className="text-xs">{newMarker.lng.toFixed(6)}</span>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="manual">
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div>
                  <Label className="text-xs">Latitude</Label>
                  <Input
                    type="text"
                    value={manualCoordinates.lat}
                    onChange={(e) => setManualCoordinates((prev) => ({ ...prev, lat: e.target.value }))}
                    placeholder="e.g. 9.145"
                  />
                </div>
                <div>
                  <Label className="text-xs">Longitude</Label>
                  <Input
                    type="text"
                    value={manualCoordinates.lng}
                    onChange={(e) => setManualCoordinates((prev) => ({ ...prev, lng: e.target.value }))}
                    placeholder="e.g. 40.489"
                  />
                </div>
              </div>
              <Button
                onClick={handleManualCoordinates}
                variant="outline"
                className="w-full mb-4"
                disabled={!manualCoordinates.lat || !manualCoordinates.lng}
              >
                Set Coordinates
              </Button>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Label</Label>
                <Input
                  value={newMarker.label}
                  onChange={(e) => setNewMarker({ ...newMarker, label: e.target.value })}
                  placeholder="Marker label (optional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Label Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={newMarker.labelColor}
                      onChange={(e) => setNewMarker({ ...newMarker, labelColor: e.target.value })}
                      className="w-10 h-8 rounded cursor-pointer"
                    />
                    <Input
                      value={newMarker.labelColor}
                      onChange={(e) => setNewMarker({ ...newMarker, labelColor: e.target.value })}
                      className="w-full"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Label Size</Label>
                  <Input
                    type="number"
                    value={newMarker.labelSize}
                    onChange={(e) => setNewMarker({ ...newMarker, labelSize: Number(e.target.value) })}
                    min="8"
                    max="24"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs flex items-center justify-between">
                  <span>Label Position</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <HelpCircle className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-medium">Label Position</h4>
                        <p className="text-sm text-muted-foreground">
                          Choose where the label appears relative to the marker:
                        </p>
                        <ul className="text-xs space-y-1 list-disc pl-4">
                          <li>Top: Label appears above the marker (default)</li>
                          <li>Bottom: Label appears below the marker</li>
                          <li>Left: Label appears to the left of the marker</li>
                          <li>Right: Label appears to the right of the marker</li>
                        </ul>
                      </div>
                    </PopoverContent>
                  </Popover>
                </Label>
                <RadioGroup
                  value={newMarker.labelPosition}
                  onValueChange={(value) =>
                    setNewMarker({ ...newMarker, labelPosition: value as "top" | "bottom" | "left" | "right" })
                  }
                  className="grid grid-cols-4 gap-2 mt-1"
                >
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="top" id="label-top" className="sr-only" />
                    <Label
                      htmlFor="label-top"
                      className={`flex items-center justify-center p-2 border rounded-md cursor-pointer ${
                        newMarker.labelPosition === "top" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                      }`}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="bottom" id="label-bottom" className="sr-only" />
                    <Label
                      htmlFor="label-bottom"
                      className={`flex items-center justify-center p-2 border rounded-md cursor-pointer ${
                        newMarker.labelPosition === "bottom"
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-secondary"
                      }`}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="left" id="label-left" className="sr-only" />
                    <Label
                      htmlFor="label-left"
                      className={`flex items-center justify-center p-2 border rounded-md cursor-pointer ${
                        newMarker.labelPosition === "left" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                      }`}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="right" id="label-right" className="sr-only" />
                    <Label
                      htmlFor="label-right"
                      className={`flex items-center justify-center p-2 border rounded-md cursor-pointer ${
                        newMarker.labelPosition === "right"
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-secondary"
                      }`}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-xs">Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={newMarker.color}
                    onChange={(e) => setNewMarker({ ...newMarker, color: e.target.value })}
                    className="w-10 h-8 rounded cursor-pointer"
                  />
                  <Input
                    value={newMarker.color}
                    onChange={(e) => setNewMarker({ ...newMarker, color: e.target.value })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-xs">Size</Label>
                <Input
                  type="number"
                  value={newMarker.size}
                  onChange={(e) => setNewMarker({ ...newMarker, size: Number(e.target.value) })}
                  min="4"
                  max="20"
                />
              </div>

              <div>
                <Label className="text-xs">Opacity: {Math.round(newMarker.opacity * 100)}%</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[newMarker.opacity]}
                    min={0.1}
                    max={1}
                    step={0.1}
                    onValueChange={(value) => setNewMarker({ ...newMarker, opacity: value[0] })}
                    className="flex-1"
                  />
                  <span className="text-xs w-10 text-right">{Math.round(newMarker.opacity * 100)}%</span>
                </div>
              </div>

              <div>
                <Label className="text-xs flex items-center justify-between">
                  <span>Marker Category</span>
                </Label>
                <Select value={markerCategory} onValueChange={(value) => setMarkerCategory(value as any)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic Shapes</SelectItem>
                    <SelectItem value="arrows">Arrows & Directions</SelectItem>
                   
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs flex items-center justify-between">
                  <span>Shape</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <HelpCircle className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-medium">Marker Types</h4>
                        <p className="text-sm text-muted-foreground">
                          Choose from various marker categories and shapes for your specific needs.
                        </p>
                        <ul className="text-xs space-y-1 list-disc pl-4">
                          <li>
                            <strong>Basic Shapes:</strong> Standard pins, geometric shapes, and simple markers
                          </li>
                          <li>
                            <strong>Arrows:</strong> Directional indicators for flows or directions
                          </li>
                          <li>
                            <strong>Places:</strong> Buildings, landmarks, and location-specific icons
                          </li>
                          <li>
                            <strong>Transportation:</strong> Vehicles and transport-related markers
                          </li>
                          <li>
                            <strong>Nature:</strong> Weather and natural elements
                          </li>
                        </ul>
                      </div>
                    </PopoverContent>
                  </Popover>
                </Label>
                <ScrollArea className="h-[120px] border rounded-md p-2">{renderMarkerShapeOptions()}</ScrollArea>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className="text-xs"
                >
                  {showAdvancedOptions ? "Hide Advanced Options" : "Show Advanced Options"}
                </Button>
              </div>
            </div>
          </div>

          {renderAdvancedOptions()}

          {/* Action buttons moved below the form */}
          <div className="mt-4 pt-4 border-t flex justify-center gap-4">
            {editingMarkerIndex !== null ? (
              <>
                <Button onClick={handleUpdateMarker} size="lg" className="w-1/3">
                  Update Marker
                </Button>
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={() => {
                    onRemoveMarker(editingMarkerIndex)
                    setEditingMarkerIndex(null)
                  }}
                  className="w-1/3"
                >
                  Delete Marker
                </Button>
                <Button variant="outline" size="lg" onClick={() => setEditingMarkerIndex(null)} className="w-1/3">
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                onClick={handleAddMarker}
                size="lg"
                className="w-full"
                disabled={activeTab === "map" ? !clickPosition : !newMarker.lat || !newMarker.lng}
              >
                {activeTab === "map" ? (clickPosition ? "Add Marker" : "Click on map to place marker") : "Add Marker"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="pb-2 bg-gradient-to-r from-primary/10 to-transparent">
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Markers ({markers.length})
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  {currentPage + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage === totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {markers.length === 0 ? (
            <div className="text-center py-6 bg-secondary/20 rounded-lg">
              <p className="text-muted-foreground">No markers added yet</p>
              <p className="text-xs mt-2 text-muted-foreground">Click on the map or enter coordinates to add markers</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {displayedMarkers.map((marker, index) => {
                const actualIndex = currentPage * markersPerPage + index
                return (
                  <motion.div
                    key={actualIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border rounded-md p-3 hover:bg-secondary/50 transition-colors cursor-pointer"
                    onClick={() => handleEditMarker(actualIndex)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: marker.color,
                            opacity: marker.opacity || 0.8,
                          }}
                        >
                          {getShapeIcon(marker.shape || "pin", 3)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{marker.label || `Marker ${actualIndex + 1}`}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onRemoveMarker(actualIndex)
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      <p>
                        Lat: {marker.lat.toFixed(4)}, Lng: {marker.lng.toFixed(4)}
                      </p>
                      <p>
                        Size: {marker.size}, Opacity: {Math.round((marker.opacity || 0.8) * 100)}%
                      </p>
                      <p>
                        Shape: {marker.shape || "pin"}
                        {marker.pulseEffect && ", Pulse"}
                        {marker.bounceEffect && ", Bounce"}
                      </p>
                      {marker.label && (
                        <p>
                          Label: {marker.label} ({marker.labelSize || 12}px, {marker.labelPosition || "top"})
                        </p>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="pb-2 bg-gradient-to-r from-primary/10 to-transparent">
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Marker Usage Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-secondary/20 p-3 rounded-lg">
                <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" /> Standard Pins
                </h3>
                <p className="text-xs text-muted-foreground">
                  Best for marking specific locations. Choose from various pin styles including standard, solid,
                  rounded, flat, and pulse pins.
                </p>
              </div>
              <div className="bg-secondary/20 p-3 rounded-lg">
                <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <ArrowUp className="h-4 w-4 text-primary" /> Directional Markers
                </h3>
                <p className="text-xs text-muted-foreground">
                  Use arrows to indicate direction, flow, or movement. Available in all directions including up, down,
                  left, right, and diagonals.
                </p>
              </div>
              <div className="bg-secondary/20 p-3 rounded-lg">
                <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <Building className="h-4 w-4 text-primary" /> Place Markers
                </h3>
                <p className="text-xs text-muted-foreground">
                  Specialized icons for specific locations like buildings, landmarks, restaurants, shops, and more. Use
                  these to indicate the type of place.
                </p>
              </div>
              <div className="bg-secondary/20 p-3 rounded-lg">
                <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <div className="h-4 w-4 flex items-center justify-center font-bold">1</div> Numbered Markers
                </h3>
                <p className="text-xs text-muted-foreground">
                  Perfect for creating sequences or routes. Use numbered markers to indicate order or priority of
                  locations on your map.
                </p>
              </div>
            </div>

            <div className="bg-primary/10 p-3 rounded-lg">
              <h3 className="font-medium text-sm mb-2">Advanced Marker Features</h3>
              <p className="text-xs text-muted-foreground mb-2">
                Enhance your markers with special effects and customizations:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                <li>
                  <strong>Animation Effects:</strong> Add pulse, bounce, or glow effects to draw attention to important
                  markers
                </li>
                <li>
                  <strong>Rotation & Scale:</strong> Adjust the orientation and size of markers for better visibility
                </li>
                <li>
                  <strong>Custom Styling:</strong> Add borders, shadows, and other visual enhancements
                </li>
                <li>
                  <strong>Label Positioning:</strong> Place labels in optimal positions based on map content
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
