# openIMIS Frontend Location reference module
This repository holds the files of the openIMIS Frontend Location reference module.
It is dedicated to be deployed as a module of [openimis-fe_js](https://github.com/openimis/openimis-fe_js).

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

## Main Menu Contributions
None

## Other Contributions
* `core.Boot`: registered `UserHealthFacilityLoader` and `UserDistrictsLoader` to load the reference Health Facility (GraphQL: `healthFacilities`) as well as granted Regions/Districts (GraphQL `userDistricts`) for the authenticated user

## Available Contribution Points
None

## Published Components
* `location.HealthFacilityFullPath`: Grid component to display a Health Facility alongs its full path (Region and District). Known usage: Insuree First Service Point. GraphQL: `healthFacilities`
* `location.HealthFacilityPicker`: auto-suggestion picker for Health Facility (debounced search). GraphQL: `healthFacilitiesStr`
* `location.HealthFacilityLevelPicker`: constant-based picker, translation keys: `location.healthFacilityLevel.null`, `location.healthFacilityLevel.C`,...
* `location.RegionPicker`: auto-suggestion picker for Regions (out of user's registered regions in cache)
* `location.DistrictPicker`: auto-suggestion picker for Regions (out of user's registered districts in cache)


## Dispatched Redux Actions
* `LOCATION_USER_DISTRICTS_{REQ|RESP|ERR}`: loading user's registered districts. Known usage: `UserDistrictsLoader` boot component
* `LOCATION_USER_HEALTH_FACILITY_FULL_PATH_{REQ|RESP|ERR}`, loading user default health facility (full path). Known usage: `UserHealthFacilityLoader` boot component
* `LOCATION_HEALTH_FACILITY_FULL_PATH_{REQ|RESP|ERR}`, loading health facility full path. Known usage: `UserHealthFacilityLoader`, `HealthFacilityFullPathComponent` (itself used in `insuree.InsureeFirstServicePoint`), 
* `LOCATION_HEALTH_FACILITIES_{REQ|RESP|ERR}`, loading Health Facilities (full text search on code + name). Known usage: `HealthFacilityPicker`

## Other Modules Listened Redux Actions
None

## Other Modules Redux State Bindings
* `state.core.user`, to access user info (rights,...)

## Configurations Options
* `healthFacilitiesMinCharLookup`: minimum characters to type before triggering search in `location.HealthFacilityPicker`, Default: 2
* `debounceTime`: debounce time to wait before triggering search in `location.HealthFacilityPicker`, Default: 800 ms
* `RegionPicker.selectThreshold`: region suggestions count threshold under which the AutoSuggestion switch to a SelectInut (drop down list), default: 10
* `DistrictPicker.selectThreshold`: district suggestions count threshold under which the AutoSuggestion switch to a SelectInut (drop down list), default: 10
* `HealthFacilityPicker.selectThreshold`: HF suggestions count threshold under which the AutoSuggestion switch to a SelectInut (drop down list), default: 10
* `ClaimAdminPicker.selectThreshold`: Claim Admin suggestions count threshold under which the AutoSuggestion switch to a SelectInut (drop down list), default: 10