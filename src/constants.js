export const DEFAULT_LOCATION_TYPES = ["R", "D", "W", "V"]; //overwrittn by props.modulesManager.getConf("fe-location", "Location.types", DEFAULT_LOCATION_TYPES)
export const HEALTH_FACILITY_LEVELS = ["C", "D", "H"];
export const HEALTH_FACILITY_LEGAL_FORMS = ["C", "D", "G", "P"];
export const HEALTH_FACILITY_SUB_LEVELS = ["I", "N", "R"];
const HF_STATUS_ACTIVE = "AC"
const HF_STATUS_INACTIVE = "IN"
const HF_STATUS_DELISTED = "DE"
const HF_STATUS_IDLE = "ID"
export const HEALTH_FACILITY_STATUSES = [HF_STATUS_ACTIVE, HF_STATUS_INACTIVE, HF_STATUS_DELISTED, HF_STATUS_IDLE];

export const MODULE_NAME = "location";

export const RIGHT_LOCATION_ADD = 121902;
export const RIGHT_LOCATION_EDIT = 121903;
export const RIGHT_LOCATION_DELETE = 121904;
export const RIGHT_LOCATION_MOVE = 121905;
export const RIGHT_REGION_LOCATION_ADD = 121906;

export const RIGHT_HEALTH_FACILITY_ADD = 121102;
export const RIGHT_HEALTH_FACILITY_EDIT = 121103;
export const RIGHT_HEALTH_FACILITY_DELETE = 121104;

export const MAX_INT_NUMBER = 2147483647;
