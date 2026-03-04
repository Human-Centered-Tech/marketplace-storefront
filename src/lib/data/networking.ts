import { NetworkingEvent } from "@/types/networking"
import { sdk } from "../config"

export const listNetworkingEvents = async (params?: {
  status?: string
  limit?: number
  offset?: number
}) => {
  return sdk.client
    .fetch<{
      events: NetworkingEvent[]
      count: number
    }>("/store/networking/events", {
      query: params as Record<string, string | number>,
      cache: "no-cache",
    })
    .catch(() => ({ events: [], count: 0 }))
}

export const getNetworkingEvent = async (id: string) => {
  return sdk.client
    .fetch<{ event: NetworkingEvent }>(`/store/networking/events/${id}`, {
      cache: "no-cache",
    })
    .then(({ event }) => event)
    .catch(() => null)
}
