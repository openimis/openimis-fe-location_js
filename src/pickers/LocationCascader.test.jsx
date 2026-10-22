import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders, makeStore, screen } from "@openimis/fe-core/testing";

// The fe-core barrel cannot be loaded from a test: only what LocationCascader uses.
vi.mock("@openimis/fe-core", async () => {
  const h = (await import("react")).createElement;
  return {
    GetIconComponent: (name) => () => h("span", null, name),
    useModulesManager: () => ({ getConf: (module, key, defaultValue) => defaultValue }),
    useTranslations: () => ({
      formatMessage: (id) => id,
      formatMessageWithValues: (id) => id,
    }),
  };
});
vi.mock("../actions", () => ({
  fetchLocationsStr: () => ({ type: "TEST_NOOP" }),
  fetchLocationsByUuids: () => ({ type: "TEST_NOOP" }),
}));
vi.mock("./LocationCascaderMobile", () => ({ default: () => null }));

const { default: LocationCascader } = await import("./LocationCascader");

const LEVEL_ERROR = "LocationCascader.requiredLevel";
const region = { id: "1", uuid: "r-1", code: "R1", name: "Region 1", type: "R", parent: null };
const district = { id: "2", uuid: "d-1", code: "R1D1", name: "District 1", type: "D", parent: region };

const renderCascader = (props) =>
  renderWithProviders(<LocationCascader {...props} />, {
    store: makeStore({ reducers: { loc: (state = {}) => state } }),
  });

describe("LocationCascader required level", () => {
  it("accepts any level when required without a requiredLevel", () => {
    renderCascader({ required: true, value: region });
    expect(screen.queryByText(LEVEL_ERROR)).not.toBeInTheDocument();
  });

  it("flags a location above the requiredLevel", () => {
    renderCascader({ required: true, requiredLevel: 2, value: district });
    expect(screen.getByText(LEVEL_ERROR)).toBeInTheDocument();
  });
});
