import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import _debounce from "lodash/debounce";
import { styled } from "@mui/material/styles";
import _ from "lodash";
import { Grid } from "@mui/material";
import { withModulesManager, ControlledField, PublishedComponent, formatMessage } from "@openimis/fe-core";
import { selectLocation } from "../actions";
import { DEFAULT_LOCATION_TYPES } from "../constants";
import { getLocationMaxLevels, locationLevelSlots, locationsByLevel } from "../utils";
import CoarseLocation from "./CoarseLocation";

const StyledDetailedLocation = styled('div')(({ theme }) => ({
  '& .dialogTitle': theme?.dialog?.title ?? {},
  '& .dialogContent': theme?.dialog?.content ?? {},
  '& .form': {
    padding: 0,
  },
  '& .item': {
    padding: theme.spacing(1),
  },
  '& .paperDivider': theme?.paper?.divider ?? {},
}));

class DetailedLocation extends Component {
  state = {};

  constructor(props) {
    super(props);
    this.locationTypes = props.modulesManager.getConf("fe-location", "Location.types", DEFAULT_LOCATION_TYPES);
    // One location picker per level, or null for the region/district layout of 4 levels.
    this.levelSlots = locationLevelSlots(getLocationMaxLevels(props.modulesManager), this.locationTypes);
  }

  computeState = () => {
    const { value } = this.props;
    if (this.levelSlots) {
      this.setState({ levels: locationsByLevel(value, this.locationTypes, this.levelSlots.length) });
      return;
    }
    const lineage = [];
    let current = value || null;
    while (current) {
      lineage.unshift(current);
      current = current.parent || null;
    }
    let state = {
      "location_-2": lineage[0] || null,
      "location_-1": lineage[1] || null,
    };
    _.times(this.locationTypes.length - 2, (i) => {
      state[`location_${i}`] = lineage[i + 2] || null;
    });
    this.setState({ ...state });
  };

  componentDidMount() {
    this.computeState();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (!_.isEqual(prevProps.value, this.props.value)) {
      this.computeState();
    }
  }

  onDistrictChange = (d, source) => {
    let state = { ...this.state };
    if (!d && source === "region") {
      state[`location_-2`] = null;
    }
    if (!state[`location_-2`] && !!d) {
      state[`location_-2`] = d.parent;
    }
    state[`location_-1`] = d;
    for (let i = 0; i < this.locationTypes.length - 2; i++) {
      state[`location_${i}`] = null;
    }
    this.setState({ ...state }, (e) => {
      const nextValue = d ?? state[`location_-2`] ?? null;
      this.props.onChange(nextValue);
      this.props.selectLocation(d, 1, this.locationTypes.length);
    });
  };

  onLocationChange = (l, v) => {
    let state = { ...this.state };
    let current = v;
    for (let i = l; i >= -2 && !!current; i--) {
      state[`location_${i}`] = current;
      current = current.parent;
    }
    state[`location_${l}`] = v;
    for (let i = l + 1; i < this.locationTypes.length - 2; i++) {
      state[`location_${i}`] = null;
    }
    this.setState({ ...state }, (e) => {
      if (l === this.locationTypes.length - 3) {
        const fallback = l > 0 ? state[`location_${l - 1}`] : state[`location_-1`];
        this.props.onChange(v ?? fallback ?? null);
      }
      this.props.selectLocation(v, l, this.locationTypes.length);
    });
  };

  onLevelChange = (level, v) => {
    const count = this.levelSlots.length;
    const parents = locationsByLevel(v, this.locationTypes, count);
    const current = this.state.levels || [];
    const levels = Array.from({ length: count }, (_, l) => (l < level ? parents[l] || current[l] || null : null));
    levels[level] = v;
    this.setState({ levels }, () => {
      this.props.onChange(v ?? (level > 0 ? levels[level - 1] : null) ?? null);
      this.props.selectLocation(v, level, count);
    });
  };

  renderLevels() {
    const { intl, split = false, readOnly, required = false, filterLabels = true, title = "" } = this.props;
    const levels = this.state.levels || [];
    const grid = split ? 12 : Math.max(1, Math.floor(12 / this.levelSlots.length));
    return (
      <StyledDetailedLocation>
        <Grid container className="form">
          {this.levelSlots.map(({ level, type, labelKey }) => (
            <ControlledField
              module="location"
              id={`DetailedLocation.location_${level}`}
              key={`location_${level}`}
              field={
                <Grid size={grid} className="item">
                  <PublishedComponent
                    pubRef="location.LocationPicker"
                    value={levels[level] || null}
                    parentLocation={level > 0 ? levels[level - 1] || null : null}
                    readOnly={readOnly}
                    required={required}
                    withNull={true}
                    filterLabels={filterLabels}
                    label={formatMessage(intl, "location", labelKey)}
                    locationLevel={level}
                    onChange={(v) => this.onLevelChange(level, v)}
                    title={title}
                    dataCy={`location-${type}-picker`}
                  />
                </Grid>
              }
            />
          ))}
        </Grid>
      </StyledDetailedLocation>
    );
  }

  render() {
    if (this.levelSlots) return this.renderLevels();
    const {
      split = false,
      readOnly,
      required = false,
      filterLabels = true,
      title = '',
    } = this.props;
    let grid = split ? 12 : 6;
    return (
      <StyledDetailedLocation>
        <Grid container className="form">
          <Grid size={grid}>
            <CoarseLocation
              region={this.state[`location_-2`]}
              district={this.state[`location_-1`]}
              readOnly={readOnly}
              required={required}
              onChange={this.onDistrictChange}
              filterLabels={filterLabels}
              title={title}
            />
          </Grid>
          {_.times(this.locationTypes.length - 2, (i) => (
            <ControlledField
              module="location"
              id={`DetailedLocation.location_${this.locationTypes.length - 2 + i}`}
              key={`location_${this.locationTypes.length - 2 + i}`}
              field={
                <Grid size={Math.floor(grid / (this.locationTypes.length - 2))} className="item">
                  <PublishedComponent
                    pubRef="location.LocationPicker"
                    value={this.state[`location_${i}`] ?? null}
                    parentLocation={this.state[`location_${i - 1}`] ?? null}
                    regionLocation={this.state[`location_-2`] ?? null}
                    districtLocation={this.state[`location_-1`] ?? null}
                    readOnly={readOnly}
                    required={required}
                    withNull={true}
                    filterLabels={filterLabels}
                    locationLevel={this.locationTypes.length - 2 + i}
                    onChange={(v) => this.onLocationChange(i, v)}
                    title={title}
                    dataCy={`location-${this.locationTypes[this.locationTypes.length - 2 + i]}-picker`}
                  />
                </Grid>
              }
            />
          ))}
        </Grid>
      </StyledDetailedLocation>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ selectLocation }, dispatch);
};

export { StyledDetailedLocation };
export default withModulesManager(
  injectIntl(connect(mapStateToProps, mapDispatchToProps)(DetailedLocation)),
);
