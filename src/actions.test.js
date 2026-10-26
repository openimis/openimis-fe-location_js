import { describe, expect, it, vi } from "vitest";

// The fe-core barrel cannot be loaded from a test: graphql is replaced by a
// stub that returns its arguments, so the action's meta can be inspected.
vi.mock("@openimis/fe-core", () => ({
  graphql: (payload, type, params) => ({ payload, type, params }),
  graphqlWithVariables: (operation, variables, type, params) => ({ operation, variables, type, params }),
  formatQuery: () => "",
  formatPageQuery: () => "",
  formatPageQueryWithCount: () => "",
  formatMutation: () => "",
  formatGQLString: (s) => s,
  formatJsonField: (s) => s,
  decodeId: (id) => id,
}));

const { fetchLocations } = await import("./actions");

const LEVELS = ["R", "D", "W", "V"];

describe("fetchLocations", () => {
  it.each([1, 2, 3])("tags the level %i request with its parent, so a stale response can be dropped", (level) => {
    const action = fetchLocations(LEVELS, level, { uuid: "parent-uuid" });

    expect(action.type).toBe(`LOCATION_LOCATIONS_${level}`);
    expect(action.params).toEqual({ parentUuid: "parent-uuid" });
  });
});
