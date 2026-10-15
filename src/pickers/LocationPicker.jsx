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
  },
  '& .MuiFormControl-root': {
    width: '100%',
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
    regionLocation,
    districtLocation,
    required,
    filterSelectedOptions = true,
    withPlaceholder,
    title = '',
    dataCy
  } = props;
  const [open, setOpen] = useState(false);
  const [resetKey, setResetKey] = useState();
  const { formatMessage } = useTranslations("location", modulesManager);
  const [searchString, setSearchString] = useState("");
  const onInputChange = useDebounceCb(setSearchString, modulesManager.getConf("fe-location", "debounceTime", 400));

  const isLoading = useSelector((state) => state.loc[`fetchingL${locationLevel}s`]);
  const options = useSelector((state) => state.loc[`l${locationLevel}s`] ?? []);

  const regions = useSelector((state) => state.loc[`l0s`]);
  const districts = useSelector((state) => state.loc[`l1s`]);
  // `l0s`/`l1s` carry two different things: the *results* of a level-0/1 lookup, and - when a
  // RegionPicker or DistrictPicker makes a selection - the single location that was chosen
  // (LOCATION_FILTER_REGION_SELECTED replaces the slice with `[location]`). Only the second is
  // an ancestor to narrow by. Taking the first entry of a result list treated an arbitrary
  // region as "the" region, and since this value is also passed to fetchLocationsStr below it
  // narrowed the query itself, not just the dropdown: on the user form the Districts picker
  // only ever offered the districts of whichever region happened to come back first (OP-3186).
  const selectedRegion = regions?.length === 1 ? regions[0] : null;
  const selectedDistrict = districts?.length === 1 ? districts[0] : null;
  const activeRegion = regionLocation || selectedRegion;
  const activeDistrict = districtLocation || selectedDistrict;

  const hasAncestor = (node, targetUuid) => {
    let current = node;
    while (current) {
      if (current.uuid === targetUuid) return true;
      current = current.parent || null;
    }
    return false;
  };

  // Options come from `locationsStr`, which the backend already narrows with
  // Location.get_queryset - the same rule the location list uses. Filtering again
  // here against the user's own districts answered the question a second way and
  // hid locations the user is entitled to administer (OP-3186).
  const filteredOptions = options.filter((option) => {
    if (parentLocation?.uuid) return hasAncestor(option, parentLocation.uuid);
    if (parentLocations?.length) return parentLocations.some((uuid) => hasAncestor(option, uuid));
    // `activeRegion`/`activeDistrict` narrow a picker to a chosen ancestor, so they
    // only mean anything strictly below that ancestor's own level. They are read from
    // `l0s`/`l1s`, which at level 0 and 1 is the option list itself: without the level
    // guard a region was kept only if it descended from `l0s[0]`, which no region does
    // but itself, leaving exactly one region selectable (OP-3186).
    if (locationLevel > 1 && activeDistrict?.uuid) return hasAncestor(option, activeDistrict.uuid);
    if (locationLevel > 0 && activeRegion?.uuid) return hasAncestor(option, activeRegion.uuid);
    return true;
  });

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
          activeRegion?.uuid,
          activeDistrict?.uuid,
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
          modulesManager, locationLevel, activeRegion?.uuid,
          activeDistrict?.uuid, parentLocation, searchString,
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
        options={filteredOptions}
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
        data-cy={dataCy}
        renderInput={(inputProps) => (
          <TextField
            {...inputProps}
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
