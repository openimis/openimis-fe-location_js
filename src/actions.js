import { graphql, formatQuery, formatPageQuery, decodeId } from "@openimis/fe-core";

export function fetchUserDistricts() {
  let payload = formatQuery("userDistricts",
    null,
    ["id", "uuid", "code", "name",
      "regionId", "regionUuid", "regionCode", "regionName"]
  );
  return graphql(payload, 'LOCATION_USER_DISTRICTS');
}

function healthFacilityFullPath(key, mm, id) {
  let payload = formatPageQuery("healthFacilities",
    [`id: "${id}"`],
    mm.getRef("location.HealthFacilityPicker.projection")
  );
  return graphql(payload, key);
}

export function fetchUserHealthFacilityFullPath(mm, id) {
  return healthFacilityFullPath('LOCATION_USER_HEALTH_FACILITY_FULL_PATH', mm, id);
}

export function fetchHealthFacilityFullPath(mm, id) {
  return healthFacilityFullPath('LOCATION_HEALTH_FACILITY_FULL_PATH', mm, id);
}

export function fetchHealthFacilities(mm, region, district, str) {
  let filters = [];
  if (!!str && str.length) filters.push([`str:"${str}"`]);
  if (!!region) filters.push([`regionUuid: "${region.uuid}"`])
  if (!!district) filters.push([`districtUuid:"${district.uuid}"`])
  let payload = formatPageQuery("healthFacilitiesStr",
    filters,
    mm.getRef("location.HealthFacilityPicker.projection")
  );
  return graphql(payload, 'LOCATION_HEALTH_FACILITIES');
}

export function fetchLocations(type, parent) {
  let filters = [`type: "${type}"`];
  if (!!parent) {
    filters.push(`parent_Uuid: "${parent.uuid}"`)
  }
  let payload = formatPageQuery("locations",
    filters,
    ["id", "uuid", "type", "code", "name"]
  );
  return graphql(payload, `LOCATION_LOCATIONS_${type}`);
}

export function clearLocations(type) {
  return dispatch => {
    dispatch({type: `LOCATION_LOCATIONS_${type}_CLEAR`})
  }
}
