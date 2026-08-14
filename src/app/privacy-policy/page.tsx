import PublicShell from "@/src/components/public-shell";

export default function PrivacyPolicyPage() {
  return (
    <PublicShell>
      <section className="bg-slate-950 py-24 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Privacy</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tighter sm:text-5xl">Privacy Policy</h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">Last updated: August 12, 2025</p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-slate mx-auto max-w-3xl">
            <p>
              WastePickup (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the WastePickup platform (the &quot;Service&quot;), a waste management operations platform for Nigerian Private Service Providers (PSPs). This Privacy Policy explains how we collect, use, and protect your information.
            </p>

            <h2>Data we collect</h2>
            <p>When you use our Service, we may collect:</p>
            <ul>
              <li><strong>Account details:</strong> name, email, phone number, and company details.</li>
              <li><strong>Resident records:</strong> resident names, addresses, phone numbers, and schedules.</li>
              <li><strong>Usage data:</strong> route activity, pickup confirmations, and billing history.</li>
              <li><strong>Device data:</strong> IP address, browser type, and device identifiers.</li>
            </ul>

            <h2>How we use information</h2>
            <p>We use data to deliver the Service, manage accounts, send notifications, support payments, and improve product performance.</p>

            <h2>Sharing information</h2>
            <p>We do not sell your data. We may share information with:</p>
            <ul>
              <li><strong>Payment partners:</strong> like Paystack, solely to process transactions.</li>
              <li><strong>Service providers:</strong> vendors that support hosting, storage, and analytics.</li>
              <li><strong>Legal compliance:</strong> government or enforcement agencies when required by law.</li>
            </ul>

            <h2>Data retention</h2>
            <p>We retain your data while your account is active. You can request deletion of your account data by contacting support.</p>

            <h2>Your rights</h2>
            <ul>
              <li>Access and correct your account information.</li>
              <li>Request deletion of your organization data.</li>
              <li>Export your data in a portable format.</li>
            </ul>

            <h2>Security</h2>
            <p>We use TLS encryption for data in transit and industry-standard password hashing. We limit access to internal systems to authorized personnel only.</p>

            <h2>Policy changes</h2>
            <p>We may update this Privacy Policy. We will post the new date at the top of this page when changes are made.</p>

            <h2>Contact</h2>
            <p>If you have questions about privacy, email <a href="mailto:privacy@wastepickup.ng">privacy@wastepickup.ng</a>.</p>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
