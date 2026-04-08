import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import WelcomeModal from "@/components/WelcomeModal";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardContent from "@/components/DashboardContent";
import HelpContent from "@/components/HelpContent";
import HelpStudio from "@/components/admin/HelpStudio";
import HomePage from "@/components/home/HomePage";
import OrganizationSettings from "@/components/settings/OrganizationSettings";
import WorkflowBuilder from "@/components/workflow/WorkflowBuilder";

const Index = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [activeView, setActiveView] = useState("home");

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const renderContent = () => {
    if (activeView === "home") return <HomePage onNavigate={setActiveView} />;
    if (activeView === "help") return <HelpContent />;
    if (activeView === "admin") return <HelpStudio />;
    if (activeView === "settings") return <OrganizationSettings onNavigate={setActiveView} />;
    if (activeView === "workflow") return <WorkflowBuilder />;
    return <DashboardContent onNavigate={setActiveView} />;
  };

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar activeView={activeView} onViewChange={setActiveView} />
      {renderContent()}
      <AnimatePresence>
        {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default Index;
