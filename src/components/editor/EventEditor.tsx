import { Plus, Trash2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEditorStore } from "@/store/editorStore";
import {
  type CommandType,
  type ConditionType,
  type EventCommand,
  type EventCondition,
  type EventPage,
  type EventTrigger,
  useProjectStore,
} from "@/store/projectStore";

const TRIGGERS: { value: EventTrigger; label: string; description: string }[] =
  [
    {
      value: "action",
      label: "Action",
      description: "Player presses action button",
    },
    { value: "touch", label: "Touch", description: "Player walks into event" },
    {
      value: "autorun",
      label: "Autorun",
      description: "Runs once when conditions met",
    },
    {
      value: "parallel",
      label: "Parallel",
      description: "Runs continuously in background",
    },
  ];

const CONDITION_TYPES: { value: ConditionType; label: string }[] = [
  { value: "switch", label: "Switch" },
  { value: "variable", label: "Variable" },
  { value: "hasItem", label: "Has Item" },
  { value: "hasPokemon", label: "Has Pokemon" },
  { value: "partySize", label: "Party Size" },
];

const COMMAND_TYPES: { value: CommandType; label: string }[] = [
  { value: "showMessage", label: "Show Message" },
  { value: "showChoices", label: "Show Choices" },
  { value: "setSwitch", label: "Set Switch" },
  { value: "setVariable", label: "Set Variable" },
  { value: "conditional", label: "Conditional Branch" },
  { value: "teleport", label: "Teleport" },
  { value: "givePokemon", label: "Give Pokemon" },
];

interface EventEditorProps {
  event: {
    id: string;
    name: string;
    position: { x: number; y: number };
    width: number;
    height: number;
    trigger: EventTrigger;
    pages: EventPage[];
  };
  mapId: string;
}

