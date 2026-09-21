export type HomePermission = "environment" | "goals" | "workflow" | "audit" | "news" | "games" | "team-activity";
export type HomePriority = "high" | "medium" | "low";

export interface HomeUser {
  id: string;
  name: string;
  organization: string;
  role: "admin" | "manager" | "user";
  permissions: HomePermission[];
}

export interface HomeAction {
  id: string;
  title: string;
  module: string;
  type: "Approve" | "Verify" | "Submit" | "Review" | "Complete" | "Assign" | "Acknowledge";
  assignedBy: string;
  due: string;
  dueLabel: string;
  priority: HomePriority;
  status: "overdue" | "today" | "upcoming";
  target: string;
  permission: HomePermission;
}

export interface HomeForm {
  id: string;
  title: string;
  description: string;
  module: string;
  due: string;
  dueLabel: string;
  priority: HomePriority;
  status: "overdue" | "in-progress" | "not-started";
  progress: number;
  target: string;
  permission: HomePermission;
}

export interface HomeFeedItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  permission?: HomePermission;
}

export interface HomeDashboardData {
  user: HomeUser;
  actions: HomeAction[];
  forms: HomeForm[];
  notifications: HomeFeedItem[];
  activity: HomeFeedItem[];
  news: HomeFeedItem[];
  updates: HomeFeedItem[];
  upcoming: HomeFeedItem[];
  leaderboard: { name: string; score: number; rank: number; change: number }[];
  quote: { text: string; author: string };
}