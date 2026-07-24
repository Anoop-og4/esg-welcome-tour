import { ReactNode } from "react";
import { Newspaper, Inbox, CheckCircle2, Link2, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type View = "news-dashboard" | "news-incoming" | "news-approved" | "news-assignments";

const tabs: { key: View; label: string; icon: typeof Inbox }[] = [
  { key: "news-dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "news-incoming", label: "Incoming News", icon: Inbox },
  { key: "news-approved", label: "Approved News", icon: CheckCircle2 },
  { key: "news-assignments", label: "Assignments", icon: Link2 },
];

interface Props {
  active: View;
  onNavigate: (v: string) => void;
  children: ReactNode;
}

export default function NewsMgmtShell({ active, onNavigate, children }: Props) {
  const activeTab = tabs.find((t) => t.key === active) ?? tabs[0];
  return (
    <div className="flex-1 min-w-0 overflow-y-auto bg-background">
      <div className="max-w-[1500px] mx-auto p-4 md:p-6 space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => onNavigate("news-dashboard")} className="cursor-pointer">
                  News Management
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{activeTab.label}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Newspaper className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-foreground">News Management</h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Ingestion → Review → Approval → Assignment → Analytics
              </p>
            </div>
          </div>

          {/* Step tabs */}
          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border/60 bg-card p-1">
            {tabs.map((t, i) => {
              const isActive = t.key === active;
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => onNavigate(t.key)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-xs md:text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span className="w-5 h-5 rounded-full bg-background/20 flex items-center justify-center text-[10px] font-bold">
                    {i + 1}
                  </span>
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
