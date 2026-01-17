import { useEffect } from "react";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { LayerPanel } from "@/components/editor/LayerPanel";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";
import { TilePalette } from "@/components/editor/TilePalette";
import { useEditorStore } from "@/store/editorStore";
import { useProjectStore } from "@/store/projectStore";

export function EditorPage() {
  const { project, createProject } = useProjectStore();
  const { activeLayerId, setActiveLayerId, setActiveTool, selectTiles } =
    useEditorStore();

  // Create a default project if none exists
  useEffect(() => {
    if (!project) {
      createProject("My RPG Game");
    }
  }, [project, createProject]);

  // Initialize editor state when project loads
  useEffect(() => {
    const currentMap = project?.maps[0];
    if (currentMap && !activeLayerId) {
      // Auto-select first layer
      const firstLayer = currentMap.layers[0];
      if (firstLayer) {
        setActiveLayerId(firstLayer.id);
      }
    }
  }, [project, activeLayerId, setActiveLayerId]);

  // Set paint tool and first tile on initial mount for better UX
  useEffect(() => {
    setActiveTool("paint");
    selectTiles([1]); // Select first tile by default
  }, [setActiveTool, selectTiles]); // Zustand actions are stable, so this runs once
  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      {/* Top Toolbar */}
      <EditorToolbar />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Tile Palette */}
        <TilePalette />

        {/* Center - Editor Canvas */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto bg-muted/30">
            <EditorCanvas />
          </div>

          {/* Bottom - Layer Panel */}
          <LayerPanel />
        </main>

        {/* Right Sidebar - Properties Panel */}
        <PropertiesPanel />
      </div>
    </div>
  );
}
