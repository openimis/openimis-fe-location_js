import React from "react";
import LocationAlertForwarder from "./components/LocationAlertForwarder";
import LocationsPage from "./pages/LocationsPage";
import HealthFacilitiesPage from "./pages/HealthFacilitiesPage";
import HealthFacilityEditPage from "./pages/HealthFacilityEditPage";
import UserHealthFacilityLoader from "./components/UserHealthFacilityLoader";
import UserDistrictsLoader from "./components/UserDistrictsLoader";
import HealthFacilityFullPath from "./components/HealthFacilityFullPath";
import HealthFacilityPicker from "./pickers/HealthFacilityPicker";
import HealthFacilityLevelPicker from "./pickers/HealthFacilityLevelPicker";
import HealthFacilitySubLevelPicker from "./pickers/HealthFacilitySubLevelPicker";
import HealthFacilityLegalFormPicker from "./pickers/HealthFacilityLegalFormPicker";
import HealthFacilityPriceListsPanel from "./components/HealthFacilityPriceListsPanel";
import RegionPicker from "./pickers/RegionPicker";
import DistrictPicker from "./pickers/DistrictPicker";
import messages_en from "./translations/en.json";
import reducer from "./reducer";

const ROUTE_LOCATIONS = "location/locations";
const ROUTE_HEALTH_FACILITIES = "location/healthFacilities";
const ROUTE_HEALTH_FACILITY_EDIT = "location/healthFacility";

const DEFAULT_CONFIG = {
  "translations": [{ key: 'en', messages: messages_en }],
  "reducers": [{ key: 'loc', reducer: reducer }], // location is the default used by syncHistoryWithStore...
  "refs": [
    { key: "location.route.healthFacilities", ref: ROUTE_HEALTH_FACILITIES },    
    { key: "location.route.healthFacilityEdit", ref: ROUTE_HEALTH_FACILITY_EDIT },    
    { key: "location.HealthFacilityFullPath", ref: HealthFacilityFullPath },
    { key: "location.HealthFacilityPicker", ref: HealthFacilityPicker },
    { key: "location.HealthFacilityPicker.projection", ref: ["id", "uuid", "code", "name", "level", "servicesPricelist{id, uuid}", "itemsPricelist{id, uuid}", "location{id, uuid, code, name, parent{id, uuid, code, name}}"] },
    { key: "location.HealthFacilityLevelPicker", ref: HealthFacilityLevelPicker },
    { key: "location.HealthFacilityLevelPicker.projection", ref: null },
    { key: "location.HealthFacilitySubLevelPicker", ref: HealthFacilitySubLevelPicker },
    { key: "location.HealthFacilitySubLevelPicker.projection", ref: null },
    { key: "location.HealthFacilityLegalFormPicker", ref: HealthFacilityLegalFormPicker },
    { key: "location.HealthFacilityLegalFormPicker.projection", ref: ["code", "legalForm"] },
    { key: "location.RegionPicker", ref: RegionPicker },
    { key: "location.DistrictPicker", ref: DistrictPicker },
    { key: "location.HealthFacilityGQLType", ref: "HealthFacilityGQLType"},
    { key: "location.HealthFacilityPriceListsPanel", ref: HealthFacilityPriceListsPanel},
    { key: "location.LocationGQLType", ref: "LocationGQLType"},
    { key: "location.LocationsPage", ref: LocationsPage},
    { key: "location.HealthFacilitiesPage", ref: HealthFacilitiesPage},
  ],
  "core.Router": [
    { path: ROUTE_LOCATIONS, component: LocationsPage },
    { path: ROUTE_HEALTH_FACILITIES, component: HealthFacilitiesPage },
    { path: ROUTE_HEALTH_FACILITY_EDIT, component: HealthFacilityEditPage },
    { path: ROUTE_HEALTH_FACILITY_EDIT + "/:healthFacility_uuid?", component: HealthFacilityEditPage },
  ],
  "core.Boot": [LocationAlertForwarder, UserHealthFacilityLoader, UserDistrictsLoader],
}

export const LocationModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
}