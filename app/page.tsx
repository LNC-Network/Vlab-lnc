"use client";

import { useState, useEffect } from "react";
import WidgetPanel from "@/components/widget-panel";
import SimulationCanvas from "@/components/simulation-canvas";
import PythonConsole from "@/components/python-console";
import LogicEditor from "@/components/logic-editor";
import AiChatInterface from "@/components/ai-chat-interface";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import type { Widget } from "@/types/widget";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import { PanelLeft, PanelRightClose } from "lucide-react";

export default function Home() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [pythonCode, setPythonCode] = useState<string>(
    "# Python code will appear here\n"
  );
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleAddWidget = (widget: Widget) => {
    setWidgets([
      ...widgets,
      { ...widget, id: `widget-${Date.now()}`, position: { x: 100, y: 100 } },
    ]);
  };

  const handleUpdateWidgetPosition = (
    id: string,
    position: { x: number; y: number }
  ) => {
    setWidgets(
      widgets.map((widget) =>
        widget.id === id ? { ...widget, position } : widget
      )
    );
  };

  const handleLogicUpdate = (code: string) => {
    setPythonCode(code);
  };

  // Add event listener for widget addition from simulation canvas
  useEffect(() => {
    const handleAddWidgetEvent = (e: CustomEvent) => {
      if (e.detail) {
        setWidgets([...widgets, e.detail]);
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.addEventListener("addWidget" as any, handleAddWidgetEvent as any);

    return () => {
      window.removeEventListener(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "addWidget" as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handleAddWidgetEvent as any
      );
    };
  }, [widgets]);

  // Add event listener for widget deletion
  useEffect(() => {
    const handleDeleteWidgetEvent = (e: CustomEvent) => {
      if (e.detail && e.detail.id) {
        setWidgets(widgets.filter((widget) => widget.id !== e.detail.id));
      }
    };
    window.addEventListener(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      "deleteWidget" as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handleDeleteWidgetEvent as any
    );

    return () => {
      window.removeEventListener(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "deleteWidget" as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handleDeleteWidgetEvent as any
      );
    };
  }, [widgets]);

  return (
    <main className="flex flex-col h-screen">
      <header className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold">
          AI-Powered Virtual Lab Platform
        </h1>
        {!isDesktop && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
            className="text-primary-foreground"
          >
            {leftPanelCollapsed ? <PanelLeft /> : <PanelRightClose />}
          </Button>
        )}
      </header>

      <ResizablePanelGroup
        direction={isMobile ? "vertical" : "horizontal"}
        className="flex-1"
      >
        {/* Left Panel - Widget Selection and AI Chat */}
        <ResizablePanel
          defaultSize={25}
          minSize={isDesktop ? 20 : 5}
          // collapsible={isDesktop}
          // collapsedSize={0}
          // onCollapse={() => setLeftPanelCollapsed(true)}
          // onExpand={() => setLeftPanelCollapsed(false)}
          // className={leftPanelCollapsed && !isDesktop ? "hidden" : ""}
        >
          <div className="h-full flex flex-col border-r">
            <Tabs defaultValue="widgets" className="flex-1 flex flex-col">
              <TabsList className="w-full justify-start px-4">
                <TabsTrigger value="widgets">Widgets</TabsTrigger>
                <TabsTrigger value="ai-chat">AI Assistant</TabsTrigger>
              </TabsList>

              <TabsContent value="widgets" className="flex-1 overflow-hidden">
                <WidgetPanel onAddWidget={handleAddWidget} />
              </TabsContent>

              <TabsContent
                value="ai-chat"
                className="flex-1 overflow-hidden p-0"
              >
                <AiChatInterface />
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>

        {!leftPanelCollapsed && <ResizableHandle withHandle />}

        {/* Right Panel - Simulation View and Code */}
        <ResizablePanel
          defaultSize={leftPanelCollapsed ? 100 : isMobile ? 60 : 75}
        >
          <ResizablePanelGroup direction="vertical">
            {/* Simulation Canvas */}
            <ResizablePanel defaultSize={60} minSize={30}>
              <div className="h-full border-b">
                <SimulationCanvas
                  widgets={widgets}
                  onUpdateWidgetPosition={handleUpdateWidgetPosition}
                />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Code and Logic Editor */}
            <ResizablePanel defaultSize={40} minSize={isDesktop ? 7 : 10}>
              <Tabs defaultValue="logic" className="h-full">
                <TabsList className="mx-4 mt-2">
                  <TabsTrigger value="logic">Logic Editor</TabsTrigger>
                  <TabsTrigger value="python">Python Console</TabsTrigger>
                </TabsList>
                <TabsContent value="logic" className="h-[calc(100%-40px)]">
                  <LogicEditor onUpdateCode={handleLogicUpdate} />
                </TabsContent>
                <TabsContent value="python" className="h-[calc(100%-40px)]">
                  <PythonConsole code={pythonCode} onChange={setPythonCode} />
                </TabsContent>
              </Tabs>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}
