import React, { Component } from "react";
import { injectIntl } from 'react-intl';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
    formatMessageWithValues, withModulesManager, withHistory, historyPush,
} from "@openimis/fe-core";
import { createOrUpdateHealthFacility } from "../actions";
import { RIGHT_HEALTH_FACILITY_ADD, RIGHT_HEALTH_FACILITY_EDIT } from "../constants";
import HealthFacilityForm from "../components/HealthFacilityForm";

const styles = theme => ({
    page: theme.page,
});


class HealthFacilityEditPage extends Component {

    add = () => {
        historyPush(this.props.modulesManager, this.props.history, "location.route.healthFacilityEdit")
    }

    save = (hf) => {
        this.props.createOrUpdateHealthFacility(
            hf,
            formatMessageWithValues(
                this.props.intl,
                "location",
                !hf.uuid ? "CreateHealthFacility.mutationLabel" : "UpdateHealthFacility.mutationLabel",
                { code: hf.code }
            )
        );
    }

    render() {
        const { modulesManager, history, classes, rights, healthFacility_uuid } = this.props;
        return (
            <div className={classes.page}>
                <HealthFacilityForm
                    healthFacility_uuid={healthFacility_uuid}
                    back={e => historyPush(modulesManager, history, "location.route.healthFacilities")}
                    add={rights.includes(RIGHT_HEALTH_FACILITY_ADD) ? this.add : null}
                    save={rights.includes(RIGHT_HEALTH_FACILITY_EDIT) ? this.save : null}
                />
            </div>
        )
    }
}

const mapStateToProps = (state, props) => ({
    rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
    healthFacility_uuid: props.match.params.healthFacility_uuid,
})

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ createOrUpdateHealthFacility }, dispatch);
};

export default withHistory(withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
    injectIntl(withTheme(withStyles(styles)(HealthFacilityEditPage))
    ))));