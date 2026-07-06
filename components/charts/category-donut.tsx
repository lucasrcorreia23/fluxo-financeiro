"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { accentHex } from "@/lib/data/categories";
import type { CategorySpend } from "@/lib/finance";
import { formatBRL, formatPercent } from "@/lib/utils";

export function CategoryDonut({
  data,
  total,
}: {
  data: CategorySpend[];
  total: number;
}) {
  if (data.length === 0) {
    return (
      <div className="grid h-[220px] place-items-center text-sm text-[var(--color-muted)]">
        Sem gastos com valor definido ainda.
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.category.name,
    value: d.total,
    accent: d.category.accent,
    pct: d.pct,
  }));

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={68}
            outerRadius={100}
            paddingAngle={2}
            stroke="none"
            startAngle={90}
            endAngle={-270}
          >
            {chartData.map((d) => (
              <Cell key={d.name} fill={accentHex(d.accent)} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-wide text-[var(--color-muted)]">
            Total gasto
          </p>
          <p className="text-xl font-semibold tnum">{formatBRL(total)}</p>
        </div>
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        {data.slice(0, 6).map((d) => (
          <li key={d.category.id} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: accentHex(d.category.accent) }}
            />
            <span className="truncate text-[var(--color-muted)]">{d.category.name}</span>
            <span className="ml-auto font-medium tnum">{formatPercent(d.pct)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
