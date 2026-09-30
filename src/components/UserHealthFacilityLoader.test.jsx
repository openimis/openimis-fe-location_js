import React from "react";
import { describe, expect, it, vi } from "vitest";

// fe-core's barrel imports itself, so the real helpers come from their defining modules.
vi.mock("@openimis/fe-core", async () => {
  const modules = await vi.importActual("@openimis/fe-core/helpers/modules");
  return { withModulesManager: modules.default };
});

vi.mock("../actions", () => ({
  fetchUserHealthFacilityFullPath: vi.fn(() => ({ type: "LOCATION_USER_HEALTH_FACILITY_FULL_PATH_REQ" })),
}));

const { default: UserHealthFacilityLoader } = await import("./UserHealthFacilityLoader");
const { fetchUserHealthFacilityFullPath } = await import("../actions");
const { makeStore, mockModulesManager, renderWithProviders } = await import("@openimis/fe-core/testing");

const renderLoader = ({ iUser, userHealthFacilityFullPath = null }) => {
  const modulesManager = mockModulesManager();
  const store = makeStore({
    preloadedState: { core: { user: { i_user: iUser } }, loc: { userHealthFacilityFullPath } },
    reducers: { loc: (state = {}) => state },
  });
  const { container } = renderWithProviders(<UserHealthFacilityLoader />, { store, modulesManager });
  return { container, modulesManager };
};

describe("UserHealthFacilityLoader", () => {
  it("loads the facility the logged-in user belongs to", () => {
    const { container, modulesManager } = renderLoader({ iUser: { health_facility_id: 17 } });

    expect(fetchUserHealthFacilityFullPath).toHaveBeenCalledExactlyOnceWith(modulesManager, 17);
    expect(container).toBeEmptyDOMElement();
  });

  it("does not load it again once it is in the store", () => {
    renderLoader({ iUser: { health_facility_id: 17 }, userHealthFacilityFullPath: { id: "17" } });

    expect(fetchUserHealthFacilityFullPath).not.toHaveBeenCalled();
  });

  it("loads nothing for a user attached to no facility", () => {
    renderLoader({ iUser: { health_facility_id: null } });

    expect(fetchUserHealthFacilityFullPath).not.toHaveBeenCalled();
  });
});
