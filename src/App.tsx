import { useState } from "react";
import { Button } from "@/components/ui/button";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-bold text-foreground">
        Monster Tamer RPG Builder
      </h1>
      <p className="text-muted-foreground">
        A Pokémon GBA-style game builder/engine
      </p>
      <div className="flex gap-4">
        <Button onClick={() => setCount((count) => count + 1)}>
          Count: {count}
        </Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
      </div>
    </div>
  );
}

export default App;