export function EventEditor({ event, mapId }: EventEditorProps) {
  const { updateEvent } = useProjectStore();
  const { selectEntity } = useEditorStore();

  // Handle event property updates
  const handleUpdateEvent = (
    updates: Partial<{
      name: string;
      trigger: EventTrigger;
      pages: EventPage[];
    }>,
  ) => {
    updateEvent(mapId, event.id, updates);
  };

  // Add a new page
  const handleAddPage = () => {
    const newPage: EventPage = {
      id: crypto.randomUUID(),
      conditions: [],
      commands: [],
    };
    handleUpdateEvent({ pages: [...event.pages, newPage] });
  };

  // Delete a page
  const handleDeletePage = (pageId: string) => {
    if (event.pages.length <= 1) return; // Keep at least one page
    handleUpdateEvent({ pages: event.pages.filter((p) => p.id !== pageId) });
  };

  // Update a specific page
  const handleUpdatePage = (pageId: string, updates: Partial<EventPage>) => {
    handleUpdateEvent({
      pages: event.pages.map((p) =>
        p.id === pageId ? { ...p, ...updates } : p,
      ),
    });
  };

  // Add condition to page
  const handleAddCondition = (pageId: string) => {
    const page = event.pages.find((p) => p.id === pageId);
    if (!page) return;

    const newCondition: EventCondition = {
      id: crypto.randomUUID(),
      type: "switch",
      switchId: "",
      switchValue: true,
    };
    handleUpdatePage(pageId, { conditions: [...page.conditions, newCondition] });
  };

  // Remove condition from page
  const handleRemoveCondition = (pageId: string, conditionId: string) => {
    const page = event.pages.find((p) => p.id === pageId);
    if (!page) return;

    handleUpdatePage(pageId, {
      conditions: page.conditions.filter((c) => c.id !== conditionId),
    });
  };

  // Update condition
  const handleUpdateCondition = (
    pageId: string,
    conditionId: string,
    updates: Partial<EventCondition>,
  ) => {
    const page = event.pages.find((p) => p.id === pageId);
    if (!page) return;

    handleUpdatePage(pageId, {
      conditions: page.conditions.map((c) =>
        c.id === conditionId ? { ...c, ...updates } : c,
      ),
    });
  };

  // Add command to page
  const handleAddCommand = (pageId: string) => {
    const page = event.pages.find((p) => p.id === pageId);
    if (!page) return;

    const newCommand: EventCommand = {
      id: crypto.randomUUID(),
      type: "showMessage",
      message: "",
    };
    handleUpdatePage(pageId, { commands: [...page.commands, newCommand] });
  };

  // Remove command from page
  const handleRemoveCommand = (pageId: string, commandId: string) => {
    const page = event.pages.find((p) => p.id === pageId);
    if (!page) return;

    handleUpdatePage(pageId, {
      commands: page.commands.filter((c) => c.id !== commandId),
    });
  };

  // Update command
  const handleUpdateCommand = (
    pageId: string,
    commandId: string,
    updates: Partial<EventCommand>,
  ) => {
    const page = event.pages.find((p) => p.id === pageId);
    if (!page) return;

    handleUpdatePage(pageId, {
      commands: page.commands.map((c) =>
        c.id === commandId ? { ...c, ...updates } : c,
      ),
    });
  };

  // Get human-readable condition text
  const getConditionText = (condition: EventCondition): string => {
    switch (condition.type) {
      case "switch":
        return `Switch [${condition.switchId || "?"}] is ${condition.switchValue ? "ON" : "OFF"}`;
      case "variable":
        return `Variable [${condition.variableId || "?"}] ${condition.variableOp || "=="} ${condition.variableValue ?? 0}`;
      case "hasItem":
        return `Has Item [${condition.itemId || "?"}]`;
      case "hasPokemon":
        return `Has Pokemon [${condition.pokemonId || "any"}]`;
      case "partySize":
        return `Party Size ${condition.partySizeOp || "=="} ${condition.partySizeValue ?? 0}`;
      default:
        return "Unknown condition";
    }
  };

  // Get human-readable command text
  const getCommandText = (command: EventCommand): string => {
    switch (command.type) {
      case "showMessage":
        return `Message: "${command.message?.slice(0, 20) || "..."}"${(command.message?.length ?? 0) > 20 ? "..." : ""}`;
      case "showChoices":
        return `Choices: ${command.choices?.length || 0} options`;
      case "setSwitch":
        return `Set Switch [${command.switchId || "?"}] = ${command.switchValue ? "ON" : "OFF"}`;
      case "setVariable":
        return `Variable [${command.variableId || "?"}] ${command.variableOp || "="} ${command.variableValue ?? 0}`;
      case "conditional":
        return "Conditional Branch";
      case "teleport":
        return `Teleport to (${command.teleportX ?? "?"}, ${command.teleportY ?? "?"})`;
      case "givePokemon":
        return `Give Pokemon [${command.pokemonId || "?"}] Lv.${command.pokemonLevel ?? 5}`;
      default:
        return "Unknown command";
    }
  };

  return (
    <section>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        Event
      </h3>
      <div className="space-y-4">
        {/* Event Icon */}
        <div className="flex flex-col items-center gap-2 p-3 bg-muted/50 rounded-md">
          <div className="w-12 h-12 bg-yellow-500/30 border border-yellow-500 rounded flex items-center justify-center">
            <Zap className="h-6 w-6 text-yellow-500" />
          </div>
          <span className="text-xs text-muted-foreground">{event.name}</span>
        </div>

        {/* Name */}
        <div className="space-y-1">
          <Label htmlFor="event-name" className="text-xs">
            Name
          </Label>
          <Input
            id="event-name"
            className="h-8 text-xs"
            value={event.name}
            onChange={(e) => handleUpdateEvent({ name: e.target.value })}
          />
        </div>

        {/* Position (read-only) */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="event-x" className="text-xs">
              X
            </Label>
            <Input
              id="event-x"
              type="number"
              className="h-8 text-xs"
              value={event.position.x}
              readOnly
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="event-y" className="text-xs">
              Y
            </Label>
            <Input
              id="event-y"
              type="number"
              className="h-8 text-xs"
              value={event.position.y}
              readOnly
            />
          </div>
        </div>

        {/* Size */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="event-width" className="text-xs">
              Width
            </Label>
            <Input
              id="event-width"
              type="number"
              className="h-8 text-xs"
              value={event.width}
              readOnly
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="event-height" className="text-xs">
              Height
            </Label>
            <Input
              id="event-height"
              type="number"
              className="h-8 text-xs"
              value={event.height}
              readOnly
            />
          </div>
        </div>

        {/* Trigger Type */}
        <div className="space-y-1">
          <Label htmlFor="event-trigger" className="text-xs">
            Trigger
          </Label>
          <Select
            value={event.trigger}
            onValueChange={(value: EventTrigger) =>
              handleUpdateEvent({ trigger: value })
            }
          >
            <SelectTrigger id="event-trigger" className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TRIGGERS.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            {TRIGGERS.find((t) => t.value === event.trigger)?.description}
          </p>
        </div>

        <Separator />

        {/* Pages */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Pages</Label>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={handleAddPage}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>

          <Tabs
            defaultValue={event.pages[0]?.id}
            className="w-full"
          >
            <TabsList className="w-full h-8 p-0.5">
              {event.pages.map((page, index) => (
                <TabsTrigger
                  key={page.id}
                  value={page.id}
                  className="text-xs h-7 px-2 flex-1"
                >
                  {index + 1}
                </TabsTrigger>
              ))}
            </TabsList>

            {event.pages.map((page, pageIndex) => (
              <TabsContent key={page.id} value={page.id} className="mt-2">
                <div className="space-y-3 p-2 border rounded-md">
                  {/* Page Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">
                      Page {pageIndex + 1}
                    </span>
                    {event.pages.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive"
                        onClick={() => handleDeletePage(page.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>

                  {/* Conditions */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground">
                        Conditions
                      </Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1 text-xs"
                        onClick={() => handleAddCondition(page.id)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    {page.conditions.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">
                        No conditions (always active)
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {page.conditions.map((condition) => (
                          <div
                            key={condition.id}
                            className="flex items-center gap-1 p-1 bg-muted/50 rounded text-xs"
                          >
                            <Select
                              value={condition.type}
                              onValueChange={(value: ConditionType) =>
                                handleUpdateCondition(page.id, condition.id, {
                                  type: value,
                                })
                              }
                            >
                              <SelectTrigger className="h-6 w-24 text-xs">
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
                            <span className="flex-1 text-xs truncate">
                              {getConditionText(condition)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0"
                              onClick={() =>
                                handleRemoveCondition(page.id, condition.id)
                              }
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Commands */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground">
                        Commands
                      </Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1 text-xs"
                        onClick={() => handleAddCommand(page.id)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    {page.commands.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">
                        No commands
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {page.commands.map((command, cmdIndex) => (
                          <div
                            key={command.id}
                            className="flex items-center gap-1 p-1 bg-muted/50 rounded text-xs"
                          >
                            <span className="text-muted-foreground w-4">
                              {cmdIndex + 1}.
                            </span>
                            <Select
                              value={command.type}
                              onValueChange={(value: CommandType) =>
                                handleUpdateCommand(page.id, command.id, {
                                  type: value,
                                })
                              }
                            >
                              <SelectTrigger className="h-6 w-28 text-xs">
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
                            <span className="flex-1 text-xs truncate">
                              {getCommandText(command)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0"
                              onClick={() =>
                                handleRemoveCommand(page.id, command.id)
                              }
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </section>
  );
}
