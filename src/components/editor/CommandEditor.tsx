import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CommandType, EventCommand } from "@/store/projectStore";

const COMMAND_TYPES: { value: CommandType; label: string }[] = [
  { value: "showMessage", label: "Show Message" },
  { value: "showChoices", label: "Show Choices" },
  { value: "setSwitch", label: "Set Switch" },
  { value: "setVariable", label: "Set Variable" },
  { value: "conditional", label: "Conditional Branch" },
  { value: "teleport", label: "Teleport" },
  { value: "giveMonster", label: "Give Monster" },
];

const VARIABLE_OPS = [
  { value: "=", label: "=" },
  { value: "+=", label: "+=" },
  { value: "-=", label: "-=" },
  { value: "*=", label: "*=" },
  { value: "/=", label: "/=" },
];

interface CommandEditorProps {
  command: EventCommand;
  index: number;
  onUpdate: (updates: Partial<EventCommand>) => void;
  onRemove: () => void;
}

export function CommandEditor({
  command,
  index,
  onUpdate,
  onRemove,
}: CommandEditorProps) {
  // Get human-readable command text
  const getCommandPreview = (): string => {
    switch (command.type) {
      case "showMessage":
        return command.message
          ? `"${command.message.slice(0, 30)}${command.message.length > 30 ? "..." : ""}"`
          : "(empty message)";
      case "showChoices":
        return command.choices?.length
          ? `${command.choices.length} choice(s): ${command.choices.slice(0, 2).join(", ")}${command.choices.length > 2 ? "..." : ""}`
          : "(no choices)";
      case "setSwitch":
        return `[${command.switchId || "?"}] = ${command.switchValue ? "ON" : "OFF"}`;
      case "setVariable":
        return `[${command.variableId || "?"}] ${command.variableOp || "="} ${command.variableValue ?? 0}`;
      case "conditional":
        return "If/Else branch";
      case "teleport":
        return `Map: ${command.teleportMapId || "?"} (${command.teleportX ?? "?"}, ${command.teleportY ?? "?"})`;
      case "giveMonster":
        return `[${command.monsterId || "?"}] Lv.${command.monsterLevel ?? 5}`;
      default:
        return "Unknown command";
    }
  };

  // Handle type change - reset parameters for new type
  const handleTypeChange = (newType: CommandType) => {
    const baseUpdate: Partial<EventCommand> = { type: newType };

    // Set default values and clear others
    switch (newType) {
      case "showMessage":
        onUpdate({
          ...baseUpdate,
          message: "",
          choices: undefined,
          choiceResults: undefined,
          switchId: undefined,
          switchValue: undefined,
          variableId: undefined,
          variableOp: undefined,
          variableValue: undefined,
          condition: undefined,
          thenCommands: undefined,
          elseCommands: undefined,
          teleportMapId: undefined,
          teleportX: undefined,
          teleportY: undefined,
          monsterId: undefined,
          monsterLevel: undefined,
        });
        break;
      case "showChoices":
        onUpdate({
          ...baseUpdate,
          choices: ["Yes", "No"],
          choiceResults: [],
          message: undefined,
          switchId: undefined,
          switchValue: undefined,
          variableId: undefined,
          variableOp: undefined,
          variableValue: undefined,
          condition: undefined,
          thenCommands: undefined,
          elseCommands: undefined,
          teleportMapId: undefined,
          teleportX: undefined,
          teleportY: undefined,
          monsterId: undefined,
          monsterLevel: undefined,
        });
        break;
      case "setSwitch":
        onUpdate({
          ...baseUpdate,
          switchId: "",
          switchValue: true,
          message: undefined,
          choices: undefined,
          choiceResults: undefined,
          variableId: undefined,
          variableOp: undefined,
          variableValue: undefined,
          condition: undefined,
          thenCommands: undefined,
          elseCommands: undefined,
          teleportMapId: undefined,
          teleportX: undefined,
          teleportY: undefined,
          monsterId: undefined,
          monsterLevel: undefined,
        });
        break;
      case "setVariable":
        onUpdate({
          ...baseUpdate,
          variableId: "",
          variableOp: "=",
          variableValue: 0,
          message: undefined,
          choices: undefined,
          choiceResults: undefined,
          switchId: undefined,
          switchValue: undefined,
          condition: undefined,
          thenCommands: undefined,
          elseCommands: undefined,
          teleportMapId: undefined,
          teleportX: undefined,
          teleportY: undefined,
          monsterId: undefined,
          monsterLevel: undefined,
        });
        break;
      case "conditional":
        onUpdate({
          ...baseUpdate,
          condition: undefined,
          thenCommands: [],
          elseCommands: [],
          message: undefined,
          choices: undefined,
          choiceResults: undefined,
          switchId: undefined,
          switchValue: undefined,
          variableId: undefined,
          variableOp: undefined,
          variableValue: undefined,
          teleportMapId: undefined,
          teleportX: undefined,
          teleportY: undefined,
          monsterId: undefined,
          monsterLevel: undefined,
        });
        break;
      case "teleport":
        onUpdate({
          ...baseUpdate,
          teleportMapId: "",
          teleportX: 0,
          teleportY: 0,
          message: undefined,
          choices: undefined,
          choiceResults: undefined,
          switchId: undefined,
          switchValue: undefined,
          variableId: undefined,
          variableOp: undefined,
          variableValue: undefined,
          condition: undefined,
          thenCommands: undefined,
          elseCommands: undefined,
          monsterId: undefined,
          monsterLevel: undefined,
        });
        break;
      case "giveMonster":
        onUpdate({
          ...baseUpdate,
          monsterId: "",
          monsterLevel: 5,
          message: undefined,
          choices: undefined,
          choiceResults: undefined,
          switchId: undefined,
          switchValue: undefined,
          variableId: undefined,
          variableOp: undefined,
          variableValue: undefined,
          condition: undefined,
          thenCommands: undefined,
          elseCommands: undefined,
          teleportMapId: undefined,
          teleportX: undefined,
          teleportY: undefined,
        });
        break;
    }
  };

  // Handle choices array update
  const handleChoiceChange = (choiceIndex: number, value: string) => {
    const newChoices = [...(command.choices || [])];
    newChoices[choiceIndex] = value;
    onUpdate({ choices: newChoices });
  };

  const handleAddChoice = () => {
    const newChoices = [...(command.choices || []), `Choice ${(command.choices?.length || 0) + 1}`];
    onUpdate({ choices: newChoices });
  };

  const handleRemoveChoice = (choiceIndex: number) => {
    const newChoices = (command.choices || []).filter((_, i) => i !== choiceIndex);
    onUpdate({ choices: newChoices });
  };

  // Render parameter fields based on command type
  const renderParameters = () => {
    switch (command.type) {
      case "showMessage":
        return (
          <div className="space-y-2">
            <div className="space-y-1">
              <Label className="text-xs">Message</Label>
              <textarea
                className="w-full h-16 px-2 py-1 text-xs border rounded bg-background resize-none"
                placeholder="Enter message text..."
                value={command.message || ""}
                onChange={(e) => onUpdate({ message: e.target.value })}
              />
            </div>
          </div>
        );

      case "showChoices":
        return (
          <div className="space-y-2">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Choices</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1 text-xs"
                  onClick={handleAddChoice}
                >
                  + Add
                </Button>
              </div>
              <div className="space-y-1">
                {(command.choices || []).map((choice, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground w-4">
                      {i + 1}.
                    </span>
                    <Input
                      className="h-6 text-xs flex-1"
                      value={choice}
                      onChange={(e) => handleChoiceChange(i, e.target.value)}
                    />
                    {(command.choices?.length || 0) > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0"
                        onClick={() => handleRemoveChoice(i)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "setSwitch":
        return (
          <div className="space-y-2">
            <div className="space-y-1">
              <Label className="text-xs">Switch ID</Label>
              <Input
                className="h-7 text-xs"
                placeholder="e.g., door_opened"
                value={command.switchId || ""}
                onChange={(e) => onUpdate({ switchId: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Value</Label>
              <Select
                value={command.switchValue ? "true" : "false"}
                onValueChange={(v) => onUpdate({ switchValue: v === "true" })}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">ON</SelectItem>
                  <SelectItem value="false">OFF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "setVariable":
        return (
          <div className="space-y-2">
            <div className="space-y-1">
              <Label className="text-xs">Variable ID</Label>
              <Input
                className="h-7 text-xs"
                placeholder="e.g., gold_count"
                value={command.variableId || ""}
                onChange={(e) => onUpdate({ variableId: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Operation</Label>
                <Select
                  value={command.variableOp || "="}
                  onValueChange={(v) =>
                    onUpdate({ variableOp: v as EventCommand["variableOp"] })
                  }
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VARIABLE_OPS.map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Value</Label>
                <Input
                  type="number"
                  className="h-7 text-xs"
                  value={command.variableValue ?? 0}
                  onChange={(e) =>
                    onUpdate({ variableValue: parseInt(e.target.value, 10) || 0 })
                  }
                />
              </div>
            </div>
          </div>
        );

      case "conditional":
        return (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground italic">
              Conditional branching allows executing different commands based on
              conditions. Advanced editing coming soon.
            </p>
          </div>
        );

      case "teleport":
        return (
          <div className="space-y-2">
            <div className="space-y-1">
              <Label className="text-xs">Map ID</Label>
              <Input
                className="h-7 text-xs"
                placeholder="e.g., town_square"
                value={command.teleportMapId || ""}
                onChange={(e) => onUpdate({ teleportMapId: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">X</Label>
                <Input
                  type="number"
                  min={0}
                  className="h-7 text-xs"
                  value={command.teleportX ?? 0}
                  onChange={(e) =>
                    onUpdate({ teleportX: parseInt(e.target.value, 10) || 0 })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Y</Label>
                <Input
                  type="number"
                  min={0}
                  className="h-7 text-xs"
                  value={command.teleportY ?? 0}
                  onChange={(e) =>
                    onUpdate({ teleportY: parseInt(e.target.value, 10) || 0 })
                  }
                />
              </div>
            </div>
          </div>
        );

      case "giveMonster":
        return (
          <div className="space-y-2">
            <div className="space-y-1">
              <Label className="text-xs">Monster ID</Label>
              <Input
                className="h-7 text-xs"
                placeholder="e.g., pikachu"
                value={command.monsterId || ""}
                onChange={(e) => onUpdate({ monsterId: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Level</Label>
              <Input
                type="number"
                min={1}
                max={100}
                className="h-7 text-xs"
                value={command.monsterLevel ?? 5}
                onChange={(e) =>
                  onUpdate({ monsterLevel: parseInt(e.target.value, 10) || 5 })
                }
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-2 bg-muted/50 rounded border space-y-2">
      {/* Header with drag handle, index, type selector, and delete button */}
      <div className="flex items-center gap-1">
        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
        <span className="text-xs text-muted-foreground w-5">{index + 1}.</span>
        <Select value={command.type} onValueChange={handleTypeChange}>
          <SelectTrigger className="h-7 flex-1 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COMMAND_TYPES.map((ct) => (
              <SelectItem key={ct.value} value={ct.value}>
                {ct.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Dynamic parameter fields */}
      {renderParameters()}

      {/* Preview */}
      <div className="pt-1 border-t">
        <p className="text-xs text-muted-foreground italic truncate">
          {getCommandPreview()}
        </p>
      </div>
    </div>
  );
}
