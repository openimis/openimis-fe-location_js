import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Autocomplete  from "@mui/material/Autocomplete";
import { TextField } from "@mui/material";
import Popper from "@mui/material/Popper";
import { styled } from "@mui/material/styles";
import { withModulesManager, combine, useTranslations, useDebounceCb } from "@openimis/fe-core";
import _debounce from "lodash/debounce";
import { locationLabel } from "../utils";
import { fetchLocationsStr, clearLocations, fetchParentLocationsStr } from "../actions";
import _ from "lodash";

const StyledLocationPicker = styled('div')(({ theme }) => ({
  '& .textField': {
    width: "100%",
  },
  '& .MuiAutocomplete-root': {
    width: '100%',
    minWidth: 360,
  },
  '& .MuiFormControl-root': {
    width: '100%',
    minWidth: 360,
  },
}));

const LocationDropdownPopper = styled(Popper)(({ theme }) => ({
  width: 'auto',
  minWidth: 300,
  '& .MuiAutocomplete-paper': {
    width: 'max-content',
  },
  '& .MuiAutocomplete-listbox': {
    width: 'max-content',
  },
}));

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
    parentLocations,
    required,
    filterSelectedOptions = true,
    withPlaceholder,
    restrictedOptions,
    title = '',
  } = props;
  const [open, setOpen] = useState(false);
  const [resetKey, setResetKey] = useState();
  const { formatMessage } = useTranslations("location", modulesManager);
  const [searchString, setSearchString] = useState("");
  const onInputChange = useDebounceCb(setSearchString, modulesManager.getConf("fe-location", "debounceTime", 400));

  const isLoading = useSelector((state) => state.loc[`fetchingL${locationLevel}s`]);
  const options = useSelector((state) => state.loc[`l${locationLevel}s`] ?? []);

  const restricted = useSelector((state) => state.loc[`userL${locationLevel}s`]);

  const regions = useSelector((state) => state.loc[`l0s`]);
  const districts = useSelector((state) => state.loc[`l1s`]);

  const dispatch = useDispatch();
  const handleChange = (__, value) => {
    onChange(value, locationLabel(value));
    if (!multiple) setOpen(false);
  };

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
      if (parentLocations) {
        dispatch(fetchParentLocationsStr(modulesManager, locationLevel, parentLocations, searchString, 20));
      } else {
        dispatch(fetchLocationsStr(
          modulesManager,
          locationLevel,
          regions?.[0]?.uuid,
          districts?.[0]?.uuid,
          parentLocation,
          searchString,
        ));
      }
    }
  }, [searchString, parentLocation, parentLocations]);

  useEffect(() => {
    if (open) {
      if (parentLocations) {
        dispatch(fetchParentLocationsStr(modulesManager, locationLevel, parentLocations, searchString, 20));
      } else {
        dispatch(fetchLocationsStr(
          modulesManager, locationLevel, regions?.[0]?.uuid,
          districts?.[0]?.uuid, parentLocation, searchString,
        ));
      }
    } else {
      setSearchString("");
    }
  }, [open]);

  useEffect(() => {
    setResetKey(Date.now());
  }, [value]);

  return (
    <StyledLocationPicker>
      <Autocomplete
        key={resetKey}
        fullWidth
        loadingText={formatMessage("LocationPicker.loadingText")}
        openText={formatMessage("LocationPicker.openText")}
        closeText={formatMessage("LocationPicker.closeText")}
        clearText={formatMessage("LocationPicker.clearText")}
        openOnFocus
        multiple={multiple}
        disabled={readOnly}
        options={restrictedOptions ? restricted : options}
        loading={isLoading}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        autoComplete
        value={value}
        getOptionLabel={(option) => locationLabel(option)}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        onChange={handleChange}
        filterOptions={filterOptions}
        filterSelectedOptions={filterSelectedOptions}
        onInputChange={(__, searchString) => onInputChange(searchString)}
        PopperComponent={LocationDropdownPopper}
        renderInput={(inputProps) => (
          <TextField
            {...inputProps}
            variant="standard"
            fullWidth
            required={required}
            label={withLabel && (label || formatMessage(`Location${locationLevel}Picker.label`))}
            placeholder={
              withPlaceholder ? placeholder || formatMessage(`Location${locationLevel}Picker.placehoder`) : null
            }
            title={title}
          />
        )}
      />
    </StyledLocationPicker>
  );
};

const enhance = combine(withModulesManager);

export { StyledLocationPicker };
export default enhance(LocationPicker);
