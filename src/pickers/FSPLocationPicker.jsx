import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import  Autocomplete  from "@mui/material/Autocomplete";
import { TextField } from "@mui/material";
import { styled } from "@mui/material/styles";

import { withModulesManager, combine, useTranslations } from "@openimis/fe-core";
import { fetchAvailableLocations } from "../actions";
import { locationLabel } from "../utils";

const StyledFSPLocationPicker = styled('div')(({ theme }) => ({
  '& .textField': {
    width: "100%",
  },
}));

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
    <StyledFSPLocationPicker>
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
    </StyledFSPLocationPicker>
  );
};

const enhance = combine(withModulesManager);

export default enhance(FSPLocationPicker);
