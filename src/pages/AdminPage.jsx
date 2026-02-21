import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Tabs, TabsContent } from "../components/ui/tabs";
import { AnimatedTabsList, AnimatedTabsTrigger } from "../components/ui/animated-tabs.jsx";
import { AdminGuard } from "../components/admin/AdminGuard.jsx";
import { AirdropTab } from "../components/admin/AirdropTab.jsx";
import { PayoutStatusTab } from "../components/admin/PayoutStatusTab.jsx";
import { HoldersTab } from "../components/admin/HoldersTab.jsx";
import { KamonStatusTab } from "../components/admin/KamonStatusTab.jsx";
import { fadeInUp, staggerDelay, tabContent } from "../lib/motion.js";

const ADMIN_TABS = [
  { key: "airdrop", label: "Airdrop" },
  { key: "payouts", label: "Payouts" },
  { key: "holders", label: "Holders" },
  { key: "kamon", label: "Kamon" },
];

const TAB_COMPONENTS = {
  airdrop: AirdropTab,
  payouts: PayoutStatusTab,
  holders: HoldersTab,
  kamon: KamonStatusTab,
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState(ADMIN_TABS[0].key);

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <motion.h1
        className="font-serif text-3xl font-bold"
        {...fadeInUp}
      >
        Admin Dashboard
      </motion.h1>

      <AdminGuard>
        <motion.div
          className="w-full max-w-2xl"
          {...fadeInUp}
          transition={{ ...fadeInUp.transition, ...staggerDelay(1) }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <AnimatedTabsList className="w-full" activeValue={activeTab}>
              {ADMIN_TABS.map((tab) => (
                <AnimatedTabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className="flex-1"
                  layoutId="admin-tab"
                >
                  {tab.label}
                </AnimatedTabsTrigger>
              ))}
            </AnimatedTabsList>

            <AnimatePresence mode="wait">
              {ADMIN_TABS.map((tab) => {
                if (tab.key !== activeTab) return null;
                const TabComponent = TAB_COMPONENTS[tab.key];
                return (
                  <TabsContent
                    key={tab.key}
                    value={tab.key}
                    className="mt-6"
                    forceMount
                    asChild
                  >
                    <motion.div {...tabContent}>
                      <TabComponent />
                    </motion.div>
                  </TabsContent>
                );
              })}
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </AdminGuard>
    </div>
  );
}
