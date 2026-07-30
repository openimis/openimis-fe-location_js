import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import { styled } from "@mui/material/styles";
import { fetchHealthFacilityFullPath } from "../actions";
import { Grid } from "@mui/material";
import { withModulesManager, FieldLabel, ControlledField } from "@openimis/fe-core";

const StyledHealthFacilityFullPath = styled('div')(({ theme }) => ({
  '& .container': {
    position: "relative",
    top: "50%",
    left: "50%",
    transform: "translate(-50%,0%)",
  },
}));

class HealthFacilityFullPath extends Component {
  componentDidMount() {
    if (!!this.props.hfid) {
      this.props.fetchHealthFacilityFullPath(this.props.modulesManager, this.props.hfid);
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.hfid !== this.props.hfid) {
      this.props.fetchHealthFacilityFullPath(this.props.hfid);
    }
  }

  render() {
    const { modulesManager, healthFacilityFullPath } = this.props;
    if (!healthFacilityFullPath) return null;
    return (
      <StyledHealthFacilityFullPath>
        <Grid container className="container">
          <ControlledField
            module="location"
            id="HealthFacilityFullPath.region"
            field={
              <Fragment>
                <Grid size={2}>
                  <FieldLabel module="location" id="HealthFacilityFullPath.region" />
                </Grid>
                <ControlledField
                  module="location"
                  id="HealthFacilityFullPath.region.code"
                  field={
                    <Grid size={modulesManager.hideField("location", "HealthFacilityFullPath.region.name") ? 10 : 3}>
                      {healthFacilityFullPath.location.parent.code}
                    </Grid>
                  }
                />
                <ControlledField
                  module="location"
                  id="HealthFacilityFullPath.region.name"
                  field={
                    <Grid size={modulesManager.hideField("location", "HealthFacilityFullPath.region.code") ? 10 : 7}>
                      {healthFacilityFullPath.location.parent.name}
                    </Grid>
                  }
                />
              </Fragment>
            }
          />
          <ControlledField
            module="location"
            id="HealthFacilityFullPath.district"
            field={
              <Fragment>
                <Grid size={2}>
                  <FieldLabel module="location" id="HealthFacilityFullPath.district" />
                </Grid>
                <ControlledField
                  module="location"
                  id="HealthFacilityFullPath.district.code"
                  field={
                    <Grid size={modulesManager.hideField("location", "HealthFacilityFullPath.district.name") ? 10 : 3}>
                      {healthFacilityFullPath.location.code}
                    </Grid>
                  }
                />
                <ControlledField
                  module="location"
                  id="HealthFacilityFullPath.district.name"
                  field={
                    <Grid size={modulesManager.hideField("location", "HealthFacilityFullPath.dictrict.code") ? 10 : 7}>
                      {healthFacilityFullPath.location.name}
                    </Grid>
                  }
                />
              </Fragment>
            }
          />
          <ControlledField
            module="location"
            id="HealthFacilityFullPath.healthFacility"
            field={
              <Fragment>
                <Grid size={2}>
                  <FieldLabel module="location" id="HealthFacilityFullPath.healthFacility" />
                </Grid>
                <ControlledField
                  module="location"
                  id="HealthFacilityFullPath.healthFacility.code"
                  field={
                    <Grid
                      item
                      size={
                        modulesManager.hideField("location", "HealthFacilityFullPath.healthFacility.nameAndLevel")
                          ? 10
                          : 3
                      }
                    >
                      {healthFacilityFullPath.code}
                    </Grid>
                  }
                />
                <ControlledField
                  module="location"
                  id="HealthFacilityFullPath.healthFacility.nameAndLevel"
                  field={
                    <Grid size={7}>
                      <ControlledField
                        module="location"
                        id="HealthFacilityFullPath.healthFacility.name"
                        field={healthFacilityFullPath.name}
                      />
                      <ControlledField
                        module="location"
                        id="HealthFacilityFullPath.healthFacility.level"
                        field={` (${healthFacilityFullPath.level})`}
                      />
                    </Grid>
                  }
                />
              </Fragment>
            }
          />
        </Grid>
      </StyledHealthFacilityFullPath>
    );
  }
}

const mapStateToProps = (state) => ({
  healthFacilityFullPath: state.loc.healthFacilityFullPath,
  fetchingHealthFacilityFullPath: state.loc.fetchingHealthFacilityFullPath,
  fetchedHealthFacilityFullPath: state.loc.HealthFacilityFullPath,
  errorHealthFacilityFullPath: state.loc.errorHealthFacilityFullPath,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchHealthFacilityFullPath }, dispatch);
};

export { StyledHealthFacilityFullPath };
export default withModulesManager(
  connect(mapStateToProps, mapDispatchToProps)(injectIntl(HealthFacilityFullPath)),
);
