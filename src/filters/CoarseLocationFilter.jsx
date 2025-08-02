import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import _debounce from "lodash/debounce";
import { styled } from "@mui/material/styles";
import _ from "lodash";
import { Grid } from "@mui/material";
import { ControlledField, PublishedComponent } from "@openimis/fe-core";

const StyledCoarseLocationFilter = styled('div')(({ theme }) => ({
  '& .dialogTitle': theme.dialog.title,
  '& .dialogContent': theme.dialog.content,
  '& .form': {
    padding: 0,
  },
  '& .item': {
    padding: theme.spacing(1),
  },
  '& .paperDivider': theme.paper.divider,
}));

class CoarseLocationFilter extends Component {
  state = {
    reset: 0,
  };

  _filterValue = (k) => {
    const { filters } = this.props;
    return !!filters && !!filters[k] ? filters[k].value : null;
  };

  render() {
    return (
      <StyledCoarseLocationFilter>
        <Grid container className="form">
          <ControlledField
            module="location"
            id={`CoarseLocationFilter.location_0`}
            field={
              <Grid item xs={6} className="item">
                <PublishedComponent
                  pubRef="location.RegionPicker"
                  value={this._filterValue(`${this.props.anchor}_0`)}
                  withNull={true}
                  onChange={(v, s) => this.props.onChange(0, v, s)}
                />
              </Grid>
            }
          />
          <ControlledField
            module="location"
            id={`CoarseLocationFilter.location_1`}
            field={
              <Grid item xs={6} className="item">
                <PublishedComponent
                  pubRef="location.DistrictPicker"
                  value={this._filterValue(`${this.props.anchor}_1`)}
                  region={this._filterValue(`${this.props.anchor}_0`)}
                  withNull={true}
                  reset={this.state.reset}
                  onChange={(v, s) => this.props.onChange(1, v, s)}
                />
              </Grid>
            }
          />
        </Grid>
      </StyledCoarseLocationFilter>
    );
  }
}

export default CoarseLocationFilter;
