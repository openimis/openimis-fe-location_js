import React, { Component } from "react";
import { injectIntl } from "react-intl";
import _ from "lodash";
import _debounce from "lodash/debounce";

import { Grid, FormControlLabel, Checkbox } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";

import { withModulesManager, formatMessage, TextInput, PublishedComponent } from "@openimis/fe-core";

const styles = (theme) => ({
  dialogTitle: theme.dialog.title,
  dialogContent: theme.dialog.content,
  form: {
    padding: 0,
  },
  item: {
    padding: theme.spacing(1),
  },
  paperDivider: theme.paper.divider,
});

class HealthFacilityFilter extends Component {
  state = {
    reset: 0,
  };

  debouncedOnChangeFilter = _debounce(
    this.props.onChangeFilters,
    this.props.modulesManager.getConf("fe-location", "debounceTime", 200),
  );

  _filterValue = (k) => {
    const { filters } = this.props;
    return !!filters && !!filters[k] ? filters[k].value : null;
  };

  _filterTextFieldValue = (key) => {
    const { filters } = this.props;
    return !!filters && !!filters[key] ? filters[key].value : "";
  };

  _regionFilter = (v) => {
    return {
      id: "region",
      value: v,
      filter: !!v ? `location_Parent_Uuid: "${v.uuid}"` : null,
    };
  };

  _districtFilter = (v) => {
    return {
      id: "district",
      value: v,
      filter: !!v ? `location_Uuid: "${v.uuid}"` : null,
    };
  };

  _onChangeRegion = (v, s) => {
    this.props.onChangeFilters([
      this._regionFilter(v),
      {
        id: "district",
        value: null,
      },
    ]);
    this.setState((state) => ({
      reset: state.reset + 1,
    }));
  };

  _onChangeDistrict = (v, s) => {
    let filters = [this._districtFilter(v)];
    if (!!v) {
      filters.push(this._regionFilter(v.parent));
    }
    this.props.onChangeFilters(filters);
    this.setState((state) => ({
      reset: state.reset + 1,
    }));
  };

  _onChangeCheckbox = (key, value) => {
    let filters = [
      {
        id: key,
        value: value,
        filter: `${key}: ${value}`,
      },
    ];
    this.props.onChangeFilters(filters);
  };

  _onChange = (k, v, s) => {
    let filters = [
      {
        id: k,
        value: v,
        filter: `${k}: "${v}"`,
      },
    ];
    this.props.onChangeFilters(filters);
    this.setState((state) => ({
      reset: state.reset + 1,
    }));
  };

  render() {
    const { intl, classes, modulesManager } = this.props;
    this.isHealthFacilityStatusEnabled  = modulesManager.getConf("fe-location", "healthFacilityForm.isHealthFacilityStatusEnabled", false);
    return (
      <Grid container className={classes.form}>
        <Grid item xs={2} className={classes.item}>
          <PublishedComponent
            pubRef="location.RegionPicker"
            value={this._filterValue("region")}
            reset={this.state.reset}
            withNull={true}
            onChange={this._onChangeRegion}
          />
        </Grid>
        <Grid item xs={2} className={classes.item}>
          <PublishedComponent
            pubRef="location.DistrictPicker"
            value={this._filterValue("district")}
            region={this._filterValue("region")}
            reset={this.state.reset}
            withNull={true}
            onChange={this._onChangeDistrict}
          />
        </Grid>
        <Grid item xs={2} className={classes.item}>
          <PublishedComponent
            pubRef="location.HealthFacilityLegalFormPicker"
            value={this._filterValue("legalForm_Code")}
            onChange={(v, s) => this._onChange("legalForm_Code", v, s)}
          />
        </Grid>
        <Grid item xs={2} className={classes.item}>
          <PublishedComponent
            pubRef="location.HealthFacilityLevelPicker"
            value={this._filterValue("level")}
            onChange={(v, s) => this._onChange("level", v, s)}
          />
        </Grid>
        <Grid item xs={2} className={classes.item}>
          <PublishedComponent
            pubRef="medical.CareTypePicker"
            value={this._filterValue("careType")}
            onChange={(v, s) => this._onChange("careType", v, s)}
          />
        </Grid>
        <Grid item xs={2} className={classes.item}>
          <FormControlLabel
            control={
              <Checkbox
                color="primary"
                checked={!!this._filterValue("showHistory")}
                onChange={(event) => this._onChangeCheckbox("showHistory", event.target.checked)}
              />
            }
            label={formatMessage(intl, "location", "HealthFacilityFilter.showHistory")}
          />
        </Grid>
        <Grid item xs={2} className={classes.item}>
          <TextInput
            module="location"
            label="HealthFacilityFilter.code"
            name="code"
            value={this._filterTextFieldValue("code")}
            onChange={(v) =>
              this.debouncedOnChangeFilter([
                {
                  id: "code",
                  value: v,
                  filter: !!v ? `code_Icontains: "${v}"` : null,
                },
              ])
            }
          />
        </Grid>
        <Grid item xs={4} className={classes.item}>
          <TextInput
            module="location"
            label="HealthFacilityFilter.name"
            name="name"
            value={this._filterTextFieldValue("name")}
            onChange={(v) =>
              this.debouncedOnChangeFilter([
                {
                  id: "name",
                  value: v,
                  filter: !!v ? `name_Icontains: "${v}"` : null,
                },
              ])
            }
          />
        </Grid>
        <Grid item xs={2} className={classes.item}>
          <TextInput
            module="location"
            label="HealthFacilityFilter.phone"
            name="phone"
            value={this._filterTextFieldValue("phone")}
            onChange={(v) =>
              this.debouncedOnChangeFilter([
                {
                  id: "phone",
                  value: v,
                  filter: !!v ? `phone_Icontains: "${v}"` : null,
                },
              ])
            }
          />
        </Grid>
        <Grid item xs={2} className={classes.item}>
          <TextInput
            module="location"
            label="HealthFacilityFilter.fax"
            name="fax"
            value={this._filterTextFieldValue("fax")}
            onChange={(v) =>
              this.debouncedOnChangeFilter([
                {
                  id: "fax",
                  value: v,
                  filter: !!v ? `fax_Icontains: "${v}"` : null,
                },
              ])
            }
          />
        </Grid>
        <Grid item xs={2} className={classes.item}>
          <TextInput
            module="location"
            label="HealthFacilityFilter.email"
            name="email"
            value={this._filterTextFieldValue("email")}
            onChange={(v) =>
              this.debouncedOnChangeFilter([
                {
                  id: "email",
                  value: v,
                  filter: !!v ? `email_Icontains: "${v}"` : null,
                },
              ])
            }
          />
        </Grid>
        {this.isHealthFacilityStatusEnabled && <Grid item xs={3} className={classes.item}>
          <PublishedComponent
            module="location"
            label="HealthFacilityForm.status"
            pubRef="location.HealthFacilityStatusPicker"
            value={this._filterValue("status")}
            onChange={(value, s) => this._onChange("status", value, s)}
            withNull={true}
          />
        </Grid>}
      </Grid>
    );
  }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(HealthFacilityFilter))));
