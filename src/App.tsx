import { GameCanvas } from "@/components/engine/GameCanvas";
import { Button } from "@/components/ui/button";

function App() {
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
        <Button variant="outline">Editor Mode</Button>
        <Button variant="secondary">Play Mode</Button>
      </div>
    </div>
  );
}

export default App;
