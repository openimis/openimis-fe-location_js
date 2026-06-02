import React, { useState } from "react";
import { injectIntl } from "react-intl";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Button,
} from "@mui/material";

import { formatMessage, 
  TextInput, 
  useTranslations, 
  withModulesManager 
} from "@openimis/fe-core";

const FilterLocationDialog = ({ open, title, onCancel, onApply, filters, modulesManager }) => {
  const [codeFilter, setCodeFilter] = useState(filters?.code || "");
  const [nameFilter, setNameFilter] = useState(filters?.name || "");

  const handleChange = (setter) => (value) => setter(value);
  const { formatMessage, formatMessageWithValues } = useTranslations("location", modulesManager);

  const handleApply = () => {
    const appliedFilters = {};
    if (codeFilter.trim()) appliedFilters.code = codeFilter.trim();
    if (nameFilter.trim()) appliedFilters.name = nameFilter.trim();
    onApply(appliedFilters);
  };

  const handleClear = () => {
    setCodeFilter("");
    setNameFilter("");
    onApply({});
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <Divider />
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextInput
              module="location"
              label={formatMessage("location.filter.code")}
              value={codeFilter}
              onChange={handleChange(setCodeFilter)}
              placeholder="Code..."
            />
          </Grid>
          <Grid item xs={12}>
            <TextInput
              module="location"
              label={formatMessage("location.filter.name")}
              value={nameFilter}
              onChange={handleChange(setNameFilter)}
              placeholder="Name..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button onClick={handleClear}>
          {formatMessage("filterDialog.clear")}
        </Button>
        <Button onClick={onCancel}>
          {formatMessage("filterDialog.cancel")}
        </Button>
        <Button onClick={handleApply} color="primary" autoFocus>
          {formatMessage("filterDialog.apply")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default withModulesManager(FilterLocationDialog);
