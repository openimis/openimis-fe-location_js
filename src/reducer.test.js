import { describe, expect, it, vi } from "vitest";

// fe-core's barrel imports itself, so the real helpers come from their defining modules.
vi.mock("@openimis/fe-core", async () => vi.importActual("@openimis/fe-core/helpers/api"));

const { default: reducer } = await import("./reducer");
const { graphqlErrors, relayPage, serverError } = await import("@openimis/fe-core/testing");

const initial = () => reducer(undefined, { type: "@@INIT" });
const dispatch = (state, type, { payload, meta } = {}) => reducer(state, { type, payload, meta });
const respond = (state, type, data) => dispatch(state, `${type}_RESP`, { payload: { data } });
const fail = (state, type, payload = serverError(500, "Internal Server Error", "boom")) =>
  dispatch(state, `${type}_ERR`, { payload });

const SERVER_ERROR = { code: 500, message: "Internal Server Error", detail: "boom" };
const DATA_ERROR = { code: "Data error", message: "Server returned data error status", detail: "not permitted" };

const region = { uuid: "r-1", code: "R1", name: "Tahida" };
const otherRegion = { uuid: "r-2", code: "R2", name: "Ultha" };
const district = (uuid, parent) => ({ uuid, code: uuid.toUpperCase(), name: `District ${uuid}`, parent });
const location = (uuid) => ({ uuid, code: uuid.toUpperCase(), name: `Location ${uuid}` });
const hf = (code, loc = district("d-1", region)) => ({ uuid: `uuid-${code}`, code, name: `HF ${code}`, location: loc });

