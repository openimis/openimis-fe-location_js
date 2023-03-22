import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Fab } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import { withHistory, historyPush, formatMessage, Helmet, clearCurrentPaginationPage } from "@openimis/fe-core";
import HealthFacilitiesSearcher from "../components/HealthFacilitiesSearcher";
import { RIGHT_HEALTH_FACILITY_ADD, MODULE_NAME } from "../constants";

const styles = (theme) => ({
  page: theme.page,
  fab: theme.fab,
});

class HealthFacilitiesPage extends Component {
  onAdd = () => {
    historyPush(this.props.modulesManager, this.props.history, "location.route.healthFacilityEdit");
  };

  onDoubleClick = (hf) => {
    historyPush(this.props.modulesManager, this.props.history, "location.route.healthFacilityEdit", [hf.uuid]);
  };

  componentDidMount = () => {
    const { module } = this.props;
    if (module !== MODULE_NAME) this.props.clearCurrentPaginationPage();
  };

  render() {
    const { classes, rights } = this.props;
    return (
      <div className={classes.page}>
        <Helmet title={formatMessage(this.props.intl, "location", "healthFacilities.page.title")} />
        <HealthFacilitiesSearcher onDoubleClick={this.onDoubleClick} />
        {rights.includes(RIGHT_HEALTH_FACILITY_ADD) && (
          <div className={classes.fab}>
            <Fab color="primary" onClick={this.onAdd}>
              <AddIcon />
            </Fab>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  module: state.core?.savedPagination?.module,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ clearCurrentPaginationPage }, dispatch);

export default injectIntl(
  withTheme(withStyles(styles)(withHistory(connect(mapStateToProps, mapDispatchToProps)(HealthFacilitiesPage)))),
);
