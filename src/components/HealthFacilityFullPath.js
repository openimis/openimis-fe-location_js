import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from 'react-intl';
import { withTheme, withStyles } from "@material-ui/core/styles";
import { fetchHealthFacilityFullPath } from "../actions";
import { Grid } from "@material-ui/core";
import { withModulesManager, FieldLabel, ControlledField } from "@openimis/fe-core";

const styles = theme => ({
    container: {
        position: "relative",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,0%)",
    }
});

class HealthFacilityFullPath extends Component {

    componentDidMount() {
        if (!!this.props.hfid) {
            this.props.fetchHealthFacilityFullPath(
                this.props.modulesManager,
                this.props.hfid
            );
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.hfid !== this.props.hfid) {
            this.props.fetchHealthFacilityFullPath(this.props.hfid);
        }
    }

    render() {
        const { modulesManager, classes, healthFacilityFullPath } = this.props;
        if (!healthFacilityFullPath) return null;
        return (
            <Grid container className={classes.container}>
                <ControlledField module="location" id="HealthFacilityFullPath.region" field={(
                    <Fragment>
                        <Grid item xs={2}><FieldLabel module="location" id="HealthFacilityFullPath.region" /></Grid>
                        <ControlledField module="location" id="HealthFacilityFullPath.region.code" field={(
                            <Grid item xs={modulesManager.hideField("location", "HealthFacilityFullPath.region.name") ? 10 : 3}>
                                {healthFacilityFullPath.location.parent.code}
                            </Grid>
                        )} />
                        <ControlledField module="location" id="HealthFacilityFullPath.region.name" field={(
                            <Grid item xs={modulesManager.hideField("location", "HealthFacilityFullPath.region.code") ? 10 : 7}>
                                {healthFacilityFullPath.location.parent.name}
                            </Grid>
                        )} />
                    </Fragment>
                )} />
                <ControlledField module="location" id="HealthFacilityFullPath.district" field={(
                    <Fragment>
                        <Grid item xs={2}><FieldLabel module="location" id="HealthFacilityFullPath.district" /></Grid>
                        <ControlledField module="location" id="HealthFacilityFullPath.district.code" field={(
                            <Grid item xs={modulesManager.hideField("location", "HealthFacilityFullPath.district.name") ? 10 : 3}>
                                {healthFacilityFullPath.location.code}
                            </Grid>
                        )} />
                        <ControlledField module="location" id="HealthFacilityFullPath.district.name" field={(
                            <Grid item xs={modulesManager.hideField("location", "HealthFacilityFullPath.dictrict.code") ? 10 : 7}>
                                {healthFacilityFullPath.location.name}
                            </Grid>
                        )} />
                    </Fragment>
                )} />
                <ControlledField module="location" id="HealthFacilityFullPath.healthFacility" field={(
                    <Fragment>
                        <Grid item xs={2}><FieldLabel module="location" id="HealthFacilityFullPath.healthFacility" /></Grid>
                        <ControlledField module="location" id="HealthFacilityFullPath.healthFacility.code" field={(
                            <Grid item xs={modulesManager.hideField("location", "HealthFacilityFullPath.healthFacility.nameAndLevel") ? 10 : 3}>
                                {healthFacilityFullPath.code}
                            </Grid>
                        )} />
                        <ControlledField module="location" id="HealthFacilityFullPath.healthFacility.nameAndLevel" field={(
                            <Grid item xs={7}>
                                <ControlledField module="location" id="HealthFacilityFullPath.healthFacility.name" field={healthFacilityFullPath.name} />
                                <ControlledField module="location" id="HealthFacilityFullPath.healthFacility.level" field={` (${healthFacilityFullPath.level})`} />
                            </Grid>
                        )} />
                    </Fragment>
                )} />
            </Grid>
        )
    }
}

const mapStateToProps = state => ({
    healthFacilityFullPath: state.loc.healthFacilityFullPath,
    fetchingHealthFacilityFullPath: state.loc.fetchingHealthFacilityFullPath,
    fetchedHealthFacilityFullPath: state.loc.HealthFacilityFullPath,
    errorHealthFacilityFullPath: state.loc.errorHealthFacilityFullPath,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchHealthFacilityFullPath }, dispatch);
};

export default withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
    injectIntl(withTheme(
        withStyles(styles)(HealthFacilityFullPath)
    ))
));
