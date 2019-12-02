import { graphql, formatQuery, formatPageQuery, formatMutation } from "@openimis/fe-core";

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

export function fetchLocations(levels, type, parent) {
  let filters = [`type: "${levels[type]}"`];
  if (!!parent) {
    filters.push(`parent_Uuid: "${parent.uuid}"`)
  }
  let payload = formatPageQuery("locations",
    filters,
    ["id", "uuid", "type", "code", "name", "malePopulation", "femalePopulation", "otherPopulation", "families"]
  );
  return graphql(payload, `LOCATION_LOCATIONS_${type}`);
}

export function clearLocations(type) {
  return dispatch => {
    dispatch({ type: `LOCATION_LOCATIONS_${type}_CLEAR` })
  }
}

export function formatLocationGQL(location) {
  return `
    ${location.uuid !== undefined && location.uuid !== null ? `uuid: "${location.uuid}"` : ''}
    code: "${location.code}"
    name: "${location.name}"
    ${!!location.parentUuid ? `parentUuid: "${location.parentUuid}"` : ""}
    ${!!location.malePopulation ? `malePopulation: ${location.malePopulation}` : ""}
    ${!!location.femalePopulation ? `femalePopulation: ${location.femalePopulation}` : ""}
    ${!!location.otherPopulation ? `otherPopulation: ${location.otherPopulation}` : ""}
    ${!!location.families ? `families: ${location.families}` : ""}
    type: "${location.type}"
  `
}

export function createOrUpdateLocation(location, clientMutationLabel) {
  let action = location.uuid !== undefined && location.uuid !== null ? "update" : "create";
  let mutation = formatMutation(`${action}Location`, formatLocationGQL(location), clientMutationLabel);
  var requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ['LOCATION_MUTATION_REQ', `LOCATION_${action.toUpperCase()}_LOCATION_RESP`, 'LOCATION_MUTATION_ERR'],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime
    }
  )
}

export function deleteLocation(location, opts, clientMutationLabel) {
  let payload = `
    uuid: "${location.uuid}"
    code: "${location.code}"
    ${opts.action === "drop" ? "" : `newParentUuid: "${opts.newParent}"`}
  `;
  let mutation = formatMutation("deleteLocation", payload, clientMutationLabel);
  var requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ['LOCATION_MUTATION_REQ', 'LOCATION_DELETE_LOCATION_RESP', 'LOCATION_MUTATION_ERR'],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime
    }
  )
}

export function moveLocation(location, newParent, clientMutationLabel) {
  let payload = `
    uuid: "${location.uuid}"
    ${!!newParent ? `newParentUuid: "${newParent.uuid}"` : ""}
  `;
  let mutation = formatMutation("moveLocation", payload, clientMutationLabel);
  var requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ['LOCATION_MUTATION_REQ', 'LOCATION_MOVE_LOCATION_RESP', 'LOCATION_MUTATION_ERR'],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime
    }
  )
}