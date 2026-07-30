import { useState } from "react";
import { useModulesManager, useTranslations, Autocomplete, useGraphqlQuery } from "@openimis/fe-core";

const HealthFacilitySubLevelPicker = (props) => {
  const {
    onChange,
    readOnly,
    required,
    withLabel = true,
    withPlaceholder,
    value, // code string or null
    label,
    withNull = true,
    ...otherProps
  } = props;

  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("location", modulesManager);
  const [searchString, setSearchString] = useState("");

  const { data, isLoading, error } = useGraphqlQuery(
    `
    query HealthFacilitySubLevels {
      healthFacilitySubLevels {
        code
        healthFacilitySubLevel
      }
    }
    `,
    {},
    { skip: false },
  );

  const options = data?.healthFacilitySubLevels ?? [];

  const selected = options.find((o) => o.code === value) ?? null;

  const getOptionLabel = (option) => {
    if (!option) return "";
    return (
      option.healthFacilitySubLevel ||
      formatMessage(`healthFacilitySubLevel.${option.code}`) ||
      option.code
    );
  };

  const handleChange = (option) => {
    const code = option ? option.code : null;
    const display = getOptionLabel(option);
    onChange(code, display);
  };

  return (
    <Autocomplete
      required={required}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      label={label ?? formatMessage("healthFacilitySubLevel")}
      placeholder={formatMessage("healthFacilitySubLevel.null")}
      error={error}
      options={options}
      isLoading={isLoading}
      value={selected}
      getOptionLabel={getOptionLabel}
      onChange={handleChange}
      onInputChange={setSearchString}
      withNull={withNull}
      {...otherProps}
    />
  );
};

export default HealthFacilitySubLevelPicker;
