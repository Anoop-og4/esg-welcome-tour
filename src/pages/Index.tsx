import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import WelcomeModal from "@/components/WelcomeModal";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardContent from "@/components/DashboardContent";
import HelpContent from "@/components/HelpContent";

const Index = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeView, setActiveView] = useState("environment");

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar activeView={activeView} onViewChange={setActiveView} />
      {activeView === "help" ? <HelpContent /> : <DashboardContent />}
      <AnimatePresence>
        {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default Index;
