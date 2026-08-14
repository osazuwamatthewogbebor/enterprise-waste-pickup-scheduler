import PublicShell from "@/src/components/public-shell";

export default function AboutPage() {
  return (
    <PublicShell>
      <section className="bg-slate-950 py-24 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">About</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tighter sm:text-5xl">
              Software built to simplify waste operations in Nigeria.
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              WastePickup delivers route planning, billing, driver coordination, and resident management in one operational platform.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Our vision</h2>
                <p className="mt-4 text-lg leading-8 text-slate-600">
                  Empower waste operators with software that makes planning, execution, and payment collection easier and more reliable.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-950">How we help</h2>
                <p className="mt-4 text-lg leading-8 text-slate-600">
                  WastePickup replaces fragmented workflows with a single system for zones, routes, field operations, and resident service.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-950">Core capabilities</h3>
              <ul className="mt-6 space-y-4 text-slate-600">
                <li className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="font-semibold text-slate-900">Route and zone management</p>
                  <p className="mt-2 text-sm leading-6">Build routes, assign drivers, and manage service areas from one control panel.</p>
                </li>
                <li className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="font-semibold text-slate-900">Resident records</p>
                  <p className="mt-2 text-sm leading-6">Keep accurate address, schedule, and billing information for every resident.</p>
                </li>
                <li className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="font-semibold text-slate-900">Payment tracking</p>
                  <p className="mt-2 text-sm leading-6">Issue invoices and collect payments through integrated Paystack links.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              ["Operations visibility", "Monitor route progress and pickup status from one dashboard."],
              ["Cleaner billing", "Send professional invoices and simplify collections."],
              ["Field accountability", "Keep drivers aligned with assigned routes and proof-of-service tracking."],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
                <p className="text-xl font-semibold text-slate-950">{title}</p>
                <p className="mt-4 text-sm leading-7 text-slate-600">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
