import React, { useEffect } from "react";
import clsx from "clsx";
import { TextInput, useModulesManager, useTranslations} from "@openimis/fe-core";
import { InputAdornment, CircularProgress, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import CheckOutlinedIcon from "@material-ui/icons/CheckOutlined";
import ErrorOutlineOutlinedIcon from "@material-ui/icons/ErrorOutlineOutlined";
import { useDispatch, useSelector } from "react-redux";
import { HFCodeValidationCheck } from "../actions";
import _debounce from "lodash/debounce";

const useStyles = makeStyles((theme) => ({
  validIcon: {
    color: "green",
  },
  invalidIcon: {
    color: theme.palette.error.main,
  },
}));

const UniqueValueValidation = ({
  value,
  onChange,
  className,
  label = "Code",
  placeholder,
  readOnly,
  required,
  inputProps,
}) => {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const dispatch = useDispatch();
  const { formatMessage } = useTranslations("location", modulesManager);

  const isValid = useSelector((store) => store.loc.validationFields?.HFCode?.isValid);
  const isValidating = useSelector((store) => store.loc.validationFields?.HFCode.isValidating);
  const validationError = useSelector((store) => store.loc.validationFields?.HFCode.validationError);

  console.log("isValid", isValid);
  console.log("isValidating", isValidating);
  console.log("validationError", validationError);

  useEffect(() => {
    if (value) dispatch(HFCodeValidationCheck(modulesManager, { healthFacilityCode: value }));
  }, [value]);

  return (
    <TextInput
      module="location"
      className={className}
      disabled={readOnly}
      required={required}
      label={label}
      placeholder={placeholder}
      error={ validationError || (!isValid && value) ? formatMessage("location.EditDialog.codeTaken") : null}
      value={value}
      inputProps={{
        maxLength: modulesManager.getConf("fe-location", "locationForm.CodeMaxLength", inputProps.maxLength),
      }}
      endAdornment={
        <InputAdornment
          position="end"
          className={clsx(isValid && value && classes.validIcon, !isValid && value && classes.invalidIcon)}
        >
          <>
            {isValidating && (
              <Box mr={1}>
                <CircularProgress size={20} />
              </Box>
            )}
            {isValid && value && <CheckOutlinedIcon size={20} />}
            {!isValid && value && <ErrorOutlineOutlinedIcon size={20} />}
          </>
        </InputAdornment>
      }
      onChange={onChange}
    />
  );
};

export default UniqueValueValidation;
