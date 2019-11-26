import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { fetchUserDistricts } from "../actions";

class UserDistrictsLoader extends Component {
    componentDidMount() {
        if (!this.props.userDistricts) {
            this.props.fetchUserDistricts();
        }
    }
    render() {
        return null;
    }
}

const mapStateToProps = state => ({
    userDistricts: !!state.loc && state.loc.userDistricts,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchUserDistricts }, dispatch);
};


export default connect(mapStateToProps, mapDispatchToProps)(UserDistrictsLoader);