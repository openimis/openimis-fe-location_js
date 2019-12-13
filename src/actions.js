import {
  graphql, decodeId,
  formatQuery, formatPageQuery, formatPageQueryWithCount,
  formatMutation
} from "@openimis/fe-core";

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

export function fetchHealthFacility(mm, healthFacilityUuid, healthFacilityCode) {
  let filters = [
    !!healthFacilityUuid ? `uuid: "${healthFacilityUuid}"` : `code: "${healthFacilityCode}"`,
    'showHistory: true'
  ]
  let projections = [
    "id", "uuid", "code", "name", "careType",
    "address", "phone", "fax", "email",
    "legalForm{code}", "level", "subLevel{code}",
    "location{id, uuid, code, name, parent{id, uuid, code, name}}",
    "servicesPricelist{id, uuid, name}", "itemsPricelist{id, uuid, name}",
    "catchments{id, location{id, uuid, code, name}, catchment}",
    "validityFrom", "validityTo"
  ]
  const payload = formatPageQuery("healthFacilities",
    filters,
    projections
  );
  return graphql(payload, 'LOCATION_HEALTH_FACILITY');
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

export function fetchHealthFacilitySummaries(filters) {
  var projections = [
    "id", "uuid", "code", "name", "careType",
    "phone", "fax", "email",
    "level", "legalForm{code}",
    "location{code,name, parent{code, name}}",
    "validityFrom", "validityTo"
  ]
  const payload = formatPageQueryWithCount("healthFacilities",
    filters,
    projections
  );
  return graphql(payload, 'LOCATION_HEALTH_FACILITY_SEARCHER');
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

function formatLocationGQL(location) {
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

function formatCatchment(catchment) {
  return `{
    ${!!catchment.id ? `id: ${catchment.id}`:""}
    locationId: ${decodeId(catchment.location.id)}
    catchment: ${catchment.catchment}    
  }`
}

function formatCatchments(catchments) {
  if (!catchments || !catchments.length) return "";
  return `catchments: [
    ${catchments.map(c => formatCatchment(c)).join('\n')}
  ]`
}

function formatHealthFacilityGQL(hf) {
  return `
    ${hf.uuid !== undefined && hf.uuid !== null ? `uuid: "${hf.uuid}"` : ''}
    code: "${hf.code}"
    name: "${hf.name}"
    locationId: ${decodeId(hf.location.id)}
    level: "${hf.level}"
    legalFormId: "${hf.legalForm.code}"
    careType: "${hf.careType}"
    ${!!hf.subLevel ? `subLevelId: "${hf.subLevel.code}"` : ""}
    ${!!hf.address ? `address: ${JSON.stringify(hf.address)}` : ""}
    ${!!hf.phone ? `phone: "${hf.phone}"` : ""}
    ${!!hf.fax ? `fax: "${hf.fax}"` : ""}
    ${!!hf.email ? `email: "${hf.email}"` : ""}
    ${!!hf.servicesPricelist ? `servicesPricelistId: ${decodeId(hf.servicesPricelist.id)}` : ""}
    ${!!hf.itemsPricelist ? `itemsPricelistId: ${decodeId(hf.itemsPricelist.id)}` : ""}
    ${formatCatchments(hf.catchments)}
  `
}


export function createOrUpdateHealthFacility(hf, clientMutationLabel) {
  let action = hf.uuid !== undefined && hf.uuid !== null ? "update" : "create";
  let mutation = formatMutation(`${action}HealthFacility`, formatHealthFacilityGQL(hf), clientMutationLabel);
  var requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ['LOCATION_MUTATION_REQ', `LOCATION_${action.toUpperCase()}_HEALTH_FACILITY_RESP`, 'LOCATION_MUTATION_ERR'],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime
    }
  )
}


export function deleteHealthFacility(hf, clientMutationLabel) {
  let payload = `
    uuid: "${hf.uuid}"
    code: "${hf.code}"
  `
  let mutation = formatMutation("deleteHealthFacility", payload, clientMutationLabel);
  var requestedDateTime = new Date();
  hf.clientMutationId = mutation.clientMutationId;
  return graphql(
    mutation.payload,
    ['LOCATION_MUTATION_REQ', 'LOCATION_DELETE_HEALTH_FACILITY_RESP', 'LOCATION_MUTATION_ERR'],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime
    }
  )
}