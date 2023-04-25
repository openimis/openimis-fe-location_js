import React, { Component } from "react";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from "react-intl";
import { TextField } from "@material-ui/core";
import { withModulesManager, formatMessage, AutoSuggestion } from "@openimis/fe-core";
import _debounce from "lodash/debounce";
import { selectDistrictLocation, clearLocations } from "../actions.js";
import { locationLabel } from "../utils";
import { bindActionCreators } from "redux";

const styles = (theme) => ({
  textField: {
    width: "100%",
  },
});

class DistrictPicker extends Component {
  constructor(props) {
    super(props);
    this.selectThreshold = props.modulesManager.getConf("fe-location", "DistrictPicker.selectThreshold", 10);
  }

  onSuggestionSelected = (v) => {
    if (this.props.value !== v)
      this.props.selectDistrictLocation(v);
    this.props.onChange(v, locationLabel(v));
  };

  componentWillUnmount() {
    this.props.clearLocations(1);
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
    } = this.props;

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

    let items = districts || [];
    if (!!region) {
      items = items.filter((d) => {
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
  districts: state.loc.userL1s,
  userHealthFacilityFullPath: state.loc.userHealthFacilityFullPath,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      selectDistrictLocation,
      clearLocations,
    },
    dispatch,
  );

export default withModulesManager(
  connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(DistrictPicker))))
);
