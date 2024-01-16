import React, { Component } from "react";
import _ from "lodash";

import { withTheme, withStyles } from "@material-ui/core/styles";
import { Grid } from "@material-ui/core";

import { ControlledField, PublishedComponent } from "@openimis/fe-core";
import { locationLabel } from "../utils";

const styles = (theme) => ({
  dialogTitle: theme.dialog.title,
  dialogContent: theme.dialog.content,
  form: {
    padding: 0,
  },
  item: {
    padding: theme.spacing(1),
  },
  paperDivider: theme.paper.divider,
});

class FSPCoarseLocation extends Component {
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

  filterDistrict = (options, { inputValue }) => {
    if (this.state.region) {
      const filteredOptions = options.filter((district) => this.state.region?.uuid === district.parent.uuid);
      return !!inputValue
        ? filteredOptions.filter((option) => locationLabel(option).includes(inputValue))
        : filteredOptions;
    }

    if (inputValue) {
      return options.filter((option) => locationLabel(option).includes(inputValue));
    } else return options;
  };

  onChangeDistrict = (district) => {
    if (!!district) {
      this.setState({ region: district.parent });
    }
    this.props.onChange(district);
  };

  render() {
    const { classes, readOnly, required = false } = this.props;
    const { region, district } = this.state;
    return (
      <Grid container className={classes.form}>
        <ControlledField
          module="location"
          id={`FSPCoarseLocation.location_0`}
          field={
            <Grid item xs={6} className={classes.item}>
              <PublishedComponent
                pubRef="location.FSPLocationPicker"
                locationLevel={0}
                value={region}
                onChange={this.onChangeRegion}
                readOnly={readOnly}
                required={required}
              />
            </Grid>
          }
        />
        <ControlledField
          module="location"
          id={`FSPCoarseLocation.location_1`}
          field={
            <Grid item xs={6} className={classes.item}>
              <PublishedComponent
                pubRef="location.FSPLocationPicker"
                locationLevel={1}
                value={district}
                onChange={this.onChangeDistrict}
                filterOptions={this.filterDistrict}
                readOnly={readOnly}
                required={required}
              />
            </Grid>
          }
        />
      </Grid>
    );
  }
}

export default withTheme(withStyles(styles)(FSPCoarseLocation));
