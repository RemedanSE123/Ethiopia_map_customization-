"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

interface StepIndicatorProps {
  currentStep: number
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const [animated, setAnimated] = useState(false)
  const [hoveredStep, setHoveredStep] = useState<number | null>(null)

  // Define consistent steps across all pages
  const steps = [
    { number: 1, label: "Select Areas", description: "Choose regions, zones, woredas", path: "/" },
    { number: 2, label: "Customize Map", description: "Style your map", path: "/customize" },
    { number: 3, label: "Add Data Layers", description: "Enrich with data", path: "/data" },
    { number: 4, label: "Add Metadata", description: "Title, legend, description", path: "/metadata" },
    { number: 5, label: "Export", description: "Preview and download", path: "/export" },
  ]

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setAnimated(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 relative">
      <motion.h1
        className="text-3xl font-bold text-center text-white mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Ethiopia Interactive Map Explorer
      </motion.h1>

      <div className="flex justify-between items-center w-full relative">
        {/* Connector line - positioned BELOW the circles */}
        <div className="absolute top-[50%] left-0 w-full h-[4px] bg-gray-700 -z-10 transform -translate-y-1/2"></div>

        {/* Progress line - positioned to match connector line */}
        <motion.div
          className="absolute top-[50%] left-0 h-[4px] bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 -z-5 transform -translate-y-1/2"
          initial={{ width: "0%" }}
          animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 1, ease: "easeInOut" }}
        ></motion.div>

        {steps.map((step) => (
          <motion.div
            key={step.number}
            className="flex flex-col items-center relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * step.number }}
            onMouseEnter={() => setHoveredStep(step.number)}
            onMouseLeave={() => setHoveredStep(null)}
          >
            <Link
              href={step.path}
              className={cn("flex flex-col items-center", step.number <= currentStep && "cursor-pointer")}
            >
              <motion.div
                className={cn(
                  "flex items-center justify-center w-20 h-20 rounded-full border-[3px] transition-all duration-500 text-xl font-bold shadow-lg",
                  step.number === currentStep
                    ? "bg-gradient-to-br from-blue-500 to-blue-700 border-blue-300 text-white"
                    : step.number < currentStep
                      ? "bg-blue-600 border-blue-400 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-400",
                )}
                style={{
                  boxShadow: step.number === currentStep ? "0 0 25px rgba(59, 130, 246, 0.7)" : "none",
                }}
                whileHover={step.number <= currentStep ? { scale: 1.05 } : {}}
                whileTap={step.number <= currentStep ? { scale: 0.95 } : {}}
                animate={
                  step.number === currentStep
                    ? {
                        scale: [1, 1.05, 1],
                        borderColor: [
                          "rgba(147, 197, 253, 0.8)",
                          "rgba(59, 130, 246, 0.8)",
                          "rgba(147, 197, 253, 0.8)",
                        ],
                      }
                    : {}
                }
                transition={
                  step.number === currentStep
                    ? {
                        repeat: Number.POSITIVE_INFINITY,
                        duration: 2,
                        ease: "easeInOut",
                      }
                    : {}
                }
              >
                {step.number}
              </motion.div>
              <div className="mt-4 text-center">
                <motion.p
                  className={cn(
                    "font-medium transition-all duration-300",
                    step.number === currentStep
                      ? "text-white text-lg"
                      : step.number < currentStep
                        ? "text-blue-300"
                        : "text-gray-500",
                  )}
                  whileHover={step.number <= currentStep ? { scale: 1.05, color: "#ffffff" } : {}}
                >
                  {step.label}
                </motion.p>
                <motion.p
                  className={cn(
                    "text-xs transition-all duration-300 mt-1",
                    step.number === currentStep ? "text-gray-300" : "text-gray-500",
                  )}
                >
                  {step.description}
                </motion.p>
              </div>
            </Link>

            {/* Tooltip that appears on hover */}
            <AnimatePresence>
              {hoveredStep === step.number && step.number <= currentStep && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-2 bg-blue-900/90 text-white p-2 rounded-md shadow-lg z-20 w-48 text-center"
                >
                  <p className="text-sm font-medium">{step.label}</p>
                  <p className="text-xs mt-1">{step.description}</p>
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-blue-900/90"></div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
