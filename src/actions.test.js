import { describe, expect, it, vi } from "vitest";

// Only fe-core's two dispatchers are stubbed; the formatters are real, imported
// from their defining modules because fe-core's barrel imports itself.
const core = vi.hoisted(() => ({
  graphql: vi.fn((payload, type, meta) => ({ payload, type, meta })),
  graphqlWithVariables: vi.fn((operation, variables, type, meta) => ({ operation, variables, type, meta })),
}));

vi.mock("@openimis/fe-core", async () => ({
  ...(await vi.importActual("@openimis/fe-core/helpers/api")),
  ...(await vi.importActual("@openimis/fe-core/helpers/jsonExt")),
  ...core,
}));

const actions = await import("./actions");
const { globalId } = await import("@openimis/fe-core/testing");

const query = (result) => result.payload.replace(/\s+/g, " ");
const operation = (result) => result.operation.replace(/\s+/g, " ");
// A fix may escape the search string in the text or pass it as a variable.
const searchReaches = (result, text) =>
  text(result).includes('O\\"Neil') || Object.values(result.variables ?? {}).includes('O"Neil');

const mm = (types) => ({
  getConf: (module, key, defaultValue) => (key === "Location.types" && types ? types : defaultValue),
  getRef: (key) => (key === "location.HealthFacilityPicker.projection" ? ["id", "code"] : null),
});

const dispatched = (thunk) => {
  const dispatch = vi.fn();
  thunk(dispatch);
  return dispatch.mock.calls.map(([action]) => action);
};

const MUTATION_TYPES = (resp) => ["LOCATION_MUTATION_REQ", resp, "LOCATION_MUTATION_ERR"];

