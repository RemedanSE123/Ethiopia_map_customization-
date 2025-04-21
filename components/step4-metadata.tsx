"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { FileText, Info, LinkIcon, Palette, User, Building, Calendar } from "lucide-react"

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

interface Step4MetadataProps {
  metadata: MapMetadata
  handleMetadataChange: (key: keyof MapMetadata, value: any) => void
}

export default function Step4Metadata({ metadata, handleMetadataChange }: Step4MetadataProps) {
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
              value={metadata.title}
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
              value={metadata.description}
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
                value={metadata.author}
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
                value={metadata.organization}
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
              value={metadata.date}
              onChange={(e) => handleMetadataChange("date", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="map-link" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" /> Share Link
            </Label>
            <Input
              id="map-link"
              value={metadata.link}
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
    </>
  )
}
