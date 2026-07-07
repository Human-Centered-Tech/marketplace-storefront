import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Account & Data Deletion — Catholic Owned",
  description:
    "How to delete your Catholic Owned account, or request deletion of specific data, from the app or by email.",
}

export default function AccountDeletionPage() {
  return (
    <main className="bg-white min-h-screen py-16 lg:py-24">
      <article className="max-w-3xl mx-auto px-6 lg:px-8 prose-content">
        <div className="mb-12">
          <p className="text-[#BE9B32] text-[11px] font-semibold uppercase tracking-[0.2em] mb-3">
            Your Data
          </p>
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-[#17294A] uppercase mb-3">
            Account &amp; Data Deletion
          </h1>
          <p className="text-sm text-[#44474e]">
            For the Catholic Owned app and catholicowned.com
          </p>
        </div>

        <Section title="Delete Your Account">
          <p>You can delete your Catholic Owned account at any time:</p>
          <ul>
            <li>
              <strong>In the Catholic Owned app:</strong> open the{" "}
              <strong>Menu</strong>, then choose{" "}
              <strong>Delete account</strong> and confirm. This works on both
              iOS and Android.
            </li>
            <li>
              <strong>By email:</strong> send a message to{" "}
              <a href="mailto:support@catholicowned.com">
                support@catholicowned.com
              </a>{" "}
              from the email address on your account with the subject
              &ldquo;Delete my account.&rdquo; We&rsquo;ll confirm and process
              the request.
            </li>
          </ul>
        </Section>

        <Section title="What Gets Deleted">
          <p>
            Deleting your account removes your profile, saved addresses,
            favorites, registries, messages, and sign-in credentials. Records
            we are legally required to keep — such as completed order and
            payment records — are retained only as long as tax and commercial
            law require, then removed.
          </p>
          <p>
            After deletion, your email address is held briefly to prevent
            accidental or malicious re-registration, then released.
          </p>
        </Section>

        <Section title="Request Deletion of Specific Data">
          <p>
            If you&rsquo;d like certain data deleted without closing your
            account — for example, your message history or saved addresses —
            email{" "}
            <a href="mailto:support@catholicowned.com">
              support@catholicowned.com
            </a>{" "}
            describing what you&rsquo;d like removed, and we&rsquo;ll take care
            of it.
          </p>
        </Section>

        <Section title="Questions">
          <p>
            See our{" "}
            <a href="/privacy">Privacy Policy</a> for full details on what we
            collect and how it&rsquo;s used, or contact{" "}
            <a href="mailto:support@catholicowned.com">
              support@catholicowned.com
            </a>
            .
          </p>
        </Section>
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
