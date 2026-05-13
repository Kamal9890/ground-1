import React, { useEffect, useState } from "react";
import ProfileSidebar from "../../../components/reusable components/ProfileSidebar";
import api from "../../../lib/api";
import { Paddle } from "@paddle/paddle-js";
import { getPaddle } from "../../../lib/paddleClient";

type PlanKey = "starter" | "pro" | "impact";
type PaidPlanKey = Exclude<PlanKey, "starter">;

type PlanConfig = {
  name: string;
  price: string;
  badge?: string;
  features: string[];
  highlight?: boolean;
};

const DEFAULT_PLANS: Record<PaidPlanKey, PlanConfig> = {
  pro: {
    name: "Growth",
    price: "£39 / month",
    badge: "Most popular",
    highlight: true,
    features: [
      "Up to 3 user seats",
      "50 curated grant matches per month",
      "20 AI grant drafts per month",
      "Readiness checklist",
      "Application timeline",
      "Email & in-app notifications",
      "Insights dashboard (Basic)",
    ],
  },
  impact: {
    name: "Impact",
    price: "£79 / month",
    features: [
      "Up to 10 user seats",
      "5000 curated grant matches per month",
      "25 AI grant drafts per month",
      "Outreach Agent",
      "Multi-organisation collaboration",
      "Advanced insights & analytics",
      "Email & in-app notifications",
      "Insights dashboard (Advanced)",
    ],
  },
};

/* ---------------- helpers ---------------- */

function normalizePlan(raw: any): PlanKey {
  const s = String(raw || "").toLowerCase();
  if (s === "pro") return "pro";
  if (s === "impact" || s === "team" || s === "team_plan") return "impact";
  // backend returns "free"; keep that as the account fallback plan
  return "starter";
}

function normalizePlanKeyFromApi(raw: any): PaidPlanKey | null {
  const s = String(raw || "").toLowerCase();
  if (s === "pro" || s === "growth") return "pro";
  if (["impact", "team", "team_plan", "team-plan"].includes(s)) return "impact";
  return null;
}

async function apiGetMyPlan(): Promise<PlanKey> {
  try {
    const { data } = await api.get("/payment/my-plan/");
    return normalizePlan(data?.plan);
  } catch (err) {
    // console.error("Failed to fetch current plan", err);
    return "starter";
  }
}

async function apiGetPlans(): Promise<Record<PaidPlanKey, PlanConfig>> {
  try {
    const { data } = await api.get("/payment/plans/");
    const next: Record<PaidPlanKey, PlanConfig> = { ...DEFAULT_PLANS };

    const arr = Array.isArray(data)
      ? data
      : Array.isArray((data as any)?.results)
        ? (data as any).results
        : [];

    arr.forEach((p: any) => {
      const key = normalizePlanKeyFromApi(
        p?.id || p?.plan || p?.code || p?.key || p?.slug || p?.name
      );
      if (!key) return;

      const base = next[key];

      const displayName =
        p?.name || p?.label || p?.display_name || base.name || "";

      const currency = p?.currency || "£";
      const amount =
        typeof p?.price_month === "number" ||
          typeof p?.price_month === "string"
          ? p?.price_month
          : null;
      const priceText =
        amount !== null && amount !== undefined
          ? `${currency}${amount} / month`
          : base.price;

      const features: string[] = Array.isArray(p?.features)
        ? p.features.map((x: any) => String(x ?? "")).filter(Boolean)
        : base.features;

      const badge =
        typeof p?.badge === "string" && p.badge.trim()
          ? p.badge
          : base.badge;

      const highlight =
        typeof p?.highlight === "boolean" ? p.highlight : base.highlight;

      next[key] = {
        name: displayName,
        price: priceText,
        features,
        badge,
        highlight,
      };
    });

    return next;
  } catch (err) {
    // console.error("Failed to fetch plans; using fallback", err);
    return DEFAULT_PLANS;
  }
}

