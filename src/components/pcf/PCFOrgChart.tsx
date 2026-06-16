import { useEffect, useRef } from "react";
import { OrgChart } from "d3-org-chart";
import { PCFNode } from "./pcfTypes";
import { renderNodeCardHTML } from "./PCFNodeCard";
import { calculateBranchTotal } from "./pcfUtils";

interface PCFOrgChartProps {
  nodes: PCFNode[];
  onNodeClick: (id: string) => void;
  onAddChild: (parentId: string) => void;
  /** drop dragged node onto target node -> reparent / reorder */
  onDropNode: (draggedId: string, targetId: string) => void;
  registerFit?: (fit: () => void) => void;
}

export default function PCFOrgChart({
  nodes,
  onNodeClick,
  onAddChild,
  onDropNode,
  registerFit,
}: PCFOrgChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<OrgChart<PCFNode> | null>(null);
  // keep latest handlers without re-creating chart
  const handlers = useRef({ onNodeClick, onAddChild, onDropNode });
  handlers.current = { onNodeClick, onAddChild, onDropNode };

  useEffect(() => {
    if (!containerRef.current) return;
    const sorted = [...nodes].sort((a, b) => a.order - b.order);

    if (!chartRef.current) {
      chartRef.current = new OrgChart<PCFNode>();
    }
    const chart = chartRef.current;

    chart
      .container(containerRef.current as unknown as string)
      .data(sorted)
      .nodeId((d) => d.id)
      .parentNodeId((d) => (d.parentId ?? undefined) as string)
      .nodeWidth(() => 260)
      .nodeHeight(() => 140)
      .childrenMargin(() => 50)
      .compactMarginBetween(() => 30)
      .compactMarginPair(() => 40)
      .siblingsMargin(() => 30)
      .nodeContent((d: any) => {
        const branch = calculateBranchTotal(d.data.id, nodes);
        return renderNodeCardHTML(d.data, d.depth, branch);
      })
      .onNodeClick((d: any) => {
        const id = typeof d === "object" ? d?.data?.id ?? d?.id : d;
        if (id) handlers.current.onNodeClick(id as string);
      })
      .render();

    if (registerFit) registerFit(() => chart.fit());
  }, [nodes, registerFit]);

  // Drag & drop + add-child via event delegation (survives re-renders)
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    let draggedId: string | null = null;

    const getId = (el: EventTarget | null): string | null => {
      const card = (el as HTMLElement)?.closest?.("[data-pcf-id]");
      return card ? card.getAttribute("data-pcf-id") : null;
    };

    const onDragStart = (e: DragEvent) => {
      draggedId = getId(e.target);
      if (draggedId && e.dataTransfer) {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", draggedId);
      }
    };
    const onDragOver = (e: DragEvent) => {
      const targetId = getId(e.target);
      if (targetId && draggedId && targetId !== draggedId) {
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
      }
    };
    const onDrop = (e: DragEvent) => {
      const targetId = getId(e.target);
      const dragged = draggedId ?? e.dataTransfer?.getData("text/plain") ?? null;
      if (targetId && dragged && targetId !== dragged) {
        e.preventDefault();
        handlers.current.onDropNode(dragged, targetId);
      }
      draggedId = null;
    };
    const onClick = (e: MouseEvent) => {
      const addBtn = (e.target as HTMLElement)?.closest?.("[data-pcf-add]");
      if (addBtn) {
        e.stopPropagation();
        const pid = addBtn.getAttribute("data-pcf-add");
        if (pid) handlers.current.onAddChild(pid);
      }
    };

    root.addEventListener("dragstart", onDragStart);
    root.addEventListener("dragover", onDragOver);
    root.addEventListener("drop", onDrop);
    root.addEventListener("click", onClick, true);
    return () => {
      root.removeEventListener("dragstart", onDragStart);
      root.removeEventListener("dragover", onDragOver);
      root.removeEventListener("drop", onDrop);
      root.removeEventListener("click", onClick, true);
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full" />;
}
