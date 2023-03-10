import React, { Component } from "react";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from "react-intl";
import { TextField } from "@material-ui/core";
import { withModulesManager, formatMessage, AutoSuggestion } from "@openimis/fe-core";
import _debounce from "lodash/debounce";
import { locationLabel } from "../utils";
import { fetchAllDistricts } from "../actions.js";
import { bindActionCreators } from "redux";

const styles = (theme) => ({
  textField: {
    width: "100%",
  },
});

let allDistrictsFlag = false;

class DistrictPicker extends Component {
  constructor(props) {
    super(props);
    this.selectThreshold = props.modulesManager.getConf("fe-location", "DistrictPicker.selectThreshold", 10);
  }

  onSuggestionSelected = (v) => {
    this.props.onChange(v, locationLabel(v));
  };

  componentDidMount() {
    if (allDistrictsFlag) this.props.fetchAllDistricts();
  }

  render() {
    const {
      intl,
      classes,
      userHealthFacilityFullPath,
      reset,
      value,
      withLabel = true,
      label,
      withNull = false,
      nullLabel = null,
      filterLabels = true,
      region,
      districts,
      readOnly = false,
      required = false,
      allRegions,
      userDistricts,
    } = this.props;

    allDistrictsFlag = allRegions; // If all regions are displayed, we also want to display all the districts

    if (!!userHealthFacilityFullPath) {
      return (
        <TextField
          label={!!withLabel && (label || formatMessage(intl, "location", "DistrictPicker.label"))}
          className={classes.textField}
          disabled
          value={locationLabel(userHealthFacilityFullPath.location)}
        />
      );
    }

    let items = allDistrictsFlag ? districts : userDistricts;

    if (!!region) {
      items = items.filter((d) => {
        console.log(d);
        return d.parent.uuid === region.uuid;
      });
    }

    return (
      <AutoSuggestion
        module="location"
        items={items}
        label={!!withLabel && (label || formatMessage(intl, "location", "DistrictPicker.label"))}
        lookup={locationLabel}
        getSuggestionValue={locationLabel}
        renderSuggestion={(a) => <span>{locationLabel(a)}</span>}
        onSuggestionSelected={this.onSuggestionSelected}
        onClear={this.onSuggestionSelected}
        value={value}
        reset={reset}
        readOnly={readOnly}
        required={required}
        selectThreshold={this.selectThreshold}
        withNull={withNull}
        nullLabel={
          nullLabel || filterLabels
            ? formatMessage(intl, "location", "location.DistrictPicker.null")
            : formatMessage(intl, "location", "location.DistrictPicker.none")
        }
      />
    );
  }
}

const mapStateToProps = (state) => ({
  userDistricts: state.loc.userL1s || [],
  districts: state.loc.allDistricts || [],
  userHealthFacilityFullPath: state.loc.userHealthFacilityFullPath,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ fetchAllDistricts }, dispatch);

export default withModulesManager(
  connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(DistrictPicker)))),
);
