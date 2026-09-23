/**
 * Two-stream pagination for directory searches that use geo.
 *
 * Algolia drops every record without `_geoloc` from an aroundLatLng query —
 * online-only businesses with no street address, including paying members
 * (Quaestor, 9/22). So whenever we search by location we also query
 * `has_geoloc:false` without geo and merge the two result streams.
 *
 * The index ranks by desc(rank_weight) (tier) ahead of geo, so merging by
 * rank_weight reproduces the order Algolia would give if those records were
 * never dropped. Within a tier the located stream wins ties: nearby
 * businesses first, then the online-only ones that serve the area.
 */

export type RankedHit = { objectID: string; rank_weight?: number | null }

export type StreamState<H> = {
  buffer: H[]
  // Next Algolia page to fetch for this stream.
  nextPage: number
  exhausted: boolean
  nbHits: number
}

export type MergeState<H> = { geo: StreamState<H>; noGeo: StreamState<H> }

export const emptyStream = <H>(): StreamState<H> => ({
  buffer: [],
  nextPage: 0,
  exhausted: false,
  nbHits: 0,
})

/** Streams whose buffer can't fill the next page and still have pages left. */
export function streamsNeedingFetch<H>(
  state: MergeState<H>,
  pageSize: number
): Array<"geo" | "noGeo"> {
  return (["geo", "noGeo"] as const).filter(
    (k) => !state[k].exhausted && state[k].buffer.length < pageSize
  )
}

/** Fold one fetched Algolia page into a stream. Returns a new stream. */
export function applyPage<H>(
  stream: StreamState<H>,
  result: { hits: H[]; nbHits?: number; nbPages?: number }
): StreamState<H> {
  const hits = result.hits ?? []
  const nextPage = stream.nextPage + 1
  return {
    buffer: [...stream.buffer, ...hits],
    nextPage,
    // nbPages, not nbHits, is the end of the road (Algolia's pagination cap);
    // an empty page is the belt-and-braces terminator.
    exhausted: nextPage >= (result.nbPages ?? 0) || hits.length === 0,
    nbHits: result.nbHits ?? stream.nbHits,
  }
}

const weight = (h: RankedHit) => Number(h.rank_weight ?? -1)

/** Take up to `pageSize` hits in merged order. Returns the page + new state. */
export function takeMerged<H extends RankedHit>(
  state: MergeState<H>,
  pageSize: number
): { page: H[]; state: MergeState<H> } {
  const geo = [...state.geo.buffer]
  const noGeo = [...state.noGeo.buffer]
  const page: H[] = []
  while (page.length < pageSize && (geo.length || noGeo.length)) {
    if (!noGeo.length) page.push(geo.shift()!)
    else if (!geo.length) page.push(noGeo.shift()!)
    else page.push(weight(noGeo[0]) > weight(geo[0]) ? noGeo.shift()! : geo.shift()!)
  }
  return {
    page,
    state: {
      geo: { ...state.geo, buffer: geo },
      noGeo: { ...state.noGeo, buffer: noGeo },
    },
  }
}

export const mergeHasMore = <H>(state: MergeState<H>) =>
  !!(
    state.geo.buffer.length ||
    state.noGeo.buffer.length ||
    !state.geo.exhausted ||
    !state.noGeo.exhausted
  )

export const mergeTotal = <H>(state: MergeState<H>) =>
  state.geo.nbHits + state.noGeo.nbHits
