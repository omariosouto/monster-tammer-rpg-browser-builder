import { parseAsStringEnum, useQueryState } from "nuqs";
import { NuqsAdapter } from "nuqs/adapters/react";
import { useEffect } from "react";
import { GameCanvas } from "@/components/engine/GameCanvas";
import { Button } from "@/components/ui/button";
import { EditorPage } from "@/pages/EditorPage";
import { useProjectStore } from "@/store/projectStore";

type AppMode = "home" | "editor" | "play";

const modeParser = parseAsStringEnum<AppMode>([
  "home",
  "editor",
  "play",
]).withDefault("home");

function HomePage({ onModeChange }: { onModeChange: (mode: AppMode) => void }) {
  const { createProject } = useProjectStore();

  const handleEditorClick = () => {
    createProject("New Project");
    onModeChange("editor");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-bold text-foreground">
        Monster Tamer RPG Builder
      </h1>
      <p className="text-muted-foreground">
        A Pokémon GBA-style game builder/engine
      </p>

      <div className="border border-border rounded-lg overflow-hidden shadow-lg">
        <GameCanvas width={480} height={320} />
      </div>

      <p className="text-sm text-muted-foreground">
        480x320 canvas (2x GBA resolution: 240x160)
      </p>

      <div className="flex gap-4">
        <Button variant="default" onClick={handleEditorClick}>
          Open Editor
        </Button>
        <Button variant="secondary" onClick={() => onModeChange("play")}>
          Play Mode
        </Button>
      </div>
    </div>
  );
}

function AppContent() {
  const [mode, setMode] = useQueryState("mode", modeParser);
  const { project, createProject } = useProjectStore();

  // Auto-create project when entering editor mode via URL
  useEffect(() => {
    if (mode === "editor" && !project) {
      createProject("New Project");
    }
  }, [mode, project, createProject]);

  if (mode === "editor") {
    return <EditorPage />;
  }

  return <HomePage onModeChange={setMode} />;
}

function App() {
  return (
    <NuqsAdapter>
      <AppContent />
    </NuqsAdapter>
  );
}

export default App;
