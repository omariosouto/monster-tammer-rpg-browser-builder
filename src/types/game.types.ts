import { z } from "zod";

// ============================================================================
// Base Types
// ============================================================================

export const PositionSchema = z.object({
  x: z.number().int(),
  y: z.number().int(),
});
export type Position = z.infer<typeof PositionSchema>;

export const DirectionSchema = z.enum(["up", "down", "left", "right"]);
export type Direction = z.infer<typeof DirectionSchema>;

// ============================================================================
// Editor Types
// ============================================================================

export const EditorToolSchema = z.enum([
  "select",
  "paint",
  "erase",
  "fill",
  "rectangle",
  "npc",
  "event",
  "spawn",
]);
export type EditorTool = z.infer<typeof EditorToolSchema>;

export const HistoryEntryTypeSchema = z.enum(["tile", "npc", "event", "layer"]);
export type HistoryEntryType = z.infer<typeof HistoryEntryTypeSchema>;

export const HistoryEntrySchema = z.object({
  type: HistoryEntryTypeSchema,
  mapId: z.string().min(1),
  data: z.unknown(),
  timestamp: z.number(),
});
export type HistoryEntry = z.infer<typeof HistoryEntrySchema>;

// ============================================================================
// Player Types
// ============================================================================

export const PlayerStateSchema = z.object({
  mapId: z.string(),
  position: PositionSchema,
  direction: DirectionSchema,
});
export type PlayerState = z.infer<typeof PlayerStateSchema>;

// ============================================================================
// Game State Types (Switches & Variables)
// ============================================================================

export const SwitchValueSchema = z.boolean();
export type SwitchValue = z.infer<typeof SwitchValueSchema>;

export const SwitchesSchema = z.record(z.string(), SwitchValueSchema);
export type Switches = z.infer<typeof SwitchesSchema>;

export const VariableValueSchema = z.number();
export type VariableValue = z.infer<typeof VariableValueSchema>;

export const VariablesSchema = z.record(z.string(), VariableValueSchema);
export type Variables = z.infer<typeof VariablesSchema>;

// ============================================================================
// Dialog Types
// ============================================================================

export const DialogStateSchema = z.object({
  isOpen: z.boolean(),
  message: z.string(),
  choices: z.array(z.string()).optional(),
});
export type DialogState = z.infer<typeof DialogStateSchema>;

// ============================================================================
// Tileset Types
// ============================================================================

export const TilesetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  image: z.string().min(1),
  tileWidth: z.number().int().positive(),
  tileHeight: z.number().int().positive(),
  columns: z.number().int().positive(),
  tileCount: z.number().int().nonnegative(),
});
export type Tileset = z.infer<typeof TilesetSchema>;

// ============================================================================
// Layer Types
// ============================================================================

export const LayerTypeSchema = z.enum([
  "ground",
  "object",
  "overlay",
  "collision",
]);
export type LayerType = z.infer<typeof LayerTypeSchema>;

export const LayerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: LayerTypeSchema,
  visible: z.boolean(),
  opacity: z.number().min(0).max(1),
  data: z.array(z.number().int().nonnegative()),
});
export type Layer = z.infer<typeof LayerSchema>;

// ============================================================================
// NPC Types
// ============================================================================

export const NPCInstanceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  position: PositionSchema,
  spritesheet: z.string().min(1),
  direction: DirectionSchema,
});
export type NPCInstance = z.infer<typeof NPCInstanceSchema>;

// ============================================================================
// Event Types
// ============================================================================

export const EventTriggerSchema = z.enum([
  "action",
  "touch",
  "autorun",
  "parallel",
]);
export type EventTrigger = z.infer<typeof EventTriggerSchema>;

export const ConditionTypeSchema = z.enum([
  "switch",
  "variable",
  "item",
  "actor",
]);
export type ConditionType = z.infer<typeof ConditionTypeSchema>;

export const ConditionSchema = z.object({
  type: ConditionTypeSchema,
  id: z.string().min(1),
  operator: z.enum(["==", "!=", ">", ">=", "<", "<="]).optional(),
  value: z.union([z.boolean(), z.number(), z.string()]),
});
export type Condition = z.infer<typeof ConditionSchema>;

export const CommandTypeSchema = z.enum([
  "show_text",
  "show_choices",
  "set_switch",
  "set_variable",
  "transfer_player",
  "change_map",
  "play_sound",
  "play_music",
  "wait",
  "conditional_branch",
  "loop",
  "break_loop",
  "comment",
]);
export type CommandType = z.infer<typeof CommandTypeSchema>;

export const BaseCommandSchema = z.object({
  id: z.string().min(1),
  type: CommandTypeSchema,
});

export const ShowTextCommandSchema = BaseCommandSchema.extend({
  type: z.literal("show_text"),
  text: z.string(),
  faceName: z.string().optional(),
  faceIndex: z.number().int().nonnegative().optional(),
});
export type ShowTextCommand = z.infer<typeof ShowTextCommandSchema>;

