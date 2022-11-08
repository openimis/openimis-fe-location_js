import { healthFacilityLabel } from "../utils";
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
  const userHealthFacility = useSelector((state) => state.loc.userHealthFacilityFullPath);
  const { formatMessage } = useTranslations("location", modulesManager);
  const [searchString, setSearchString] = useState("");
  const pickedDistrictsUuids = district && district.map((district) => district.uuid);
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
            location {id,uuid,code,name,type parent { id,uuid,code,name,type }}
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
      readOnly={Boolean(userHealthFacility) || readOnly}
      options={data?.healthFacilities?.edges.map((edge) => edge.node) ?? []}
      isLoading={isLoading}
      value={userHealthFacility ?? value}
      getOptionLabel={healthFacilityLabel}
      onChange={(option) => onChange(option, healthFacilityLabel(option))}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={setSearchString}
    />
  );
};

export default HealthFacilityPicker;
