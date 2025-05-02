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
    { number: 3, label: "Add Metadata", description: "Title, legend, description", path: "/metadata" },
    { number: 4, label: "Export", description: "Preview and download", path: "/export" },
  ]

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setAnimated(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12 relative overflow-hidden">
      {/* Custom CSS for glowing line, particles, and connection nodes */}
      <style jsx>{`
        .glow-line {
          background: linear-gradient(
            90deg,
            rgba(59, 130, 246, 0.7),
            rgba(147, 197, 253, 0.9),
            rgba(236, 72, 153, 0.7)
          );
          animation: glow 3s ease-in-out infinite;
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(147, 197, 253, 0.8);
          border-radius: 50%;
          animation: particle-move 2s linear infinite;
          pointer-events: none;
        }

        .energy-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: rgba(236, 72, 153, 0.9);
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(236, 72, 153, 0.7);
          animation: energy-flow 1.5s ease-in-out infinite;
          pointer-events: none;
        }

        .connection-node {
          position: absolute;
          width: 12px;
          height: 12px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.8), rgba(59, 130, 246, 0.3));
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: pulse-node 2s ease-in-out infinite;
          cursor: pointer;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .connection-node:hover {
          transform: translate(-50%, -50%) scale(1.2);
          box-shadow: 0 0 20px rgba(147, 197, 253, 0.8);
        }

        @keyframes glow {
          0% {
            filter: brightness(1);
            box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
          }
          50% {
            filter: brightness(1.5);
            box-shadow: 0 0 20px rgba(147, 197, 253, 0.8);
          }
          100% {
            filter: brightness(1);
            box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
          }
        }

        @keyframes particle-move {
          0% {
            opacity: 0;
            transform: translateX(0);
          }
          50% {
            opacity: 0.8;
          }
          100% {
            opacity: 0;
            transform: translateX(100%);
          }
        }

        @keyframes energy-flow {
          0% {
            opacity: 0.4;
            transform: translateX(-50%) scale(0.8);
          }
          50% {
            opacity: 1;
            transform: translateX(50%) scale(1.2);
          }
          100% {
            opacity: 0.4;
            transform: translateX(50%) scale(0.8);
          }
        }

        @keyframes pulse-node {
          0% {
            box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.8);
            transform: translate(-50%, -50%) scale(1.1);
          }
          100% {
            box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>

      <motion.h1
        className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-16"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        Ethiopia Interactive Map Explorer
      </motion.h1>

      <div className="flex justify-between items-center w-full relative">
        {/* Connector line - subtle background line */}
        <div className="absolute top-[50%] left-0 w-full h-[6px] bg-gray-800/50 rounded-full -z-10 transform -translate-y-1/2"></div>

        {/* Progress line - glowing, animated gradient */}
        <motion.div
          className="absolute top-[50%] left-0 h-[6px] glow-line rounded-full -z-5 transform -translate-y-1/2"
          initial={{ width: "0%" }}
          animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          {/* Particle effects along the progress line */}
          {animated && currentStep > 1 && (
            <>
              <div className="particle" style={{ left: "20%", animationDelay: "0s" }}></div>
              <div className="particle" style={{ left: "50%", animationDelay: "0.5s" }}></div>
              <div className="particle" style={{ left: "80%", animationDelay: "1s" }}></div>
            </>
          )}
        </motion.div>

        {/* Connection Nodes and Energy Particles */}
        {steps.slice(0, -1).map((step, index) => (
          <div
            key={`connection-${step.number}`}
            className="absolute top-[50%] transform -translate-y-1/2"
            style={{
              left: `${((index + 1) * 100) / (steps.length - 1)}%`,
            }}
          >
            {step.number <= currentStep && (
              <>
                {/* Pulsing Connection Node */}
                <div
                  className="connection-node"
                  onMouseEnter={() => setHoveredStep(step.number)}
                  onMouseLeave={() => setHoveredStep(null)}
                ></div>
                {/* Energy Particles flowing between steps */}
                <div
                  className="energy-particle"
                  style={{
                    left: `${((index + 0.5) * 100) / (steps.length - 1)}%`,
                    animationDelay: `${index * 0.3}s`,
                  }}
                ></div>
              </>
            )}
          </div>
        ))}

        {steps.map((step) => (
          <motion.div
            key={step.number}
            className="flex flex-col items-center relative z-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 * step.number, ease: "easeOut" }}
            onMouseEnter={() => setHoveredStep(step.number)}
            onMouseLeave={() => setHoveredStep(null)}
          >
            <Link
              href={step.number <= currentStep ? step.path : "#"}
              className={cn(
                "flex flex-col items-center",
                step.number <= currentStep ? "cursor-pointer" : "cursor-not-allowed"
              )}
            >
              <motion.div
                className={cn(
                  "flex items-center justify-center w-16 h-16 rounded-full border-4 transition-all duration-500 text-xl font-bold",
                  step.number === currentStep
                    ? "bg-gradient-to-br from-blue-600 to-purple-600 border-blue-300/50 text-white"
                    : step.number < currentStep
                    ? "bg-blue-700/80 border-blue-400/50 text-white"
                    : "bg-gray-900/50 border-gray-700/50 text-gray-500",
                  "backdrop-blur-sm"
                )}
                style={{
                  boxShadow:
                    step.number === currentStep
                      ? "0 0 30px rgba(59, 130, 246, 0.7), inset 0 0 10px rgba(255, 255, 255, 0.2)"
                      : step.number < currentStep
                      ? "0 0 15px rgba(59, 130, 246, 0.3)"
                      : "none",
                }}
                whileHover={
                  step.number <= currentStep
                    ? {
                        scale: 1.1,
                        rotate: 5,
                        boxShadow: "0 0 40px rgba(147, 197, 253, 0.8)",
                      }
                    : {}
                }
                whileTap={step.number <= currentStep ? { scale: 0.9 } : {}}
                animate={
                  step.number === currentStep
                    ? {
                        scale: [1, 1.08, 1],
                        boxShadow: [
                          "0 0 30px rgba(59, 130, 246, 0.7)",
                          "0 0 50px rgba(147, 197, 253, 0.9)",
                          "0 0 30px rgba(59, 130, 246, 0.7)",
                        ],
                      }
                    : {}
                }
                transition={
                  step.number === currentStep
                    ? {
                        repeat: Number.POSITIVE_INFINITY,
                        duration: 2.5,
                        ease: "easeInOut",
                      }
                    : { duration: 0.3 }
                }
              >
                {step.number}
              </motion.div>
              <div className="mt-4 text-center">
                <motion.p
                  className={cn(
                    "font-semibold text-sm tracking-wide",
                    step.number === currentStep
                      ? "bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300"
                      : step.number < currentStep
                      ? "text-blue-300/80"
                      : "text-gray-600"
                  )}
                  whileHover={
                    step.number <= currentStep
                      ? { scale: 1.05, color: "rgb(255, 255, 255)" }
                      : {}
                  }
                  transition={{ duration: 0.3 }}
                >
                  {step.label}
                </motion.p>
                <motion.p
                  className={cn(
                    "text-xs mt-1",
                    step.number === currentStep ? "text-gray-300" : "text-gray-500"
                  )}
                  transition={{ duration: 0.3 }}
                >
                  {step.description}
                </motion.p>
              </div>
            </Link>

            {/* Enhanced Tooltip */}
            <AnimatePresence>
              {hoveredStep === step.number && step.number <= currentStep && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full mt-3 bg-gray-900/90 backdrop-blur-md text-white p-3 rounded-lg shadow-2xl z-20 w-56 text-center border border-blue-500/20"
                  style={{
                    boxShadow: "0 8px 32px rgba(59, 130, 246, 0.3)",
                  }}
                >
                  <p className="text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
                    {step.label}
                  </p>
                  <p className="text-xs mt-1 text-gray-300">{step.description}</p>
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-gray-900/90"></div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  )
}