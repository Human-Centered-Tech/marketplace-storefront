import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy — Catholic Owned",
  description:
    "How Catholic Owned collects, uses, and protects your personal information.",
}

const UPDATED_DATE = "April 17, 2026"

export default function PrivacyPage() {
  return (
    <main className="bg-white min-h-screen py-16 lg:py-24">
      <article className="max-w-3xl mx-auto px-6 lg:px-8 prose-content">
        <div className="mb-12">
          <p className="text-[#BE9B32] text-[11px] font-semibold uppercase tracking-[0.2em] mb-3">
            Privacy Policy
          </p>
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-[#17294A] uppercase mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm text-[#44474e]">Last updated: {UPDATED_DATE}</p>
        </div>

        <Section title="1. Introduction">
          <p>
            Catholic Owned (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
            &ldquo;our&rdquo;) operates the catholicowned.com marketplace and
            Business Directory. This Privacy Policy explains what personal
            information we collect, how we use it, and the choices you have.
          </p>
          <p>
            By using our services, you agree to the collection and use of
            information as described below. If you do not agree, please do not
            use our services.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <p>
            <strong>Information you provide:</strong> Account information (name,
            email, password), billing and shipping addresses, payment method
            details (handled by Stripe — we never see your full card number),
            business information if you sell on the platform, content you
            post, and messages you send to other users.
          </p>
          <p>
            <strong>Information collected automatically:</strong> IP address,
            device and browser information, pages viewed, referring URLs, and
            interactions with the platform. We use this for analytics, fraud
            prevention, and improving the service.
          </p>
          <p>
            <strong>From third parties:</strong> If you sign in via Google,
            Apple, or another identity provider, we receive the profile
            information you authorize them to share (typically name, email, and
            profile image).
          </p>
        </Section>

        <Section title="3. How We Use Your Information">
          <ul>
            <li>To create and manage your account</li>
            <li>To process orders, payments, and subscriptions</li>
            <li>To deliver transactional emails (receipts, shipping updates, payment notices)</li>
            <li>To send marketing emails (only if you&rsquo;ve opted in)</li>
            <li>To enable messaging between buyers, vendors, and directory listings</li>
            <li>To verify Catholic-owned business status</li>
            <li>To improve the platform and detect fraud or abuse</li>
            <li>To comply with legal obligations</li>
          </ul>
        </Section>

        <Section title="4. How We Share Your Information">
          <p>
            <strong>With vendors:</strong> When you place an order, we share
            the information the vendor needs to fulfill it (name, shipping
            address, order contents).
          </p>
          <p>
            <strong>With service providers:</strong> We use vetted third-party
            services to run the platform, including Stripe (payments), Resend
            (transactional email), SendGrid (marketing email, if you&rsquo;ve
            opted in), and analytics providers. Each operates under a data
            processing agreement limiting their use of your information to the
            purposes we specify.
          </p>
          <p>
            <strong>For legal reasons:</strong> We may disclose information if
            required by law, subpoena, or to protect our rights, users, or the
            public.
          </p>
          <p>
            <strong>We do not sell your personal information.</strong>
          </p>
        </Section>

        <Section title="5. Cookies and Tracking">
          <p>
            We use cookies to keep you signed in, remember your cart, and
            understand how the platform is used. You can disable cookies in
            your browser settings, though parts of the site may not work
            correctly without them.
          </p>
        </Section>

        <Section title="6. Your Rights">
          <p>Depending on where you live, you may have the right to:</p>
          <ul>
            <li>Access the personal information we hold about you</li>
            <li>Correct inaccurate information</li>
            <li>Delete your account and associated data</li>
            <li>Opt out of marketing emails (use the unsubscribe link in any marketing email)</li>
            <li>Export your data in a portable format</li>
          </ul>
          <p>
            To exercise any of these rights, email us at{" "}
            <a href="mailto:privacy@catholicowned.com" className="text-[#BE9B32] underline">
              privacy@catholicowned.com
            </a>
            .
          </p>
        </Section>

        <Section title="7. Data Retention">
          <p>
            We retain your account information for as long as your account is
            active and for a reasonable period afterward, or as required to
            meet legal or accounting obligations. Order and transaction
            records are retained as required by tax and commercial law.
          </p>
        </Section>

        <Section title="8. Security">
          <p>
            We use industry-standard measures to protect your data — TLS
            encryption in transit, secure databases, and limited internal
            access. No system is perfectly secure, and we cannot guarantee
            absolute protection against unauthorized access. If you believe
            your account has been compromised, email{" "}
            <a href="mailto:security@catholicowned.com" className="text-[#BE9B32] underline">
              security@catholicowned.com
            </a>{" "}
            immediately.
          </p>
        </Section>

        <Section title="9. Children&rsquo;s Privacy">
          <p>
            Catholic Owned is not directed at children under 13. We do not
            knowingly collect personal information from children. If you
            believe we have inadvertently collected such information, contact
            us and we&rsquo;ll delete it.
          </p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>
            We may update this policy from time to time. When we do,
            we&rsquo;ll update the &ldquo;last updated&rdquo; date at the top
            and, for material changes, notify you by email or a prominent
            notice on the platform.
          </p>
        </Section>

        <Section title="11. Contact Us">
          <p>
            Questions about this Privacy Policy? Email{" "}
            <a href="mailto:privacy@catholicowned.com" className="text-[#BE9B32] underline">
              privacy@catholicowned.com
            </a>
            .
          </p>
        </Section>

        <div className="mt-16 pt-6 border-t border-[#d6d0c4]/40 text-xs text-[#44474e] italic">
          This document is a starter policy drafted for Catholic Owned.
          It should be reviewed by qualified counsel before launch to ensure
          compliance with applicable laws (GDPR, CCPA/CPRA, state-specific
          requirements, etc.).
        </div>
      </article>
    </main>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-10">
      <h2 className="font-serif text-xl lg:text-2xl font-bold text-[#17294A] mb-4">
        {title}
      </h2>
      <div className="space-y-4 text-[15px] leading-relaxed text-[#44474e] [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_a]:text-[#BE9B32] [&_a]:underline">
        {children}
      </div>
    </section>
  )
}
