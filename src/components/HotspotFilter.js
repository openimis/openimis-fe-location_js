import React, { Component } from "react";
import _debounce from "lodash/debounce";
import { Grid } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { withModulesManager, TextInput, PublishedComponent } from "@openimis/fe-core";
import MicroCatchmentPicker from "../pickers/MicroCatchmentPicker";

const styles = (theme) => ({
  form: {
    padding: 0,
  },
  item: {
    padding: theme.spacing(1),
  },
});

class HotspotFilter extends Component {
  debouncedOnChangeFilter = _debounce(
    this.props.onChangeFilters,
    this.props.modulesManager.getConf("fe-location", "debounceTime", 200),
  );

  _filterValue = (key) => {
    const { filters } = this.props;
    return !!filters && !!filters[key] ? filters[key].value : null;
  };

  _filterTextFieldValue = (key) => {
    const { filters } = this.props;
    return !!filters && !!filters[key] ? filters[key].value : "";
  };

  // District = top level of the Malawi hierarchy (Location type R), held on the micro-catchment.
  _filterPayload = ({ district, microCatchment, code, name } = {}) => [
    {
      id: "district",
      value: district,
      filter: !!district ? `microCatchment_District_Uuid: "${district.uuid}"` : null,
    },
    {
      id: "microCatchment",
      value: microCatchment,
      filter: !!microCatchment ? `microCatchment_Uuid: "${microCatchment.uuid}"` : null,
    },
    {
      id: "code",
      value: code,
      filter: !!code ? `code_Icontains: "${code}"` : null,
    },
    {
      id: "name",
      value: name,
      filter: !!name ? `name_Icontains: "${name}"` : null,
    },
  ];

  _currentFilters = (overrides) =>
    this._filterPayload({
      district: this._filterValue("district"),
      microCatchment: this._filterValue("microCatchment"),
      code: this._filterTextFieldValue("code"),
      name: this._filterTextFieldValue("name"),
      ...overrides,
    });

  _onChangeDistrict = (district) => {
    // Changing district clears the micro-catchment (it must belong to the district).
    this.props.onChangeFilters(this._currentFilters({ district, microCatchment: null }));
  };

  _onChangeMicroCatchment = (microCatchment) => {
    this.props.onChangeFilters(
      this._currentFilters({
        microCatchment,
        district: microCatchment?.district || this._filterValue("district"),
      }),
    );
  };

  _onChangeCode = (code) => {
    this.debouncedOnChangeFilter(this._currentFilters({ code }));
  };

  _onChangeName = (name) => {
    this.debouncedOnChangeFilter(this._currentFilters({ name }));
  };

  render() {
    const { classes } = this.props;
    const district = this._filterValue("district");
    return (
      <Grid container className={classes.form}>
        <Grid item xs={3} className={classes.item}>
          <PublishedComponent
            pubRef="location.RegionPicker"
            value={district}
            withNull={true}
            onChange={this._onChangeDistrict}
          />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <MicroCatchmentPicker
            value={this._filterValue("microCatchment")}
            district={district}
            label="HotspotFilter.microCatchment"
            onChange={this._onChangeMicroCatchment}
          />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <TextInput
            module="location"
            label="HotspotFilter.code"
            name="code"
            value={this._filterTextFieldValue("code")}
            onChange={this._onChangeCode}
          />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <TextInput
            module="location"
            label="HotspotFilter.name"
            name="name"
            value={this._filterTextFieldValue("name")}
            onChange={this._onChangeName}
          />
        </Grid>
      </Grid>
    );
  }
}

export default withModulesManager(withTheme(withStyles(styles)(HotspotFilter)));
