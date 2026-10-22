import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import EnvironmentDashboard from "@/components/dashboard/EnvironmentDashboard";
import { LAYOUT_STORAGE_KEY } from "@/lib/dashboardLayout";
import { libraryStore } from "@/lib/dashboardLibrary";

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

const renderDashboard = () =>
  render(
    <TooltipProvider>
      <EnvironmentDashboard />
    </TooltipProvider>,
  );

const widgetIds = () => screen.queryAllByTestId(/^widget-/).map((el) => el.dataset.testid);

// full-dashboard renders with charts are slow in jsdom
describe("EnvironmentDashboard", { timeout: 20_000 }, () => {
  beforeEach(() => {
    localStorage.clear();
    libraryStore.reload();
  });

  it("renders the default template in a clean view mode", () => {
    renderDashboard();
    expect(screen.getByTestId("widget-kpi-overview")).toBeInTheDocument();
    expect(screen.queryByText("Editing dashboard")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /remove kpi overview/i })).not.toBeInTheDocument();
  });

  it("cancel discards edits; save persists them", async () => {
    renderDashboard();
    const before = widgetIds();

    fireEvent.click(screen.getByRole("button", { name: /customize/i }));
    expect(screen.getByText("Editing dashboard")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Remove Carbon Intensity" }));
    // card leaves after its exit animation
    await waitFor(() => expect(widgetIds()).not.toContain("widget-carbon-intensity"));
    expect(screen.getByText("Unsaved changes")).toBeInTheDocument();

    // cancel asks for confirmation, then restores
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.click(screen.getByRole("button", { name: "Discard changes" }));
    expect(widgetIds()).toEqual(before);

    // edit again: resize + remove, then save
    fireEvent.click(screen.getByRole("button", { name: /customize/i }));
    const card = screen.getByTestId("widget-green-energy");
    fireEvent.click(within(card).getByRole("radio", { name: "Large size" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove Carbon Intensity" }));
    fireEvent.click(screen.getByRole("button", { name: /save layout/i }));

    const stored = JSON.parse(localStorage.getItem(LAYOUT_STORAGE_KEY)!);
    expect(stored.items.map((i: { id: string }) => i.id)).not.toContain("carbon-intensity");
    expect(stored.items.find((i: { id: string }) => i.id === "green-energy").size).toBe("large");
  });

  it("re-adds a removed widget from the searchable library", () => {
    renderDashboard();
    fireEvent.click(screen.getByRole("button", { name: /customize/i }));
    fireEvent.click(screen.getByRole("button", { name: "Remove Water Statistics" }));
    // library is a sheet below the desktop breakpoint in jsdom; open it
    fireEvent.click(screen.getAllByRole("button", { name: /add widgets/i })[0]);
    fireEvent.change(screen.getByLabelText("Search widgets"), { target: { value: "withdrawal" } });
    fireEvent.click(screen.getByRole("button", { name: "Add Water Statistics" }));
    expect(widgetIds()).toContain("widget-water-stats");
  });

  it("saves the layout as a named template and shows its name", async () => {
    renderDashboard();
    fireEvent.click(screen.getByRole("button", { name: /customize/i }));
    fireEvent.click(screen.getByRole("button", { name: "Remove Carbon Intensity" }));
    fireEvent.keyDown(screen.getByRole("button", { name: "More save options" }), { key: "Enter" });
    fireEvent.click(screen.getByRole("menuitem", { name: /save as new template/i }));

    const nameInput = screen.getByLabelText("Template name");
    // duplicate of a built-in name is rejected
    fireEvent.change(nameInput, { target: { value: "Executive Summary" } });
    fireEvent.click(screen.getByRole("button", { name: "Save template" }));
    expect(screen.getByText(/used by a built-in template/)).toBeInTheDocument();

    fireEvent.change(nameInput, { target: { value: "Plant ops review" } });
    fireEvent.click(screen.getByRole("button", { name: "Save template" }));

    // edit mode is committed and the subtitle names the template
    await waitFor(() => expect(screen.queryByText("Editing dashboard")).not.toBeInTheDocument());
    expect(screen.getByText("Plant ops review")).toBeInTheDocument();
    const [saved] = libraryStore.getState().templates;
    expect(saved.name).toBe("Plant ops review");
    expect(saved.items.map((i) => i.id)).not.toContain("carbon-intensity");
    expect(JSON.parse(localStorage.getItem(LAYOUT_STORAGE_KEY)!).templateId).toBe(saved.id);
  });

  it("creates a custom widget by chatting with OG", async () => {
    renderDashboard();
    fireEvent.click(screen.getByRole("button", { name: /customize/i }));
    fireEvent.click(screen.getAllByRole("button", { name: /add widgets/i })[0]);
    fireEvent.click(screen.getByRole("button", { name: /ask og/i }));

    fireEvent.change(screen.getByLabelText("Describe a widget"), { target: { value: "Show our waste split as a donut" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(await screen.findAllByText("Waste Mix", {}, { timeout: 3000 })).toHaveLength(2); // chat proposal + live preview

    // refine, then create from the dialog footer
    fireEvent.change(screen.getByLabelText("Describe a widget"), { target: { value: "make it a bar chart, larger" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    await screen.findByText(/Updated\./, {}, { timeout: 3000 });
    const createButtons = screen.getAllByRole("button", { name: /create widget/i });
    fireEvent.click(createButtons[createButtons.length - 1]);

    const [spec] = libraryStore.getState().widgets;
    expect(spec).toMatchObject({ metric: "waste-streams", visual: "bar", size: "large", source: "assistant" });
    await waitFor(() => expect(widgetIds()).toContain(`widget-${spec.id}`));
  });
});
