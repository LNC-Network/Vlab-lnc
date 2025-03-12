"use client"

import { useState, useEffect } from "react"
import type { LogicBlock } from "@/types/widget"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, Play, Save, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"

// Sample logic blocks
const LOGIC_BLOCKS: LogicBlock[] = [
  {
    id: "start",
    type: "control",
    category: "control",
    label: "Start",
    outputs: [{ name: "next", type: "control" }],
    pythonTemplate: "# Start of program\n",
  },
  {
    id: "print",
    type: "action",
    category: "output",
    label: "Print",
    inputs: [{ name: "message", type: "string", defaultValue: "Hello World" }],
    outputs: [{ name: "next", type: "control" }],
    pythonTemplate: "print({message})\n",
  },
  {
    id: "variable",
    type: "data",
    category: "variables",
    label: "Set Variable",
    inputs: [
      { name: "name", type: "string", defaultValue: "my_var" },
      { name: "value", type: "any", defaultValue: "0" },
    ],
    outputs: [{ name: "next", type: "control" }],
    pythonTemplate: "{name} = {value}\n",
  },
  {
    id: "if",
    type: "control",
    category: "control",
    label: "If Condition",
    inputs: [{ name: "condition", type: "boolean", defaultValue: "True" }],
    outputs: [
      { name: "then", type: "control" },
      { name: "else", type: "control" },
    ],
    pythonTemplate: "if {condition}:\n    # Then branch\n    pass\nelse:\n    # Else branch\n    pass\n",
  },
  {
    id: "loop",
    type: "control",
    category: "control",
    label: "For Loop",
    inputs: [
      { name: "variable", type: "string", defaultValue: "i" },
      { name: "range", type: "string", defaultValue: "range(10)" },
    ],
    outputs: [{ name: "body", type: "control" }],
    pythonTemplate: "for {variable} in {range}:\n    # Loop body\n    pass\n",
  },
  {
    id: "measure",
    type: "action",
    category: "science",
    label: "Measure Value",
    inputs: [
      { name: "widget", type: "string", defaultValue: "ph_meter" },
      { name: "property", type: "string", defaultValue: "value" },
    ],
    outputs: [{ name: "next", type: "control" }],
    pythonTemplate: "result = measure_widget('{widget}', '{property}')\n",
  },
  {
    id: "set_property",
    type: "action",
    category: "science",
    label: "Set Widget Property",
    inputs: [
      { name: "widget", type: "string", defaultValue: "bunsen_burner" },
      { name: "property", type: "string", defaultValue: "temperature" },
      { name: "value", type: "any", defaultValue: "100" },
    ],
    outputs: [{ name: "next", type: "control" }],
    pythonTemplate: "set_widget_property('{widget}', '{property}', {value})\n",
  },
]

// Group blocks by category
const BLOCK_CATEGORIES = [
  { id: "control", name: "Control Flow" },
  { id: "output", name: "Output" },
  { id: "variables", name: "Variables" },
  { id: "science", name: "Science" },
]

interface LogicEditorProps {
  onUpdateCode: (code: string) => void
}

interface BlockInstance {
  id: string
  blockId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inputs: Record<string, any>
}

export default function LogicEditor({ onUpdateCode }: LogicEditorProps) {
  const [blocks, setBlocks] = useState<BlockInstance[]>([
    { id: "block-1", blockId: "start", inputs: {} },
    { id: "block-2", blockId: "print", inputs: { message: "Hello from Virtual Lab!" } },
  ])

  const addBlock = (blockId: string) => {
    const blockTemplate = LOGIC_BLOCKS.find((b) => b.id === blockId)
    if (!blockTemplate) return
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inputs: Record<string, any> = {}
    blockTemplate.inputs?.forEach((input) => {
      inputs[input.name] = input.defaultValue
    })

    setBlocks([
      ...blocks,
      {
        id: `block-${Date.now()}`,
        blockId,
        inputs,
      },
    ])
  }

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter((block) => block.id !== id))
  }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateBlockInput = (blockId: string, inputName: string, value: any) => {
    setBlocks(
      blocks.map((block) =>
        block.id === blockId ? { ...block, inputs: { ...block.inputs, [inputName]: value } } : block,
      ),
    )
  }

  const generatePythonCode = () => {
    let code = "# Generated Python code\n\n"

    blocks.forEach((block) => {
      const blockTemplate = LOGIC_BLOCKS.find((b) => b.id === block.blockId)
      if (!blockTemplate) return

      let blockCode = blockTemplate.pythonTemplate

      // Replace input placeholders with actual values
      Object.entries(block.inputs).forEach(([name, value]) => {
        blockCode = blockCode.replace(new RegExp(`\\{${name}\\}`, "g"), value)
      })

      code += blockCode
    })

    return code
  }

  useEffect(() => {
    const code = generatePythonCode()
    onUpdateCode(code)
  }, [blocks])

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="text-sm font-medium">Logic Editor</div>
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={() => onUpdateCode(generatePythonCode())}>
            <Play className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Generate Code</span>
          </Button>
          <Button size="sm" variant="outline">
            <Save className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Save</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Block palette */}
        <div className="w-full lg:w-1/4 border-b lg:border-b-0 lg:border-r overflow-y-auto">
          <Tabs defaultValue={BLOCK_CATEGORIES[0].id}>
            <TabsList className="w-full justify-start px-2 overflow-x-auto">
              {BLOCK_CATEGORIES.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="text-xs">
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {BLOCK_CATEGORIES.map((category) => (
              <TabsContent key={category.id} value={category.id} className="p-2">
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                  {LOGIC_BLOCKS.filter((block) => block.category === category.id).map((block) => (
                    <div
                      key={block.id}
                      className={cn(
                        "p-2 border rounded cursor-pointer hover:bg-accent transition-colors",
                        "flex items-center justify-between",
                      )}
                      onClick={() => addBlock(block.id)}
                    >
                      <span className="text-sm">{block.label}</span>
                      <Plus className="h-4 w-4" />
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Block workspace */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-50">
          <div className="space-y-2">
            {blocks.map((block, index) => {
              const blockTemplate = LOGIC_BLOCKS.find((b) => b.id === block.blockId)
              if (!blockTemplate) return null

              return (
                <Card key={block.id} className="p-3 relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-6 w-6"
                    onClick={() => removeBlock(block.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  <div className="font-medium mb-2">{blockTemplate.label}</div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {blockTemplate.inputs?.map((input) => (
                      <div key={`${block.id}-${input.name}`} className="mb-2">
                        <Label className="text-xs mb-1">{input.name}</Label>
                        <Input
                          value={block.inputs[input.name] || ""}
                          onChange={(e) => updateBlockInput(block.id, input.name, e.target.value)}
                          className="h-8"
                        />
                      </div>
                    ))}
                  </div>

                  {index < blocks.length - 1 && (
                    <div className="flex justify-center my-1">
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </Card>
              )
            })}

            {blocks.length === 0 && (
              <div className="text-center p-8 text-muted-foreground">
                Drag blocks from the palette to start building your logic
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