async function apiCreateCheckoutSession(
  plan: PaidPlanKey,
  paddleInstance: Paddle | null
): Promise<void> {
  const origin = window.location.origin;
  const success_url = `${origin}/dashboard/plans?checkout=success`;
  const cancel_url = `${origin}/dashboard/plans?checkout=cancel`;

  const { data } = await api.post("/payment/checkout/", {
    plan,
    success_url,
    cancel_url,
  });

  const transactionId: string | undefined =
    data?.transaction_id || data?.transactionId || data?.id;

  const redirectUrl: string | undefined =
    data?.checkout_url || data?.url || data?.checkoutUrl;

  // Preferred: overlay
  if (paddleInstance && transactionId) {
    await paddleInstance.Checkout.open({
      transactionId,
      settings: {
        displayMode: "overlay",
        theme: "light",
        locale: "en",
        successUrl: success_url,
      },
    });
    return;
  }

  // Optional fallback: uncomment if you want redirect as backup
  // if (redirectUrl) {
  //   window.location.href = redirectUrl;
  //   return;
  // }

  throw new Error("Checkout URL / transactionId missing from response");
}

async function apiCancelSubscription(
  effectiveFrom: "next_billing_period" | "immediately" = "next_billing_period"
): Promise<void> {
  await api.post("/payment/cancel-subscription/", {
    effective_from: effectiveFrom,
  });
}

function Check() {
  return (
    <span className="material-icons text-emerald-600 text-[18px]">
      check_circle
    </span>
  );
}

/* ---------------- component ---------------- */

