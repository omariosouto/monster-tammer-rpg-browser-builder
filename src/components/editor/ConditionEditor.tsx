import { Trash2 } from "lucide-react";
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
import type { ConditionType, EventCondition } from "@/store/projectStore";

const CONDITION_TYPES: { value: ConditionType; label: string }[] = [
  { value: "switch", label: "Switch" },
  { value: "variable", label: "Variable" },
  { value: "hasItem", label: "Has Item" },
  { value: "hasMonster", label: "Has Monster" },
  { value: "partySize", label: "Party Size" },
];

const COMPARISON_OPS = [
  { value: "==", label: "=" },
  { value: "!=", label: "!=" },
  { value: ">", label: ">" },
  { value: "<", label: "<" },
  { value: ">=", label: ">=" },
  { value: "<=", label: "<=" },
];

interface ConditionEditorProps {
  condition: EventCondition;
  onUpdate: (updates: Partial<EventCondition>) => void;
  onRemove: () => void;
}

export function ConditionEditor({
  condition,
  onUpdate,
  onRemove,
}: ConditionEditorProps) {
  // Get human-readable condition text
  const getConditionPreview = (): string => {
    switch (condition.type) {
      case "switch":
        return `Switch [${condition.switchId || "?"}] is ${condition.switchValue ? "ON" : "OFF"}`;
      case "variable":
        return `Variable [${condition.variableId || "?"}] ${condition.variableOp || "=="} ${condition.variableValue ?? 0}`;
      case "hasItem":
        return `Has Item [${condition.itemId || "?"}]`;
      case "hasMonster":
        return condition.monsterId
          ? `Has Monster [${condition.monsterId}]`
          : "Has any Pokemon";
      case "partySize":
        return `Party Size ${condition.partySizeOp || "=="} ${condition.partySizeValue ?? 0}`;
      default:
        return "Unknown condition";
    }
  };

  // Handle type change - reset parameters for new type
  const handleTypeChange = (newType: ConditionType) => {
    const baseUpdate: Partial<EventCondition> = { type: newType };

    // Set default values for the new type
    switch (newType) {
      case "switch":
        onUpdate({
          ...baseUpdate,
          switchId: "",
          switchValue: true,
          variableId: undefined,
          variableOp: undefined,
          variableValue: undefined,
          itemId: undefined,
          monsterId: undefined,
          partySizeOp: undefined,
          partySizeValue: undefined,
        });
        break;
      case "variable":
        onUpdate({
          ...baseUpdate,
          variableId: "",
          variableOp: "==",
          variableValue: 0,
          switchId: undefined,
          switchValue: undefined,
          itemId: undefined,
          monsterId: undefined,
          partySizeOp: undefined,
          partySizeValue: undefined,
        });
        break;
      case "hasItem":
        onUpdate({
          ...baseUpdate,
          itemId: "",
          switchId: undefined,
          switchValue: undefined,
          variableId: undefined,
          variableOp: undefined,
          variableValue: undefined,
          monsterId: undefined,
          partySizeOp: undefined,
          partySizeValue: undefined,
        });
        break;
      case "hasMonster":
        onUpdate({
          ...baseUpdate,
          monsterId: "",
          switchId: undefined,
          switchValue: undefined,
          variableId: undefined,
          variableOp: undefined,
          variableValue: undefined,
          itemId: undefined,
          partySizeOp: undefined,
          partySizeValue: undefined,
        });
        break;
      case "partySize":
        onUpdate({
          ...baseUpdate,
          partySizeOp: ">=",
          partySizeValue: 1,
          switchId: undefined,
          switchValue: undefined,
          variableId: undefined,
          variableOp: undefined,
          variableValue: undefined,
          itemId: undefined,
          monsterId: undefined,
        });
        break;
    }
  };

  // Render parameter fields based on condition type
  const renderParameters = () => {
    switch (condition.type) {
      case "switch":
        return (
          <div className="space-y-2">
            <div className="space-y-1">
              <Label className="text-xs">Switch ID</Label>
              <Input
                className="h-7 text-xs"
                placeholder="e.g., intro_complete"
                value={condition.switchId || ""}
                onChange={(e) => onUpdate({ switchId: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Value</Label>
              <Select
                value={condition.switchValue ? "true" : "false"}
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

      case "variable":
        return (
          <div className="space-y-2">
            <div className="space-y-1">
              <Label className="text-xs">Variable ID</Label>
              <Input
                className="h-7 text-xs"
                placeholder="e.g., player_level"
                value={condition.variableId || ""}
                onChange={(e) => onUpdate({ variableId: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Operator</Label>
                <Select
                  value={condition.variableOp || "=="}
                  onValueChange={(v) =>
                    onUpdate({
                      variableOp: v as EventCondition["variableOp"],
                    })
                  }
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPARISON_OPS.map((op) => (
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
                  value={condition.variableValue ?? 0}
                  onChange={(e) =>
                    onUpdate({ variableValue: parseInt(e.target.value, 10) || 0 })
                  }
                />
              </div>
            </div>
          </div>
        );

      case "hasItem":
        return (
          <div className="space-y-2">
            <div className="space-y-1">
              <Label className="text-xs">Item ID</Label>
              <Input
                className="h-7 text-xs"
                placeholder="e.g., potion"
                value={condition.itemId || ""}
                onChange={(e) => onUpdate({ itemId: e.target.value })}
              />
            </div>
          </div>
        );

      case "hasMonster":
        return (
          <div className="space-y-2">
            <div className="space-y-1">
              <Label className="text-xs">Monster ID (empty = any)</Label>
              <Input
                className="h-7 text-xs"
                placeholder="e.g., pikachu (or empty for any)"
                value={condition.monsterId || ""}
                onChange={(e) => onUpdate({ monsterId: e.target.value })}
              />
            </div>
          </div>
        );

      case "partySize":
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Operator</Label>
                <Select
                  value={condition.partySizeOp || ">="}
                  onValueChange={(v) =>
                    onUpdate({
                      partySizeOp: v as EventCondition["partySizeOp"],
                    })
                  }
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPARISON_OPS.map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Size</Label>
                <Input
                  type="number"
                  min={0}
                  max={6}
                  className="h-7 text-xs"
                  value={condition.partySizeValue ?? 1}
                  onChange={(e) =>
                    onUpdate({
                      partySizeValue: parseInt(e.target.value, 10) || 0,
                    })
                  }
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-2 bg-muted/50 rounded border space-y-2">
      {/* Header with type selector and delete button */}
      <div className="flex items-center gap-2">
        <Select value={condition.type} onValueChange={handleTypeChange}>
          <SelectTrigger className="h-7 flex-1 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CONDITION_TYPES.map((ct) => (
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
        <p className="text-xs text-muted-foreground italic">
          {getConditionPreview()}
        </p>
      </div>
    </div>
  );
}
