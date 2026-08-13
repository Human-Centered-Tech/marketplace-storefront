// NOT a "use server" module — deliberately.
//
// networking.ts carries the "use server" directive, and Next only allows
// async-function exports from such files: exporting this const from there
// fails the production build ("Only async functions are allowed to be
// exported in a 'use server' file") even though tsc is perfectly happy.
// The sentinel lives here so both the server actions and the page can share
// it.

/**
 * A featured (members-only) event fetched while signed out. The backend
 * answers 401 `sign_in_required` with no event data, so the page shows a
 * "sign in to view" interstitial instead of a dead-end 404 — invites go out
 * by email, and logged-out recipients used to bounce off "Event not found".
 */
export const EVENT_GATED = "gated" as const
export type EventGated = typeof EVENT_GATED
