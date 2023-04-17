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
  // TO DO:
  // na componentDidMount/useEffect ... [], przy pierwszym renderze czytać value z propsów do state
  // SPRAWDZIĆ CZY PROPSY SIĘ ZMIENIŁY, CHYBA TRZEBA DO TEGO DODAĆ MAPS STATE DO PROPS DLA 'l0s'
  // (PO TO ŻEBY SIĘ TO NIE ODPALAŁO JAK KOMPONENT SIĘ RERENDERUJE)
  // ZROBIĆ TO SAMO DLA DISTRICT PICKERA: akcja + reducer + component did update w district pickerze
  // przekazywać w LocationPicker.js l0s i l1s na backend
  // na backendzie sprawdzać jak: type = V to sprawdz parent, jak nie ma to parent_parent, jak nie ma to parent_parent_parent
  // analogicznie dla M ale tylko parent i parent_parent
  // to może coś zjebać, bo czasem l3s to nie jeden a kilka Villages, więc może trzeba zrobić osobny state dla selected lokacji
  
  // permsy w claimach, jest Claim i on bierze dane np. od policy, to czy policy ma sprawdzac też claim perms?

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
