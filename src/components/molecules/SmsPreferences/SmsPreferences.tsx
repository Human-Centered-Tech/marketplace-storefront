"use client"

import { useState } from "react"
import { Button, Card } from "@/components/atoms"
import { Divider, Heading } from "@medusajs/ui"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import {
  SmsPreferences as SmsPreferencesType,
  updateSmsPreferences,
} from "@/lib/data/sms-preferences"

/**
 * Marketing-SMS consent (punchlist b716) — the settings-page section the
 * privacy policy §5 promises ("you opt in separately via a consent box in your
 * account settings").
 *
 * All three elements live on ONE screen on purpose: the phone field, the
 * consent checkbox, and the complete carrier disclosure. This is exactly what
 * an A2P 10DLC reviewer screenshots, and a disclosure behind a modal or a
 * second step reads as missing (Twilio rejection 7/21, error 30909).
 *
 * The box is UNCHECKED by default and never pre-checked from any other signal.
 * Event-reminder consent (networking_rsvp.sms_opt_in) is a separate, per-event
 * consent and must never seed this one.
 *
 * The disclosure copy is the RSVP wording verbatim (storefront dcc33fc /
 * mobile bf9aaf0) with "attendance" → "using Catholic Owned", because the
 * wording has to match the registered campaign. Don't hand-edit one copy of
 * it — change all three or none.
 */
export const SmsPreferences = ({
  preferences,
}: {
  preferences: SmsPreferencesType
}) => {
  const [optIn, setOptIn] = useState(preferences.sms_marketing_opt_in)
  const [phone, setPhone] = useState(preferences.phone || "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [suppressed, setSuppressed] = useState(preferences.carrier_suppressed)

  const save = async () => {
    setSaving(true)
    setError(null)
    setSaved(false)
    const res = await updateSmsPreferences({ optIn, phone: phone.trim() })
    setSaving(false)
    if (!res.ok) {
      setError(res.error)
      return
    }
    setOptIn(res.preferences.sms_marketing_opt_in)
    setPhone(res.preferences.phone || "")
    // Recomputed server-side against the number that was just saved, so
    // switching to a different number clears the warning with it.
    setSuppressed(res.preferences.carrier_suppressed)
    setSaved(true)
  }

  return (
    <>
      <Card className="bg-secondary p-4 flex justify-between items-center mt-8">
        <Heading level="h2" className="heading-sm uppercase">
          Text messages
        </Heading>
      </Card>
      <Card className="p-0">
        {/* Consent and deliverability are different things, and this is the
            case where they disagree: the user texted STOP, so the carrier
            blocks this number no matter what this page says. Ticking the box
            again cannot fix it — only texting START can — so saying so here is
            the difference between "we're texting you" and silence the user
            can't explain. */}
        {suppressed && (
          <>
            {/* bg-warning-secondary is the light surface token; the primary
                warning color is a solid yellow meant for fills, and the
                opacity-modifier form doesn't work on these rgba(var(--x))
                values. */}
            <div className="p-4 bg-warning-secondary">
              <p className="label-md text-primary font-semibold mb-1">
                Your carrier is blocking texts to this number
              </p>
              <p className="label-md text-secondary">
                STOP was texted from this number, so your mobile carrier won&apos;t
                deliver our messages — turning the setting back on here
                isn&apos;t enough on its own. To start receiving them again,
                text <strong>START</strong> from that phone to the number our
                messages came from.
              </p>
            </div>
            <Divider />
          </>
        )}
        <div className="p-4">
          <label
            htmlFor="sms-marketing-phone"
            className="label-md text-secondary block mb-2"
          >
            Mobile number
          </label>
          <input
            id="sms-marketing-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value)
              setSaved(false)
            }}
            placeholder="(555) 123-4567"
            className="w-full max-w-sm px-[16px] py-[12px] border rounded-sm bg-component-secondary focus:border-primary focus:outline-none focus:ring-0"
          />
          <p className="label-md text-secondary mt-2">
            This is the same number we use for event reminders you&apos;ve
            asked for.
          </p>
        </div>
        <Divider />
        <div className="p-4">
          <label className="flex items-start gap-3 text-sm text-secondary leading-relaxed cursor-pointer">
            <input
              type="checkbox"
              checked={optIn}
              onChange={(e) => {
                setOptIn(e.target.checked)
                setSaved(false)
              }}
              className="mt-1 shrink-0 w-[18px] h-[18px]"
            />
            {/* Full carrier disclosure — A2P 10DLC reviewers require
                frequency, rates, STOP, HELP, the not-a-condition clause and a
                privacy link on the consent line itself. */}
            <span>
              I agree to receive marketing text messages from Catholic Owned®
              at the number provided, such as occasional updates and new
              curated guides. Message frequency varies. Msg &amp; data rates
              may apply. Reply STOP to opt out or HELP for help. Consent is not
              a condition of using Catholic Owned. See our{" "}
              <LocalizedClientLink
                href="/privacy"
                className="underline hover:text-primary"
              >
                Privacy Policy
              </LocalizedClientLink>
              .
            </span>
          </label>
        </div>
        <Divider />
        <div className="p-4 flex items-center gap-4 flex-wrap">
          <Button
            onClick={save}
            disabled={saving}
            className="uppercase font-semibold"
          >
            {saving ? "Saving…" : "Save preferences"}
          </Button>
          {error && <p className="label-md text-negative">{error}</p>}
          {saved && !error && (
            <p className="label-md text-secondary">
              {optIn
                ? "Saved — you'll receive marketing texts at this number."
                : "Saved — you won't receive marketing texts."}
            </p>
          )}
          {preferences.sms_marketing_opt_in && !saved && (
            <p className="label-md text-secondary">
              Opted in
              {preferences.sms_marketing_opt_in_at
                ? ` on ${new Date(
                    preferences.sms_marketing_opt_in_at
                  ).toLocaleDateString()}`
                : ""}
              .
            </p>
          )}
        </div>
        <Divider />
        <div className="p-4">
          <p className="label-md text-secondary">
            Marketing texts are separate from event reminders. Turning this off
            does not stop reminders for events you&apos;ve RSVP&apos;d to, and
            never affects order or shipping notifications.
          </p>
        </div>
      </Card>
    </>
  )
}
