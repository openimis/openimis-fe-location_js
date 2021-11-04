import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Autocomplete } from "@material-ui/lab";
import { TextField } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { withModulesManager, combine, useTranslations, useDebounceCb } from "@openimis/fe-core";
import _debounce from "lodash/debounce";
import { locationLabel } from "../utils";
import { fetchLocationsStr, clearLocations } from "../actions";
import _ from "lodash";

const styles = () => ({
  textField: {
    width: "100%",
  },
});

const LocationPicker = (props) => {
  const {
    modulesManager,
    multiple,
    readOnly,
    locationLevel = 0,
    value,
    withLabel = true,
    onChange,
    label,
    placeholder,
    filterOptions,
    parentLocation,
    required,
    filterSelectedOptions = true,
    withPlaceholder,
  } = props;
  const [open, setOpen] = useState(false);
  const [resetKey, setResetKey] = useState();
  const { formatMessage } = useTranslations("location", modulesManager);
  const [searchString, setSearchString] = useState("");
  const onInputChange = useDebounceCb(setSearchString, modulesManager.getConf("fe-location", "debounceTime", 400));

  const isLoading = useSelector((state) => state.loc[`fetchingL${locationLevel}s`]);
  const options = useSelector((state) => state.loc[`l${locationLevel}s`] ?? []);

  const dispatch = useDispatch();
  const handleChange = (__, value) => {
    onChange(value, locationLabel(value));
    if (!multiple) setOpen(false);
  };

  // Clear locations on unmount to avoid conflicts with RegionPicker & DistrictPicker
  useEffect(() => {
    return () => {
      dispatch(clearLocations(locationLevel));
    };
  }, []);

  useEffect(() => {
    if (
      open &&
      !isLoading &&
      searchString.length >= modulesManager.getConf("fe-location", "locationMinCharLookup", 2)
    ) {
      dispatch(fetchLocationsStr(modulesManager, locationLevel, parentLocation, searchString));
    }
  }, [searchString, parentLocation]);

  useEffect(() => {
    if (open) {
      dispatch(fetchLocationsStr(modulesManager, locationLevel, parentLocation, searchString, 20));
    } else {
      setSearchString("");
    }
  }, [open]);

  useEffect(() => {
    setResetKey(Date.now());
  }, [value]);

  return (
    <Autocomplete
      key={resetKey}
      loadingText={formatMessage("LocationPicker.loadingText")}
      openText={formatMessage("LocationPicker.openText")}
      closeText={formatMessage("LocationPicker.closeText")}
      clearText={formatMessage("LocationPicker.clearText")}
      openOnFocus
      multiple={multiple}
      disabled={readOnly}
      options={options}
      loading={isLoading}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      autoComplete
      value={value}
      getOptionLabel={(option) => locationLabel(option)}
      getOptionSelected={(option, value) => option.id === value.id}
      onChange={handleChange}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={(__, searchString) => onInputChange(searchString)}
      renderInput={(inputProps) => (
        <TextField
          {...inputProps}
          variant="standard"
          required={required}
          label={withLabel && (label || formatMessage(`Location${locationLevel}Picker.label`))}
          placeholder={
            withPlaceholder ? placeholder || formatMessage(`Location${locationLevel}Picker.placehoder`) : null
          }
        />
      )}
    />
  );
};

const enhance = combine(withModulesManager, withTheme, withStyles(styles));

export default enhance(LocationPicker);
