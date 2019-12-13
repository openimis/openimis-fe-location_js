import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { fetchUserHealthFacilityFullPath } from "../actions";
import { withModulesManager } from "@openimis/fe-core";

class UserHealthFacilityLoader extends Component {
    componentDidMount() {
        if (!!this.props.user.health_facility_id && !this.props.userHealthFacilityFullPath) {
            this.props.fetchUserHealthFacilityFullPath(
                this.props.modulesManager,
                this.props.user.health_facility_id
            );
        }
    }
    render() {
        return null;
    }
}

const mapStateToProps = state => ({
    user: state.core.user.i_user,
    userHealthFacilityFullPath: state.loc.userHealthFacilityFullPath,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchUserHealthFacilityFullPath }, dispatch);
};


export default withModulesManager(connect(mapStateToProps, mapDispatchToProps)(UserHealthFacilityLoader));