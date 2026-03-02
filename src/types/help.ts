export type BlockType =
  | "title"
  | "paragraph"
  | "image"
  | "bullet-list"
  | "numbered-list"
  | "callout"
  | "divider"
  | "video"
  | "faq"
  | "code";

export type CalloutVariant = "info" | "warning" | "success";
export type TitleLevel = "h1" | "h2" | "h3";

export interface HelpBlock {
  id: string;
  type: BlockType;
  order: number;
  content: {
    text?: string;
    level?: TitleLevel;
    src?: string;
    alt?: string;
    items?: string[];
    variant?: CalloutVariant;
    language?: string;
    faqItems?: { question: string; answer: string }[];
  };
}

export type ArticleStatus = "draft" | "published";

export interface HelpArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: ArticleStatus;
  blocks: HelpBlock[];
  metaTitle: string;
  metaDescription: string;
  createdAt: string;
  updatedAt: string;
}

export const HELP_CATEGORIES = [
  "Getting Started",
  "Environment",
  "Operations",
  "Goals",
  "Social & Governance",
  "Admin",
  "General",
] as const;

export function createBlock(type: BlockType, order: number): HelpBlock {
  const id = crypto.randomUUID();
  const base = { id, type, order, content: {} };

  switch (type) {
    case "title":
      return { ...base, content: { text: "", level: "h2" as TitleLevel } };
    case "paragraph":
      return { ...base, content: { text: "" } };
    case "image":
      return { ...base, content: { src: "", alt: "" } };
    case "bullet-list":
    case "numbered-list":
      return { ...base, content: { items: [""] } };
    case "callout":
      return { ...base, content: { text: "", variant: "info" as CalloutVariant } };
    case "divider":
      return base;
    case "video":
      return { ...base, content: { src: "" } };
    case "faq":
      return { ...base, content: { faqItems: [{ question: "", answer: "" }] } };
    case "code":
      return { ...base, content: { text: "", language: "javascript" } };
    default:
      return base;
  }
}

// Sample seed data
export const SEED_ARTICLES: HelpArticle[] = [
  {
    id: "1",
    title: "Getting Started with Environment Dashboard",
    slug: "getting-started-dashboard",
    category: "Getting Started",
    status: "published",
    metaTitle: "Environment Dashboard Guide",
    metaDescription: "Learn how to navigate and use the environment dashboard effectively.",
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    blocks: [
      { id: "b1", type: "title", order: 0, content: { text: "Welcome to the Dashboard", level: "h1" } },
      { id: "b2", type: "paragraph", order: 1, content: { text: "The Environment Dashboard gives you a comprehensive overview of your organization's environmental metrics including total emissions, carbon intensity, and green energy consumption." } },
      { id: "b3", type: "callout", order: 2, content: { text: "Make sure you have the latest data imported before reviewing metrics.", variant: "info" } },
      { id: "b4", type: "image", order: 3, content: { src: "/help/overview-1.png", alt: "Dashboard overview screenshot" } },
      { id: "b5", type: "bullet-list", order: 4, content: { items: ["View total emissions at a glance", "Track carbon intensity trends", "Monitor green energy consumption", "Check goal progress"] } },
    ],
  },
  {
    id: "2",
    title: "Understanding Scope Emissions",
    slug: "scope-emissions",
    category: "Environment",
    status: "draft",
    metaTitle: "Scope 1, 2, 3 Emissions Explained",
    metaDescription: "Understand the difference between Scope 1, 2, and 3 emissions.",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    blocks: [
      { id: "b6", type: "title", order: 0, content: { text: "Scope Emissions Overview", level: "h1" } },
      { id: "b7", type: "paragraph", order: 1, content: { text: "Greenhouse gas emissions are categorized into three scopes to help organizations measure and manage their carbon footprint." } },
      { id: "b8", type: "numbered-list", order: 2, content: { items: ["Scope 1: Direct emissions from owned sources", "Scope 2: Indirect emissions from purchased energy", "Scope 3: All other indirect emissions in the value chain"] } },
      { id: "b9", type: "callout", order: 3, content: { text: "Scope 3 often represents the largest portion of an organization's total emissions.", variant: "warning" } },
    ],
  },
  {
    id: "3",
    title: "Setting Carbon Reduction Goals",
    slug: "carbon-reduction-goals",
    category: "Goals",
    status: "published",
    metaTitle: "How to Set Carbon Reduction Goals",
    metaDescription: "Step-by-step guide to creating effective carbon reduction targets.",
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    blocks: [
      { id: "b10", type: "title", order: 0, content: { text: "Carbon Reduction Goals", level: "h1" } },
      { id: "b11", type: "paragraph", order: 1, content: { text: "Setting science-based carbon reduction targets is crucial for meaningful climate action." } },
      { id: "b12", type: "code", order: 2, content: { text: "// Example: Calculate reduction target\nconst baseline = 10000; // TCO2e\nconst targetReduction = 0.42; // 42%\nconst target = baseline * (1 - targetReduction);", language: "javascript" } },
    ],
  },
];
