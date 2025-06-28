import { healthFacilityLabel, LOCATION_SUMMARY_PROJECTION } from "../utils";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useModulesManager, useTranslations, Autocomplete, useGraphqlQuery } from "@openimis/fe-core";
import _debounce from "lodash/debounce";

const HealthFacilityPicker = (props) => {
  const {
    onChange,
    readOnly,
    required,
    withLabel = true,
    withPlaceholder,
    value,
    label,
    filterOptions,
    filterSelectedOptions,
    placeholder,
    multiple,
    region,
    district,
    level,
  } = props;

  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("location", modulesManager);
  const [searchString, setSearchString] = useState("");
  let pickedDistrictsUuids = [];
  Array.isArray(district) ? pickedDistrictsUuids = district?.map((district) => district?.uuid) : pickedDistrictsUuids.push(district?.uuid);
  const { data, isLoading, error } = useGraphqlQuery(
    `
    query HealthFacilityPicker ($str: String, $region: String, $district: [String], $level: String) {
      healthFacilities: healthFacilitiesStr(first: 20, str: $str, regionUuid: $region, districtsUuids: $district, level: $level) {
        edges {
          node {
            id
            uuid
            code
            name
            level
            servicesPricelist{id, uuid}
            itemsPricelist{id, uuid}
            location {${LOCATION_SUMMARY_PROJECTION.join(",")} parent { ${LOCATION_SUMMARY_PROJECTION.join(",")} }}
          }
        }
      }
    }
  `,
    { level, region: region?.uuid, district: pickedDistrictsUuids, str: searchString },
    { skip: true },
  );

  return (
    <Autocomplete
      multiple={multiple}
      required={required}
      placeholder={placeholder ?? formatMessage("HealthFacilityPicker.placeholder")}
      label={label ?? formatMessage("HealthFacilityPicker.label")}
      error={error}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      options={data?.healthFacilities?.edges.map((edge) => edge.node) ?? []}
      isLoading={isLoading}
      value={value}
      getOptionLabel={healthFacilityLabel}
      onChange={(option) => onChange(option, healthFacilityLabel(option))}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={setSearchString}
    />
  );
};

export default HealthFacilityPicker;
