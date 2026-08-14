import PublicShell from "@/src/components/public-shell";

export default function TermsOfServicePage() {
  return (
    <PublicShell>
      <section className="bg-slate-950 py-24 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Terms</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tighter sm:text-5xl">Terms of Service</h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">Last updated: August 12, 2025</p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-slate mx-auto max-w-3xl">
            <p>
              These Terms of Service (&quot;Terms&quot;) govern your use of WastePickup (&quot;Service&quot;). By using the Service, you agree to be bound by these Terms.
            </p>

            <h2>Account registration</h2>
            <p>
              You must create an account to use the Service. You are responsible for keeping your login information secure and for all activity on your account.
            </p>

            <h2>License</h2>
            <p>
              We grant you a limited, non-exclusive license to use the Service for your internal business operations in Nigeria.
            </p>

            <h2>Data ownership</h2>
            <p>
              You retain ownership of your data. We only use it to operate the Service and do not sell it to third parties.
            </p>

            <h2>Prohibited activities</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the Service unlawfully.</li>
              <li>Attempt unauthorized access to the Service.</li>
              <li>Store personal data without appropriate consent.</li>
              <li>Interfere with the Service or its users.</li>
              <li>Reverse engineer the platform.</li>
            </ul>

            <h2>Fees and payments</h2>
            <p>
              We offer a 30-day free trial. After the trial, you must subscribe to a paid plan. All fees are non-refundable unless required by law. We use Paystack for payment processing.
            </p>

            <h2>Termination</h2>
            <p>
              We may suspend or terminate your access at any time. You may cancel your account at any time by contacting support.
            </p>

            <h2>Disclaimers</h2>
            <p>
              The Service is provided &quot;as is&quot; without warranties. We do not guarantee the Service will always be available or error-free.
            </p>

            <h2>Limitation of liability</h2>
            <p>
              To the maximum extent permitted by law, our liability is limited to amounts paid by you for the Service in the prior 12 months.
            </p>

            <h2>Governing law</h2>
            <p>
              These Terms are governed by the laws of the Federal Republic of Nigeria, with disputes resolved in Lagos courts.
            </p>

            <h2>Changes to the Terms</h2>
            <p>
              We may update these Terms and will publish the new effective date on this page.
            </p>

            <h2>Contact</h2>
            <p>
              Questions? Email <a href="mailto:legal@wastepickup.ng">legal@wastepickup.ng</a>.
            </p>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
