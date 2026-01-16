import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Direction = "up" | "down" | "left" | "right";

interface Position {
  x: number;
  y: number;
}

interface PlayerState {
  mapId: string;
  position: Position;
  direction: Direction;
}

interface DialogState {
  isOpen: boolean;
  message: string;
  choices?: string[];
  onChoice?: (index: number) => void;
}

interface GameState {
  // Player state
  player: PlayerState;

  // Game flags
  switches: Record<string, boolean>;
  variables: Record<string, number>;

  // Runtime
  isPlaying: boolean;
  isPaused: boolean;
  dialogState: DialogState;

  // Actions
  setPlayerPosition: (mapId: string, x: number, y: number) => void;
  setPlayerDirection: (direction: Direction) => void;
  movePlayer: (direction: Direction) => void;

  setSwitch: (id: string, value: boolean) => void;
  getSwitch: (id: string) => boolean;
  setVariable: (id: string, value: number) => void;
  getVariable: (id: string) => number;

  startGame: (startMapId: string, startPosition: Position) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  stopGame: () => void;

  showDialog: (message: string, choices?: string[]) => Promise<number>;
  closeDialog: () => void;

  resetGameState: () => void;
}

const initialPlayerState: PlayerState = {
  mapId: "",
  position: { x: 0, y: 0 },
  direction: "down",
};

const initialDialogState: DialogState = {
  isOpen: false,
  message: "",
  choices: undefined,
  onChoice: undefined,
};

const initialState = {
  player: initialPlayerState,
  switches: {},
  variables: {},
  isPlaying: false,
  isPaused: false,
  dialogState: initialDialogState,
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setPlayerPosition: (mapId, x, y) =>
        set((state) => ({
          player: { ...state.player, mapId, position: { x, y } },
        })),

      setPlayerDirection: (direction) =>
        set((state) => ({
          player: { ...state.player, direction },
        })),

      movePlayer: (direction) => {
        const { player } = get();
        const offsets: Record<Direction, Position> = {
          up: { x: 0, y: -1 },
          down: { x: 0, y: 1 },
          left: { x: -1, y: 0 },
          right: { x: 1, y: 0 },
        };
        const offset = offsets[direction];
        set({
          player: {
            ...player,
            direction,
            position: {
              x: player.position.x + offset.x,
              y: player.position.y + offset.y,
            },
          },
        });
      },

      setSwitch: (id, value) =>
        set((state) => ({
          switches: { ...state.switches, [id]: value },
        })),

      getSwitch: (id) => get().switches[id] ?? false,

      setVariable: (id, value) =>
        set((state) => ({
          variables: { ...state.variables, [id]: value },
        })),

      getVariable: (id) => get().variables[id] ?? 0,

      startGame: (startMapId, startPosition) =>
        set({
          isPlaying: true,
          isPaused: false,
          player: {
            mapId: startMapId,
            position: startPosition,
            direction: "down",
          },
        }),

      pauseGame: () => set({ isPaused: true }),

      resumeGame: () => set({ isPaused: false }),

      stopGame: () =>
        set({
          isPlaying: false,
          isPaused: false,
        }),

      showDialog: (message, choices) => {
        return new Promise<number>((resolve) => {
          set({
            dialogState: {
              isOpen: true,
              message,
              choices,
              onChoice: (index: number) => {
                get().closeDialog();
                resolve(index);
              },
            },
          });
        });
      },

      closeDialog: () =>
        set({
          dialogState: initialDialogState,
        }),

      resetGameState: () => set(initialState),
    }),
    {
      name: "monster-tamer-game-state",
      partialize: (state) => ({
        player: state.player,
        switches: state.switches,
        variables: state.variables,
      }),
    },
  ),
);