describe("location actions", () => {
  describe("the user's districts", () => {
    it("asks for the districts with their regions", () => {
      const result = actions.fetchUserDistricts();

      expect(result.type).toBe("LOCATION_USER_DISTRICTS");
      expect(query(result)).toContain("userDistricts { id,uuid,code,name,parent{id, uuid, code, name} }");
    });

    it("clears them", () => {
      expect(dispatched(actions.clearUserDistricts())).toEqual([{ type: "LOCATION_USER_DISTRICTS_CLEAR" }]);
    });
  });

  describe("health facility lookups", () => {
    it("looks the user's facility up by its numeric id, with the picker projection", () => {
      const result = actions.fetchUserHealthFacilityFullPath(mm(), 17);

      expect(result.type).toBe("LOCATION_USER_HEALTH_FACILITY_FULL_PATH");
      expect(query(result)).toContain(`healthFacilities(id: "${globalId("HealthFacilityGQLType", 17)}")`);
      expect(query(result)).toContain("node { id,code }");
    });

    it.each([
      ["a global id", globalId("HealthFacilityGQLType", 42)],
      ["a numeric id", "42"],
    ])("re-encodes %s for the full path lookup", (_label, id) => {
      const result = actions.fetchHealthFacilityFullPath(mm(), id);

      expect(result.type).toBe("LOCATION_HEALTH_FACILITY_FULL_PATH");
      expect(query(result)).toContain(`healthFacilities(id: "${globalId("HealthFacilityGQLType", 42)}")`);
    });

    it("loads a facility for editing by uuid, history included", () => {
      const result = actions.fetchHealthFacility(mm(), "hf-uuid", "HF1");

      expect(result.type).toBe("LOCATION_HEALTH_FACILITY");
      expect(query(result)).toContain('healthFacilities(uuid: "hf-uuid",showHistory: true)');
      expect(query(result)).toContain("catchments{id, location{id, uuid, code, name}, catchment}");
      expect(query(result)).toContain("location{id, uuid, code, name, parent{id, uuid, code, name}}");
      expect(query(result)).not.toContain("totalCount");
    });

    it("falls back to the code when no uuid is given", () => {
      expect(query(actions.fetchHealthFacility(mm(), null, "HF1"))).toContain(
        'healthFacilities(code: "HF1",showHistory: true)',
      );
    });

    it("counts the facility summaries", () => {
      const result = actions.fetchHealthFacilitySummaries(["first: 10", 'code_Icontains: "HF"']);

      expect(result.type).toBe("LOCATION_HEALTH_FACILITY_SEARCHER");
      expect(query(result)).toContain('healthFacilities(first: 10,code_Icontains: "HF") { totalCount');
      expect(query(result)).toContain("clientMutationId");
    });

    it("clears the facility being edited", () => {
      expect(dispatched(actions.clearHealthFacility())).toEqual([{ type: "LOCATION_HEALTH_FACILITY_CLEAR" }]);
    });
  });

  describe("fetchLocations", () => {
    const LEVELS = ["R", "D", "W", "V"];

    it.each([0, 1, 2, 3])("asks for level %i by its configured type, ordered by code", (level) => {
      const result = actions.fetchLocations(LEVELS, level);

      expect(result.type).toBe(`LOCATION_LOCATIONS_${level}`);
      expect(query(result)).toContain(`locations( type: "${LEVELS[level]}", orderBy: "code" )`);
    });

    it("restricts to the children of a parent", () => {
      expect(query(actions.fetchLocations(LEVELS, 1, { uuid: "r-1" }))).toContain(
        'locations( type: "D", orderBy: "code" ,parent_Uuid: "r-1")',
      );
    });

    it("adds each extra filter as a quoted argument", () => {
      const sent = query(actions.fetchLocations(LEVELS, 2, null, { code_Istartswith: "R1", name_Icontains: "ja" }));

      expect(sent).toContain(',code_Istartswith: "R1",name_Icontains: "ja")');
    });

    it("accepts a null filter object", () => {
      expect(query(actions.fetchLocations(LEVELS, 0, null, null))).toContain('orderBy: "code" )');
    });

    it("asks for the population figures the locations page edits", () => {
      expect(query(actions.fetchLocations(LEVELS, 3))).toContain(
        "malePopulation,femalePopulation,otherPopulation,families,clientMutationId",
      );
    });
  });

  describe("filterLocationByParents", () => {
    it.each([
      ["wards of a district", "d-1", null, "W", 'parent_Uuid: "d-1"'],
      ["villages of a district", "d-1", null, "V", 'parent_Parent_Uuid: "d-1"'],
      ["wards of a region", null, "r-1", "W", 'parent_Parent_Uuid: "r-1"'],
      ["villages of a region", null, "r-1", "V", 'parent_Parent_Parent_Uuid: "r-1"'],
      ["wards when both are known, by the district", "d-1", "r-1", "W", 'parent_Uuid: "d-1"'],
      ["regions", null, null, "R", ""],
      ["wards with neither known", null, null, "W", ""],
    ])("filters %s", (_label, districtUuid, regionUuid, type, expected) => {
      const filters = ['type: "X"'];

      expect(actions.filterLocationByParents(districtUuid, regionUuid, filters, type)).toBe(true);
      expect(filters).toEqual(['type: "X"', expected]);
    });
  });

  describe("fetchLocationsStr", () => {
    it("searches level 0 by the configured type and nests one parent", () => {
      const result = actions.fetchLocationsStr(mm(), 0);

      expect(result.type).toBe("LOCATION_LOCATIONS_0");
      expect(result.variables).toEqual({});
      expect(operation(result)).toContain('locationsStr(type: "R",str: "",)');
      expect(operation(result)).toContain("node { id,uuid,type,code,name,parent{id,uuid,code,name,type} }");
    });

    it("reads the location types from the module configuration", () => {
      expect(operation(actions.fetchLocationsStr(mm(["P", "C", "S"]), 2))).toContain('type: "S"');
    });

    it("restricts to the children of a parent, ignoring region and district", () => {
      const sent = operation(actions.fetchLocationsStr(mm(), 2, "r-1", "d-1", { uuid: "d-9" }, "ja"));

      expect(sent).toContain('locationsStr(type: "W",str: "ja",parent_Uuid: "d-9")');
    });

    it.each([
      ["a ward", 2, 'parent_Uuid: "d-1"'],
      ["a village", 3, 'parent_Parent_Uuid: "d-1"'],
    ])("narrows %s to the active district when there is no parent", (_label, level, expected) => {
      expect(operation(actions.fetchLocationsStr(mm(), level, "r-1", "d-1", null, "ja"))).toContain(expected);
    });

    it("nests as many parents as the level is deep", () => {
      const sent = operation(actions.fetchLocationsStr(mm(), 3));

      expect(sent.match(/parent\{/g)).toHaveLength(4);
    });

    // Currently fails: `first` is written as first: '20' — single quotes are not a GraphQL
    // string delimiter and the argument is an Int, so any caller passing it gets a syntax error.
    it.fails("limits the number of results with a valid argument", () => {
      expect(operation(actions.fetchLocationsStr(mm(), 1, null, null, null, "ja", 20))).toContain("first: 20");
    });

    // Currently fails: the search string is interpolated raw, so a quote typed into a
    // location picker ends the string early and the lookup is a syntax error.
    it.fails("keeps a quote in the search string from breaking the query", () => {
      const result = actions.fetchLocationsStr(mm(), 1, null, null, null, 'O"Neil');

      expect(operation(result)).not.toContain('"O"Neil"');
      expect(searchReaches(result, operation)).toBe(true);
    });
  });

  describe("fetchParentLocationsStr", () => {
    it("searches within several parents at once", () => {
      const result = actions.fetchParentLocationsStr(mm(), 2, ["d-1", "d-2"], "ja", 20);

      expect(result.type).toBe("LOCATION_LOCATIONS_2");
      expect(query(result)).toContain('locationsStr(type: "W",str: "ja",first: 20,parent_Uuid_In: ["d-1", "d-2"])');
      expect(query(result).match(/parent\{/g)).toHaveLength(3);
    });

    it("leaves out the parent restriction and the limit when not given", () => {
      expect(query(actions.fetchParentLocationsStr(mm(), 0, null, "ta"))).toContain('locationsStr(type: "R",str: "ta")');
    });

    // Currently fails: the search string is interpolated raw, as in fetchLocationsStr.
    it.fails("keeps a quote in the search string from breaking the query", () => {
      const result = actions.fetchParentLocationsStr(mm(), 1, ["r-1"], 'O"Neil');

      expect(query(result)).not.toContain('"O"Neil"');
      expect(searchReaches(result, query)).toBe(true);
    });
  });

  describe("fetchLocationsByUuids", () => {
    it("fetches the locations named, with four levels of parents by default", () => {
      const result = actions.fetchLocationsByUuids(["v-1", "w-2"]);

      expect(result.type).toBe("LOCATION_LOCATIONS_BY_UUIDS");
      expect(result.variables).toEqual({});
      expect(operation(result)).toContain('locationsStr(uuid_In: ["v-1","w-2"])');
      expect(operation(result).match(/parent\{/g)).toHaveLength(4);
    });

    it("nests one parent fewer than the deepest level asked for", () => {
      expect(operation(actions.fetchLocationsByUuids(["d-1"], 2)).match(/parent\{/g)).toHaveLength(2);
    });

    it.each([
      ["an empty list", []],
      ["no list", null],
      ["an undefined list", undefined],
    ])("skips the round trip for %s", (_label, uuids) => {
      expect(actions.fetchLocationsByUuids(uuids)).toEqual({ type: "LOCATION_LOCATIONS_BY_UUIDS_EMPTY" });
    });
  });

  describe("location lists", () => {
    it("asks for every region", () => {
      const result = actions.fetchAllRegions();

      expect(result.type).toBe("LOCATION_REGIONS");
      expect(query(result)).toContain('locations(type: "R") {');
      expect(query(result)).toContain("node { id,uuid,code,name }");
    });

    it.each([0, 1])("asks for all level %i locations regardless of the user's rights", (level) => {
      const result = actions.fetchAvailableLocations(mm(), level);

      expect(result.type).toBe(`LOCATION_ALL_LOCATION_${level}`);
      expect(query(result)).toContain(`locationsAll(type: "${["R", "D"][level]}")`);
      expect(query(result).match(/parent\{/g)).toHaveLength(level + 1);
    });

    it.each([0, 1, 2, 3])("clears level %i", (level) => {
      expect(dispatched(actions.clearLocations(level))).toEqual([{ type: `LOCATION_LOCATIONS_${level}_CLEAR` }]);
    });
  });

  describe("selecting in a filter", () => {
    const picked = { uuid: "d-1" };

    it("reports the level picked and how many there are", () => {
      expect(dispatched(actions.selectLocation(picked, 1, 4))).toEqual([
        { type: "LOCATION_FILTER_SELECTED", payload: { location: picked, level: 1, maxLevels: 4 } },
      ]);
    });

    it.each([
      ["selectRegionLocation", "LOCATION_FILTER_REGION_SELECTED"],
      ["selectDistrictLocation", "LOCATION_FILTER_DISTRICT_SELECTED"],
    ])("%s reports the location picked", (creator, type) => {
      expect(dispatched(actions[creator](picked))).toEqual([{ type, payload: { location: picked } }]);
    });
  });

  describe("code validation", () => {
    it.each([
      ["HFCodeValidationCheck", "LOCATION_HF_CODE_FIELDS_VALIDATION", "validateHealthFacilityCode",
        "$healthFacilityCode", { healthFacilityCode: "HF1" }],
      ["locationCodeValidationCheck", "LOCATION_CODE_FIELDS_VALIDATION", "validateLocationCode",
        "$locationCode", { locationCode: "R1" }],
    ])("%s passes the code as a variable", (creator, type, field, variable, variables) => {
      const result = actions[creator](mm(), variables);

      expect(result.type).toBe(type);
      expect(result.variables).toBe(variables);
      expect(operation(result)).toContain(`isValid: ${field}(${variable.slice(1)}: ${variable})`);
      expect(operation(result)).toContain(`query (${variable}: String!)`);
    });

    it.each([
      ["HFCodeSetValid", "LOCATION_HF_CODE_FIELDS_VALIDATION_SET_VALID"],
      ["HFCodeValidationClear", "LOCATION_HF_CODE_FIELDS_VALIDATION_CLEAR"],
      ["locationCodeSetValid", "LOCATION_CODE_SET_VALID"],
      ["locationCodeValidationClear", "LOCATION_CODE_FIELDS_VALIDATION_CLEAR"],
    ])("%s dispatches %s", (creator, type) => {
      expect(dispatched(actions[creator]())).toEqual([{ type }]);
    });
  });

  describe("location mutations", () => {
    const newVillage = {
      code: "R1D1M1V9",
      name: "Rachla",
      type: "V",
      parentUuid: "w-1",
      malePopulation: 10,
      femalePopulation: 12,
      otherPopulation: 1,
      families: 5,
    };

    it.each([
      ["creates", newVillage, "createLocation", "LOCATION_CREATE_LOCATION_RESP"],
      ["updates", { ...newVillage, uuid: "v-9" }, "updateLocation", "LOCATION_UPDATE_LOCATION_RESP"],
    ])("%s a location between the shared request and error types", (_label, location, name, resp) => {
      const result = actions.createOrUpdateLocation(location, "Save village");

      expect(result.type).toEqual(MUTATION_TYPES(resp));
      expect(query(result)).toContain(`mutation ${name} { ${name}( input: {`);
      expect(query(result)).toContain(`clientMutationId: "${result.meta.clientMutationId}"`);
      expect(query(result)).toContain('clientMutationLabel: "Save village"');
      expect(result.meta).toMatchObject({ clientMutationLabel: "Save village" });
      expect(result.meta.requestedDateTime).toBeInstanceOf(Date);
    });

    it("sends every field of a new location", () => {
      const sent = query(actions.createOrUpdateLocation(newVillage, "Create"));

      expect(sent).toContain(
        'code: "R1D1M1V9" name: "Rachla" parentUuid: "w-1" malePopulation: 10 femalePopulation: 12 ' +
          'otherPopulation: 1 families: 5 type: "V"',
      );
      expect(sent).not.toContain("uuid: ");
    });

    it("names the location being updated", () => {
      expect(query(actions.createOrUpdateLocation({ ...newVillage, uuid: "v-9" }, "Update"))).toContain(
        'uuid: "v-9" code: "R1D1M1V9"',
      );
    });

    it("leaves out the parent of a region and figures nobody entered", () => {
      const sent = query(actions.createOrUpdateLocation({ code: "R9", name: "North", type: "R" }, "Create"));

      expect(sent).toContain('code: "R9" name: "North" type: "R"');
      expect(sent).not.toMatch(/parentUuid|Population|families/);
    });

    // Currently fails: each figure is sent only when truthy, so a population or family count
    // set back to 0 is dropped from the mutation and the stored value is left as it was.
    it.fails.each(["malePopulation", "femalePopulation", "otherPopulation", "families"])(
      "sends a zero %s",
      (field) => {
        expect(query(actions.createOrUpdateLocation({ ...newVillage, uuid: "v-9", [field]: 0 }, "Update"))).toContain(
          `${field}: 0`,
        );
      },
    );

    // Currently fails: formatGQLString escapes the quote first and the backslash second,
    // so its own escape character is escaped again and the server receives
    // name: "Saint \\"Mary\\"" — a syntax error, not the typed name.
    it.fails("escapes a name the user typed quotes into", () => {
      expect(query(actions.createOrUpdateLocation({ ...newVillage, name: 'Saint "Mary"' }, "Create"))).toContain(
        'name: "Saint \\"Mary\\""',
      );
    });

    it("moves the children of a deleted location to the new parent", () => {
      const result = actions.deleteLocation({ uuid: "d-1", code: "R1D1" }, { action: "move", newParent: "d-2" }, "Del");

      expect(result.type).toEqual(MUTATION_TYPES("LOCATION_DELETE_LOCATION_RESP"));
      expect(query(result)).toContain('mutation deleteLocation');
      expect(query(result)).toContain('uuid: "d-1" code: "R1D1" newParentUuid: "d-2"');
      expect(result.meta).toMatchObject({ clientMutationId: expect.any(String), clientMutationLabel: "Del" });
    });

    it("drops the children of a deleted location when asked to", () => {
      const sent = query(actions.deleteLocation({ uuid: "d-1", code: "R1D1" }, { action: "drop" }, "Del"));

      expect(sent).toContain('uuid: "d-1" code: "R1D1" } )');
      expect(sent).not.toContain("newParentUuid");
    });

    it("moves a location under a new parent", () => {
      const result = actions.moveLocation({ uuid: "w-1" }, { uuid: "d-2" }, "Move");

      expect(result.type).toEqual(MUTATION_TYPES("LOCATION_MOVE_LOCATION_RESP"));
      expect(query(result)).toContain('mutation moveLocation');
      expect(query(result)).toContain('uuid: "w-1" newParentUuid: "d-2"');
      expect(result.meta.requestedDateTime).toBeInstanceOf(Date);
    });

    it("moves a location to the top when there is no new parent", () => {
      const sent = query(actions.moveLocation({ uuid: "d-1" }, null, "Move"));

      expect(sent).toContain('uuid: "d-1" } )');
      expect(sent).not.toContain("newParentUuid");
    });
  });

  describe("health facility mutations", () => {
    const facility = {
      code: "HF9",
      name: "Rajo Clinic",
      location: { id: globalId("LocationGQLType", 21) },
      level: "C",
      legalForm: { code: "G" },
      careType: "B",
    };

    it.each([
      ["creates", facility, "createHealthFacility", "LOCATION_CREATE_HEALTH_FACILITY_RESP"],
      ["updates", { ...facility, uuid: "hf-9" }, "updateHealthFacility", "LOCATION_UPDATE_HEALTH_FACILITY_RESP"],
    ])("%s a facility between the shared request and error types", (_label, hf, name, resp) => {
      const result = actions.createOrUpdateHealthFacility(hf, "Save facility");

      expect(result.type).toEqual(MUTATION_TYPES(resp));
      expect(query(result)).toContain(`mutation ${name} { ${name}( input: {`);
      expect(query(result)).toContain(`clientMutationId: "${result.meta.clientMutationId}"`);
      expect(result.meta).toMatchObject({ clientMutationLabel: "Save facility" });
      expect(result.meta.requestedDateTime).toBeInstanceOf(Date);
    });

    it("sends the required fields, with the location as a numeric id", () => {
      const sent = query(actions.createOrUpdateHealthFacility(facility, "Create"));

      expect(sent).toContain('code: "HF9" name: "Rajo Clinic" locationId: 21 level: "C" legalFormId: "G" careType: "B"');
      expect(sent).not.toMatch(/uuid:|accCode|subLevelId|address|phone|fax|email|Pricelist|catchments|status/);
    });

    it("names the facility being updated", () => {
      expect(query(actions.createOrUpdateHealthFacility({ ...facility, uuid: "hf-9" }, "Update"))).toContain(
        'uuid: "hf-9" code: "HF9"',
      );
    });

    it.each([
      ["accounting code", { accCode: "ACC-1" }, 'accCode: "ACC-1"'],
      ["sub level", { subLevel: { code: "I" } }, 'subLevelId: "I"'],
      ["address", { address: "1 Main St" }, 'address: "1 Main St"'],
      ["phone", { phone: "+255 1" }, 'phone: "+255 1"'],
      ["fax", { fax: "+255 2" }, 'fax: "+255 2"'],
      ["email", { email: "hf@example.org" }, 'email: "hf@example.org"'],
      ["services price list", { servicesPricelist: { id: globalId("ServicesPricelistGQLType", 3) } },
        "servicesPricelistId: 3"],
      ["items price list", { itemsPricelist: { id: globalId("ItemsPricelistGQLType", 4) } }, "itemsPricelistId: 4"],
      ["contract start", { contractStartDate: "2026-01-01" }, 'contractStartDate: "2026-01-01"'],
      ["contract end", { contractEndDate: "2026-12-31" }, 'contractEndDate: "2026-12-31"'],
      ["status", { status: "AC" }, 'status: "AC"'],
      ["extensions", { mutationExtensions: { a: 1 } }, 'mutationExtensions: "{\\"a\\":1}"'],
    ])("sends the %s when given", (_label, extra, expected) => {
      expect(query(actions.createOrUpdateHealthFacility({ ...facility, ...extra }, "Save"))).toContain(expected);
    });

    it("sends each catchment with its location as a numeric id, keeping existing ids", () => {
      const sent = query(
        actions.createOrUpdateHealthFacility(
          {
            ...facility,
            catchments: [
              { id: 7, location: { id: globalId("LocationGQLType", 31) }, catchment: 60 },
              { location: { id: "32" }, catchment: 40 },
            ],
          },
          "Save",
        ),
      );

      expect(sent).toContain("catchments: [ { id: 7 locationId: 31 catchment: 60 } { locationId: 32 catchment: 40 } ]");
    });

    it("leaves out an empty catchment list", () => {
      expect(query(actions.createOrUpdateHealthFacility({ ...facility, catchments: [] }, "Save"))).not.toContain(
        "catchments",
      );
    });

    it("deletes a facility and locks its row until the mutation completes", () => {
      const hf = { uuid: "hf-9", code: "HF9" };
      const result = actions.deleteHealthFacility(hf, "Delete facility");

      expect(result.type).toEqual(MUTATION_TYPES("LOCATION_DELETE_HEALTH_FACILITY_RESP"));
      expect(query(result)).toContain('mutation deleteHealthFacility');
      expect(query(result)).toContain('uuid: "hf-9" code: "HF9"');
      expect(hf.clientMutationId).toBe(result.meta.clientMutationId);
      expect(result.meta).toMatchObject({ clientMutationLabel: "Delete facility" });
    });
  });
});
