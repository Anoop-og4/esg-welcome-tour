# News Management Dashboard

Replace the current single-page News Assignment with a full 4-step workflow admin experience, keeping all existing modules untouched. Frontend-only POC, dummy data via the existing service layer (extended). Data persists in `localStorage` so state survives step transitions.

## Navigation

Sidebar entry `News Assignment` becomes a group **News Management** with sub-items:
1. Dashboard
2. Incoming News
3. Approved News
4. Assignments

A shared header with breadcrumbs + step indicator (Incoming → Approved → Assigned → Dashboard) sits above every sub-view.

## Data model (extends `src/types/newsAssignment.ts`)

```ts
News {
  ...existing,
  status: "pending" | "approved" | "rejected",
  category?: string,
  createdAt: string,
}

Assignment {
  id: string,
  newsId: number,
  orgId: number,
  category: string,
  topic: string,
  tags: string[],
  priority: "low" | "medium" | "high",
  displayOrder: number,
  visibility: "public" | "internal" | "hidden",
  notes: string,
  assignedAt: string,
}
```
A news article can have many Assignments (different orgs, different metadata).

`newsAssignmentService.ts` gets: `updateNewsStatus`, `updateNews`, `deleteNews`, `createAssignment`, `updateAssignment`, `deleteAssignment`, `listAssignments`, `getActivity`. All in-memory + persisted to `localStorage` under `news-mgmt-v1`.

## Modules

### 1. Incoming News (`IncomingNews.tsx`)
- Table of `status=pending` articles: Title, Source, Category, Date, Relevance, Status badge, Actions.
- Toolbar: search, pillar filter, source filter, "Fetch News" (adds 3 fake new items), bulk approve/reject.
- Row actions: Preview (drawer), Approve, Reject (confirmation dialog).
- Pagination (10/page), sortable columns, empty + loading states, toasts.

### 2. Approved News (`ApprovedNews.tsx`)
- Table of `status=approved` articles with editable inline fields via Edit dialog.
- Actions: Edit (dialog with title, summary, category, pillar), Delete (confirm), Assign to Organization (opens Assignment dialog).
- Bulk: Delete, Assign to org.
- Badge shows count of existing assignments for each article.

### 3. Assignments (`Assignments.tsx`)
- Full CRUD table of assignments across all news+orgs.
- Columns: News title, Organization, Category, Topic, Tags, Priority, Order, Visibility, Assigned date, Actions.
- Create Assignment dialog (`AssignmentDialog.tsx`) with all metadata fields, org picker, tag chips input, priority + visibility selects, notes textarea.
- Row actions: Edit, Delete, Reassign (change org, keeps metadata).
- Filters: org, priority, visibility, search.

### 4. Dashboard (`NewsDashboard.tsx`)
Summary cards: Total, Pending, Approved, Rejected, Assigned, Unassigned, Organizations, Assignments.
Charts (recharts, already in project):
- Bar: News per Organization
- Pie: News by Status
- Line: News over Time (last 14 days)
- Horizontal bar: Category distribution
Tables/lists:
- Recent Assignments (last 10)
- Top Organizations (by assignment count)
- Latest Activity timeline (approve/reject/assign events)

## Shared UI
- `NewsMgmtShell.tsx` — layout wrapper with breadcrumb + step indicator + sub-nav tabs.
- `StatusBadge.tsx`, `PriorityBadge.tsx`.
- `ConfirmDialog.tsx` reused for destructive actions.
- All tables: shadcn Table + sorting, search input, pagination controls.
- Loading skeletons preserved from current impl.

## Integration
- `Index.tsx`: replace single `news-assignment` view with router-like switch on `news-dashboard | news-incoming | news-approved | news-assignments`, all rendering `NewsMgmtShell` with active tab.
- `DashboardSidebar.tsx`: convert the current News Assignment entry into an expandable group (like Environment/Games) with the 4 sub-items. The old `NewsAssignmentPage` is removed from routing (files left in place but unused).

## Out of scope
- Real backend/API (service layer stays mock, structured for later swap).
- Role-based permissions logic (UI shows role badges only; no enforcement).
- Real-time updates.

## File plan
New:
- `src/components/newsMgmt/NewsMgmtShell.tsx`
- `src/components/newsMgmt/IncomingNews.tsx`
- `src/components/newsMgmt/ApprovedNews.tsx`
- `src/components/newsMgmt/Assignments.tsx`
- `src/components/newsMgmt/NewsDashboard.tsx`
- `src/components/newsMgmt/AssignmentDialog.tsx`
- `src/components/newsMgmt/EditNewsDialog.tsx`
- `src/components/newsMgmt/PreviewDrawer.tsx`
- `src/components/newsMgmt/StatusBadge.tsx`

Edited:
- `src/types/newsAssignment.ts` (extend types)
- `src/lib/newsAssignmentService.ts` (extend service)
- `src/data/news.ts` (add status/category/createdAt)
- `src/data/organizations.ts` (add a few more orgs)
- `src/components/DashboardSidebar.tsx` (group + sub-items)
- `src/pages/Index.tsx` (view routing)
