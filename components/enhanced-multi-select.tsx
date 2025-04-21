"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

export interface Option {
  value: string
  label: string
}

interface EnhancedMultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (values: string[]) => void
  placeholder: string
  className?: string
}

export function EnhancedMultiSelect({ options, selected, onChange, placeholder, className }: EnhancedMultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const handleSelectAll = () => {
    if (selected.length === options.length) {
      onChange([])
    } else {
      onChange(options.map((option) => option.value))
    }
  }

  const handleRemove = (value: string) => {
    onChange(selected.filter((item) => item !== value))
  }

  const handleClear = () => {
    onChange([])
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-secondary hover:bg-secondary/80 border-primary/20 text-foreground"
          >
            {selected.length > 0 ? `${selected.length} selected` : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="start" side="bottom" sideOffset={4}>
          {/* Command component for search and selection */}
          <Command className="bg-transparent overflow-y-auto scroll-smooth">
            <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} className="border-primary/20" />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  onSelect={handleSelectAll}
                  className="cursor-pointer hover:bg-secondary flex items-center transition-colors duration-200"
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      selected.length === options.length ? "bg-primary text-primary-foreground" : "opacity-50",
                    )}
                  >
                    {selected.length === options.length && <Check className="h-3 w-3" />}
                  </div>
                  <span>Select All</span>
                </CommandItem>
                <CommandSeparator className="bg-muted/50" />
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className="cursor-pointer hover:bg-secondary flex items-center transition-colors duration-200"
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        selected.includes(option.value) ? "bg-primary text-primary-foreground" : "opacity-50",
                      )}
                    >
                      {selected.includes(option.value) && <Check className="h-3 w-3" />}
                    </div>
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((value) => {
            const option = options.find((o) => o.value === value)
            return (
              <Badge
                key={value}
                variant="secondary"
                className="px-2 py-1 bg-primary/20 hover:bg-primary/30 text-foreground interactive-badge"
              >
                {option?.label}
                <button
                  className="ml-1 rounded-full hover:bg-secondary p-0.5"
                  onClick={() => handleRemove(value)}
                  aria-label={`Remove ${option?.label}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
          {selected.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleClear}
            >
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
