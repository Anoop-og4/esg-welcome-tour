import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import EnvironmentDashboard from "@/components/dashboard/EnvironmentDashboard";
import { LAYOUT_STORAGE_KEY } from "@/lib/dashboardLayout";

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

describe("EnvironmentDashboard", () => {
  beforeEach(() => localStorage.clear());

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
});
