import React, { Component } from "react";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Fab } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import {
  historyPush,
  withModulesManager,
  withHistory,
  Helmet,
  formatMessage,
} from "@openimis/fe-core";
import MicroCatchmentSearcher from "../components/MicroCatchmentSearcher";
import { RIGHT_MICRO_CATCHMENT_ADD } from "../constants";

const styles = (theme) => ({
  page: theme.page,
  fab: theme.fab,
});

class MicroCatchmentsPage extends Component {
  onAdd = () => {
    historyPush(this.props.modulesManager, this.props.history, "location.route.microCatchment");
  };

  render() {
    const { classes, rights } = this.props;
    const canAdd = rights.includes(RIGHT_MICRO_CATCHMENT_ADD) || rights.includes(String(RIGHT_MICRO_CATCHMENT_ADD));
    return (
      <div className={classes.page}>
        <Helmet title={formatMessage(this.props.intl, "location", "microCatchments.page.title")} />
        <MicroCatchmentSearcher />
        {canAdd && (
          <Fab color="primary" className={classes.fab} onClick={this.onAdd}>
            <AddIcon />
          </Fab>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights || [],
});

export default withModulesManager(
  withHistory(
    connect(mapStateToProps)(
      injectIntl(withTheme(withStyles(styles)(MicroCatchmentsPage)))
    )
  )
);
