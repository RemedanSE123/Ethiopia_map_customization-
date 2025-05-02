// step3-metadata.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Info, LinkIcon, Palette, User, Building, Calendar, Trash2 } from "lucide-react"
import { useState } from "react"

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

interface Step3MetadataProps {
  metadata: MapMetadata
  handleMetadataChange: (key: keyof MapMetadata, value: any) => void
}

export default function Step3Metadata({ metadata, handleMetadataChange }: Step3MetadataProps) {
  const [newLegendLabel, setNewLegendLabel] = useState("")
  const [newLegendColor, setNewLegendColor] = useState("#000000")
  const [newLegendIcon, setNewLegendIcon] = useState("pin")
  const [newLegendIconColor, setNewLegendIconColor] = useState("#000000")

  const addLegendItem = () => {
    if (newLegendLabel.trim()) {
      const updatedLegendItems = [
        ...metadata.legendItems,
        { label: newLegendLabel, color: newLegendColor, icon: newLegendIcon, iconColor: newLegendIconColor },
      ]
      handleMetadataChange("legendItems", updatedLegendItems)
      setNewLegendLabel("")
      setNewLegendColor("#000000")
      setNewLegendIcon("pin")
      setNewLegendIconColor("#000000")
    }
  }

  const removeLegendItem = (index: number) => {
    const updatedLegendItems = metadata.legendItems.filter((_, i) => i !== index)
    handleMetadataChange("legendItems", updatedLegendItems)
  }

  const updateLegendItem = (index: number, field: "label" | "color" | "icon" | "iconColor", value: string) => {
    const updatedLegendItems = metadata.legendItems.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    )
    handleMetadataChange("legendItems", updatedLegendItems)
  }

  const iconOptions = [
    { value: "pin", label: "Pin" },
    { value: "flag", label: "Flag" },
    { value: "circle", label: "Circle" },
    { value: "square", label: "Square" },
    { value: "triangle", label: "Triangle" },
    { value: "star", label: "Star" },
    { value: "heart", label: "Heart" },
    { value: "home", label: "Home" },
    { value: "building", label: "Building" },
    { value: "check", label: "Check" },
  ]

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" /> Map Information
          </CardTitle>
          <CardDescription>Add title, description, and other metadata</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="map-title" className="flex items-center gap-2">
              <Info className="h-4 w-4" /> Title
            </Label>
            <Input
              id="map-title"
              value={metadata.title || ""}
              onChange={(e) => handleMetadataChange("title", e.target.value)}
              placeholder="Enter map title"
            />
          </div>

          <div>
            <Label htmlFor="map-description" className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Description
            </Label>
            <Textarea
              id="map-description"
              value={metadata.description || ""}
              onChange={(e) => handleMetadataChange("description", e.target.value)}
              placeholder="Describe your map"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="map-author" className="flex items-center gap-2">
                <User className="h-4 w-4" /> Author
              </Label>
              <Input
                id="map-author"
                value={metadata.author || ""}
                onChange={(e) => handleMetadataChange("author", e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div>
              <Label htmlFor="map-organization" className="flex items-center gap-2">
                <Building className="h-4 w-4" /> Organization
              </Label>
              <Input
                id="map-organization"
                value={metadata.organization || ""}
                onChange={(e) => handleMetadataChange("organization", e.target.value)}
                placeholder="Your organization"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="map-date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Date
            </Label>
            <Input
              id="map-date"
              type="date"
              value={metadata.date || ""}
              onChange={(e) => handleMetadataChange("date", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="map-link" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" /> Share Link
            </Label>
            <Input
              id="map-link"
              value={metadata.link || ""}
              onChange={(e) => handleMetadataChange("link", e.target.value)}
              placeholder="https://example.com/map/share/123456"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" /> Display Options
          </CardTitle>
          <CardDescription>Choose what to show on your map</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-title" className="text-sm font-medium">
              Show Title
            </Label>
            <Switch
              id="show-title"
              checked={metadata.showTitle}
              onCheckedChange={(checked) => handleMetadataChange("showTitle", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-description" className="text-sm font-medium">
              Show Description
            </Label>
            <Switch
              id="show-description"
              checked={metadata.showDescription}
              onCheckedChange={(checked) => handleMetadataChange("showDescription", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-author" className="text-sm font-medium">
              Show Author/Organization
            </Label>
            <Switch
              id="show-author"
              checked={metadata.showAuthor}
              onCheckedChange={(checked) => handleMetadataChange("showAuthor", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-date" className="text-sm font-medium">
              Show Date
            </Label>
            <Switch
              id="show-date"
              checked={metadata.showDate}
              onCheckedChange={(checked) => handleMetadataChange("showDate", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-legend" className="text-sm font-medium">
              Show Legend
            </Label>
            <Switch
              id="show-legend"
              checked={metadata.showLegend}
              onCheckedChange={(checked) => handleMetadataChange("showLegend", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" /> Custom Legend
          </CardTitle>
          <CardDescription>Add and customize legend items</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-2">
              <Label htmlFor="legend-label">Legend Label</Label>
              <Input
                id="legend-label"
                value={newLegendLabel}
                onChange={(e) => setNewLegendLabel(e.target.value)}
                placeholder="Enter legend label"
              />
            </div>
          
            <div>
              <Label htmlFor="legend-icon">Icon</Label>
              <Select
                value={newLegendIcon}
                onValueChange={(value) => setNewLegendIcon(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="legend-icon-color">Icon Color</Label>
              <Input
                id="legend-icon-color"
                type="color"
                value={newLegendIconColor}
                onChange={(e) => setNewLegendIconColor(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={addLegendItem} disabled={!newLegendLabel.trim()}>
            Add Legend Item
          </Button>

          <div className="space-y-2">
            {metadata.legendItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={item.label || ""}
                  onChange={(e) => updateLegendItem(index, "label", e.target.value)}
                  placeholder="Legend label"
                />
              
                <Select
                  value={item.icon || "pin"}
                  onValueChange={(value) => updateLegendItem(index, "icon", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="color"
                  value={item.iconColor || "#000000"}
                  onChange={(e) => updateLegendItem(index, "iconColor", e.target.value)}
                />
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => removeLegendItem(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}