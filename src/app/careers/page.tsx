import PublicShell from "@/src/components/public-shell";

const roles = [
  { title: "Customer Success Lead", location: "Lagos, Nigeria", type: "Full time" },
  { title: "Product Operations Manager", location: "Remote", type: "Full time" },
  { title: "Software Engineer", location: "Remote", type: "Full time" },
];

export default function CareersPage() {
  return (
    <PublicShell>
      <section className="bg-slate-950 py-24 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Careers</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tighter sm:text-5xl">
              Join our team building better waste operations.
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              We support operators across Nigeria with software that keeps their routes moving and their teams productive.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {roles.map((role) => (
              <div key={role.title} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-950">{role.title}</h2>
                <p className="mt-3 text-sm text-slate-600">{role.location}</p>
                <p className="mt-2 inline-flex rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                  {role.type}
                </p>
                <button className="mt-8 inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                  Apply now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
