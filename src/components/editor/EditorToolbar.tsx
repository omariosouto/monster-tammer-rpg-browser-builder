import {
  Eraser,
  Grid3X3,
  Home,
  Layers,
  MousePointer2,
  PaintBucket,
  Paintbrush,
  Play,
  Redo2,
  Save,
  Square,
  Undo2,
  User,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { parseAsStringEnum, useQueryState } from "nuqs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import { type EditorTool, useEditorStore } from "@/store/editorStore";

const tileTools: { id: EditorTool; icon: React.ReactNode; label: string }[] = [
  {
    id: "select",
    icon: <MousePointer2 className="h-4 w-4" />,
    label: "Select",
  },
  { id: "paint", icon: <Paintbrush className="h-4 w-4" />, label: "Paint" },
  { id: "erase", icon: <Eraser className="h-4 w-4" />, label: "Erase" },
  { id: "fill", icon: <PaintBucket className="h-4 w-4" />, label: "Fill" },
  {
    id: "rectangle",
    icon: <Square className="h-4 w-4" />,
    label: "Rectangle",
  },
];

const entityTools: { id: EditorTool; icon: React.ReactNode; label: string }[] =
  [{ id: "npc", icon: <User className="h-4 w-4" />, label: "Place NPC" }];

type AppMode = "home" | "editor" | "play";
const modeParser = parseAsStringEnum<AppMode>(["home", "editor", "play"]);

export function EditorToolbar() {
  const { activeTool, setActiveTool, zoom, setZoom, gridVisible, toggleGrid } =
    useEditorStore();
  const { handleUndo, handleRedo, canUndo, canRedo } = useUndoRedo();
  const [, setMode] = useQueryState("mode", modeParser);

  const handleCloseEditor = () => {
    setMode("home");
  };

  return (
    <header className="h-12 border-b bg-background flex items-center px-2 gap-1">
      <TooltipProvider delayDuration={300}>
        {/* Close Editor */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleCloseEditor}
            >
              <Home className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Back to Home</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* File Actions */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Save className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save Project</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={!canUndo}
                onClick={handleUndo}
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={!canRedo}
                onClick={handleRedo}
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (Ctrl+Shift+Z)</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Tile Tools */}
        <div className="flex items-center gap-1">
          {tileTools.map((tool) => (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTool === tool.id ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setActiveTool(tool.id)}
                >
                  {tool.icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{tool.label}</TooltipContent>
            </Tooltip>
          ))}
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Entity Tools */}
        <div className="flex items-center gap-1">
          {entityTools.map((tool) => (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTool === tool.id ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setActiveTool(tool.id)}
                >
                  {tool.icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{tool.label}</TooltipContent>
            </Tooltip>
          ))}
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* View Controls */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={gridVisible ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={toggleGrid}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Grid</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Layers className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Collision Layer</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setZoom(zoom - 0.5)}
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom Out</TooltipContent>
          </Tooltip>

          <span className="text-xs font-mono w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setZoom(zoom + 0.5)}
                disabled={zoom >= 4}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom In</TooltipContent>
          </Tooltip>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Test Play */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="default" size="sm" className="gap-2">
              <Play className="h-4 w-4" />
              Test Play
            </Button>
          </TooltipTrigger>
          <TooltipContent>Test your game</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </header>
  );
}
