import React from "react";
import LocationsPage from "./pages/LocationsPage";
import UserHealthFacilityLoader from "./components/UserHealthFacilityLoader";
import UserDistrictsLoader from "./components/UserDistrictsLoader";
import HealthFacilityFullPath from "./components/HealthFacilityFullPath";
import HealthFacilityPicker from "./pickers/HealthFacilityPicker";
import HealthFacilityLevelPicker from "./pickers/HealthFacilityLevelPicker";
import RegionPicker from "./pickers/RegionPicker";
import DistrictPicker from "./pickers/DistrictPicker";
import messages_en from "./translations/en.json";
import reducer from "./reducer";

const ROUTE_LOCATIONS = "location/locations";

const DEFAULT_CONFIG = {
  "translations": [{ key: 'en', messages: messages_en }],
  "reducers": [{ key: 'loc', reducer: reducer }], // location is the default used by syncHistoryWithStore...
  "refs": [
    { key: "location.HealthFacilityFullPath", ref: HealthFacilityFullPath },
    { key: "location.HealthFacilityPicker", ref: HealthFacilityPicker },
    { key: "location.HealthFacilityPicker.projection", ref: ["id", "uuid", "code", "name", "level", "servicePricelist{id, uuid}", "itemPricelist{id, uuid}", "location{id, uuid, code, name, parent{id, uuid, code, name}}"] },
    { key: "location.HealthFacilityLevelPicker", ref: HealthFacilityLevelPicker },
    { key: "location.HealthFacilityLevelPicker.projection", ref: null },
    { key: "location.RegionPicker", ref: RegionPicker },
    { key: "location.DistrictPicker", ref: DistrictPicker },
    { key: "location.HealthFacilityGQLType", ref: "HealthFacilityGQLType"},
    { key: "location.LocationGQLType", ref: "LocationGQLType"},
    { key: "location.LocationsPage", ref: LocationsPage}
  ],
  "core.Router": [
    { path: ROUTE_LOCATIONS, component: LocationsPage },
  ],
  "core.Boot": [UserHealthFacilityLoader, UserDistrictsLoader],
}

export const LocationModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
}