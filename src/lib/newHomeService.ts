import { demoProfiles, newHomeSeed } from "@/data/newHome";
import type { HomeDashboardData, HomePermission, HomeUser } from "@/types/newHome";

const PROFILE_KEY = "new-home-demo-role";

const hasPermission = (user: HomeUser, permission?: HomePermission) => !permission || user.permissions.includes(permission);

export function filterDashboardForUser(data: HomeDashboardData): HomeDashboardData {
  const allowed = <T extends { permission?: HomePermission }>(items: T[]) => items.filter((item) => hasPermission(data.user, item.permission));
  return {
    ...data,
    actions: allowed(data.actions),
    forms: allowed(data.forms),
    notifications: allowed(data.notifications),
    activity: allowed(data.activity),
    news: allowed(data.news),
    upcoming: allowed(data.upcoming),
  };
}

export async function getNewHomeDashboard(): Promise<HomeDashboardData> {
  await new Promise((resolve) => setTimeout(resolve, 450));
  const savedRole = localStorage.getItem(PROFILE_KEY);
  const role = savedRole === "manager" || savedRole === "user" ? savedRole : "admin";
  return filterDashboardForUser({ user: demoProfiles[role], ...newHomeSeed });
}