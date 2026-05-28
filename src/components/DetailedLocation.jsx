import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import _debounce from "lodash/debounce";
import { styled } from "@mui/material/styles";
import _ from "lodash";
import { Grid } from "@mui/material";
import { withModulesManager, ControlledField, PublishedComponent } from "@openimis/fe-core";
import { selectLocation } from "../actions";
import { DEFAULT_LOCATION_TYPES } from "../constants";
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
  }

  computeState = () => {
    const { value } = this.props;
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

  render() {
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
  connect(mapStateToProps, mapDispatchToProps)(DetailedLocation),
);
