import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Cascader from "rc-cascader";
import { TextField } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { useModulesManager, useTranslations } from "@openimis/fe-core";
import { fetchLocationsStr } from "../actions";
import { locationLabel } from "../utils";

const styles = () => ({
  root: {
    width: "100%",
  },
});

const LocationCascader = ({ label = "Location", onChange, readOnly, classes }) => {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("location", modulesManager);
  const dispatch = useDispatch();
  const locState = useSelector((state) => state.loc);
  const maxLevel = parseInt(
    modulesManager.getConf("location", "Location.MaxLevels", 4)
  );

  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");

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

  const handleCascaderChange = (uuids, selectedOptions) => {
    const selected = selectedOptions[selectedOptions.length - 1];
    setInputValue(selected?.label || "");
    onChange?.(selected.raw, locationLabel(selected.raw));
  };

  return (
    <div className={classes.root}>
      <Cascader
        options={options}
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
          InputProps={{
            readOnly: true,
            endAdornment: (<ArrowDropDownIcon 
              style={{ color: "rgba(0, 0, 0, 0.54)" }}
            />),
          }}
        />
      </Cascader>
    </div>
  );
};

export default withStyles(styles)(withTheme(LocationCascader));
