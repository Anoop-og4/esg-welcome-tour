import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import WelcomeModal from "@/components/WelcomeModal";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardContent from "@/components/DashboardContent";

const Index = () => {
  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <DashboardContent />
      <AnimatePresence>
        {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default Index;
