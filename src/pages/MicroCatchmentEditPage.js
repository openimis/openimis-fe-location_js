import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
  withModulesManager,
  withHistory,
  historyPush,
  Helmet,
  formatMessage,
} from "@openimis/fe-core";
import MicroCatchmentForm from "../components/MicroCatchmentForm";
import { RIGHT_MICRO_CATCHMENT_ADD, RIGHT_MICRO_CATCHMENT_EDIT } from "../constants";

const styles = (theme) => ({
  page: theme.page,
  fab: theme.fab,
});

const hasRight = (rights = [], right) => rights.includes(right) || rights.includes(String(right));

class MicroCatchmentEditPage extends Component {
  back = () => {
    historyPush(this.props.modulesManager, this.props.history, "location.route.microCatchments");
  };

  render() {
    const { classes, intl, rights, microCatchment_uuid } = this.props;
    const canEdit = hasRight(rights, RIGHT_MICRO_CATCHMENT_EDIT);
    const canAdd = hasRight(rights, RIGHT_MICRO_CATCHMENT_ADD);
    const readOnly = !!microCatchment_uuid ? !canEdit : !canAdd;

    return (
      <div className={classes.page}>
        <Helmet
          title={formatMessage(intl, "location", microCatchment_uuid ? "microCatchment.edit.page.title" : "microCatchment.new.page.title")}
        />
        <MicroCatchmentForm
          microCatchmentUuid={microCatchment_uuid}
          readOnly={readOnly}
          back={this.back}
        />
      </div>
    );
  }
}

const mapStateToProps = (state, props) => ({
  rights: state.core?.user?.i_user?.rights || [],
  microCatchment_uuid: props.match?.params?.microCatchment_uuid,
});

export default withHistory(
  withModulesManager(
    connect(mapStateToProps)(injectIntl(withTheme(withStyles(styles)(MicroCatchmentEditPage))))
  )
);
