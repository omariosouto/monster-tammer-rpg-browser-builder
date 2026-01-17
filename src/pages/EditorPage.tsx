import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { LayerPanel } from "@/components/editor/LayerPanel";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";
import { TilePalette } from "@/components/editor/TilePalette";

export function EditorPage() {
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
