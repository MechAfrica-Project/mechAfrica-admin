"use client";

import { useEffect } from "react";
import { useAnalyticsStore } from "@/stores/useAnalyticsStore";
import { AnalyticsFilters } from "./_components/AnalyticsFilters";
import { StatCard } from "./_components/StatCard";
import { DistributionDonut } from "./_components/DistributionDonut";
import { motion } from "framer-motion";
import { Users, UserCheck, ShieldAlert } from "lucide-react";

export default function AnalyticsPage() {
  const { data, isLoading, fetchAnalytics } = useAnalyticsStore();

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  return (
    <div className="flex-1 space-y-6 p-8 bg-gray-50/50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Analytics & Insights</h2>
          <p className="text-muted-foreground mt-1">Strategic overview of the platform&apos;s user base.</p>
        </div>
      </div>

      <AnalyticsFilters />

      {isLoading && !data ? (
        <div className="h-[400px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          <motion.div variants={itemVariants}>
            <StatCard
              title="Total Filtered Users"
              value={data?.total_users || 0}
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Data Quality Health"
              value={85}
              suffix="%"
              icon={<UserCheck className="h-4 w-4 text-muted-foreground" />}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Critical Missing Data"
              value={12}
              suffix="%"
              icon={<ShieldAlert className="h-4 w-4 text-muted-foreground" />}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="rounded-xl border bg-white shadow-sm p-6">
              <h3 className="font-semibold text-lg mb-4">Role Distribution</h3>
              <div className="h-[300px]">
                <DistributionDonut data={data?.role_distribution || []} />
              </div>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="rounded-xl border bg-white shadow-sm p-6">
              <h3 className="font-semibold text-lg mb-4">Gender Distribution</h3>
              <div className="h-[300px]">
                <DistributionDonut data={data?.gender_distribution || []} />
              </div>
            </div>
          </motion.div>

        </motion.div>
      )}
    </div>
  );
}
