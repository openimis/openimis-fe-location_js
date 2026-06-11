
import React, { useEffect, useState, useRef } from "react";
import { injectIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import Cascader from "rc-cascader";
import { TextField, Chip } from "@mui/material";
import { styled } from "@mui/material/styles";
import { GetIconComponent, useModulesManager, useTranslations } from "@openimis/fe-core";
import { getLocationLevel, locationLabel } from "../utils";
import { fetchLocationsStr, fetchLocationsByUuids } from "../actions";
import _ from "lodash";

const ArrowDropDownIcon = GetIconComponent("ArrowDropDown")
const KeyboardArrowRightIcon = GetIconComponent("KeyboardArrowRight");
const AutorenewIcon = GetIconComponent("Autorenew");
const StyledLocationCascader = styled('div')(({ theme }) => ({
  width: "100%",
  maxWidth: "100%",
  boxSizing: "border-box",
  '& .root': {
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
    '& .chipsContainer': {
      display: "flex",
      flexWrap: "wrap",
      gap: "4px",
      flex: 1,
      minWidth: 0,
      margin: "3px",
    },
    '& .inputRoot': {
      flexWrap: "wrap",
      "& input": {
        width: 0,
        minWidth: 0,
      },
    },
  },
  '& .rc-cascader': {
    width: "100%",
    maxWidth: "100%",
    display: "block",
  },
  '& .MuiFormControl-root': {
    width: "100%",
    maxWidth: "100%",
  },
}));



const extractPathFromValue = (location) => {
  const names = [];
  const uuids = [];

  let current = location;
  while (current) {
    names.unshift(current.name);
    uuids.unshift(current.uuid);
    current = current.parent;
  }

  return {
    names,
    uuids,
  };
};

const LocationCascader = ({
  label = "Location",
  onChange,
  readOnly,
  value,
  multiple = false,
  required = false,
  requiredLevel,
}) => {
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations("location", modulesManager);
  const dispatch = useDispatch();
  const locState = useSelector((state) => state.loc);
  const maxLevel = parseInt(
    modulesManager.getConf("location", "Location.MaxLevels", 4)
  );
  const minRequiredLevel =
    requiredLevel ?? (required ? Math.max(maxLevel - 1, 0) : null);

  const [options, setOptions] = useState([]);
  const [locations, setLocations] = useState(multiple ? [] : "");
  const [defaultValue, setDefaultValue] = useState([]);
  const [levelError, setLevelError] = useState(false);
  const [invalidSelection, setInvalidSelection] = useState(null);

  const locationCache = useRef({}); // { [parentUuid]: [childLocations] }
  const pendingExpansion = useRef(null);

  // Load top-level locations on mount
  useEffect(() => {
    dispatch(fetchLocationsStr(modulesManager, 0));
  }, []);

  useEffect(() => {
    const l0s = (locState.l0s || []).map((loc) => ({
      label: locationLabel(loc),
      value: loc.uuid,
      isLeaf: false,
      level: 0,
      raw: loc,
    }));
    setOptions(l0s);
  }, [locState.l0s]);

  const loadData = (selectedOptions) => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    const currentLevel = targetOption.level ?? selectedOptions.length - 1;

    if (currentLevel + 1 >= maxLevel) {
      targetOption.isLeaf = true;
      return;
    }

    targetOption.loading = true;
    pendingExpansion.current = { targetOption, level: currentLevel + 1 };
    dispatch(fetchLocationsStr(modulesManager, currentLevel + 1, null, null, targetOption.raw));
  };

  useEffect(() => {
    if (!pendingExpansion.current) return;

    const { targetOption, level } = pendingExpansion.current;
    if (!locState[`fetchedL${level}s`]) return;

    const children = locState[`l${level}s`]
      .map((loc) => ({
        label: locationLabel(loc),
        value: loc.uuid,
        isLeaf: level + 1 >= maxLevel,
        level,
        raw: loc,
      }));

    targetOption.loading = false;
    targetOption.children = children;
    locationCache.current[targetOption.value] = children;

    setOptions([...options]); // trigger re-render
    pendingExpansion.current = null;
  }, [locState]);

  const isLevelValid = (location) => {
    if (multiple || minRequiredLevel === null || minRequiredLevel === undefined) return true;
    return getLocationLevel(location) >= minRequiredLevel;
  };

  const getLevelErrorMessage = () =>
    formatMessageWithValues("LocationCascader.requiredLevel", {
      level: formatMessage(`locationType.${minRequiredLevel}`),
    });

  useEffect(() => {
    if (value?.uuid) {
      const { uuids } = extractPathFromValue(value);
      setDefaultValue(uuids);
      setLocations(locationLabel(value));
      setInvalidSelection(null);
      setLevelError(!isLevelValid(value));
    } else if (multiple && value?.length) {
      if(!_.isEqual(_.sortBy(value.map(v => v.uuid)), _.sortBy((locations || []).map(v => v.uuid)))) {
        const hasPartialLocations = value.some(loc => loc.uuid && !loc.name);
        if (hasPartialLocations) {
          const uuidsToFetch = value.filter(loc => loc.uuid && !loc.name).map(loc => loc.uuid);
          if (uuidsToFetch.length > 0) {
            dispatch(fetchLocationsByUuids(uuidsToFetch, maxLevel));
          }
        } else {
          setDefaultValue(value.map(v => v.uuid));
          setLocations(value)
        }
      }
    } else if (!invalidSelection) {
      setDefaultValue([]);
      setLocations("");
      setLevelError(false);
    }
  }, [value, multiple, minRequiredLevel, invalidSelection]);

  useEffect(() => {
    if (locState.fetchedLocationsByUuids && locState.locationsByUuids?.length > 0) {
      const fetchedLocationsMap = new Map(
        locState.locationsByUuids.map(loc => [loc.uuid, loc])
      );

      if (multiple && Array.isArray(value) && value.length > 0) {
        const enrichedLocations = value.map(loc => {
          if (loc.uuid && !loc.name) {
            return fetchedLocationsMap.get(loc.uuid) || loc;
          }
          return loc;
        });

        setDefaultValue(enrichedLocations.map(v => v.uuid));
        setLocations(enrichedLocations);
      }
    }
  }, [locState.fetchedLocationsByUuids, locState.locationsByUuids]);

  const handleCascaderChange = (uuids, selectedOptions) => {
    // selectedOptions contains the selected location and all its parent levels for each selection
    // unwrap to keep only the lowest level for each selection
    const unnestedOptions = (multiple ? selectedOptions : [selectedOptions]).map((opts) => opts[opts.length - 1]);
    const rawVals = unnestedOptions.map((selected) => selected.raw);
    setLocations(multiple ? rawVals : locationLabel(rawVals[0]));

    if (multiple) {
      setLevelError(false);
      onChange?.(rawVals);
      return;
    }

    const selected = rawVals[0];
    if (!isLevelValid(selected)) {
      setInvalidSelection(selected);
      setLevelError(true);
      onChange?.(null);
      return;
    }

    setInvalidSelection(null);
    setLevelError(false);
    onChange?.(selected);
  };

  return (
    <StyledLocationCascader>
      <div className="root">
        <Cascader
          options={options}
          defaultValue={defaultValue}
          loadData={loadData}
          onChange={handleCascaderChange}
          changeOnSelect={true}
          disabled={readOnly}
          expandIcon={<KeyboardArrowRightIcon fontSize="small" />}
          loadingIcon={<AutorenewIcon fontSize="small" className="spin" />}
        >
          <TextField
            label={label || formatMessage("LocationPicker.label")}
            value={multiple ? "" : locations}
            fullWidth
            disabled={readOnly}
            required={required}
            error={levelError}
            helperText={levelError ? getLevelErrorMessage() : undefined}
            InputProps={{
              readOnly: true,
              classes: multiple && Array.isArray(locations) && locations.length > 0 ? {
                root: "inputRoot",
              } : undefined,
              startAdornment: multiple && Array.isArray(locations) && locations.length > 0 ? (
                <div className="chipsContainer">
                  {locations.map((location) => (
                    <Chip
                      key={location.uuid}
                      label={locationLabel(location)}
                      disabled={readOnly}
                    />
                  ))}
                </div>
              ) : null,
              endAdornment: (<ArrowDropDownIcon
                style={{ color: "rgba(0, 0, 0, 0.54)" }}
              />),
            }}
          />
        </Cascader>
      </div>
    </StyledLocationCascader>
  );
};

export default injectIntl(LocationCascader);
