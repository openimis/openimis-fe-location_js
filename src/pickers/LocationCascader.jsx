import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Cascader from "rc-cascader";
import { TextField } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useModulesManager, useTranslations } from "@openimis/fe-core";
import { fetchLocationsStr } from "../actions";
import { locationLabel } from "../utils";

const StyledLocationCascader = styled('div')(({ theme }) => ({
  '& .root': {
    width: "100%",
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
}) => {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("location", modulesManager);
  const dispatch = useDispatch();
  const locState = useSelector((state) => state.loc);
  const maxLevel = parseInt(
    modulesManager.getConf("location", "Location.MaxLevels", 4)
  );

  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [defaultValue, setDefaultValue] = useState([]);

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

  useEffect(() => {
    if (value?.uuid) {
      const { names, uuids } = extractPathFromValue(value);
      setDefaultValue(uuids);
      setInputValue(locationLabel(value));
    } else {
      setDefaultValue([]);
      setInputValue("");
    }
  }, [value]);

  const handleCascaderChange = (uuids, selectedOptions) => {
    const selected = selectedOptions[selectedOptions.length - 1];
    setInputValue(selected?.label || "");
    onChange?.(selected.raw, locationLabel(selected.raw));
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
            value={inputValue}
            fullWidth
            disabled={readOnly}
            InputProps={{
              readOnly: true,
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

export default LocationCascader;
