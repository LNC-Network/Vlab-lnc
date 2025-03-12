"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import type { Widget } from "@/types/widget"
import * as LucideIcons from "lucide-react"
import { Trash } from "lucide-react"
import { cn } from "@/lib/utils"

interface SimulationCanvasProps {
  widgets: Widget[]
  onUpdateWidgetPosition: (id: string, position: { x: number; y: number }) => void
}

// Dynamic icon component
const DynamicIcon = ({ name }: { name: string }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (LucideIcons as any)[name.charAt(0).toUpperCase() + name.slice(1)] || LucideIcons.HelpCircle
  return <IconComponent className="h-6 w-6" />
}

export default function SimulationCanvas({ widgets, onUpdateWidgetPosition }: SimulationCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [activeWidget, setActiveWidget] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isDraggingOutside, setIsDraggingOutside] = useState(false)
  const [trashZoneActive, setTrashZoneActive] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    try {
      const widgetData = JSON.parse(e.dataTransfer.getData("widget"))
      if (widgetData && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()

        // Calculate position relative to the canvas
        let x = e.clientX - rect.left
        let y = e.clientY - rect.top

        // Ensure widget stays within canvas bounds
        x = Math.max(0, Math.min(x, rect.width - 80))
        y = Math.max(0, Math.min(y, rect.height - 80))

        const position = { x, y }

        const newWidget: Widget = {
          ...widgetData,
          id: `widget-${Date.now()}`,
          position,
        }

        // Use the callback to add the widget
        const addWidgetEvent = new CustomEvent("addWidget", { detail: newWidget })
        window.dispatchEvent(addWidgetEvent)
      }
    } catch (error) {
      console.error("Error dropping widget:", error)
    }
  }

  const handleWidgetMouseDown = (e: React.MouseEvent, widget: Widget) => {
    e.stopPropagation()
    setActiveWidget(widget.id)

    // Calculate offset from the widget's top-left corner
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })

    // Show trash zone when dragging starts
    setTrashZoneActive(true)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (activeWidget && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()

      // Check if mouse is outside the canvas boundaries
      const isOutside =
        e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom

      setIsDraggingOutside(isOutside)

      const position = {
        x: e.clientX - rect.left - dragOffset.x,
        y: e.clientY - rect.top - dragOffset.y,
      }

      // Only update position if inside the canvas
      if (!isOutside) {
        // Ensure widget stays within canvas bounds
        position.x = Math.max(0, Math.min(position.x, rect.width - 80))
        position.y = Math.max(0, Math.min(position.y, rect.height - 80))
        onUpdateWidgetPosition(activeWidget, position)
      }
    }
  }

  const handleMouseUp = () => {
    if (activeWidget && isDraggingOutside) {
      // Delete the widget that was dragged outside
      const deleteWidgetEvent = new CustomEvent("deleteWidget", {
        detail: { id: activeWidget },
      })
      window.dispatchEvent(deleteWidgetEvent)
    }

    setActiveWidget(null)
    setIsDraggingOutside(false)
    setTrashZoneActive(false)
  }

  const handleDeleteWidget = (id: string) => {
    const deleteWidgetEvent = new CustomEvent("deleteWidget", {
      detail: { id },
    })
    window.dispatchEvent(deleteWidgetEvent)
  }

  useEffect(() => {
    // Add event listeners for mouse move and up
    if (activeWidget) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    }

    // Clean up event listeners
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [activeWidget, dragOffset])

  return (
    <div className="relative h-full w-full overflow-hidden bg-white">
      <div
        ref={canvasRef}
        className="absolute inset-0 grid bg-[url('/placeholder.svg?height=20&width=20')] bg-[length:20px_20px]"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {widgets.map((widget) => (
          <div
            key={widget.id}
            className={cn(
              "absolute flex flex-col items-center justify-center p-2 border rounded-md bg-white shadow-sm",
              "w-20 h-20 cursor-move hover:shadow-md transition-shadow",
              activeWidget === widget.id && "shadow-md border-primary",
              isDraggingOutside && activeWidget === widget.id && "opacity-50",
            )}
            style={{
              left: `${widget.position.x}px`,
              top: `${widget.position.y}px`,
            }}
            onMouseDown={(e) => handleWidgetMouseDown(e, widget)}
          >
            <button
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs"
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteWidget(widget.id)
              }}
            >
              ×
            </button>
            <DynamicIcon name={widget.icon} />
            <span className="mt-1 text-xs text-center truncate w-full">{widget.name}</span>
          </div>
        ))}
      </div>

      {/* Trash zone at the bottom of the canvas */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-16 bg-destructive/20 flex items-center justify-center transition-all",
          trashZoneActive ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      >
        <div className="flex items-center gap-2 text-destructive font-medium">
          <Trash className="h-5 w-5" />
          <span>Drag here to delete</span>
        </div>
      </div>

      {/* Message when dragging outside */}
      {isDraggingOutside && activeWidget && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-destructive text-destructive-foreground px-3 py-1 rounded-md text-sm font-medium">
          Release to delete widget
        </div>
      )}

      <div className="absolute bottom-4 right-4 bg-white/80 p-2 rounded-md text-xs text-muted-foreground">
        {widgets.length} widgets in simulation
      </div>
    </div>
  )
}

