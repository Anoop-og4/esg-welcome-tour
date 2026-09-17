# New Home — Dynamic ESG Dashboard

Add a separate, permission-aware **New Home** module and make it the default landing view, while keeping the existing Home and every current module intact.

## User experience

- Add **New Home** to the sidebar and route dashboard actions through the app’s existing `onNavigate` view system.
- Keep the current Home page available as **Home** so no existing dashboard functionality is removed.
- Build a clean, light-first enterprise dashboard using the current semantic colors, typography, cards, buttons, theme toggle, search, notifications, and responsive shell.
- Use a responsive 12-column layout that becomes a single, ordered feed on mobile.

## Personalized, permission-aware content

- Introduce one dashboard access adapter that exposes the current user, organization, role capabilities, module access, and `hasPermission()`.
- The current codebase does not expose an application auth/role hook outside the game’s guest profile. The adapter will therefore use an API-ready mock session as a temporary fallback, isolated from the UI and replaceable by the real auth/permission provider without rewriting widgets.
- Every KPI, section, record, and CTA will declare required module/permission keys and be filtered before rendering. No alternate permission decisions will be embedded inside individual cards.
- Include representative Admin, Manager, and Regular User mock profiles in the service layer for future integration/testing, without hardcoding the page to one person.

## Dashboard sections

1. **Greeting and context**
   - Time-aware morning/afternoon/evening greeting, user name, organization, current date, search, theme, and notification access.

2. **Quick KPIs**
   - Pending Actions, Forms Pending, Assigned to Me, and Unread Notifications.
   - Compact breakdowns and direct navigation to the relevant authorized module.

3. **Primary work area**
   - **My Progress / ESG Leaderboard:** current rank, score, change, progress, and professional team ranking.
   - **Action Required:** priority, due state, module, assignee context, status, and contextual CTA for approve, verify, submit, review, complete, assign, or acknowledge.

4. **Workflow and data entry**
   - Permission-filtered Workflow Actions.
   - Pending Data Entry with progress, due/module/priority/status filters and sorting; CTAs continue into existing Environment, Workflow, Goals, Audit, or News views.

5. **Workspace awareness**
   - Notifications with unread treatment and empty state.
   - My Activity, or Team Activity only when the user has administrative activity access.
   - Compact ESG News & Insights and What’s New panels with API-ready records and navigation.

6. **Forward view**
   - Upcoming deadlines, events, releases, and features in a timeline/calendar-style list.
   - Configurable ESG motivation quote card.

## Data and interaction architecture

- Add typed dashboard models plus a mock service with asynchronous reads and a short loading delay, following the project’s existing service-layer convention.
- Keep user/session, permissions, KPIs, actions, forms, leaderboard, notifications, activity, news, updates, upcoming items, and quotes outside presentation components.
- Derive summary counts from authorized records rather than duplicating display numbers.
- Add loading skeletons and polished empty states for every independent widget.
- Add local filtering/sorting for pending forms and responsive overflow handling for dense lists.
- Use existing Button, Badge, Progress, Skeleton, Popover, Select, and Tooltip components; use Recharts only where a compact progress visualization adds clarity.

## Integration and validation

- Add `new-home` handling in the existing page switch and set it as the initial view.
- Preserve all existing view keys and navigation behavior.
- Verify desktop and mobile layouts, permission-based visibility, empty/loading states, and CTA navigation with the live preview.
- Add focused tests for permission filtering and derived dashboard counts.

## Technical files

- New feature folder: `src/components/newHome/` for the page and focused dashboard sections.
- New typed data/service layer: `src/types/newHome.ts`, `src/data/newHome.ts`, and `src/lib/newHomeService.ts`.
- Small integration edits only in `src/pages/Index.tsx` and `src/components/DashboardSidebar.tsx`.
- No backend schema or existing module rewrites.
