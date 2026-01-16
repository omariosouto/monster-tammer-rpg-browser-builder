import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGameStore } from "@/store/gameStore";

describe("gameStore", () => {
  beforeEach(() => {
    act(() => {
      useGameStore.getState().resetGameState();
    });
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("should have correct default values", () => {
      const state = useGameStore.getState();

      expect(state.player.mapId).toBe("");
      expect(state.player.position).toEqual({ x: 0, y: 0 });
      expect(state.player.direction).toBe("down");
      expect(state.switches).toEqual({});
      expect(state.variables).toEqual({});
      expect(state.isPlaying).toBe(false);
      expect(state.isPaused).toBe(false);
      expect(state.dialogState.isOpen).toBe(false);
    });
  });

  describe("player position", () => {
    it("should set player position", () => {
      act(() => {
        useGameStore.getState().setPlayerPosition("map-1", 5, 10);
      });

      const state = useGameStore.getState();
      expect(state.player.mapId).toBe("map-1");
      expect(state.player.position).toEqual({ x: 5, y: 10 });
    });

    it("should set player direction", () => {
      act(() => {
        useGameStore.getState().setPlayerDirection("right");
      });

      expect(useGameStore.getState().player.direction).toBe("right");
    });
  });

  describe("player movement", () => {
    it("should move player up", () => {
      act(() => {
        useGameStore.getState().setPlayerPosition("map-1", 5, 5);
        useGameStore.getState().movePlayer("up");
      });

      const state = useGameStore.getState();
      expect(state.player.position).toEqual({ x: 5, y: 4 });
      expect(state.player.direction).toBe("up");
    });

    it("should move player down", () => {
      act(() => {
        useGameStore.getState().setPlayerPosition("map-1", 5, 5);
        useGameStore.getState().movePlayer("down");
      });

      const state = useGameStore.getState();
      expect(state.player.position).toEqual({ x: 5, y: 6 });
      expect(state.player.direction).toBe("down");
    });

    it("should move player left", () => {
      act(() => {
        useGameStore.getState().setPlayerPosition("map-1", 5, 5);
        useGameStore.getState().movePlayer("left");
      });

      const state = useGameStore.getState();
      expect(state.player.position).toEqual({ x: 4, y: 5 });
      expect(state.player.direction).toBe("left");
    });

    it("should move player right", () => {
      act(() => {
        useGameStore.getState().setPlayerPosition("map-1", 5, 5);
        useGameStore.getState().movePlayer("right");
      });

      const state = useGameStore.getState();
      expect(state.player.position).toEqual({ x: 6, y: 5 });
      expect(state.player.direction).toBe("right");
    });

    it("should update direction even when moving", () => {
      act(() => {
        useGameStore.getState().setPlayerDirection("up");
        useGameStore.getState().movePlayer("left");
      });

      expect(useGameStore.getState().player.direction).toBe("left");
    });
  });

  describe("switches", () => {
    it("should set switch value", () => {
      act(() => {
        useGameStore.getState().setSwitch("door_open", true);
      });

      expect(useGameStore.getState().switches.door_open).toBe(true);
    });

    it("should get switch value", () => {
      act(() => {
        useGameStore.getState().setSwitch("flag_1", true);
      });

      expect(useGameStore.getState().getSwitch("flag_1")).toBe(true);
    });

    it("should return false for undefined switches", () => {
      expect(useGameStore.getState().getSwitch("nonexistent")).toBe(false);
    });

    it("should toggle switch value", () => {
      act(() => {
        useGameStore.getState().setSwitch("toggle_me", true);
      });

      expect(useGameStore.getState().getSwitch("toggle_me")).toBe(true);

      act(() => {
        useGameStore.getState().setSwitch("toggle_me", false);
      });

      expect(useGameStore.getState().getSwitch("toggle_me")).toBe(false);
    });
  });

  describe("variables", () => {
    it("should set variable value", () => {
      act(() => {
        useGameStore.getState().setVariable("gold", 100);
      });

      expect(useGameStore.getState().variables.gold).toBe(100);
    });

    it("should get variable value", () => {
      act(() => {
        useGameStore.getState().setVariable("hp", 50);
      });

      expect(useGameStore.getState().getVariable("hp")).toBe(50);
    });

    it("should return 0 for undefined variables", () => {
      expect(useGameStore.getState().getVariable("nonexistent")).toBe(0);
    });

    it("should support negative values", () => {
      act(() => {
        useGameStore.getState().setVariable("score", -10);
      });

      expect(useGameStore.getState().getVariable("score")).toBe(-10);
    });
  });

  describe("game control", () => {
    it("should start game", () => {
      act(() => {
        useGameStore.getState().startGame("start-map", { x: 3, y: 5 });
      });

      const state = useGameStore.getState();
      expect(state.isPlaying).toBe(true);
      expect(state.isPaused).toBe(false);
      expect(state.player.mapId).toBe("start-map");
      expect(state.player.position).toEqual({ x: 3, y: 5 });
      expect(state.player.direction).toBe("down");
    });

    it("should pause game", () => {
      act(() => {
        useGameStore.getState().startGame("map-1", { x: 0, y: 0 });
        useGameStore.getState().pauseGame();
      });

      expect(useGameStore.getState().isPaused).toBe(true);
    });

    it("should resume game", () => {
      act(() => {
        useGameStore.getState().startGame("map-1", { x: 0, y: 0 });
        useGameStore.getState().pauseGame();
        useGameStore.getState().resumeGame();
      });

      expect(useGameStore.getState().isPaused).toBe(false);
    });

    it("should stop game", () => {
      act(() => {
        useGameStore.getState().startGame("map-1", { x: 0, y: 0 });
        useGameStore.getState().stopGame();
      });

      const state = useGameStore.getState();
      expect(state.isPlaying).toBe(false);
      expect(state.isPaused).toBe(false);
    });
  });

  describe("dialog", () => {
    it("should show dialog", async () => {
      let resolved = false;

      act(() => {
        useGameStore
          .getState()
          .showDialog("Hello!")
          .then(() => {
            resolved = true;
          });
      });

      const state = useGameStore.getState();
      expect(state.dialogState.isOpen).toBe(true);
      expect(state.dialogState.message).toBe("Hello!");
      expect(resolved).toBe(false);
    });

    it("should show dialog with choices", async () => {
      act(() => {
        useGameStore.getState().showDialog("Choose:", ["Yes", "No"]);
      });

      const state = useGameStore.getState();
      expect(state.dialogState.choices).toEqual(["Yes", "No"]);
    });

    it("should close dialog and resolve with choice index", async () => {
      let choiceResult: number | undefined;

      await act(async () => {
        const promise = useGameStore
          .getState()
          .showDialog("Choose:", ["A", "B"]);

        // Simulate user selecting choice
        useGameStore.getState().dialogState.onChoice?.(1);

        choiceResult = await promise;
      });

      expect(choiceResult).toBe(1);
      expect(useGameStore.getState().dialogState.isOpen).toBe(false);
    });

    it("should close dialog", () => {
      act(() => {
        useGameStore.getState().showDialog("Test message");
        useGameStore.getState().closeDialog();
      });

      const state = useGameStore.getState();
      expect(state.dialogState.isOpen).toBe(false);
      expect(state.dialogState.message).toBe("");
    });
  });

  describe("reset", () => {
    it("should reset all game state", () => {
      act(() => {
        useGameStore.getState().startGame("map-1", { x: 5, y: 10 });
        useGameStore.getState().setSwitch("flag", true);
        useGameStore.getState().setVariable("gold", 100);
        useGameStore.getState().showDialog("Hello");
      });

      act(() => {
        useGameStore.getState().resetGameState();
      });

      const state = useGameStore.getState();
      expect(state.isPlaying).toBe(false);
      expect(state.player.mapId).toBe("");
      expect(state.switches).toEqual({});
      expect(state.variables).toEqual({});
      expect(state.dialogState.isOpen).toBe(false);
    });
  });
});
