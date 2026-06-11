import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { GetIconComponent, useModulesManager, useTranslations } from "@openimis/fe-core";
import { fetchLocationsStr } from "../actions";
import { buildSelectedLocation, getLocationLevel, locationLabel } from "../utils";

const ArrowDropDownIcon = GetIconComponent("ArrowDropDown");
const ArrowBackIcon = GetIconComponent("ArrowBack");
const CloseIcon = GetIconComponent("Close");
const KeyboardArrowRightIcon = GetIconComponent("KeyboardArrowRight");

const StyledMobilePicker = styled("div")({
  width: "100%",
  maxWidth: "100%",
});

const StyledDrawerPaper = styled(Drawer)({
  "& .MuiDrawer-paper": {
    height: "min(85dvh, 640px)",
    maxHeight: "85dvh",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    display: "flex",
    flexDirection: "column",
  },
});

const LocationCascaderMobile = ({
  label = "Location",
  onChange,
  readOnly,
  value,
  required = false,
  minRequiredLevel = null,
  displayValue,
  levelError = false,
  levelErrorMessage = "",
  onLevelErrorChange,
}) => {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("location", modulesManager);
  const dispatch = useDispatch();
  const locState = useSelector((state) => state.loc);
  const maxLevel = parseInt(modulesManager.getConf("location", "Location.MaxLevels", 4));

  const [open, setOpen] = useState(false);
  const [path, setPath] = useState([]);

  const viewLevel = path.length;
  const listItems = viewLevel === 0 ? locState.l0s || [] : locState[`l${viewLevel}s`] || [];
  const isLoading = !!locState[`fetchingL${viewLevel}s`];
  const selectedLocation = path.length ? buildSelectedLocation(path) : null;
  const canConfirm =
    !!selectedLocation &&
    (minRequiredLevel === null || minRequiredLevel === undefined || getLocationLevel(selectedLocation) >= minRequiredLevel);


  useEffect(() => {
    dispatch(fetchLocationsStr(modulesManager, 0));
  }, [dispatch, modulesManager]);

  const resetNavigation = () => setPath([]);

  const openDrawer = () => {
    if (readOnly) return;
    resetNavigation();
    setOpen(true);
  };

  const closeDrawer = () => {
    setOpen(false);
    resetNavigation();
  };

  const applySelection = (nextPath) => {
    const selected = buildSelectedLocation(nextPath);
    if (
      minRequiredLevel !== null &&
      minRequiredLevel !== undefined &&
      getLocationLevel(selected) < minRequiredLevel
    ) {
      onLevelErrorChange?.(true, selected);
      onChange?.(null);
      return;
    }

    onLevelErrorChange?.(false, null);
    onChange?.(selected);
    closeDrawer();
  };

  const handleSelect = (location) => {
    const nextPath = [...path, location];
    const currentLevel = nextPath.length - 1;
    const isLeaf = currentLevel + 1 >= maxLevel;

    if (!isLeaf) {
      setPath(nextPath);
      dispatch(fetchLocationsStr(modulesManager, currentLevel + 1, null, null, location));
      return;
    }

    applySelection(nextPath);
  };

  const handleBack = () => {
    setPath((current) => current.slice(0, -1));
  };

  const currentLevelLabel = formatMessage(`locationType.${Math.min(viewLevel, maxLevel - 1)}`);

  return (
    <StyledMobilePicker>
      <TextField
        label={label || formatMessage("LocationPicker.label")}
        value={displayValue}
        fullWidth
        disabled={readOnly}
        required={required}
        error={levelError}
        helperText={levelError ? levelErrorMessage : undefined}
        onClick={openDrawer}
        InputProps={{
          readOnly: true,
          endAdornment: <ArrowDropDownIcon style={{ color: "rgba(0, 0, 0, 0.54)" }} />,
        }}
      />

      <StyledDrawerPaper anchor="bottom" open={open} onClose={closeDrawer}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: 1,
            py: 1,
            borderBottom: "1px solid",
            borderColor: "divider",
            gap: 1,
          }}
        >
          {path.length > 0 ? (
            <IconButton onClick={handleBack} aria-label="back">
              <ArrowBackIcon />
            </IconButton>
          ) : (
            <Box sx={{ width: 40 }} />
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" noWrap>
              {label || formatMessage("LocationPicker.label")}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {currentLevelLabel}
            </Typography>
          </Box>
          <IconButton onClick={closeDrawer} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>

        {path.length > 0 && (
          <Box sx={{ px: 2, py: 1, borderBottom: "1px solid", borderColor: "divider" }}>
            <Typography variant="body2" color="text.secondary" sx={{ wordBreak: "break-word" }}>
              {path.map((item) => locationLabel(item)).join(" / ")}
            </Typography>
          </Box>
        )}

        <List sx={{ flex: 1, overflowY: "auto", py: 0 }}>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : listItems.length === 0 ? (
            <Box sx={{ px: 2, py: 3 }}>
              <Typography variant="body2" color="text.secondary">
                No locations found
              </Typography>
            </Box>
          ) : (
            listItems.map((location) => {
              const itemLevel = viewLevel;
              const canDrillDeeper = itemLevel + 1 < maxLevel;
              return (
                <ListItemButton key={location.uuid} onClick={() => handleSelect(location)} divider>
                  <ListItemText
                    primary={locationLabel(location)}
                    primaryTypographyProps={{ sx: { wordBreak: "break-word" } }}
                  />
                  {canDrillDeeper ? <KeyboardArrowRightIcon color="action" /> : null}
                </ListItemButton>
              );
            })
          )}
        </List>

        {canConfirm && (
          <Box
            sx={{
              p: 2,
              borderTop: "1px solid",
              borderColor: "divider",
              backgroundColor: "background.paper",
            }}
          >
            <Button fullWidth variant="contained" onClick={() => applySelection(path)}>
              {formatMessage("LocationCascader.confirmSelection") || "Use this location"}
            </Button>
          </Box>
        )}
      </StyledDrawerPaper>
    </StyledMobilePicker>
  );
};

export default LocationCascaderMobile;