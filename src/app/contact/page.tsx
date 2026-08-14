import PublicShell from "@/src/components/public-shell";

export default function ContactPage() {
  return (
    <PublicShell>
      <section className="bg-slate-950 py-24 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Contact</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tighter sm:text-5xl">
              Talk to the team behind WastePickup.
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              Whether you want a demo, pricing information, or support, our team is ready to help.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="space-y-8">
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-8 shadow-sm">
                <h2 className="text-2xl font-semibold text-slate-950">Contact information</h2>
                <p className="mt-4 text-lg leading-8 text-slate-600">
                  Get fast support or request a conversation with our growth team.
                </p>
                <div className="mt-8 space-y-6 text-sm text-slate-600">
                  <div>
                    <p className="font-semibold text-slate-900">Email</p>
                    <p>hello@wastepickup.ng</p>
                    <p>support@wastepickup.ng</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Phone</p>
                    <p>+234 800 000 0000</p>
                    <p>Mon-Fri, 9am - 6pm WAT</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Head office</p>
                    <p>15A Lekki-Epe Expressway, Victoria Island, Lagos, Nigeria</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-8 shadow-sm">
                <h2 className="text-2xl font-semibold text-slate-950">Send us a message</h2>
                <form className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      type="text"
                      name="firstName"
                      required
                      placeholder="First name"
                      className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                    <input
                      type="text"
                      name="lastName"
                      required
                      placeholder="Last name"
                      className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="Email address"
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <input
                    type="text"
                    name="company"
                    placeholder="Company name (optional)"
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <select
                    name="inquiryType"
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">What can we help you with?</option>
                    <option>Product demo</option>
                    <option>Pricing</option>
                    <option>Technical support</option>
                    <option>Partnership</option>
                    <option>Other</option>
                  </select>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    placeholder="Your message"
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Send message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
