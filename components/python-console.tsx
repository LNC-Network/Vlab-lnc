"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Play, Copy, Trash } from "lucide-react"


interface PythonConsoleProps {
  code: string
  onChange: (code: string) => void
}

export default function PythonConsole({ code, onChange }: PythonConsoleProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // This is a simplified mock implementation
    // In a real app, you would use a proper code editor like Monaco or CodeMirror
    if (editorRef.current) {
      const textarea = document.createElement("textarea")
      textarea.value = code
      textarea.className = "w-full h-full p-4 font-mono text-sm resize-none focus:outline-none bg-black text-green-400"
      textarea.style.height = "calc(100% - 40px)"
      textarea.addEventListener("input", (e) => {
        onChange((e.target as HTMLTextAreaElement).value)
      })

      editorRef.current.innerHTML = ""
      editorRef.current.appendChild(textarea)
    }
  }, [])

  useEffect(() => {
    // Update the textarea value when code changes
    if (editorRef.current) {
      const textarea = editorRef.current.querySelector("textarea")
      if (textarea && textarea.value !== code) {
        textarea.value = code
      }
    }
  }, [code])

  const handleRunCode = () => {
    if (outputRef.current) {
      outputRef.current.innerHTML = ""

      // Simulate Python execution with a simple output
      const output = document.createElement("div")
      output.className = "p-2 text-sm font-mono"

      try {
        // This is just a simulation - in a real app you would send the code to a backend
        output.innerHTML = `<div class="text-green-500">[Executing Python code...]</div>
<div class="mt-1">>>> print("Hello from Virtual Lab!")</div>
<div>Hello from Virtual Lab!</div>
<div class="mt-1 text-green-500">[Execution completed]</div>`
      } catch (error) {
        output.innerHTML = `<div class="text-red-500">Error: ${error}</div>`
      }

      outputRef.current.appendChild(output)
    }

  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code)

  }

  const handleClearCode = () => {
    onChange("# Python code will appear here\n")
    if (outputRef.current) {
      outputRef.current.innerHTML = ""
    }

  }

  return (
    <div className="h-full flex flex-col bg-black text-white">
      <div className="flex items-center justify-between p-2 border-b border-gray-700">
        <div className="text-sm font-medium">Python Console</div>
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={handleRunCode} className="text-black bg-white hover:bg-gray-100">
            <Play className="h-4 w-4 mr-1" />
            Run
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyCode}
            className="text-black bg-white hover:bg-gray-100"
          >
            <Copy className="h-4 w-4 mr-1" />
            Copy
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleClearCode}
            className="text-black bg-white hover:bg-gray-100"
          >
            <Trash className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div ref={editorRef} className="flex-1 overflow-auto"></div>
        <div className="h-1/3 border-t border-gray-700 overflow-auto">
          <div className="p-2 text-xs text-gray-400">Output:</div>
          <div ref={outputRef} className="px-2"></div>
        </div>
      </div>
    </div>
  )
}

