import PublicShell from "@/src/components/public-shell";

const features = [
  {
    title: "Route planning built for field operations",
    detail: "Define service zones, optimize stop order, and dispatch routes to drivers with a single workflow.",
  },
  {
    title: "Resident profiles and billing",
    detail: "Store resident details, track pickup schedules, issue invoices, and reconcile payments in one place.",
  },
  {
    title: "Driver coordination and tracking",
    detail: "Keep drivers aligned with live route updates, service confirmations, and proof-of-pickup reports.",
  },
  {
    title: "Service request intake",
    detail: "Let residents submit pickup requests with a public form and route them into your operating team.",
  },
  {
    title: "Performance reporting",
    detail: "Monitor collection progress, payment status, and route efficiency with clear dashboards.",
  },
  {
    title: "Paystack payment links",
    detail: "Send convenient payment requests and track receipts natively within the platform.",
  },
];

export default function FeaturesPage() {
  return (
    <PublicShell>
      <section className="bg-blue-950 py-24 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Features</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tighter sm:text-5xl">
              Everything a modern waste operation needs.
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              From route creation to driver handoff, resident billing to service quality tracking — every step is connected.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <h2 className="text-xl font-semibold text-slate-950">{feature.title}</h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">{feature.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
