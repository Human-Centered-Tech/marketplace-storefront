"use client"

import { useState, useTransition } from "react"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import {
  NetworkingContactExchange,
  NetworkingEvent,
  NetworkingRSVP,
  NetworkingSubscription,
} from "@/types/networking"
import {
  cancelNetworkingSubscription,
  respondToContactExchange,
  subscribeToNetworking,
} from "@/lib/data/networking"

type Props = {
  currentUserId: string
  subscription: NetworkingSubscription | null
  rsvps: NetworkingRSVP[]
  contacts: NetworkingContactExchange[]
  upcomingEvents: NetworkingEvent[]
}

export const NetworkingDashboard = ({
  subscription,
  rsvps,
  contacts,
  upcomingEvents,
  currentUserId,
}: Props) => {
  const [sub, setSub] = useState(subscription)
  const [contactList, setContactList] = useState(contacts)
  const [pending, startTransition] = useTransition()

  const isActive = sub?.status === "active" || sub?.status === "gifted"

  // Partition RSVPs into upcoming vs past based on the event date we
  // can't see from the RSVP alone; use created_at as a proxy for now.
  const rsvpByEventId = new Map(rsvps.map((r) => [r.event_id, r]))

  const myUpcomingEvents = upcomingEvents.filter((e) => {
    const d = new Date(e.event_date)
    return d.getTime() >= Date.now()
  })

  const handleSubscribe = (plan: "monthly" | "annual") => {
    startTransition(async () => {
      const result = await subscribeToNetworking(plan)
      if (result?.checkout_url) {
        window.location.href = result.checkout_url
      } else if (result?.subscription) {
        setSub(result.subscription)
      }
    })
  }

  const handleCancel = () => {
    if (!sub) return
    if (!confirm("Cancel your networking subscription at end of period?")) return
    startTransition(async () => {
      const res = await cancelNetworkingSubscription(sub.id)
      if (res) {
        setSub({ ...sub, status: "cancelled" })
      }
    })
  }

  const handleContactConsent = (contactId: string, consent: boolean) => {
    startTransition(async () => {
      const updated = await respondToContactExchange(contactId, consent)
      if (updated) {
        setContactList((prev) =>
          prev.map((c) => (c.id === contactId ? updated : c))
        )
      }
    })
  }

  return (
    <div className="space-y-8">
      {/* Subscription status */}
      <section className="border border-[#d6d0c4]/40 rounded-xl bg-white p-6">
        <h2 className="font-serif text-xl font-semibold text-[#17294A] mb-4">
          Subscription
        </h2>

        {isActive && sub ? (
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#BE9B32]">
                {sub.plan === "annual" ? "Annual Member" : "Monthly Member"}
              </p>
              <p className="font-serif text-lg text-[#17294A] mt-1">
                {sub.plan === "annual" ? "$250 / year" : "$25 / month"}
              </p>
              <p className="text-xs text-secondary mt-2">
                Renews {new Date(sub.ends_at).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={handleCancel}
              disabled={pending}
              className="text-xs text-secondary hover:text-red-600 underline"
            >
              Cancel subscription
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-secondary">
              Subscribe to join Catholic Speed Networking events and connect with
              faithful professionals.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => handleSubscribe("monthly")}
                disabled={pending}
                className="border border-[#17294A] rounded-lg p-4 text-left hover:bg-[#faf9f5] transition-colors disabled:opacity-50"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#BE9B32]">
                  Monthly
                </p>
                <p className="font-serif text-lg text-[#17294A] mt-1">
                  $25 / month
                </p>
                <p className="text-xs text-secondary mt-1">
                  Cancel anytime
                </p>
              </button>
              <button
                onClick={() => handleSubscribe("annual")}
                disabled={pending}
                className="border-2 border-[#BE9B32] rounded-lg p-4 text-left hover:bg-[#BE9B32]/5 transition-colors disabled:opacity-50"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#BE9B32]">
                  Annual (save 17%)
                </p>
                <p className="font-serif text-lg text-[#17294A] mt-1">
                  $250 / year
                </p>
                <p className="text-xs text-secondary mt-1">
                  Includes 2 gift subs
                </p>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Upcoming events */}
      <section className="border border-[#d6d0c4]/40 rounded-xl bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl font-semibold text-[#17294A]">
            Upcoming Events
          </h2>
          <LocalizedClientLink
            href="/networking"
            className="text-xs text-[#BE9B32] underline"
          >
            Browse all
          </LocalizedClientLink>
        </div>
        {myUpcomingEvents.length === 0 ? (
          <p className="text-sm text-secondary italic">
            No upcoming events scheduled. Check back soon.
          </p>
        ) : (
          <ul className="divide-y divide-[#d6d0c4]/30">
            {myUpcomingEvents.map((event) => {
              const rsvp = rsvpByEventId.get(event.id)
              return (
                <li key={event.id} className="py-4 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="font-serif text-base font-semibold text-[#17294A]">
                      {event.title}
                    </h3>
                    <p className="text-xs text-secondary mt-1">
                      {new Date(event.event_date).toLocaleString([], {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}{" "}
                      &middot; {event.duration_minutes} min
                    </p>
                  </div>
                  {rsvp?.status === "confirmed" ? (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                      RSVP&rsquo;d
                    </span>
                  ) : (
                    <LocalizedClientLink
                      href={`/networking/${event.id}`}
                      className="text-xs font-semibold text-[#17294A] border border-[#17294A] rounded-lg px-4 py-2 hover:bg-[#17294A] hover:text-white transition-colors"
                    >
                      RSVP
                    </LocalizedClientLink>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Contacts */}
      <section className="border border-[#d6d0c4]/40 rounded-xl bg-white p-6">
        <h2 className="font-serif text-xl font-semibold text-[#17294A] mb-4">
          Contact Exchanges
        </h2>
        {contactList.length === 0 ? (
          <p className="text-sm text-secondary italic">
            No contact exchanges yet. After attending an event you can request
            to connect with other participants.
          </p>
        ) : (
          <ul className="divide-y divide-[#d6d0c4]/30">
            {contactList.map((c) => {
              const isIncoming = c.recipient_id === currentUserId
              const needsResponse =
                isIncoming && c.status === "pending" && !c.recipient_consent
              const otherParty = isIncoming ? c.requester_id : c.recipient_id
              return (
                <li key={c.id} className="py-4 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-medium text-sm text-[#17294A]">
                      {otherParty.slice(0, 16)}&hellip;
                    </p>
                    <p className="text-xs text-secondary">
                      {isIncoming ? "Wants to connect" : "You requested"} &middot;{" "}
                      {c.status}
                    </p>
                  </div>
                  {needsResponse && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleContactConsent(c.id, true)}
                        disabled={pending}
                        className="text-xs font-semibold bg-[#17294A] text-white px-3 py-1.5 rounded-lg disabled:opacity-50"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleContactConsent(c.id, false)}
                        disabled={pending}
                        className="text-xs font-semibold text-secondary border border-[#d6d0c4] px-3 py-1.5 rounded-lg disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                  {c.status === "mutual" && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                      Connected
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
