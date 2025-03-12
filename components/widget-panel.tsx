"use client"

import type React from "react"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Widget } from "@/types/widget"
import { cn } from "@/lib/utils"

// Sample widget data
const WIDGET_CATEGORIES = [
  {
    id: "lab-equipment",
    name: "Lab Equipment",
    widgets: [
      { type: "bunsen-burner", name: "Bunsen Burner", icon: "flame" },
      { type: "ph-meter", name: "pH Meter", icon: "activity" },
      { type: "beaker", name: "Beaker", icon: "flask" },
      { type: "microscope", name: "Microscope", icon: "eye" },
      { type: "thermometer", name: "Thermometer", icon: "thermometer" },
    ],
  },
  {
    id: "measurement",
    name: "Measurement",
    widgets: [
      { type: "scale", name: "Digital Scale", icon: "scale" },
      { type: "ruler", name: "Ruler", icon: "ruler" },
      { type: "timer", name: "Timer", icon: "timer" },
      { type: "voltmeter", name: "Voltmeter", icon: "zap" },
    ],
  },
  {
    id: "chemicals",
    name: "Chemicals",
    widgets: [
      { type: "acid", name: "Acid Solution", icon: "droplet" },
      { type: "base", name: "Base Solution", icon: "droplet" },
      { type: "water", name: "Distilled Water", icon: "droplet" },
      { type: "salt", name: "Salt", icon: "square" },
    ],
  },
]

// Import all icons from lucide-react
import * as LucideIcons from "lucide-react"

// Dynamic icon component
const DynamicIcon = ({ name }: { name: string }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (LucideIcons as any)[name.charAt(0).toUpperCase() + name.slice(1)] || LucideIcons.HelpCircle
  return <IconComponent className="h-5 w-5" />
}

interface WidgetPanelProps {
  onAddWidget: (widget: Widget) => void
}

export default function WidgetPanel({ onAddWidget }: WidgetPanelProps) {
  const [searchQuery, setSearchQuery] = useState("")
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragStart = (e: React.DragEvent, widget: any) => {
    e.dataTransfer.setData("widget", JSON.stringify(widget))
  }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleWidgetClick = (widget: any) => {
    onAddWidget(widget)
  }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filterWidgets = (widgets: any[]) => {
    if (!searchQuery) return widgets
    return widgets.filter((w) => w.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search widgets..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue={WIDGET_CATEGORIES[0].id} className="flex-1 overflow-hidden flex flex-col">
        <TabsList className="w-full justify-start px-2 overflow-x-auto">
          {WIDGET_CATEGORIES.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="text-xs">
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {WIDGET_CATEGORIES.map((category) => (
          <TabsContent key={category.id} value={category.id} className="flex-1 overflow-y-auto p-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filterWidgets(category.widgets).map((widget, index) => (
                <div
                  key={`${widget.type}-${index}`}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 border rounded-md",
                    "cursor-grab hover:bg-accent transition-colors",
                  )}
                  draggable
                  onDragStart={(e) => handleDragStart(e, widget)}
                  onClick={() => handleWidgetClick(widget)}
                >
                  <DynamicIcon name={widget.icon} />
                  <span className="mt-1 text-xs text-center">{widget.name}</span>
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="p-2 border-t">
        <p className="text-xs text-muted-foreground">Drag widgets to canvas or click to add</p>
      </div>
    </div>
  )
}

