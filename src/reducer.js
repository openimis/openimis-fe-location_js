import {
    formatServerError, formatGraphQLError, parseData, pageInfo,
    dispatchMutationReq, dispatchMutationResp, dispatchMutationErr
} from '@openimis/fe-core';

import { locationLabel } from "./utils";

function reducer(
    state = {
        fetchingHealthFacilityFullPath: false,
        fetchedHealthFacilityFullPath: false,
        healthFacilityFullPath: null,
        errorHealthFacilityFullPath: null,
        fetchingHealthFacilities: false,
        fetchedHealthFacilities: false,
        healthFacilities: null,
        healthFacilitiesPageInfo: {},
        errorHealthFacilities: null,
        fetchingHealthFacility: false,
        fetchedHealthFacility: false,
        healthFacility: null,
        errorHealthFacility: null,
        fetchingL0s: false,
        fetchedL0s: false,
        l0s: [],
        errorL0s: null,
        fetchingL1s: false,
        fetchedL1s: false,
        l1s: [],
        errorL1s: null,
        fetchingL2s: false,
        fetchedL2s: false,
        l2s: [],
        errorL2s: null,
        fetchingL3s: false,
        fetchedL3s: false,
        l3s: [],
        errorL3s: null,
        submittingMutation: false,
        mutation: {},
    },
    action,
) {
    switch (action.type) {
        case 'LOCATION_USER_DISTRICTS_RESP':
            let userL1s = action.payload.data.userDistricts || [];
            let userL0s = userL1s.reduce(
                (res, d) => {
                    res[d.parent.uuid] = d.parent;
                    return res;
                }
                , {})
            return {
                ...state,
                userL0s: Object.values(userL0s),
                userL1s,
            }
        case 'LOCATION_USER_HEALTH_FACILITY_FULL_PATH_RESP':
            var userHealthFacilityFullPath = parseData(action.payload.data.healthFacilities)[0]
            return {
                ...state,
                userHealthFacilityFullPath,
                userHealthFacilityLocationStr: !!userHealthFacilityFullPath.location ? locationLabel(userHealthFacilityFullPath.location) : null,
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
        case 'LOCATION_HEALTH_FACILITIES_STR_REQ':
            return {
                ...state,
                fetchingHealthFacilities: true,
                fetchedHealthFacilities: false,
                healthFacilities: null,
                errorHealthFacilities: null,
            };
        case 'LOCATION_HEALTH_FACILITIES_STR_RESP':
            return {
                ...state,
                fetchingHealthFacilities: false,
                fetchedHealthFacilities: true,
                healthFacilities: parseData(action.payload.data.healthFacilitiesStr),
                errorHealthFacilities: formatGraphQLError(action.payload)
            };
        case 'LOCATION_HEALTH_FACILITIES_STR_ERR':
            return {
                ...state,
                fetchingHealthFacilities: false,
                errorHealthFacilities: formatServerError(action.payload)
            };
        case 'LOCATION_HEALTH_FACILITY_SEARCHER_REQ':
            return {
                ...state,
                fetchingHealthFacilities: true,
                fetchedHealthFacilities: false,
                healthFacilities: null,
                healthFacilitiesPageInfo: { totalCount: 0 },
                errorHealthFacilities: null,
            };
        case 'LOCATION_HEALTH_FACILITY_SEARCHER_RESP':
            return {
                ...state,
                fetchingHealthFacilities: false,
                fetchedHealthFacilities: true,
                healthFacilities: parseData(action.payload.data.healthFacilities),
                healthFacilitiesPageInfo: pageInfo(action.payload.data.healthFacilities),
                errorHealthFacilities: formatGraphQLError(action.payload)
            };
        case 'LOCATION_HEALTH_FACILITY_SEARCHER_ERR':
            return {
                ...state,
                fetchingHealthFacilities: false,
                errorHealthFacilities: formatServerError(action.payload)
            };
        case 'LOCATION_HEALTH_FACILITY_REQ':
            return {
                ...state,
                fetchingHealthFacility: true,
                fetchedHealthFacility: false,
                healthFacility: null,
                errorHealthFacility: null,
            };
        case 'LOCATION_HEALTH_FACILITY_RESP':
            var hfs = parseData(action.payload.data.healthFacilities);
            return {
                ...state,
                fetchingHealthFacility: false,
                fetchedHealthFacility: true,
                healthFacility: (!!hfs && hfs.length > 0) ? hfs[0] : null,
                errorHealthFacility: formatGraphQLError(action.payload)
            };
        case 'LOCATION_HEALTH_FACILITY_ERR':
            return {
                ...state,
                fetchingHealthFacility: false,
                errorHealthFacility: formatServerError(action.payload)
            };
        case 'LOCATION_LOCATIONS_0_REQ':
            return {
                ...state,
                fetchingL0s: true,
                fetchedL0s: false,
                l0s: [],
                l1s: [],
                l2s: [],
                l3s: [],
                errorL0s: null,
            };
        case 'LOCATION_LOCATIONS_0_RESP':
            return {
                ...state,
                fetchingL0s: false,
                fetchedL0s: true,
                l0s: parseData(action.payload.data.locations || action.payload.data.locationsStr),
                errorL0s: formatGraphQLError(action.payload)
            };
        case 'LOCATION_LOCATIONS_0_ERR':
            return {
                ...state,
                fetchingL0s: false,
                errorL0s: formatServerError(action.payload)
            };
        case 'LOCATION_LOCATIONS_1_REQ':
            return {
                ...state,
                fetchingL1s: true,
                fetchedL1s: false,
                l1s: [],
                l2s: [],
                l3s: [],
                errorL1s: null,
            };
        case 'LOCATION_LOCATIONS_1_RESP':
            return {
                ...state,
                fetchingL1s: false,
                fetchedL1s: true,
                l1s: parseData(action.payload.data.locations || action.payload.data.locationsStr),
                errorL1s: formatGraphQLError(action.payload)
            };
        case 'LOCATION_LOCATIONS_1_ERR':
            return {
                ...state,
                fetchingL1s: false,
                errorL1s: formatServerError(action.payload)
            };
        case 'LOCATION_LOCATIONS_1_CLEAR':
            return {
                ...state,
                l1s: [],
                l2s: [],
                l3s: [],
            };
        case 'LOCATION_LOCATIONS_2_REQ':
            return {
                ...state,
                fetchingL2s: true,
                fetchedL2s: false,
                l2s: [],
                l3s: [],
                errorL2s: null,
            };
        case 'LOCATION_LOCATIONS_2_RESP':
            return {
                ...state,
                fetchingL2s: false,
                fetchedL2s: true,
                l2s: parseData(action.payload.data.locations || action.payload.data.locationsStr),
                errorL2s: formatGraphQLError(action.payload)
            };
        case 'LOCATION_LOCATIONS_2_ERR':
            return {
                ...state,
                fetchingL2s: false,
                errorL2s: formatServerError(action.payload)
            };
        case 'LOCATION_LOCATIONS_2_CLEAR':
            return {
                ...state,
                l2s: [],
                l3s: [],
            };
        case 'LOCATION_LOCATIONS_3_REQ':
            return {
                ...state,
                fetchingL3s: true,
                fetchedL3s: false,
                l3s: [],
                errorL3s: null,
            };
        case 'LOCATION_LOCATIONS_3_RESP':
            return {
                ...state,
                fetchingL3s: false,
                fetchedL3s: true,
                l3s: parseData(action.payload.data.locations || action.payload.data.locationsStr),
                errorL3s: formatGraphQLError(action.payload)
            };
        case 'LOCATION_LOCATIONS_3_ERR':
            return {
                ...state,
                fetchingL3s: false,
                errorL3s: formatServerError(action.payload)
            };
        case 'LOCATION_LOCATIONS_3_CLEAR':
            return {
                ...state,
                l3s: [],
            };
        case 'LOCATION_FILTER_SELECTED':
            let newState = { ...state }
            for (var i = action.payload.level + 1; i < action.payload.maxLevels; i++) {
                newState[`l${i}s`] = []
            }
            return newState;
        case 'LOCATION_MUTATION_REQ':
            return dispatchMutationReq(state, action)
        case 'LOCATION_MUTATION_ERR':
            return dispatchMutationErr(state, action);
        case 'LOCATION_CREATE_LOCATION_RESP':
            return dispatchMutationResp(state, "createLocation", action);
        case 'LOCATION_UPDATE_LOCATION_RESP':
            return dispatchMutationResp(state, "updateLocation", action);
        case 'LOCATION_DELETE_LOCATION_RESP':
            return dispatchMutationResp(state, "deleteLocation", action);
        case 'LOCATION_MOVE_LOCATION_RESP':
            return dispatchMutationResp(state, "moveLocation", action);
        case 'LOCATION_CREATE_HEALTH_FACILITY_RESP':
            return dispatchMutationResp(state, "createHealthFacility", action);
        case 'LOCATION_UPDATE_HEALTH_FACILITY_RESP':
            return dispatchMutationResp(state, "updateHealthFacility", action);
        case 'LOCATION_DELETE_HEALTH_FACILITY_RESP':
            return dispatchMutationResp(state, "deleteHealthFacility", action);
        default:
            return state;
    }
}

export default reducer;
