import { healthFacilityLabel} from "../utils";
import React, { useState } from "react";
import { useModulesManager, useTranslations, Autocomplete, useGraphqlQuery } from "@openimis/fe-core";

const HealthFacilityReferPicker = (props) => {
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
    level,
  } = props;

  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("location", modulesManager);
  const [searchString, setSearchString] = useState("");
  const { data, isLoading, error } = useGraphqlQuery(
    `
    query HealthFacilityPicker ($str: String, $level: String) {
      healthFacilities: healthFacilitiesStr(first: 20, str: $str, level: $level) {
        edges {
          node {
            id
            uuid
            code
            name
            level
            servicesPricelist{id, uuid}
            itemsPricelist{id, uuid}
          }
        }
      }
    }
  `,
    { level, str: searchString },
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

export default HealthFacilityReferPicker;
