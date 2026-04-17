import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service — Catholic Owned",
  description:
    "The terms and conditions governing use of the Catholic Owned marketplace and Business Directory.",
}

const UPDATED_DATE = "April 17, 2026"

export default function TermsPage() {
  return (
    <main className="bg-white min-h-screen py-16 lg:py-24">
      <article className="max-w-3xl mx-auto px-6 lg:px-8">
        <div className="mb-12">
          <p className="text-[#BE9B32] text-[11px] font-semibold uppercase tracking-[0.2em] mb-3">
            Terms of Service
          </p>
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-[#17294A] uppercase mb-3">
            Terms of Service
          </h1>
          <p className="text-sm text-[#44474e]">Last updated: {UPDATED_DATE}</p>
        </div>

        <Section title="1. Acceptance of Terms">
          <p>
            By accessing or using Catholic Owned (the &ldquo;Service&rdquo;),
            you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;).
            If you do not agree, do not use the Service.
          </p>
          <p>
            These Terms form a legal agreement between you and Catholic Owned,
            Inc. (&ldquo;Catholic Owned,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;).
          </p>
        </Section>

        <Section title="2. Eligibility">
          <p>
            You must be at least 18 years old (or the age of majority in your
            jurisdiction) to create an account. By registering you represent
            that you meet this requirement and that the information you
            provide is accurate.
          </p>
        </Section>

        <Section title="3. Your Account">
          <p>
            You&rsquo;re responsible for keeping your login credentials secure
            and for all activity under your account. Notify us immediately at{" "}
            <a href="mailto:security@catholicowned.com">
              security@catholicowned.com
            </a>{" "}
            if you suspect unauthorized use.
          </p>
        </Section>

        <Section title="4. Using the Marketplace (Buyers)">
          <p>
            When you buy products or services on Catholic Owned, you enter
            into a contract directly with the selling vendor. Catholic Owned
            facilitates the transaction but is not party to it. Questions
            about products, delivery, or returns should go to the vendor
            first; we&rsquo;re happy to help mediate if needed.
          </p>
          <p>
            You agree not to use the Service to: purchase items for resale
            fraud, dispute legitimate charges without cause, harass vendors,
            or violate any applicable law.
          </p>
        </Section>

        <Section title="5. Selling on Catholic Owned (Vendors)">
          <p>
            Selling on the marketplace requires an active Business Directory
            subscription (Verified, Featured, or Enterprise tier) and
            verification of your business as Catholic-owned or
            Catholic-aligned.
          </p>
          <p>As a vendor, you agree to:</p>
          <ul>
            <li>List only products or services you have the legal right to sell</li>
            <li>Accurately describe your products, including condition, materials, and origin</li>
            <li>Respond to customer messages within 2 business days</li>
            <li>Ship orders within the shipping window you specify on your storefront</li>
            <li>Honor your stated return policy</li>
            <li>Not list products that conflict with Catholic moral teaching</li>
          </ul>
          <p>
            We reserve the right to remove listings, suspend accounts, or
            terminate vendors who fail to meet these standards.
          </p>
        </Section>

        <Section title="6. Subscriptions and Payments">
          <p>
            Directory subscriptions are billed annually in advance and
            auto-renew unless cancelled before the renewal date. Marketplace
            commissions are deducted from each sale; the net payout is
            transferred to your Stripe Connect account per the schedule
            disclosed during vendor onboarding.
          </p>
          <p>
            All prices are in U.S. dollars unless otherwise noted. We may
            change subscription prices with at least 30 days&rsquo; notice;
            changes take effect at your next renewal.
          </p>
        </Section>

        <Section title="7. Content You Post">
          <p>
            You retain ownership of content you post (product listings,
            images, messages, reviews). You grant Catholic Owned a worldwide,
            non-exclusive, royalty-free license to use, display, and
            distribute that content as necessary to operate the Service.
          </p>
          <p>You represent that your content:</p>
          <ul>
            <li>Is yours to post, or you have permission from the rightsholder</li>
            <li>Does not infringe any trademark, copyright, or other right</li>
            <li>Is not defamatory, misleading, or illegal</li>
            <li>Is consistent with Catholic moral and ethical principles</li>
          </ul>
        </Section>

        <Section title="8. Prohibited Uses">
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to any account or system</li>
            <li>Scrape, crawl, or extract data beyond what public search exposes</li>
            <li>Transmit viruses, malware, or any other harmful code</li>
            <li>Interfere with the normal operation of the Service</li>
            <li>Impersonate another person or business</li>
          </ul>
        </Section>

        <Section title="9. Intellectual Property">
          <p>
            &ldquo;Catholic Owned&rdquo; and &ldquo;The New Catholic
            Economy&rdquo; are registered trademarks. The Service&rsquo;s
            design, code, and original content are owned by Catholic Owned or
            its licensors and are protected by copyright and other
            intellectual property laws.
          </p>
        </Section>

        <Section title="10. Termination">
          <p>
            We may suspend or terminate your account at any time for violation
            of these Terms. You may close your account at any time from your
            account settings. Surviving your account&rsquo;s termination: any
            payment obligations, these Terms&rsquo; dispute-resolution
            clauses, and our respective intellectual property rights.
          </p>
        </Section>

        <Section title="11. Disclaimers and Limitation of Liability">
          <p>
            The Service is provided &ldquo;as is&rdquo; and &ldquo;as
            available&rdquo; without warranty of any kind, express or implied.
            Catholic Owned disclaims all warranties to the fullest extent
            permitted by law.
          </p>
          <p>
            To the fullest extent allowed by law, Catholic Owned&rsquo;s
            aggregate liability to you for any claim arising out of or
            relating to the Service is limited to the greater of (a) $100 or
            (b) the amount you paid us in the 12 months preceding the claim.
          </p>
        </Section>

        <Section title="12. Dispute Resolution">
          <p>
            These Terms are governed by the laws of the United States and the
            state in which Catholic Owned is headquartered. Any dispute
            arising out of or relating to the Service or these Terms shall be
            resolved first through good-faith negotiation, and if unresolved,
            through binding arbitration in that jurisdiction.
          </p>
        </Section>

        <Section title="13. Changes to These Terms">
          <p>
            We may update these Terms from time to time. For material changes,
            we&rsquo;ll notify you by email and/or a prominent notice on the
            Service at least 14 days before they take effect. Continued use
            after that constitutes acceptance of the updated Terms.
          </p>
        </Section>

        <Section title="14. Contact">
          <p>
            Questions about these Terms? Email{" "}
            <a href="mailto:legal@catholicowned.com">
              legal@catholicowned.com
            </a>
            .
          </p>
        </Section>

        <div className="mt-16 pt-6 border-t border-[#d6d0c4]/40 text-xs text-[#44474e] italic">
          This document is a starter agreement drafted for Catholic Owned.
          It should be reviewed by qualified counsel before launch.
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
