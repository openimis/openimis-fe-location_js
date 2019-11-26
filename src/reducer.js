import { formatServerError, formatGraphQLError, parseData } from '@openimis/fe-core';
import { healthFacilityLabel, locationLabel } from "./utils";

function reducer(
    state = {
        fetchingHealthFacilityFullPath: false,
        fetchedHealthFacilityFullPath: false,
        healthFacilityFullPath: null,
        errorHealthFacilityFullPath: null,
        fetchingHealthFacilities: false,
        fetchedHealthFacilities: false,
        healthFacilities: null,
        errorHealthFacilities: null,
        fetchingRegions: false,
        fetchedRegions: false,
        regions: [],
        errorRegions: null,
        fetchingDistricts: false,
        fetchedDistricts: false,
        districts: [],
        errorDistricts: null,
        fetchingMunicipalities: false,
        fetchedMunicipalities: false,
        municipalities: [],
        errorMunicipalities: null,
        fetchingWards: false,
        fetchedWards: false,
        wards: [],
        errorWards: null,
    },
    action,
) {
    switch (action.type) {
        case 'LOCATION_USER_DISTRICTS_RESP':
            let userDistricts = action.payload.data.userDistricts || [];
            let userRegions = userDistricts.reduce(
                (res, d) => {
                    res[d.regionUuid] = { id: d.regionId, uuid: d.regionUuid, code: d.regionCode, name: d.regionName };
                    return res;
                }
                , {})
            return {
                ...state,
                userRegions: Object.values(userRegions),
                userDistricts,
            }
        case 'LOCATION_USER_HEALTH_FACILITY_FULL_PATH_RESP':
            let hfFullPath = parseData(action.payload.data.healthFacilities)[0];
            return {
                ...state,
                userHealthFacilityFullPath: hfFullPath,
            }
        case 'LOCATION_HEALTH_FACILITY_FULL_PATH_REQ':
            return {
                ...state,
                fetchingHealthFacilityFullPath: true,
                fetchedHealthFacilityFullPath: false,
                healthFacilityFullPath: null,
                errorHealthFacilityFullPath: null,
            };
        case 'LOCATION_HEALTH_FACILITY_FULL_PATH_RESP':
            return {
                ...state,
                fetchingHealthFacilityFullPath: false,
                fetchedHealthFacilityFullPath: true,
                healthFacilityFullPath: parseData(action.payload.data.healthFacilities)[0],
                errorHealthFacilityFullPath: formatGraphQLError(action.payload)
            };
        case 'LOCATION_HEALTH_FACILITY_FULL_PATH_ERR':
            return {
                ...state,
                fetchingHealthFacilityFullPath: false,
                errorHealthFacilityFullPath: formatServerError(action.payload)
            };
        case 'LOCATION_HEALTH_FACILITIES_REQ':
            return {
                ...state,
                fetchingHealthFacilities: true,
                fetchedHealthFacilities: false,
                healthFacilities: null,
                errorHealthFacilities: null,
            };
        case 'LOCATION_HEALTH_FACILITIES_RESP':
            return {
                ...state,
                fetchingHealthFacilities: false,
                fetchedHealthFacilities: true,
                healthFacilities: parseData(action.payload.data.healthFacilitiesStr),
                errorHealthFacilities: formatGraphQLError(action.payload)
            };
        case 'LOCATION_HEALTH_FACILITIES_ERR':
            return {
                ...state,
                fetchingHealthFacilities: false,
                errorHealthFacilities: formatServerError(action.payload)
            };
        case 'LOCATION_LOCATIONS_R_REQ':
            return {
                ...state,
                fetchingRegions: true,
                fetchedRegions: false,
                regions: [],
                errorRegions: null,
            };
        case 'LOCATION_LOCATIONS_R_RESP':
            return {
                ...state,
                fetchingRegions: false,
                fetchedRegions: true,
                regions: parseData(action.payload.data.locations),
                errorRegions: formatGraphQLError(action.payload)
            };
        case 'LOCATION_LOCATIONS_R_ERR':
            return {
                ...state,
                fetchingRegions: false,
                errorRegions: formatServerError(action.payload)
            };
        case 'LOCATION_LOCATIONS_D_REQ':
            return {
                ...state,
                fetchingDistricts: true,
                fetchedDistricts: false,
                districts: [],
                errorDistricts: null,
            };
        case 'LOCATION_LOCATIONS_D_RESP':
            return {
                ...state,
                fetchingDistricts: false,
                fetchedDistricts: true,
                districts: parseData(action.payload.data.locations),
                errorDistricts: formatGraphQLError(action.payload)
            };
        case 'LOCATION_LOCATIONS_D_ERR':
            return {
                ...state,
                fetchingDistricts: false,
                errorDistricts: formatServerError(action.payload)
            };
        case 'LOCATION_LOCATIONS_D_CLEAR':
            return {
                ...state,
                districts: [],
                municipalities: [],
                wards: [],
            };
        case 'LOCATION_LOCATIONS_M_REQ':
            return {
                ...state,
                fetchingMunicipalities: true,
                fetchedMunicipalities: false,
                municipalities: [],
                errorMunicipalities: null,
            };
        case 'LOCATION_LOCATIONS_M_RESP':
            return {
                ...state,
                fetchingMunicipalities: false,
                fetchedMunicipalities: true,
                municipalities: parseData(action.payload.data.locations),
                errorMunicipalities: formatGraphQLError(action.payload)
            };
        case 'LOCATION_LOCATIONS_M_ERR':
            return {
                ...state,
                fetchingMunicipalities: false,
                errorMunicipalities: formatServerError(action.payload)
            };
        case 'LOCATION_LOCATIONS_M_CLEAR':
            return {
                ...state,
                municipalities: [],
                wards: [],
            };
        case 'LOCATION_LOCATIONS_W_REQ':
            return {
                ...state,
                fetchingWards: true,
                fetchedWards: false,
                wards: [],
                errorWards: null,
            };
        case 'LOCATION_LOCATIONS_W_RESP':
            return {
                ...state,
                fetchingWards: false,
                fetchedWards: true,
                wards: parseData(action.payload.data.locations),
                errorWards: formatGraphQLError(action.payload)
            };
        case 'LOCATION_LOCATIONS_W_ERR':
            return {
                ...state,
                fetchingWards: false,
                errorWards: formatServerError(action.payload)
            };
        case 'LOCATION_LOCATIONS_W_CLEAR':
            return {
                ...state,
                wards: [],
            };
        default:
            return state;
    }
}

export default reducer;
