"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"

interface NavigationStepsProps {
  steps: {
    label: string
    active: boolean
    onClick: () => void
  }[]
}

export function NavigationSteps({ steps }: NavigationStepsProps) {
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <Button
                variant={step.active ? "default" : "outline"}
                size="sm"
                onClick={step.onClick}
                className={`rounded-full ${step.active ? "" : "opacity-70"}`}
              >
                {step.label}
              </Button>
              {index < steps.length - 1 && <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