describe("location reducer", () => {
  describe("initialisation", () => {
    it("starts with nothing loaded and nothing in flight", () => {
      const state = initial();

      expect(state.submittingMutation).toBe(false);
      expect(state.mutation).toEqual({});
      expect(state.healthFacility).toBeNull();
      expect(state.healthFacilities).toBeNull();
      expect(state.healthFacilitiesPageInfo).toEqual({});
      expect([state.l0s, state.l1s, state.l2s, state.l3s]).toEqual([[], [], [], []]);
      expect([state.userL0s, state.userL1s, state.allL0s, state.allL1s]).toEqual([[], [], [], []]);
      expect(state.locationsByUuids).toEqual([]);
    });

    it("returns the same state object for an unrelated action", () => {
      const state = initial();

      expect(reducer(state, { type: "SOMETHING_ELSE" })).toBe(state);
    });
  });

  describe("the user's districts", () => {
    it("forgets the previous districts while the next ones load", () => {
      const loaded = { ...initial(), userL0s: [region], userL1s: [district("d-1", region)], fetchedUserLocation: true };

      expect(dispatch(loaded, "LOCATION_USER_DISTRICTS_REQ")).toMatchObject({
        userL0s: [],
        userL1s: [],
        fetchingUserLocation: true,
        fetchedUserLocation: false,
        errorUserLocation: null,
      });
    });

    it("derives the user's regions from the districts' parents, once each", () => {
      const districts = [district("d-1", region), district("d-2", region), district("d-3", otherRegion)];
      const state = respond(initial(), "LOCATION_USER_DISTRICTS", { userDistricts: districts });

      expect(state.userL1s).toEqual(districts);
      expect(state.userL0s).toEqual([region, otherRegion]);
      expect(state).toMatchObject({ fetchingUserLocation: false, fetchedUserLocation: true, errorUserLocation: null });
    });

    it("treats a missing district list as an empty one", () => {
      const state = respond(initial(), "LOCATION_USER_DISTRICTS", { userDistricts: null });

      expect(state.userL1s).toEqual([]);
      expect(state.userL0s).toEqual([]);
    });

    it("surfaces a data error", () => {
      const state = dispatch(initial(), "LOCATION_USER_DISTRICTS_RESP", {
        payload: { data: { userDistricts: [] }, ...graphqlErrors("not permitted") },
      });

      expect(state.errorUserLocation).toEqual(DATA_ERROR);
    });

    it("records a transport failure and stops fetching", () => {
      const loading = dispatch(initial(), "LOCATION_USER_DISTRICTS_REQ");

      expect(fail(loading, "LOCATION_USER_DISTRICTS")).toMatchObject({
        fetchingUserLocation: false,
        errorUserLocation: SERVER_ERROR,
      });
    });

    it("clears everything on request", () => {
      const loaded = respond(initial(), "LOCATION_USER_DISTRICTS", { userDistricts: [district("d-1", region)] });

      expect(dispatch(loaded, "LOCATION_USER_DISTRICTS_CLEAR")).toMatchObject({
        userL0s: [],
        userL1s: [],
        fetchingUserLocation: false,
        fetchedUserLocation: false,
        errorUserLocation: null,
      });
    });
  });

  describe("the user's health facility", () => {
    it("keeps the first facility and labels its location", () => {
      const state = respond(initial(), "LOCATION_USER_HEALTH_FACILITY_FULL_PATH", {
        healthFacilities: relayPage([hf("HF1"), hf("HF2")]),
      });

      expect(state.userHealthFacilityFullPath).toEqual(hf("HF1"));
      expect(state.userHealthFacilityLocationStr).toBe("D-1 District d-1");
    });

    it("has no location label when the facility has no location", () => {
      const state = respond(initial(), "LOCATION_USER_HEALTH_FACILITY_FULL_PATH", {
        healthFacilities: relayPage([{ ...hf("HF1"), location: null }]),
      });

      expect(state.userHealthFacilityLocationStr).toBeNull();
    });

    it("has neither facility nor label when none matched", () => {
      const state = respond(initial(), "LOCATION_USER_HEALTH_FACILITY_FULL_PATH", { healthFacilities: relayPage([]) });

      expect(state.userHealthFacilityFullPath).toBeUndefined();
      expect(state.userHealthFacilityLocationStr).toBeNull();
    });
  });

  describe("single-record health facility lookups", () => {
    const LOOKUPS = [
      ["full path", "LOCATION_HEALTH_FACILITY_FULL_PATH", "HealthFacilityFullPath", "healthFacilityFullPath"],
      ["edit form", "LOCATION_HEALTH_FACILITY", "HealthFacility", "healthFacility"],
    ];

    it.each(LOOKUPS)("forgets the previous %s facility while the next loads", (_label, type, suffix, field) => {
      const loaded = { ...initial(), [field]: hf("OLD"), [`fetched${suffix}`]: true, [`error${suffix}`]: "x" };

      expect(dispatch(loaded, `${type}_REQ`)).toMatchObject({
        [`fetching${suffix}`]: true,
        [`fetched${suffix}`]: false,
        [field]: null,
        [`error${suffix}`]: null,
      });
    });

    it.each(LOOKUPS)("keeps the first facility of the %s page", (_label, type, suffix, field) => {
      const state = respond(initial(), type, { healthFacilities: relayPage([hf("HF1"), hf("HF2")]) });

      expect(state[field]).toEqual(hf("HF1"));
      expect(state[`fetching${suffix}`]).toBe(false);
      expect(state[`fetched${suffix}`]).toBe(true);
      expect(state[`error${suffix}`]).toBeNull();
    });

    it.each(LOOKUPS)("surfaces a data error on the %s lookup", (_label, type, suffix) => {
      const state = dispatch(initial(), `${type}_RESP`, {
        payload: { data: { healthFacilities: relayPage([]) }, ...graphqlErrors("not permitted") },
      });

      expect(state[`error${suffix}`]).toEqual(DATA_ERROR);
    });

    it.each(LOOKUPS)("records a transport failure on the %s lookup", (_label, type, suffix) => {
      const state = fail(dispatch(initial(), `${type}_REQ`), type);

      expect(state[`fetching${suffix}`]).toBe(false);
      expect(state[`error${suffix}`]).toEqual(SERVER_ERROR);
    });

    it("clears the facility being edited", () => {
      const loaded = respond(initial(), "LOCATION_HEALTH_FACILITY", { healthFacilities: relayPage([hf("HF1")]) });

      expect(dispatch(loaded, "LOCATION_HEALTH_FACILITY_CLEAR")).toMatchObject({
        fetchingHealthFacility: false,
        fetchedHealthFacility: false,
        healthFacility: null,
        errorHealthFacility: null,
      });
    });
  });

  describe("health facility search", () => {
    it("empties the list and zeroes the count while a search runs", () => {
      const loaded = { ...initial(), healthFacilities: [hf("HF1")], healthFacilitiesPageInfo: { totalCount: 1 } };

      expect(dispatch(loaded, "LOCATION_HEALTH_FACILITY_SEARCHER_REQ")).toMatchObject({
        fetchingHealthFacilities: true,
        fetchedHealthFacilities: false,
        healthFacilities: null,
        healthFacilitiesPageInfo: { totalCount: 0 },
        errorHealthFacilities: null,
      });
    });

    it("stores the page and its paging info", () => {
      const state = respond(initial(), "LOCATION_HEALTH_FACILITY_SEARCHER", {
        healthFacilities: relayPage([hf("HF1"), hf("HF2")], { totalCount: 12, pageInfo: { hasNextPage: true } }),
      });

      expect(state.healthFacilities).toEqual([hf("HF1"), hf("HF2")]);
      expect(state.healthFacilitiesPageInfo).toMatchObject({ totalCount: 12, hasNextPage: true });
      expect(state).toMatchObject({ fetchingHealthFacilities: false, fetchedHealthFacilities: true });
    });

    it("surfaces a data error", () => {
      const state = dispatch(initial(), "LOCATION_HEALTH_FACILITY_SEARCHER_RESP", {
        payload: { data: { healthFacilities: relayPage([]) }, ...graphqlErrors("not permitted") },
      });

      expect(state.errorHealthFacilities).toEqual(DATA_ERROR);
    });

    it("records a transport failure", () => {
      const state = fail(dispatch(initial(), "LOCATION_HEALTH_FACILITY_SEARCHER_REQ"), "LOCATION_HEALTH_FACILITY_SEARCHER");

      expect(state).toMatchObject({ fetchingHealthFacilities: false, errorHealthFacilities: SERVER_ERROR });
    });
  });

  describe("the location hierarchy, level by level", () => {
    const LEVELS = [0, 1, 2, 3];
    const populated = () => ({
      ...initial(),
      l0s: [location("l0")],
      l1s: [location("l1")],
      l2s: [location("l2")],
      l3s: [location("l3")],
    });
    const levelsFrom = (state, level) => LEVELS.filter((l) => l >= level).map((l) => state[`l${l}s`]);
    const levelsAbove = (state, level) => LEVELS.filter((l) => l < level).map((l) => state[`l${l}s`]);

    it.each(LEVELS)("empties level %i and every level below it while it loads", (level) => {
      const state = dispatch(populated(), `LOCATION_LOCATIONS_${level}_REQ`);

      expect(levelsFrom(state, level)).toEqual(levelsFrom(state, level).map(() => []));
      expect(levelsAbove(state, level)).toEqual(levelsAbove(populated(), level));
      expect(state[`fetchingL${level}s`]).toBe(true);
      expect(state[`fetchedL${level}s`]).toBe(false);
      expect(state[`errorL${level}s`]).toBeNull();
    });

    it.each(LEVELS)("stores level %i from the plain locations query", (level) => {
      const state = respond(initial(), `LOCATION_LOCATIONS_${level}`, { locations: relayPage([location("a")]) });

      expect(state[`l${level}s`]).toEqual([location("a")]);
      expect(state[`fetchingL${level}s`]).toBe(false);
      expect(state[`fetchedL${level}s`]).toBe(true);
      expect(state[`errorL${level}s`]).toBeNull();
    });

    it.each(LEVELS)("stores level %i from the search-string query", (level) => {
      const state = respond(initial(), `LOCATION_LOCATIONS_${level}`, { locationsStr: relayPage([location("b")]) });

      expect(state[`l${level}s`]).toEqual([location("b")]);
    });

    it.each(LEVELS)("surfaces a data error on level %i", (level) => {
      const state = dispatch(initial(), `LOCATION_LOCATIONS_${level}_RESP`, {
        payload: { data: { locations: relayPage([]) }, ...graphqlErrors("not permitted") },
      });

      expect(state[`errorL${level}s`]).toEqual(DATA_ERROR);
    });

    it.each(LEVELS)("records a transport failure on level %i", (level) => {
      const state = fail(dispatch(initial(), `LOCATION_LOCATIONS_${level}_REQ`), `LOCATION_LOCATIONS_${level}`);

      expect(state[`fetchingL${level}s`]).toBe(false);
      expect(state[`errorL${level}s`]).toEqual(SERVER_ERROR);
    });

    it.each([1, 2, 3])("clears level %i and every level below it, leaving the ones above", (level) => {
      const state = dispatch(populated(), `LOCATION_LOCATIONS_${level}_CLEAR`);

      expect(levelsFrom(state, level)).toEqual(levelsFrom(state, level).map(() => []));
      expect(levelsAbove(state, level)).toEqual(levelsAbove(populated(), level));
    });

    // Currently fails: there is no LOCATION_LOCATIONS_0_CLEAR case, so clearLocations(0) —
    // which RegionPicker and a region-level LocationPicker dispatch on unmount — leaves
    // the region list, including one narrowed to the picked region, in place.
    it.fails("clears the regions too", () => {
      expect(dispatch(populated(), "LOCATION_LOCATIONS_0_CLEAR").l0s).toEqual([]);
    });
  });

  describe("selecting in a filter", () => {
    const populated = () => ({
      ...initial(),
      l0s: [location("l0")],
      l1s: [location("l1")],
      l2s: [location("l2")],
      l3s: [location("l3")],
    });

    it.each([
      [0, 4, [[location("l0")], [], [], []]],
      [1, 4, [[location("l0")], [location("l1")], [], []]],
      [2, 4, [[location("l0")], [location("l1")], [location("l2")], []]],
      [3, 4, [[location("l0")], [location("l1")], [location("l2")], [location("l3")]]],
      [0, 2, [[location("l0")], [], [location("l2")], [location("l3")]]],
    ])("picking at level %i of %i empties only the levels below it", (level, maxLevels, expected) => {
      const state = dispatch(populated(), "LOCATION_FILTER_SELECTED", {
        payload: { location: location("x"), level, maxLevels },
      });

      expect([state.l0s, state.l1s, state.l2s, state.l3s]).toEqual(expected);
    });

    it.each([
      ["region", "LOCATION_FILTER_REGION_SELECTED", "l0s"],
      ["district", "LOCATION_FILTER_DISTRICT_SELECTED", "l1s"],
    ])("narrows the %s list to the one picked", (_label, type, field) => {
      const state = dispatch(populated(), type, { payload: { location: location("picked") } });

      expect(state[field]).toEqual([location("picked")]);
    });
  });

  describe("unrestricted location lists", () => {
    const LISTS = [
      ["all regions", "LOCATION_REGIONS", "AllRegions", "allRegions", "locations"],
      ["all regions by search string", "LOCATION_REGIONS", "AllRegions", "allRegions", "locationsStr"],
      ["all level 0 locations", "LOCATION_ALL_LOCATION_0", "AllL0s", "allL0s", "locationsAll"],
      ["all level 1 locations", "LOCATION_ALL_LOCATION_1", "AllL1s", "allL1s", "locationsAll"],
    ];

    it.each(LISTS)("empties %s while they load", (_label, type, suffix, field) => {
      const state = dispatch({ ...initial(), [field]: [location("old")] }, `${type}_REQ`);

      expect(state).toMatchObject({
        [field]: [],
        [`fetching${suffix}`]: true,
        [`fetched${suffix}`]: false,
        [`error${suffix}`]: null,
      });
    });

    it.each(LISTS)("stores %s", (_label, type, suffix, field, entity) => {
      const state = respond(initial(), type, { [entity]: relayPage([location("a"), location("b")]) });

      expect(state[field]).toEqual([location("a"), location("b")]);
      expect(state[`fetching${suffix}`]).toBe(false);
      expect(state[`fetched${suffix}`]).toBe(true);
      expect(state[`error${suffix}`]).toBeNull();
    });

    it.each(LISTS)("surfaces a data error on %s", (_label, type, suffix, _field, entity) => {
      const state = dispatch(initial(), `${type}_RESP`, {
        payload: { data: { [entity]: relayPage([]) }, ...graphqlErrors("not permitted") },
      });

      expect(state[`error${suffix}`]).toEqual(DATA_ERROR);
    });

    it.each(LISTS)("records a transport failure on %s", (_label, type, suffix) => {
      const state = fail(dispatch(initial(), `${type}_REQ`), type);

      expect(state[`fetching${suffix}`]).toBe(false);
      expect(state[`error${suffix}`]).toEqual(SERVER_ERROR);
    });
  });

  describe("code validation", () => {
    const FIELDS = [
      ["health facility", "LOCATION_HF_CODE_FIELDS_VALIDATION", "HFCode", "LOCATION_HF_CODE_FIELDS_VALIDATION_SET_VALID"],
      ["location", "LOCATION_CODE_FIELDS_VALIDATION", "locationCode", "LOCATION_CODE_SET_VALID"],
    ];

    const validating = (type) => dispatch(initial(), `${type}_REQ`);

    it.each(FIELDS)("marks the %s code as being checked", (_label, type, field) => {
      expect(validating(type).validationFields[field]).toEqual({
        isValidating: true,
        isValid: false,
        validationError: null,
      });
    });

    it.each(FIELDS)("reports a free %s code as valid", (_label, type, field) => {
      const state = respond(validating(type), type, { isValid: true });

      expect(state.validationFields[field]).toEqual({ isValidating: false, isValid: true, validationError: null });
    });

    it.each(FIELDS)("reports a taken %s code as invalid", (_label, type, field) => {
      expect(respond(validating(type), type, { isValid: false }).validationFields[field].isValid).toBe(false);
    });

    it.each(FIELDS)("surfaces a data error from the %s code check", (_label, type, field) => {
      const state = dispatch(validating(type), `${type}_RESP`, {
        payload: { data: { isValid: null }, ...graphqlErrors("not permitted") },
      });

      expect(state.validationFields[field].validationError).toEqual(DATA_ERROR);
    });

    it.each(FIELDS)("treats a failed %s code check as invalid and records why", (_label, type, field) => {
      expect(fail(validating(type), type).validationFields[field]).toEqual({
        isValidating: false,
        isValid: false,
        validationError: SERVER_ERROR,
      });
    });

    it.each(FIELDS)("accepts a %s code as valid without a round trip", (_label, _type, field, setValid) => {
      expect(dispatch(initial(), setValid).validationFields[field]).toEqual({
        isValidating: false,
        isValid: true,
        validationError: null,
      });
    });

    it.each(FIELDS)("forgets the verdict on the %s code when cleared", (_label, type, field) => {
      const checked = respond(validating(type), type, { isValid: true });

      expect(dispatch(checked, `${type}_CLEAR`).validationFields[field].isValid).toBe(false);
    });

    // Currently fails: clearing sets isValidating true, so the form believes a check it
    // just cancelled is still running.
    it.fails.each(FIELDS)("stops validating the %s code on clear", (_label, type, field) => {
      expect(dispatch(validating(type), `${type}_CLEAR`).validationFields[field].isValidating).toBe(false);
    });

    it("keeps the two codes' results apart", () => {
      const hfChecked = respond(validating("LOCATION_HF_CODE_FIELDS_VALIDATION"), "LOCATION_HF_CODE_FIELDS_VALIDATION", {
        isValid: true,
      });
      const both = fail(dispatch(hfChecked, "LOCATION_CODE_FIELDS_VALIDATION_REQ"), "LOCATION_CODE_FIELDS_VALIDATION");

      expect(both.validationFields.HFCode.isValid).toBe(true);
      expect(both.validationFields.locationCode.validationError).toEqual(SERVER_ERROR);
    });
  });

  describe("mutations", () => {
    const MUTATION_RESULTS = [
      ["LOCATION_CREATE_LOCATION_RESP", "createLocation"],
      ["LOCATION_UPDATE_LOCATION_RESP", "updateLocation"],
      ["LOCATION_DELETE_LOCATION_RESP", "deleteLocation"],
      ["LOCATION_MOVE_LOCATION_RESP", "moveLocation"],
      ["LOCATION_CREATE_HEALTH_FACILITY_RESP", "createHealthFacility"],
      ["LOCATION_UPDATE_HEALTH_FACILITY_RESP", "updateHealthFacility"],
      ["LOCATION_DELETE_HEALTH_FACILITY_RESP", "deleteHealthFacility"],
    ];

    const submitting = () =>
      dispatch(initial(), "LOCATION_MUTATION_REQ", {
        meta: { clientMutationId: "cmid-1", clientMutationLabel: "Create location" },
      });

    it("records the request metadata while a mutation is in flight", () => {
      expect(submitting()).toMatchObject({
        submittingMutation: true,
        mutation: { id: "cmid-1", clientMutationLabel: "Create location" },
      });
    });

    it.each(MUTATION_RESULTS)("clears the in-flight flag and keeps the internal id of %s", (type, service) => {
      const state = dispatch(submitting(), type, { payload: { data: { [service]: { internalId: "internal-1" } } } });

      expect(state.submittingMutation).toBe(false);
      expect(state.mutation.id).toBe("internal-1");
      expect(state.mutation.clientMutationLabel).toBe("Create location");
    });

    it("raises an alert when a mutation fails", () => {
      const state = dispatch(submitting(), "LOCATION_MUTATION_ERR", {
        payload: { status: 500, statusText: "Internal Server Error" },
      });

      expect(JSON.parse(state.alert)).toEqual({ status: 500, statusText: "Internal Server Error" });
    });

    // Currently fails: dispatchMutationErr in fe-core only stores the alert, so the module
    // is left believing the mutation is still being submitted.
    it.fails("stops submitting once a mutation has failed", () => {
      expect(dispatch(submitting(), "LOCATION_MUTATION_ERR", { payload: { status: 500 } }).submittingMutation).toBe(
        false,
      );
    });
  });

  describe("locations by uuid", () => {
    it("forgets the previous locations while the next ones load", () => {
      const loaded = { ...initial(), locationsByUuids: [location("a")], fetchedLocationsByUuids: true };

      expect(dispatch(loaded, "LOCATION_LOCATIONS_BY_UUIDS_REQ")).toMatchObject({
        fetchingLocationsByUuids: true,
        fetchedLocationsByUuids: false,
        locationsByUuids: [],
        errorLocationsByUuids: null,
      });
    });

    it("stores the locations found", () => {
      const state = respond(initial(), "LOCATION_LOCATIONS_BY_UUIDS", {
        locationsStr: relayPage([location("a"), location("b")]),
      });

      expect(state.locationsByUuids).toEqual([location("a"), location("b")]);
      expect(state).toMatchObject({ fetchingLocationsByUuids: false, fetchedLocationsByUuids: true });
    });

    it("surfaces a data error", () => {
      const state = dispatch(initial(), "LOCATION_LOCATIONS_BY_UUIDS_RESP", {
        payload: { data: { locationsStr: relayPage([]) }, ...graphqlErrors("not permitted") },
      });

      expect(state.errorLocationsByUuids).toEqual(DATA_ERROR);
    });

    it("records a transport failure", () => {
      const state = fail(dispatch(initial(), "LOCATION_LOCATIONS_BY_UUIDS_REQ"), "LOCATION_LOCATIONS_BY_UUIDS");

      expect(state).toMatchObject({ fetchingLocationsByUuids: false, errorLocationsByUuids: SERVER_ERROR });
    });

    it("counts an empty uuid list as fetched, with nothing found", () => {
      const loaded = { ...initial(), locationsByUuids: [location("a")], errorLocationsByUuids: SERVER_ERROR };

      expect(dispatch(loaded, "LOCATION_LOCATIONS_BY_UUIDS_EMPTY")).toMatchObject({
        fetchingLocationsByUuids: false,
        fetchedLocationsByUuids: true,
        locationsByUuids: [],
        errorLocationsByUuids: null,
      });
    });
  });

  describe("logging out", () => {
    it("resets the initial-state fields on logout", () => {
      const touched = [
        ["LOCATION_USER_DISTRICTS", { userDistricts: [district("d-1", region)] }],
        ["LOCATION_USER_HEALTH_FACILITY_FULL_PATH", { healthFacilities: relayPage([hf("HF1")]) }],
        ["LOCATION_HEALTH_FACILITY_FULL_PATH", { healthFacilities: relayPage([hf("HF1")]) }],
        ["LOCATION_HEALTH_FACILITY_SEARCHER", { healthFacilities: relayPage([hf("HF1")]) }],
        ["LOCATION_HEALTH_FACILITY", { healthFacilities: relayPage([hf("HF1")]) }],
        ["LOCATION_LOCATIONS_0", { locations: relayPage([location("a")]) }],
        ["LOCATION_LOCATIONS_1", { locations: relayPage([location("a")]) }],
        ["LOCATION_LOCATIONS_2", { locations: relayPage([location("a")]) }],
        ["LOCATION_LOCATIONS_3", { locations: relayPage([location("a")]) }],
        ["LOCATION_ALL_LOCATION_0", { locationsAll: relayPage([location("a")]) }],
        ["LOCATION_ALL_LOCATION_1", { locationsAll: relayPage([location("a")]) }],
      ].reduce((state, [type, data]) => respond(state, type, data), dispatch(initial(), "LOCATION_MUTATION_REQ"));

      expect(dispatch(touched, "CORE_AUTH_LOGOUT")).toMatchObject(initial());
    });
  });
});
