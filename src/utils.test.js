import { describe, expect, it } from "vitest";

import {
  buildParentLocationFilters,
  buildSelectedLocation,
  getLocationLevel,
  healthFacilityLabel,
  locationLabel,
  locationPathFromValue,
  nestParentsProjections,
} from "./utils";

const region = { uuid: "r-1", code: "R1", name: "Tahida", parent: null };
const district = { uuid: "d-1", code: "R1D1", name: "Rajo", parent: region };
const ward = { uuid: "w-1", code: "R1D1M1", name: "Jaber", parent: district };
const village = { uuid: "v-1", code: "R1D1M1V1", name: "Rachla", parent: ward };

describe("location utils", () => {
  describe.each([
    ["locationLabel", locationLabel],
    ["healthFacilityLabel", healthFacilityLabel],
  ])("%s", (_name, label) => {
    it.each([
      ["code and name", { code: "R1", name: "Tahida" }, "R1 Tahida"],
      ["code only", { code: "R1" }, "R1"],
      ["name only", { name: "Tahida" }, "Tahida"],
      ["neither", { uuid: "r-1" }, ""],
      ["empty strings", { code: "", name: "" }, ""],
      ["nothing at all", null, ""],
      ["undefined", undefined, ""],
    ])("labels a record with %s", (_label, record, expected) => {
      expect(label(record)).toBe(expected);
    });
  });

  describe("getLocationLevel", () => {
    it.each([
      ["a region", region, 0],
      ["a district", district, 1],
      ["a ward", ward, 2],
      ["a village", village, 3],
      ["a location whose parent was not fetched", { uuid: "x" }, 0],
    ])("puts %s at level %i", (_label, location, expected) => {
      expect(getLocationLevel(location)).toBe(expected);
    });

    it.each([null, undefined])("puts %s below every level", (location) => {
      expect(getLocationLevel(location)).toBe(-1);
    });
  });

  describe("locationPathFromValue", () => {
    it("lists the lineage from the root down to the location", () => {
      expect(locationPathFromValue(village)).toEqual([region, district, ward, village]);
    });

    it("is just the location for a root", () => {
      expect(locationPathFromValue(region)).toEqual([region]);
    });

    it.each([null, undefined])("is empty for %s", (location) => {
      expect(locationPathFromValue(location)).toEqual([]);
    });
  });

  describe("buildSelectedLocation", () => {
    const flat = [
      { uuid: "r-1", code: "R1" },
      { uuid: "d-1", code: "R1D1" },
      { uuid: "w-1", code: "R1D1M1" },
    ];

    it("returns the last item, linked to the others through its parents", () => {
      const selected = buildSelectedLocation(flat);

      expect(selected.uuid).toBe("w-1");
      expect(selected.parent.uuid).toBe("d-1");
      expect(selected.parent.parent.uuid).toBe("r-1");
      expect(selected.parent.parent.parent).toBeNull();
    });

    it("drops any parent the path items carried, so the path alone decides the lineage", () => {
      const selected = buildSelectedLocation([{ uuid: "d-1", parent: { uuid: "stale" } }]);

      expect(selected.parent).toBeNull();
    });

    it("does not modify the path it is given", () => {
      const path = flat.map((item) => ({ ...item }));
      buildSelectedLocation(path);

      expect(path).toEqual(flat);
    });

    it.each([
      ["an empty path", []],
      ["no path", null],
      ["an undefined path", undefined],
    ])("selects nothing for %s", (_label, path) => {
      expect(buildSelectedLocation(path)).toBeNull();
    });

    it("round-trips with locationPathFromValue", () => {
      const selected = buildSelectedLocation(flat);

      expect(locationPathFromValue(selected).map((l) => l.uuid)).toEqual(["r-1", "d-1", "w-1"]);
      expect(getLocationLevel(selected)).toBe(2);
    });
  });

  describe("buildParentLocationFilters", () => {
    it("filters on the location and its level, and exposes the lineage slot by slot", () => {
      expect(buildParentLocationFilters(ward)).toEqual([
        { id: "parentLocation", value: ward, filter: 'parentLocation: "w-1", parentLocationLevel: 2' },
        { id: "parentLocation_0", value: region, filter: "" },
        { id: "parentLocation_1", value: district, filter: "" },
        { id: "parentLocation_2", value: ward, filter: "" },
        { id: "parentLocation_3", value: null, filter: "" },
      ]);
    });

    it.each([
      ["a region", region, 0],
      ["a district", district, 1],
      ["a ward", ward, 2],
      ["a village", village, 3],
    ])("gives %s level %i", (_label, location, level) => {
      expect(buildParentLocationFilters(location)[0].filter).toContain(`parentLocationLevel: ${level}`);
    });

    it.each([null, undefined])("clears the filter and every slot for %s", (location) => {
      expect(buildParentLocationFilters(location)).toEqual([
        { id: "parentLocation", value: null, filter: null },
        { id: "parentLocation_0", value: null, filter: "" },
        { id: "parentLocation_1", value: null, filter: "" },
        { id: "parentLocation_2", value: null, filter: "" },
        { id: "parentLocation_3", value: null, filter: "" },
      ]);
    });

    it("uses the anchor for the filter name and every slot id", () => {
      const filters = buildParentLocationFilters(district, "location", 2);

      expect(filters.map((f) => f.id)).toEqual(["location", "location_0", "location_1"]);
      expect(filters[0].filter).toBe('location: "d-1", locationLevel: 1');
    });

    it("has one slot per configured location type", () => {
      expect(buildParentLocationFilters(region, "parentLocation", 6)).toHaveLength(7);
      expect(buildParentLocationFilters(village, "parentLocation", 2).map((f) => f.value)).toEqual([
        village,
        region,
        district,
      ]);
    });
  });

  describe("nestParentsProjections", () => {
    it("asks for one parent's summary at depth 0", () => {
      expect(nestParentsProjections(0)).toBe("parent{id,uuid,code,name,type}");
    });

    it("nests one more parent per level", () => {
      expect(nestParentsProjections(2)).toBe(
        "parent{id,uuid,code,name,type,parent{id,uuid,code,name,type,parent{id,uuid,code,name,type}}}",
      );
    });
  });
});
