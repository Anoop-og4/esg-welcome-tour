import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import WelcomeModal from "@/components/WelcomeModal";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardContent from "@/components/DashboardContent";
import HelpContent from "@/components/HelpContent";
import HelpStudio from "@/components/admin/HelpStudio";

const Index = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeView, setActiveView] = useState("environment");

  const renderContent = () => {
    if (activeView === "help") return <HelpContent />;
    if (activeView === "admin") return <HelpStudio />;
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
