import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Target, Sparkles, TrendingUp, BarChart3 } from "lucide-react";
import WhatIfPlanner from "./WhatIfPlanner";

function ComingSoon({ icon: Icon, title }: { icon: typeof Target; title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="h-16 w-16 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mb-4">
        <Icon className="h-7 w-7 text-teal-400" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">Coming soon — this module is in active development.</p>
    </div>
  );
}

export default function GoalModule() {
  const [tab, setTab] = useState("whatif");

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="px-6 py-6 max-w-[1600px] mx-auto">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-muted/50 mb-6">
            <TabsTrigger value="targets" className="data-[state=active]:bg-background data-[state=active]:text-teal-400">
              <Target className="h-4 w-4 mr-1.5" /> Targets
            </TabsTrigger>
            <TabsTrigger value="whatif" className="data-[state=active]:bg-background data-[state=active]:text-teal-400">
              <Sparkles className="h-4 w-4 mr-1.5" /> What-if Planner
            </TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-background data-[state=active]:text-teal-400">
              <TrendingUp className="h-4 w-4 mr-1.5" /> Progress Tracker
            </TabsTrigger>
            <TabsTrigger value="benchmark" className="data-[state=active]:bg-background data-[state=active]:text-teal-400">
              <BarChart3 className="h-4 w-4 mr-1.5" /> Benchmark
            </TabsTrigger>
          </TabsList>

          <TabsContent value="targets"><ComingSoon icon={Target} title="Targets" /></TabsContent>
          <TabsContent value="whatif"><WhatIfPlanner /></TabsContent>
          <TabsContent value="progress"><ComingSoon icon={TrendingUp} title="Progress Tracker" /></TabsContent>
          <TabsContent value="benchmark"><ComingSoon icon={BarChart3} title="Benchmark" /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
