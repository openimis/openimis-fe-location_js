import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { Autocomplete } from "@material-ui/lab";
import { TextField } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";

import { withModulesManager, combine, useTranslations } from "@openimis/fe-core";
import { fetchAvailableLocations } from "../actions";
import { locationLabel } from "../utils";

const styles = () => ({
  textField: {
    width: "100%",
  },
});

const FSPLocationPicker = ({
  locationLevel = 0,
  modulesManager,
  readOnly,
  required,
  value,
  onChange,
  filterOptions,
  filterSelectedOptions = true,
  withLabel = true,
  withPlaceholder = true,
  label,
  placeholder,
}) => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const { formatMessage } = useTranslations("location", modulesManager);
  const options = useSelector((store) => store.loc[`allL${locationLevel}s`]) || [];
  const isLoading = useSelector((store) => store.loc[`fetchingAllL${locationLevel}s`]);

  const handleChange = (__, value) => onChange(value, locationLabel(value));

  useEffect(() => {
    dispatch(fetchAvailableLocations(modulesManager, locationLevel));
  }, [locationLevel]);

  return (
    <Autocomplete
      autoComplete
      openOnFocus
      loadingText={formatMessage("LocationPicker.loadingText")}
      openText={formatMessage("LocationPicker.openText")}
      closeText={formatMessage("LocationPicker.closeText")}
      clearText={formatMessage("LocationPicker.clearText")}
      disabled={readOnly}
      options={options}
      loading={isLoading}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      value={value}
      getOptionLabel={(option) => locationLabel(option)}
      getOptionSelected={(option, value) => option?.id === value?.id}
      onChange={handleChange}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      renderInput={(inputProps) => (
        <TextField
          {...inputProps}
          variant="standard"
          required={required}
          label={withLabel ? label || formatMessage(`location.locationType.${locationLevel}`) : null}
          placeholder={
            withPlaceholder ? placeholder || formatMessage(`location.locationType.${locationLevel}.placeholder`) : null
          }
        />
      )}
    />
  );
};

const enhance = combine(withModulesManager, withTheme, withStyles(styles));

export default enhance(FSPLocationPicker);
