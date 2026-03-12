export type NotificationType = "system" | "alert" | "message" | "activity";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

export const dummyNotifications: Notification[] = [
  {
    id: "n1",
    title: "Scope 1 Emissions Updated",
    message: "Carbon emissions data for Q4 2025 has been processed. Total: 45,200 TCO₂e.",
    type: "activity",
    read: false,
    createdAt: "2026-03-12T09:15:00Z",
  },
  {
    id: "n2",
    title: "High Risk Alert: Water Usage",
    message: "Water consumption exceeded threshold by 18% in the APAC region.",
    type: "alert",
    read: false,
    createdAt: "2026-03-12T08:30:00Z",
  },
  {
    id: "n3",
    title: "ESG Report Ready",
    message: "Your annual ESG compliance report is ready for review and download.",
    type: "system",
    read: false,
    createdAt: "2026-03-11T16:00:00Z",
  },
  {
    id: "n4",
    title: "New Comment on Governance Policy",
    message: "Sarah Chen commented on the Anti-Corruption Policy draft.",
    type: "message",
    read: false,
    createdAt: "2026-03-11T14:22:00Z",
  },
  {
    id: "n5",
    title: "Goal Milestone Achieved",
    message: "Renewable energy target reached 75% — ahead of schedule by 2 months.",
    type: "activity",
    read: true,
    createdAt: "2026-03-11T10:00:00Z",
  },
  {
    id: "n6",
    title: "System Maintenance Scheduled",
    message: "Platform maintenance window: March 15, 2026 from 02:00–04:00 UTC.",
    type: "system",
    read: true,
    createdAt: "2026-03-10T12:00:00Z",
  },
  {
    id: "n7",
    title: "Diversity Score Improved",
    message: "Board diversity index increased to 42% — up 5% from last quarter.",
    type: "activity",
    read: true,
    createdAt: "2026-03-10T09:45:00Z",
  },
  {
    id: "n8",
    title: "Critical: Compliance Deadline",
    message: "CSRD reporting deadline is in 14 days. 3 sections still require completion.",
    type: "alert",
    read: false,
    createdAt: "2026-03-09T15:30:00Z",
  },
  {
    id: "n9",
    title: "New Team Member Added",
    message: "James Park has been added to the Sustainability Reporting team.",
    type: "message",
    read: true,
    createdAt: "2026-03-09T11:00:00Z",
  },
  {
    id: "n10",
    title: "Data Import Complete",
    message: "Energy consumption data from 12 facilities has been successfully imported.",
    type: "system",
    read: true,
    createdAt: "2026-03-08T17:20:00Z",
  },
  {
    id: "n11",
    title: "Supply Chain Risk Detected",
    message: "Tier 2 supplier flagged for potential labor practice violations in Southeast Asia.",
    type: "alert",
    read: false,
    createdAt: "2026-03-08T08:10:00Z",
  },
  {
    id: "n12",
    title: "Weekly Digest Available",
    message: "Your weekly ESG performance summary is ready. Key highlights: emissions down 3%.",
    type: "system",
    read: true,
    createdAt: "2026-03-07T09:00:00Z",
  },
];
