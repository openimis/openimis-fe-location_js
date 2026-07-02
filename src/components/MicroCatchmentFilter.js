import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { Grid } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { TextInput, PublishedComponent, formatMessage } from "@openimis/fe-core";

const styles = (theme) => ({
  dialogTitle: theme.dialog.title,
  dialogContent: theme.dialog.content,
  form: {
    padding: 0,
  },
  item: {
    padding: theme.spacing(1),
  },
});

class MicroCatchmentFilter extends Component {
  debouncedOnChangeFilter = this.props.onChangeFilters;

  _filterValue = (k) => {
    const { filters } = this.props;
    return !!filters && !!filters[k] ? filters[k].value : null;
  };

  _onChangeFilter = (k, v, s) => {
    this.debouncedOnChangeFilter([
      {
        id: k,
        value: v,
        filter: s,
      },
    ]);
  };

  _onChangeStringFilter = (k, v, lookup = true) => {
    this._onChangeFilter(k, v, !!v ? `${k}: ${lookup ? `"${v}"` : v}` : null);
  };

  render() {
    const { classes, intl } = this.props;

    return (
      <Grid container className={classes.form}>
        <Grid item xs={3} className={classes.item}>
          <TextInput
            module="location"
            label="microCatchment.code"
            value={this._filterValue("code")}
            onChange={(v) => this._onChangeStringFilter("code", v)}
          />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <TextInput
            module="location"
            label="microCatchment.name"
            value={this._filterValue("name")}
            onChange={(v) => this._onChangeStringFilter("name", v)}
          />
        </Grid>
        <Grid item xs={2} className={classes.item}>
          <PublishedComponent
            pubRef="location.DistrictPicker"
            value={this._filterValue("district")}
            onChange={(v) => this._onChangeFilter("district_Uuid", v, v ? `district_Uuid: "${v?.uuid}"` : null)}
          />
        </Grid>
        <Grid item xs={2} className={classes.item}>
          <PublishedComponent
            pubRef="location.LocationPicker"
            locationLevel={2}
            label={formatMessage(intl, "location", "microCatchment.ta")}
            value={this._filterValue("ta")}
            parentLocation={this._filterValue("district")}
            onChange={(v) =>
              this._onChangeFilter(
                "traditional_authorities_Location_Uuid",
                v,
                v ? `traditional_authorities_Location_Uuid: "${v?.uuid}"` : null,
              )
            }
          />
        </Grid>
        <Grid item xs={2} className={classes.item}>
          <PublishedComponent
            pubRef="core.DatePicker"
            module="location"
            label="microCatchment.dateFrom"
            value={this._filterValue("dateFrom")}
            onChange={(v) => this._onChangeStringFilter("dateFrom", v, false)}
          />
        </Grid>
        <Grid item xs={2} className={classes.item}>
          <PublishedComponent
            pubRef="core.DatePicker"
            module="location"
            label="microCatchment.dateTo"
            value={this._filterValue("dateTo")}
            onChange={(v) => this._onChangeStringFilter("dateTo", v, false)}
          />
        </Grid>
      </Grid>
    );
  }
}

export default injectIntl(withTheme(withStyles(styles)(MicroCatchmentFilter)));
