import type { News, Organization, Assignment, ActivityEvent, NewsStatus } from "@/types/newsAssignment";
import { newsSeed } from "@/data/news";
import { organizationsSeed } from "@/data/organizations";

// Mock service layer. Swap these with real fetch() calls later — signatures stay the same.
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const STORAGE_KEY = "news-mgmt-v1";

interface Store {
  news: News[];
  orgs: Organization[];
  assignments: Assignment[];
  activity: ActivityEvent[];
}

function load(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    news: newsSeed.map((n) => ({ ...n })),
    orgs: organizationsSeed.map((o) => ({ ...o })),
    assignments: [],
    activity: [],
  };
}

function save(s: Store) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

let store: Store | null = null;
function db(): Store {
  if (!store) store = load();
  return store!;
}
function persist() { save(db()); }

function log(type: ActivityEvent["type"], message: string) {
  db().activity.unshift({
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type, message, at: new Date().toISOString(),
  });
  db().activity = db().activity.slice(0, 100);
}

/* --------------------- Reads --------------------- */

export async function getNews(): Promise<News[]> {
  await delay(400);
  return db().news.map((n) => ({ ...n }));
}
export async function getOrganizations(): Promise<Organization[]> {
  await delay(200);
  return db().orgs.map((o) => ({ ...o }));
}
export async function listAssignments(): Promise<Assignment[]> {
  await delay(200);
  return db().assignments.map((a) => ({ ...a, tags: [...a.tags] }));
}
export async function getActivity(): Promise<ActivityEvent[]> {
  await delay(150);
  return db().activity.map((e) => ({ ...e }));
}

/* --------------------- News mutations --------------------- */

export function updateNewsStatus(id: number, status: NewsStatus) {
  const n = db().news.find((x) => x.id === id);
  if (!n) return;
  n.status = status;
  log(status === "approved" ? "approved" : status === "rejected" ? "rejected" : "edited",
      `News #${id} ${status}: ${n.title}`);
  persist();
}

export function updateNews(id: number, patch: Partial<News>) {
  const n = db().news.find((x) => x.id === id);
  if (!n) return;
  Object.assign(n, patch);
  log("edited", `Edited news #${id}: ${n.title}`);
  persist();
}

export function deleteNews(id: number) {
  const n = db().news.find((x) => x.id === id);
  db().news = db().news.filter((x) => x.id !== id);
  db().assignments = db().assignments.filter((a) => a.newsId !== id);
  if (n) log("deleted", `Deleted news #${id}: ${n.title}`);
  persist();
}

export function fetchIncomingNews(): News[] {
  const pool = [
    { title: "Global cement decarbonization pact expands to 40 members", source: "Reuters", pillar: "Policy & Regulation" as const, category: "Regulation" },
    { title: "Nordic offshore wind auction sets record low strike price", source: "Bloomberg Green", pillar: "Green Energy" as const, category: "Renewables" },
    { title: "Retail sector emissions rise 4% amid e-commerce growth", source: "Reuters", pillar: "ESG" as const, category: "Reporting" },
  ];
  const maxId = db().news.reduce((m, n) => Math.max(m, n.id), 0);
  const today = new Date().toISOString().slice(0, 10);
  const created: News[] = pool.map((p, i) => ({
    id: maxId + i + 1,
    title: p.title,
    source: p.source,
    published: today,
    pillar: p.pillar,
    relevance: 4,
    summary: "Freshly ingested article awaiting editorial review.",
    assignedTo: null,
    status: "pending",
    category: p.category,
    createdAt: today,
  }));
  db().news.unshift(...created);
  log("fetched", `Fetched ${created.length} new articles`);
  persist();
  return created;
}

/* --------------------- Assignment CRUD --------------------- */

export function createAssignment(input: Omit<Assignment, "id" | "assignedAt">): Assignment {
  const a: Assignment = {
    ...input,
    id: `asn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    assignedAt: new Date().toISOString(),
  };
  db().assignments.push(a);
  const org = db().orgs.find((o) => o.id === a.orgId);
  const news = db().news.find((n) => n.id === a.newsId);
  log("assigned", `Assigned "${news?.title ?? "news"}" → ${org?.name ?? "org"}`);
  persist();
  return { ...a };
}

export function updateAssignment(id: string, patch: Partial<Assignment>) {
  const a = db().assignments.find((x) => x.id === id);
  if (!a) return;
  Object.assign(a, patch);
  log("edited", `Updated assignment ${id.slice(0, 10)}`);
  persist();
}

export function deleteAssignment(id: string) {
  const a = db().assignments.find((x) => x.id === id);
  db().assignments = db().assignments.filter((x) => x.id !== id);
  if (a) {
    const org = db().orgs.find((o) => o.id === a.orgId);
    const news = db().news.find((n) => n.id === a.newsId);
    log("unassigned", `Removed "${news?.title ?? "news"}" from ${org?.name ?? "org"}`);
  }
  persist();
}

/* --------------------- Legacy (kept for old page compat) --------------------- */

export function assignNews(news: News[], newsId: number, orgId: number): News[] {
  return news.map((n) => (n.id === newsId ? { ...n, assignedTo: orgId } : n));
}
export function removeAssignment(news: News[], newsId: number): News[] {
  return news.map((n) => (n.id === newsId ? { ...n, assignedTo: null } : n));
}
