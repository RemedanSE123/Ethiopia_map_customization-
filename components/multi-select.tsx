"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
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

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (values: string[]) => void
  placeholder: string
}

export function MultiSelect({ options, selected, onChange, placeholder }: MultiSelectProps) {
  const [open, setOpen] = useState(false)

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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {selected.length > 0 ? `${selected.length} selected` : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              <CommandItem onSelect={handleSelectAll} className="cursor-pointer">
                <Check
                  className={cn("mr-2 h-4 w-4", selected.length === options.length ? "opacity-100" : "opacity-0")}
                />
                <span>Select All</span>
              </CommandItem>
              <CommandSeparator />
              {options.map((option) => (
                <CommandItem key={option.value} onSelect={() => handleSelect(option.value)} className="cursor-pointer">
                  <Check
                    className={cn("mr-2 h-4 w-4", selected.includes(option.value) ? "opacity-100" : "opacity-0")}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export function SelectedBadges({
  selected,
  options,
  onRemove,
}: {
  selected: string[]
  options: Option[]
  onRemove: (value: string) => void
}) {
  if (selected.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {selected.map((value) => {
        const option = options.find((o) => o.value === value)
        return (
          <Badge key={value} variant="secondary" className="px-2 py-1">
            {option?.label}
            <button className="ml-1 rounded-full hover:bg-gray-200 p-1" onClick={() => onRemove(value)}>
              ×
            </button>
          </Badge>
        )
      })}
    </div>
  )
}
