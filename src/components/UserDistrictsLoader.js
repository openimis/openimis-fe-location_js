import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { fetchUserDistricts } from "../actions";

class UserDistrictsLoader extends Component {
    componentDidMount() {
        if (!this.props.userL0s) {
            this.props.fetchUserDistricts();
        }
    }
    render() {
        return null;
    }
}

const mapStateToProps = state => ({
    userL0s: !!state.loc && state.loc.userL0s,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchUserDistricts }, dispatch);
};


export default connect(mapStateToProps, mapDispatchToProps)(UserDistrictsLoader);