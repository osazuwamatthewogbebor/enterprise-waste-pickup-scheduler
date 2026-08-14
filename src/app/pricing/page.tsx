import PublicShell from "@/src/components/public-shell";
import Link from "next/link";

const plans = [
  {
    name: "Essential",
    price: "₦45,000",
    description: "For small service providers ready to move operations online.",
    features: ["Resident management", "Route planning", "Basic reporting"],
  },
  {
    name: "Growth",
    price: "₦95,000",
    description: "For growing teams that need automation and dispatch control.",
    features: ["Driver assignments", "Invoice tracking", "Service request workflow"],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large operators needing support, integrations, and dedicated onboarding.",
    features: ["Custom onboarding", "Dedicated support", "Performance analytics"],
  },
];

export default function PricingPage() {
  return (
    <PublicShell>
      <section className="bg-slate-950 py-24 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">Pricing</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tighter sm:text-5xl">
              Simple pricing for every scale of waste operation.
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              Start with a plan that fits your team and upgrade as your route network grows.
              All plans include onboarding, training resources, and access to Paystack payments.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-[1.5rem] border p-8 shadow-sm transition duration-200 ${
                  plan.featured ? "border-blue-200 bg-white shadow-lg" : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-950">{plan.name}</h2>
                    <p className="mt-2 text-sm text-slate-500">{plan.description}</p>
                  </div>
                  {plan.featured && (
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                      Popular
                    </span>
                  )}
                </div>
                <p className="mt-8 text-4xl font-bold tracking-tighter text-slate-950">{plan.price}</p>
                <ul className="mt-8 space-y-4 text-sm text-slate-600">
                  {plan.features.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-blue-600" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`mt-10 inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-semibold transition ${
                    plan.featured
                      ? "bg-blue-600 text-white hover:bg-blue-500"
                      : "border border-slate-300 bg-white text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  Start trial
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
