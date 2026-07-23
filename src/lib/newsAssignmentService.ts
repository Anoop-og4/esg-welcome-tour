import type { News, Organization } from "@/types/newsAssignment";
import { newsSeed } from "@/data/news";
import { organizationsSeed } from "@/data/organizations";

// Mock service layer. Swap these with real fetch() calls later — signatures stay the same.
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function getNews(): Promise<News[]> {
  await delay(600);
  return newsSeed.map((n) => ({ ...n }));
}

export async function getOrganizations(): Promise<Organization[]> {
  await delay(300);
  return organizationsSeed.map((o) => ({ ...o }));
}

export function assignNews(news: News[], newsId: number, orgId: number): News[] {
  return news.map((n) => (n.id === newsId ? { ...n, assignedTo: orgId } : n));
}

export function removeAssignment(news: News[], newsId: number): News[] {
  return news.map((n) => (n.id === newsId ? { ...n, assignedTo: null } : n));
}
