import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { TextInput, useDebounceCb, useModulesManager, useTranslations, useGraphqlQuery } from "@openimis/fe-core";
import { InputAdornment, CircularProgress, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import CheckOutlinedIcon from "@material-ui/icons/CheckOutlined";
import ErrorOutlineOutlinedIcon from "@material-ui/icons/ErrorOutlineOutlined";

const useStyles = makeStyles((theme) => ({
  validIcon: {
    color: "green",
  },
  invalidIcon: {
    color: theme.palette.error.main,
  },
}));

const operation = `
  query ($locationCode: String!) {
    isValid: validateLocationCode(locationCode: $locationCode)
  }
`;

const UniqueCodeInput = (props) => {
  const { value, new_location, onChange, className, label = "Code", placeholder, readOnly, required, inputProps } = props;
  const [internalValue, setInternalValue] = useState(value);
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("location", modulesManager);
  const classes = useStyles();
  const {
    isLoading,
    data,
    error: graphqlError,
  } = useGraphqlQuery(operation, { locationCode: internalValue}, { skip: !internalValue });

  const handleValueChange = useDebounceCb((val) => {
    if (val) {
      setInternalValue(val);
    } else {
      onChange({"code": val, "isValid": isValid});
    }
  }, modulesManager.getConf("fe-location", "debounceTime", 400));

  const isValid = !isLoading && data?.isValid;

  useEffect(() => {
    onChange({"code": internalValue, "isValid": isValid});
  }, [isValid]);

  return (
    <TextInput
      module="location"
      className={className}
      disabled={readOnly}
      required={required}
      label={label}
      placeholder={placeholder}
      error={graphqlError || (!isValid && value)? formatMessage("location.EditDialog.codeTaken") : null}
      value={value}
      new_location={new_location}
      inputProps={{ maxLength: modulesManager.getConf("fe-location", "locationForm.CodeMaxLength", inputProps.maxLength) }}
      endAdornment={
        <InputAdornment position="end" className={clsx((isValid && value) && classes.validIcon, (!isValid && value)&& classes.invalidIcon)}>
          <>
            {isLoading && (
              <Box mr={1}>
                <CircularProgress size={20} />
              </Box>
            )}
            {(isValid && value) && <CheckOutlinedIcon size={20} />}
            {(!isValid && value) && <ErrorOutlineOutlinedIcon size={20} />}
          </>
        </InputAdornment>
      }
      onChange={handleValueChange}
    />
  );
};

export default UniqueCodeInput;
