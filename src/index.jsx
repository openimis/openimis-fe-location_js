import LocationsPage from "./pages/LocationsPage";
import HealthFacilitiesPage from "./pages/HealthFacilitiesPage";
import HealthFacilityEditPage from "./pages/HealthFacilityEditPage";
import UserHealthFacilityLoader from "./components/UserHealthFacilityLoader";
import UserDistrictsLoader from "./components/UserDistrictsLoader";
import HealthFacilityFullPath from "./components/HealthFacilityFullPath";
import HealthFacilityPicker from "./pickers/HealthFacilityPicker";
import HealthFacilityReferPicker from "./pickers/HealthFacilityReferPicker";
import HealthFacilityLevelPicker from "./pickers/HealthFacilityLevelPicker";
import HealthFacilityStatusPicker from "./pickers/HealthFacilityStatusPicker";
import HealthFacilitySubLevelPicker from "./pickers/HealthFacilitySubLevelPicker";
import HealthFacilityLegalFormPicker from "./pickers/HealthFacilityLegalFormPicker";
import HealthFacilityPriceListsPanel from "./components/HealthFacilityPriceListsPanel";
import CoarseLocationFilter from "./filters/CoarseLocationFilter";
import DetailedLocationFilter from "./filters/DetailedLocationFilter";
import CoarseLocation from "./components/CoarseLocation";
import FSPCoarseLocation from "./components/FSPCoarseLocation";
import DetailedLocation from "./components/DetailedLocation";
import DetailedHealthFacility from "./components/DetailedHealthFacility";
import RegionPicker from "./pickers/RegionPicker";
import DistrictPicker from "./pickers/DistrictPicker";
import LocationPicker from "./pickers/LocationPicker";
import LocationCascader from "./pickers/LocationCascader";
import FSPLocationPicker from "./pickers/FSPLocationPicker";
import LocationTypePicker from "./pickers/LocationTypePicker";
import messages_en from "./translations/en.json";
import reducer from "./reducer";
import {
  RIGHT_LOCATIONS,
  RIGHT_HEALTH_FACILITY_ADD,
  RIGHT_HEALTH_FACILITIES,

} from "./constants";
import { LOCATION_SUMMARY_PROJECTION, nestParentsProjections } from "./utils";
import { HEALTH_FACILITY_PICKER_PROJECTION, HEALTH_FACILITY_REFER_PICKER_PROJECTION } from "./actions";

const ROUTE_LOCATIONS = "location/locations";
const ROUTE_HEALTH_FACILITIES = "location/healthFacilities";
const ROUTE_HEALTH_FACILITY_EDIT = "location/healthFacility";

const DEFAULT_CONFIG = {
  "translations": [{ key: "en", messages: messages_en }],
  "reducers": [{ key: "loc", reducer: reducer }], // location is the default used by syncHistoryWithStore...
  "refs": [
    { key: "location.route.healthFacilities", ref: ROUTE_HEALTH_FACILITIES },
    { key: "location.route.healthFacilityEdit", ref: ROUTE_HEALTH_FACILITY_EDIT },
    { key: "location.HealthFacilityFullPath", ref: HealthFacilityFullPath },
    { key: "location.HealthFacilityPicker", ref: HealthFacilityPicker },
    { key: "location.HealthFacilityPicker.projection", ref: HEALTH_FACILITY_PICKER_PROJECTION },
    { key: "location.HealthFacilityReferPicker", ref: HealthFacilityReferPicker },
    { key: "location.HealthFacilityReferPicker.projection", ref: HEALTH_FACILITY_REFER_PICKER_PROJECTION },
    { key: "location.HealthFacilityPicker.sort", ref: "healthFacility__code" },
    { key: "location.HealthFacilityLevelPicker", ref: HealthFacilityLevelPicker },
    { key: "location.HealthFacilityLevelPicker.projection", ref: null },
    { key: "location.HealthFacilitySubLevelPicker", ref: HealthFacilitySubLevelPicker },
    { key: "location.HealthFacilityStatusPicker", ref: HealthFacilityStatusPicker },
    { key: "location.HealthFacilitySubLevelPicker.projection", ref: null },
    { key: "location.HealthFacilityLegalFormPicker", ref: HealthFacilityLegalFormPicker },
    { key: "location.HealthFacilityLegalFormPicker.projection", ref: ["code", "legalForm"] },
    { key: "location.RegionPicker", ref: RegionPicker },
    { key: "location.DistrictPicker", ref: DistrictPicker },
    { key: "location.LocationPicker", ref: LocationPicker },
    { key: "location.LocationCascader", ref: LocationCascader },
    { key: "location.FSPLocationPicker", ref: FSPLocationPicker },
    { key: "location.HealthFacilityGQLType", ref: "HealthFacilityGQLType" },
    { key: "location.HealthFacilityPriceListsPanel", ref: HealthFacilityPriceListsPanel },
    { key: "location.LocationTypePicker", ref: LocationTypePicker },
    { key: "location.LocationGQLType", ref: "LocationGQLType" },
    { key: "location.Location.MaxLevels", ref: "4" },
    { key: "location.LocationsPage", ref: LocationsPage },
    { key: "location.HealthFacilitiesPage", ref: HealthFacilitiesPage },
    { key: "location.CoarseLocationFilter", ref: CoarseLocationFilter },
    { key: "location.DetailedLocationFilter", ref: DetailedLocationFilter },
    { key: "location.CoarseLocation", ref: CoarseLocation },
    { key: "location.FSPCoarseLocation", ref: FSPCoarseLocation },
    { key: "location.DetailedLocation", ref: DetailedLocation },
    { key: "location.DetailedHealthFacility", ref: DetailedHealthFacility },
    { key: "location.route.healthFacility", ref: ROUTE_HEALTH_FACILITY_EDIT },
  ],
  "core.Router": [
    { path: ROUTE_LOCATIONS,
      component: LocationsPage,
      rights: [RIGHT_LOCATIONS],
      icon: "LocationOn",
      text: "location.locations.page.title",
    },
    { 
      path: ROUTE_HEALTH_FACILITIES,
      component: HealthFacilitiesPage,
      rights: [RIGHT_HEALTH_FACILITIES],
      icon: "LocalHospital",
      text: "location.healthFacilities.page.title",
    },
    { 
      path: ROUTE_HEALTH_FACILITY_EDIT,
      component: HealthFacilityEditPage,
      rights: [RIGHT_HEALTH_FACILITY_ADD],
      icon: "LocalHospital",
     
    },
    { path: ROUTE_HEALTH_FACILITY_EDIT + "/:healthFacility_uuid?", component: HealthFacilityEditPage, rights: [RIGHT_LOCATIONS], icon: "LocalHospital" },
  ],
  "admin.MainMenu": [
    {
      route:  ROUTE_LOCATIONS,
      
    },
    {
      route:  ROUTE_HEALTH_FACILITIES,
      withDivider: true,
    },
  ],
  "core.Boot": [UserHealthFacilityLoader, UserDistrictsLoader],
  "invoice.SubjectAndThirdpartyPicker": [
    {
      type: "health facility",
      picker: HealthFacilityPicker,
      pickerProjection: HEALTH_FACILITY_PICKER_PROJECTION,
    },
  ],
};

export const LocationModule = (cfg) => {
  let config = { ...DEFAULT_CONFIG, ...cfg };
  var levels = config.refs.filter((c) => c.key === "location.Location.MaxLevels")[0].ref;
  config.refs.push({
    key: "location.Location.FlatProjection",
    ref: [...LOCATION_SUMMARY_PROJECTION, nestParentsProjections(levels - 2)],
  });
  return config;
};
