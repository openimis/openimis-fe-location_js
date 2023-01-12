import React, { useEffect, useRef } from "react";
import clsx from "clsx";
import { TextInput, useModulesManager, useTranslations } from "@openimis/fe-core";
import { InputAdornment, CircularProgress, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import CheckOutlinedIcon from "@material-ui/icons/CheckOutlined";
import ErrorOutlineOutlinedIcon from "@material-ui/icons/ErrorOutlineOutlined";
import { useDispatch, useSelector } from "react-redux";
import { debounce } from "lodash";

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
  action,
  clearAction,
}) => {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const dispatch = useDispatch();
  const { formatMessage } = useTranslations("location", modulesManager);

  //! If we want to have generic component, HFCode has to be somehow changed into props flow
  //! Maybe it is a good idea to dispatch all info below in the parent component and pass them as a prop value
  const isValid = useSelector((store) => store.loc.validationFields?.HFCode?.isValid);
  const isValidating = useSelector((store) => store.loc.validationFields?.HFCode.isValidating);
  const validationError = useSelector((store) => store.loc.validationFields?.HFCode.validationError);

  console.log("isValid", isValid);
  console.log("isValidating", isValidating);
  console.log("validationError", validationError);

  //! Delayed request
  const debounceResponse = useRef(
    debounce((value) => dispatch(action(modulesManager, { healthFacilityCode: value })), 800),
  ).current;

  useEffect(() => {
    if (value) debounceResponse(value);
    //! Clean up function
    return () => dispatch(clearAction());
  }, [value]);

  return (
    <TextInput
      //! module={module} and pass module as a prop instead of hardcoded value
      module="location"
      className={className}
      disabled={readOnly}
      required={required}
      label={label}
      placeholder={placeholder}
      //! Code taken message should be changed into his own statement instead of using EditDialog one | This also has to be passed if we want to make this component generic
      error={validationError || (!isValid && value) ? formatMessage("location.EditDialog.codeTaken") : null}
      value={value}
      //! Hardcoded fe-location has to be replaced
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
            {!isValid && value  && <ErrorOutlineOutlinedIcon size={20} />}
          </>
        </InputAdornment>
      }
      onChange={onChange}
    />
  );
};

export default UniqueValueValidation;
