import React, { Component } from "react";
import { injectIntl } from 'react-intl';
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Fab } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import { withHistory, historyPush } from "@openimis/fe-core";
import HealthFacilitiesSearcher from "../components/HealthFacilitiesSearcher";

import { RIGHT_HEALTH_FACILITY_ADD } from "../constants";

const styles = theme => ({
    page: theme.page,
    fab: theme.fab
});

class HealthFacilitiesPage extends Component {

    onAdd = () => {
        historyPush(this.props.modulesManager, this.props.history, "location.route.healthFacilityEdit");
    }

    onDoubleClick = (hf) => {
        historyPush(this.props.modulesManager, this.props.history, "location.route.healthFacilityEdit", [hf.uuid])
    }

    render() {
        const { classes, rights } = this.props;
        return (
            <div className={classes.page}>
                <HealthFacilitiesSearcher
                    onDoubleClick={this.onDoubleClick}
                />
                {rights.includes(RIGHT_HEALTH_FACILITY_ADD) &&
                    <div className={classes.fab}>
                        <Fab color="primary"
                            onClick={this.onAdd}>
                            <AddIcon />
                        </Fab>
                    </div>
                }
            </div>
        )
    }
}

const mapStateToProps = state => ({
    rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
})

export default injectIntl(withTheme(withStyles(styles)
    (withHistory(connect(mapStateToProps)(HealthFacilitiesPage)))));