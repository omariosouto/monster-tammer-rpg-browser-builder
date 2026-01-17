import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";
import { useEditorStore } from "@/store/editorStore";
import { useProjectStore } from "@/store/projectStore";

describe("PropertiesPanel", () => {
  beforeEach(() => {
    act(() => {
      useEditorStore.getState().resetEditor();
      useProjectStore.getState().closeProject();
      useProjectStore.getState().createProject("Test Project");
    });
  });

  describe("Map properties", () => {
    it("should display map name", () => {
      render(<PropertiesPanel />);

      const nameInput = screen.getByLabelText(/name/i);
      expect(nameInput).toHaveValue("Starter Map");
    });

    it("should display map dimensions", () => {
      render(<PropertiesPanel />);

      expect(screen.getByLabelText(/width/i)).toHaveValue(20);
      expect(screen.getByLabelText(/height/i)).toHaveValue(15);
    });

    it("should allow editing map name", async () => {
      const user = userEvent.setup();
      render(<PropertiesPanel />);

      const nameInput = screen.getByLabelText(/name/i);
      await user.clear(nameInput);
      await user.type(nameInput, "New Map Name");

      expect(nameInput).toHaveValue("New Map Name");
    });
  });

  describe("NPC properties", () => {
    beforeEach(() => {
      // Add an NPC to the map
      const map = useProjectStore.getState().project?.maps[0];
      if (map) {
        act(() => {
          useProjectStore.getState().addNPC(map.id, {
            id: "test-npc-1",
            name: "Test NPC",
            position: { x: 5, y: 3 },
            spritesheet: "npc-1",
            direction: "down",
            behavior: "stationary",
            movementSpeed: 2,
          });
          useEditorStore.getState().selectEntity("test-npc-1", "npc");
        });
      }
    });

    it("should display NPC properties when selected", () => {
      render(<PropertiesPanel />);

      expect(screen.getByText("NPC")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Test NPC")).toBeInTheDocument();
    });

    it("should display NPC position as read-only", () => {
      render(<PropertiesPanel />);

      const xInput = screen.getByLabelText(/^x$/i);
      const yInput = screen.getByLabelText(/^y$/i);

      expect(xInput).toHaveValue(5);
      expect(yInput).toHaveValue(3);
      expect(xInput).toHaveAttribute("readonly");
      expect(yInput).toHaveAttribute("readonly");
    });

    it("should allow editing NPC name", async () => {
      const user = userEvent.setup();
      render(<PropertiesPanel />);

      const nameInput = screen.getByDisplayValue("Test NPC");
      await user.clear(nameInput);
      await user.type(nameInput, "Renamed NPC");

      // Verify the store was updated
      const map = useProjectStore.getState().project?.maps[0];
      const npc = map?.npcs.find((n) => n.id === "test-npc-1");
      expect(npc?.name).toBe("Renamed NPC");
    });

    it("should display sprite selector with correct value", () => {
      render(<PropertiesPanel />);

      // The sprite selector should show NPC 1
      expect(screen.getByText("NPC 1")).toBeInTheDocument();
    });

    it("should display direction selector with correct value", () => {
      render(<PropertiesPanel />);

      // Check for direction selector with "Down" selected
      expect(screen.getByText("Down")).toBeInTheDocument();
    });

    it("should display behavior selector with correct value", () => {
      render(<PropertiesPanel />);

      // Check for behavior selector with "Stationary" selected
      expect(screen.getByText("Stationary")).toBeInTheDocument();
      expect(screen.getByText("Stays in place")).toBeInTheDocument();
    });

    it("should display movement speed slider", () => {
      render(<PropertiesPanel />);

      expect(screen.getByText("Movement Speed")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument(); // Current speed value
      expect(screen.getByText("Slow")).toBeInTheDocument();
      expect(screen.getByText("Fast")).toBeInTheDocument();
    });

    it("should disable movement speed when behavior is stationary", () => {
      render(<PropertiesPanel />);

      const slider = screen.getByRole("slider");
      // Radix uses data-disabled attribute instead of disabled
      expect(slider).toHaveAttribute("data-disabled");
    });

    it("should show placeholder when no entity is selected", () => {
      act(() => {
        useEditorStore.getState().selectEntity(null, null);
      });

      render(<PropertiesPanel />);

      expect(screen.getByText(/select an entity/i)).toBeInTheDocument();
    });
  });

  describe("Panel collapse", () => {
    it("should collapse when button is clicked", async () => {
      const user = userEvent.setup();
      render(<PropertiesPanel />);

      // Find collapse button and click it
      const collapseButton = screen.getByRole("button", { name: "" });
      await user.click(collapseButton);

      // Properties header should not be visible
      expect(screen.queryByText("Properties")).not.toBeInTheDocument();
    });

    it("should expand when expand button is clicked", async () => {
      const user = userEvent.setup();
      const { rerender } = render(<PropertiesPanel />);

      // Collapse first
      const collapseButton = screen.getAllByRole("button")[0];
      await user.click(collapseButton);

      rerender(<PropertiesPanel />);

      // Now expand
      const expandButton = screen.getByRole("button");
      await user.click(expandButton);

      rerender(<PropertiesPanel />);

      expect(screen.getByText("Properties")).toBeInTheDocument();
    });
  });
});
