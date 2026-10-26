import { describe, expect, it, vi } from "vitest";

// The fe-core barrel cannot be loaded from a test: only what the reducer uses.
vi.mock("@openimis/fe-core", () => ({
  formatServerError: (payload) => payload,
  formatGraphQLError: () => null,
  parseData: (data) => data.edges.map((edge) => edge.node),
  pageInfo: (data) => data.pageInfo,
  dispatchMutationReq: (state) => state,
  dispatchMutationResp: (state) => state,
  dispatchMutationErr: (state) => state,
}));

const { default: reducer } = await import("./reducer");

const locations = (...codes) => ({ data: { locations: { edges: codes.map((code) => ({ node: { code } })) } } });

describe.each([
  [1, "l1s", "fetchingL1s"],
  [2, "l2s", "fetchingL2s"],
  [3, "l3s", "fetchingL3s"],
])("LOCATION_LOCATIONS_%i", (level, list, fetching) => {
  const type = `LOCATION_LOCATIONS_${level}`;
  const req = (parentUuid) => ({ type: `${type}_REQ`, meta: { parentUuid } });
  const resp = (parentUuid, ...codes) => ({ type: `${type}_RESP`, meta: { parentUuid }, payload: locations(...codes) });

  it("ignores a response for a parent that is no longer selected", () => {
    let state = reducer(undefined, { type: "@@INIT" });
    state = reducer(state, req("first-parent"));
    state = reducer(state, req("second-parent"));
    state = reducer(state, resp("second-parent", "SECOND-CHILD"));
    state = reducer(state, resp("first-parent", "FIRST-CHILD-1", "FIRST-CHILD-2"));

    expect(state[list].map((l) => l.code)).toEqual(["SECOND-CHILD"]);
  });

  it("keeps waiting for the selected parent when a superseded response arrives first", () => {
    let state = reducer(undefined, { type: "@@INIT" });
    state = reducer(state, req("first-parent"));
    state = reducer(state, req("second-parent"));
    state = reducer(state, resp("first-parent", "FIRST-CHILD"));

    expect(state[list]).toEqual([]);
    expect(state[fetching]).toBe(true);

    state = reducer(state, resp("second-parent", "SECOND-CHILD"));
    expect(state[list].map((l) => l.code)).toEqual(["SECOND-CHILD"]);
    expect(state[fetching]).toBe(false);
  });

  it("ignores an error for a parent that is no longer selected", () => {
    let state = reducer(undefined, { type: "@@INIT" });
    state = reducer(state, req("first-parent"));
    state = reducer(state, req("second-parent"));
    state = reducer(state, { type: `${type}_ERR`, meta: { parentUuid: "first-parent" }, payload: { message: "x" } });

    expect(state[fetching]).toBe(true);
    expect(state[`error${list.charAt(0).toUpperCase()}${list.slice(1)}`]).toBeNull();
  });

  it("accepts a response that carries no parent, as fetchLocationsStr sends", () => {
    let state = reducer(undefined, { type: "@@INIT" });
    state = reducer(state, { type: `${type}_REQ` });
    state = reducer(state, { type: `${type}_RESP`, payload: locations("ANY") });

    expect(state[list].map((l) => l.code)).toEqual(["ANY"]);
  });
});
