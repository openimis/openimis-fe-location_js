import React, { Component } from "react";
import { connect } from "react-redux";
import { AlertForwarder } from "@openimis/fe-core";

class LocationAlertForwarder extends Component {

    render() {
        return <AlertForwarder alert={this.props.alert} />
    }
}

const mapStateToProps = (state, props) => ({
    alert: !!state.loc && state.loc.alert
});

export default connect(mapStateToProps)(LocationAlertForwarder);