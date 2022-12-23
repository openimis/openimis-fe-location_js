import { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { fetchUserDistricts, clearUserDistricts } from "../actions";

class UserDistrictsLoader extends Component {
  componentDidMount() {
    this.props.fetchUserDistricts();
  }
  componentWillUnmount() {
    this.props.clearUserDistricts();
  }
  render() {
    return null;
  }
}

const mapStateToProps = (state) => ({
  userL0s: !!state.loc && state.loc.userL0s,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchUserDistricts, clearUserDistricts }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(UserDistrictsLoader);
