"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";
import { formatPercent, formatTokenAmount } from "@/lib/numberFormat";
import toast from "react-hot-toast";

interface PlanItem {
  id: number;
  name: string;
  min_amount: number;
  max_amount: number;
  roi_percent: number;
  daily_income_percent?: number;
  duration_days: number;
  max_return_multiplier?: number;
  payment_currency?: "AUTO" | "BNB" | "USDT";
}

export default function PackagesPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const res = await api.get("/payments/plans");
        setPlans(res.data?.data || []);
      } catch (error: any) {
        toast.error("Failed to load packages");
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, []);

  return (
    <div className="min-h-screen bg-[#060b14] p-4 md:p-8">
      <div className="rounded-2xl border border-[#1e2329] bg-[#161a20] p-5 shadow md:p-7">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-[#f5f5f5]">Available Packages</h2>
          <span className="text-xs text-[#848e9c]">{plans.length} packages</span>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 text-[#848e9c]">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading...
          </div>
        ) : plans.length === 0 ? (
          <p className="text-sm text-[#848e9c]">No packages configured yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div key={plan.id} className="rounded-2xl border border-[#2b3139] bg-[#111418] p-4 shadow-sm">
                <div className="inline-flex rounded-full border border-[#3a2f09] bg-[#201a08] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f0b90b]">
                  Package
                </div>
                <h3 className="mt-3 font-semibold text-[#f5f5f5]">{plan.name}</h3>
                <p className="mt-2 text-sm text-[#b7bdc6]">
                  Investment: {formatTokenAmount(plan.min_amount)} - {formatTokenAmount(plan.max_amount || plan.min_amount || 0)} {plan.payment_currency && plan.payment_currency !== "AUTO" ? plan.payment_currency : "ACTIVE ASSET"}
                </p>
                <p className="text-sm text-[#b7bdc6]">
                  Daily Points: {formatPercent((plan.daily_income_percent ?? plan.roi_percent) || 0, 4)}%
                </p>
                <p className="text-xs text-[#848e9c] mt-1">
                  Total return cap on min amount:{" "}
                  {formatTokenAmount(Number(plan.min_amount || 0) * Number(plan.max_return_multiplier || 2))}
                </p>
                <button type="button" onClick={() => router.push(`/dapp/pay/${plan.id}`)} className="mt-4 w-full rounded-lg bg-[#f0b90b] px-3 py-2 font-medium text-[#181a20] hover:bg-[#f8d45c]">
                  Activate Package
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
