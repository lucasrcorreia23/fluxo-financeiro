"use client";

import { motion } from "framer-motion";
import { InsightCard } from "@/components/insight-card";
import { PageHeader } from "@/components/ui/page-header";
import { CardSkeleton } from "@/components/ui/skeleton";
import { useData } from "@/lib/data/provider";
import { buildInsights } from "@/lib/insights";
import { stagger } from "@/lib/motion";

export default function InsightsPage() {
  const { ready, db } = useData();

  if (!ready) {
    return (
      <div className="flex flex-col gap-5">
        <div className="skeleton h-9 w-48 rounded-xl" />
        <div className="grid gap-5 sm:grid-cols-2">
          <CardSkeleton className="h-32" />
          <CardSkeleton className="h-32" />
          <CardSkeleton className="h-32" />
          <CardSkeleton className="h-32" />
        </div>
      </div>
    );
  }

  const insights = buildInsights(db);

  return (
    <>
      <PageHeader
        title="Insights"
        subtitle="O que seus números estão dizendo sobre o mês."
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid gap-5 sm:grid-cols-2"
      >
        {insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </motion.div>
    </>
  );
}