export const ShowChoicesCommandSchema = BaseCommandSchema.extend({
  type: z.literal("show_choices"),
  choices: z.array(z.string()).min(1).max(4),
  cancelType: z.number().int().min(-1).max(3).optional(),
});
export type ShowChoicesCommand = z.infer<typeof ShowChoicesCommandSchema>;

export const SetSwitchCommandSchema = BaseCommandSchema.extend({
  type: z.literal("set_switch"),
  switchId: z.string().min(1),
  value: z.boolean(),
});
export type SetSwitchCommand = z.infer<typeof SetSwitchCommandSchema>;

export const SetVariableCommandSchema = BaseCommandSchema.extend({
  type: z.literal("set_variable"),
  variableId: z.string().min(1),
  operation: z.enum(["set", "add", "sub", "mul", "div", "mod"]),
  value: z.number(),
});
export type SetVariableCommand = z.infer<typeof SetVariableCommandSchema>;

export const TransferPlayerCommandSchema = BaseCommandSchema.extend({
  type: z.literal("transfer_player"),
  mapId: z.string().min(1),
  position: PositionSchema,
  direction: DirectionSchema.optional(),
  fadeType: z.enum(["black", "white", "none"]).optional(),
});
export type TransferPlayerCommand = z.infer<typeof TransferPlayerCommandSchema>;

export const WaitCommandSchema = BaseCommandSchema.extend({
  type: z.literal("wait"),
  frames: z.number().int().positive(),
});
export type WaitCommand = z.infer<typeof WaitCommandSchema>;

export const CommandSchema = z.discriminatedUnion("type", [
  ShowTextCommandSchema,
  ShowChoicesCommandSchema,
  SetSwitchCommandSchema,
  SetVariableCommandSchema,
  TransferPlayerCommandSchema,
  WaitCommandSchema,
  BaseCommandSchema.extend({ type: z.literal("change_map") }),
  BaseCommandSchema.extend({ type: z.literal("play_sound") }),
  BaseCommandSchema.extend({ type: z.literal("play_music") }),
  BaseCommandSchema.extend({ type: z.literal("conditional_branch") }),
  BaseCommandSchema.extend({ type: z.literal("loop") }),
  BaseCommandSchema.extend({ type: z.literal("break_loop") }),
  BaseCommandSchema.extend({ type: z.literal("comment") }),
]);
export type Command = z.infer<typeof CommandSchema>;

export const EventPageSchema = z.object({
  id: z.string().min(1),
  conditions: z.array(ConditionSchema),
  commands: z.array(CommandSchema),
  graphic: z
    .object({
      spritesheet: z.string(),
      index: z.number().int().nonnegative(),
      direction: DirectionSchema,
    })
    .optional(),
  moveType: z.enum(["fixed", "random", "approach", "custom"]).optional(),
  moveSpeed: z.number().int().min(1).max(6).optional(),
  moveFrequency: z.number().int().min(1).max(5).optional(),
  priorityType: z.enum(["below", "same", "above"]).optional(),
  through: z.boolean().optional(),
});
export type EventPage = z.infer<typeof EventPageSchema>;

export const MapEventSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  position: PositionSchema,
  trigger: EventTriggerSchema,
  pages: z.array(EventPageSchema).optional(),
});
export type MapEvent = z.infer<typeof MapEventSchema>;

// ============================================================================
// Map Types
// ============================================================================

export const GameMapSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  tilesetIds: z.array(z.string()),
  layers: z.array(LayerSchema),
  npcs: z.array(NPCInstanceSchema),
  events: z.array(MapEventSchema),
});
export type GameMap = z.infer<typeof GameMapSchema>;

// ============================================================================
// Project Types
// ============================================================================

export const ProjectSettingsSchema = z.object({
  tileSize: z.number().int().positive().default(16),
  screenWidth: z.number().int().positive().default(15),
  screenHeight: z.number().int().positive().default(10),
  startMapId: z.string(),
  startPosition: PositionSchema,
});
export type ProjectSettings = z.infer<typeof ProjectSettingsSchema>;

export const ProjectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  settings: ProjectSettingsSchema,
  tilesets: z.array(TilesetSchema),
  maps: z.array(GameMapSchema),
});
export type Project = z.infer<typeof ProjectSchema>;

// ============================================================================
// Validation Helpers
// ============================================================================

export function validateProject(data: unknown): Project {
  return ProjectSchema.parse(data);
}

export function validateMap(data: unknown): GameMap {
  return GameMapSchema.parse(data);
}

export function validateTileset(data: unknown): Tileset {
  return TilesetSchema.parse(data);
}

export function validateLayer(data: unknown): Layer {
  return LayerSchema.parse(data);
}

export function validateNPC(data: unknown): NPCInstance {
  return NPCInstanceSchema.parse(data);
}

export function validateEvent(data: unknown): MapEvent {
  return MapEventSchema.parse(data);
}

export function safeValidateProject(
  data: unknown,
): { success: true; data: Project } | { success: false; error: z.ZodError } {
  const result = ProjectSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

export function safeValidateMap(
  data: unknown,
): { success: true; data: GameMap } | { success: false; error: z.ZodError } {
  const result = GameMapSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
