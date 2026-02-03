import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import _debounce from "lodash/debounce";
import { styled } from "@mui/material/styles";
import _ from "lodash";
import { Grid } from "@mui/material";
import { ControlledField, PublishedComponent } from "@openimis/fe-core";

const StyledCoarseLocation = styled('div')(({ theme }) => ({
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

class CoarseLocation extends Component {
  state = {
    region: null,
    district: null,
  };

  computeState = () => {
    this.setState({
      region: this.props.region || this.state.region,
      district: this.props.district,
    });
  };

  componentDidMount() {
    this.computeState();
  }

  componentDidUpdate(prevProps) {
    if (!_.isEqual(prevProps.region, this.props.region) || !_.isEqual(prevProps.district, this.props.district)) {
      this.computeState();
    }
  }

  onChangeRegion = (region) => {
    this.setState(
      {
        region,
        district: null,
      },
      (e) => this.props.onChange(null),
    );
  };

  onChangeDistrict = (d) => {
    if (!!d) {
      this.setState({ region: d.parent });
    }
    this.props.onChange(d);
  };

  render() {
    const {
      readOnly,
      required = false,
      filterLabels = true,
      allRegions,
      title,
    } = this.props;
    const { region, district } = this.state;
    return (
      <StyledCoarseLocation>
        <Grid container className="form">
          <ControlledField
            module="location"
            id={`CoarseLocation.location_0`}
            field={
              <Grid size={6} className="item">
                <PublishedComponent
                  pubRef="location.RegionPicker"
                  readOnly={readOnly}
                  required={required}
                  value={region}
                  withNull={false}
                  filterLabels={filterLabels}
                  onChange={this.onChangeRegion}
                  allRegions={allRegions}
                  title={title}
                />
              </Grid>
            }
          />
          <ControlledField
            module="location"
            id={`CoarseLocation.location_1`}
            field={
              <Grid size={6} className="item">
                <PublishedComponent
                  pubRef="location.DistrictPicker"
                  readOnly={readOnly}
                  required={required}
                  value={district}
                  region={this.state.region}
                  withNull={false}
                  filterLabels={filterLabels}
                  onChange={this.onChangeDistrict}
                  title={title}
                />
              </Grid>
            }
          />
        </Grid>
      </StyledCoarseLocation>
    );
  }
}

export { StyledCoarseLocation };
export default CoarseLocation;
