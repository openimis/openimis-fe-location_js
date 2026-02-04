import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { styled } from "@mui/material/styles";
import { Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { withHistory, historyPush, formatMessage, Helmet, clearCurrentPaginationPage } from "@openimis/fe-core";
import HealthFacilitiesSearcher from "../components/HealthFacilitiesSearcher";
import { RIGHT_HEALTH_FACILITY_ADD, MODULE_NAME } from "../constants";

const StyledHealthFacilitiesPage = styled('div')(({ theme }) => ({
  '& .page': theme.page ?? {},
  '& .fab': theme.fab ?? {},
}));

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
    const { rights } = this.props;
    return (
      <StyledHealthFacilitiesPage>
        <div className="page">
          <Helmet title={formatMessage(this.props.intl, "location", "healthFacilities.page.title")} />
          <HealthFacilitiesSearcher onDoubleClick={this.onDoubleClick} />
          {rights.includes(RIGHT_HEALTH_FACILITY_ADD) && (
            <div className="fab">
              <Fab color="primary" onClick={this.onAdd}>
                <AddIcon />
              </Fab>
            </div>
          )}
        </div>
      </StyledHealthFacilitiesPage>
    );
  }
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  module: state.core?.savedPagination?.module,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ clearCurrentPaginationPage }, dispatch);

export { StyledHealthFacilitiesPage };
export default injectIntl(
  withHistory(connect(mapStateToProps, mapDispatchToProps)(HealthFacilitiesPage)),
);
