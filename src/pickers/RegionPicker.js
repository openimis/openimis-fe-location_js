import React, { Component, useEffect } from "react";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from "react-intl";
import { TextField } from "@material-ui/core";
import { formatMessage, AutoSuggestion, withModulesManager } from "@openimis/fe-core";
import _debounce from "lodash/debounce";
import { locationLabel } from "../utils";
import { fetchAllRegions, selectRegionLocation } from "../actions.js";
import { bindActionCreators } from "redux";

const styles = (theme) => ({
  textField: {
    width: "100%",
  },
});

let allRegionsFlag = false;

class RegionPicker extends Component {
  constructor(props) {
    super(props);
    this.selectThreshold = props.modulesManager.getConf("fe-location", "RegionPicker.selectThreshold", 10);
  }

  onSuggestionSelected = (v) => {
    this.props.onChange(v, locationLabel(v));
  }
  
  componentDidUpdate(nextProps) {
    this.props.selectRegionLocation(nextProps.value);
  }

  componentDidMount() {
    if (allRegionsFlag) this.props.fetchAllRegions();
  }

  render() {
    const {
      intl,
      classes,
      value,
      reset,
      userHealthFacilityFullPath,
      regions,
      withLabel = true,
      label = null,
      withNull = false,
      nullLabel = null,
      filterLabels = true,
      preValues = [],
      withPlaceholder,
      placeholder = null,
      readOnly = false,
      required = false,
      allRegions,
    } = this.props;

    allRegionsFlag = allRegions;
    console.log("im here, value:", value);
    if (!!userHealthFacilityFullPath) {
      return (
        <TextField
          label={!!withLabel && (label || formatMessage(intl, "location", "RegionPicker.label"))}
          className={classes.textField}
          disabled
          value={locationLabel(userHealthFacilityFullPath.location.parent)}
        />
      );
    }
    return (
      <AutoSuggestion
        module="location"
        items={regions}
        preValues={preValues}
        label={!!withLabel && (label || formatMessage(intl, "location", "RegionPicker.label"))}
        placeholder={
          !!withPlaceholder ? placeholder || formatMessage(intl, "location", "RegionPicker.placehoder") : null
        }
        lookup={locationLabel}
        renderSuggestion={(a) => <span>{locationLabel(a)}</span>}
        getSuggestionValue={locationLabel}
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
            ? formatMessage(intl, "location", "location.RegionPicker.null")
            : formatMessage(intl, "location", "location.RegionPicker.none")
        }
      />
    );
  }
}

const mapStateToProps = (state) => ({
  regions: allRegionsFlag ? state.loc.allRegions : state.loc.userL0s || [],
  userHealthFacilityFullPath: state.loc.userHealthFacilityFullPath,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchAllRegions,
      selectRegionLocation,
    },
    dispatch,
  );

export default withModulesManager(
  connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(RegionPicker)))),
);