export default function Plans() {
  const [current, setCurrent] = useState<PlanKey>("starter");
  const [plans, setPlans] = useState<Record<PaidPlanKey, PlanConfig>>(DEFAULT_PLANS);
  const [loading, setLoading] = useState<boolean>(true);
  const [busyPlan, setBusyPlan] = useState<"pro" | "impact" | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [banner, setBanner] = useState<
    null | { tone: "success" | "warning"; text: string }
  >(null);
  const [paddle, setPaddle] = useState<Paddle | null>(null);

  // ── NEW: mobile settings dropdown toggle ──
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const instance = await getPaddle();
        if (!cancelled) setPaddle(instance);
      } catch (e) {
        // console.error("Failed to init Paddle", e);
        if (!cancelled) setPaddle(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("checkout");
    if (p === "success")
      setBanner({
        tone: "success",
        text: "Payment successful. Updating your plan...",
      });
    if (p === "cancel")
      setBanner({
        tone: "warning",
        text: "Checkout cancelled. No changes were made.",
      });
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [planKey, planConfigs] = await Promise.all([
          apiGetMyPlan(),
          apiGetPlans(),
        ]);
        setCurrent(planKey);
        setPlans(planConfigs);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSubscribe = async (plan: PaidPlanKey) => {
    try {
      setBusyPlan(plan);
      await apiCreateCheckoutSession(plan, paddle);
    } catch (e: any) {
      alert(e?.response?.data?.error ||
        e?.response?.data?.message ||
         e?.response?.data?.detail|| "Unable to start checkout");
      setBusyPlan(null);
    }
  };

  const onCancelSubscription = async () => {
    if (!isPaid || cancelling) return;
    const confirmed = window.confirm(
      "Cancel your subscription at the end of the current billing period?"
    );
    if (!confirmed) return;

    try {
      setCancelling(true);
      await apiCancelSubscription("next_billing_period");
      setBanner({
        tone: "success",
        text: "Cancellation requested successfully. After the trial period ends, your plan will be cancelled automatically.",
      });
      window.location.reload();
    } catch (e: any) {
      alert(
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        e?.response?.data?.detail ||
        "Unable to cancel subscription"
      );
    } finally {
      setCancelling(false);
    }
  };

  const isPaid = current === "pro" || current === "impact";

  return (
    // ── CHANGED: mobile layout stacks vertically; gap/padding tightened on small screens ──
    <div className="flex min-h-screen gap-5 p-3 flex-col md:flex-row">
      {/* Sidebar: hidden on mobile, visible md+ */}
      <div className="hidden md:block">
        <ProfileSidebar />
      </div>

      {/* ── Mobile-only top bar with dropdown "Settings" nav ── */}
      <div className="md:hidden">
        <button
          onClick={() => setSettingsOpen((v) => !v)}
          className="flex items-center justify-between w-full px-4 py-3 bg-white rounded-lg shadow-sm border border-[#E5E7EB] text-sm font-medium text-gray-700"
        >
          <span className="flex items-center gap-2">
            <span className="material-icons text-[18px] text-gray-500">menu</span>
            Settings
          </span>
          <span className="material-icons text-[18px] text-gray-400 transition-transform" style={{ transform: settingsOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
            expand_more
          </span>
        </button>

        {settingsOpen && (
          <div className="mt-2 bg-white rounded-lg shadow-md border border-[#E5E7EB] overflow-hidden">
            <ProfileSidebar />
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 p-2 min-w-0 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
              Plans & Billing
            </h1>
            <p className="text-[#777B7F] text-sm sm:text-base">
              Choose a plan. Billing is handled securely via Paddle.
            </p>
          </div>

          {banner && (
            <div
              className={`mb-4 rounded-md px-3 py-2 text-sm ${banner.tone === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-amber-50 border border-amber-200 text-amber-900"
                }`}
            >
              {banner.text}
            </div>
          )}

          {/* ── CHANGED: single col on mobile, 2 col on md+ ── */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {(["pro", "impact"] as PaidPlanKey[]).map((planKey) => (
              <PlanCard
                key={planKey}
                planKey={planKey}
                cfg={plans[planKey]}
                current={current}
                loading={loading}
                busy={busyPlan === planKey}
                onChoose={() => onSubscribe(planKey)}
              />
            ))}
          </div>

          <div className="mt-8 border-t pt-6">
            <div className="text-sm text-[#6B7280]">
              Current plan:{" "}
              <span className="font-medium text-gray-900">
                {loading ? "..." : current === "starter" ? "Free" : plans[current].name}
              </span>
            </div>
            {isPaid && (
              <div className="mt-3 text-xs text-[#6B7280]">
                To cancel or change billing details, use the Paddle subscription
                portal (link from your receipt). After cancellation, your
                account will automatically revert to the Free plan.
              </div>
            )}
            {isPaid && (
              <div className="mt-4">
                <button
                  onClick={onCancelSubscription}
                  disabled={loading || cancelling}
                  className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {cancelling ? "Cancelling..." : "Cancel Subscription"}
                </button>
              </div>
            )}
            {!isPaid && (
              <div className="mt-3 text-xs text-[#6B7280]">
                The Free plan has limited features. Upgrade anytime to Growth or
                Impact to unlock more.
              </div>
            )}
            <div className="mt-3 text-xs text-[#6B7280]">
              All prices are in GBP and billed monthly via Paddle. Taxes may
              apply.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanCard({
  planKey,
  cfg,
  current,
  loading,
  busy,
  onChoose,
}: {
  planKey: PaidPlanKey;
  cfg: PlanConfig;
  current: PlanKey;
  loading: boolean;
  busy: boolean;
  onChoose: () => void;
}) {
  const isCurrent = current === planKey;

  return (
    <div
      className={[
        "rounded-xl border p-5 flex flex-col",
        cfg.highlight
          ? "border-emerald-300 shadow-[0_6px_24px_rgba(16,185,129,0.15)]"
          : "border-[#E5E7EB]",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">{cfg.name}</div>
          <div className="text-sm text-[#6B7280]">{cfg.price}</div>
        </div>
        {cfg.badge && (
          <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium">
            {cfg.badge}
          </span>
        )}
      </div>

      <ul className="my-4 space-y-2 text-sm">
        {cfg.features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-4 border-t">
        <button
          disabled={loading || busy || isCurrent}
          onClick={onChoose}
          className={[
            "w-full p-2 rounded-lg text-sm font-medium transition",
            isCurrent
              ? "bg-gray-100 text-gray-500 cursor-default"
              : cfg.highlight
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-[#0077B7] text-white hover:brightness-110",
          ].join(" ")}
        >
          {loading
            ? "Loading..."
            : isCurrent
              ? "Current plan"
              : `Subscribe - ${cfg.price}`}
        </button>
      </div>
    </div>
  );
}