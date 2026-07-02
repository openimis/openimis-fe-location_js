import React, { Component } from "react";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Button } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import {
  Searcher,
  formatMessage,
  formatMessageWithValues,
  formatDateFromISO,
  withModulesManager,
  withHistory,
  historyPush,
  journalize,
  coreConfirm,
} from "@openimis/fe-core";
import { fetchMicroCatchments, deleteMicroCatchment } from "../actions";
import MicroCatchmentFilter from "./MicroCatchmentFilter";
import { RIGHT_MICRO_CATCHMENT_DELETE } from "../constants";

const styles = (theme) => ({
  page: theme.page,
  table: theme.table,
  searchResults: {
    "& .MuiTableHead-root .MuiTableCell-root": {
      fontSize: 16,
      paddingTop: theme.spacing(1.5),
      paddingBottom: theme.spacing(1.5),
    },
  },
});

class MicroCatchmentSearcher extends Component {
  state = { reset: 0, confirmedAction: null };

  constructor(props) {
    super(props);
    this.rowsPerPageOptions = props.modulesManager.getConf(
      "fe-location",
      "microCatchmentFilter.rowsPerPageOptions",
      [10, 20, 50, 100],
    );
    this.defaultPageSize = props.modulesManager.getConf("fe-location", "microCatchmentFilter.defaultPageSize", 10);
  }

  fetch = (params) => {
    this.props.fetchMicroCatchments(params);
  };

  componentDidUpdate(prevProps) {
    if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      this.setState((state) => ({ reset: state.reset + 1 }));
    } else if (prevProps.confirmed !== this.props.confirmed && this.props.confirmed && this.state.confirmedAction) {
      this.state.confirmedAction();
      this.setState({ confirmedAction: null });
    }
  }

  hasRight = (right) => this.props.rights.includes(right) || this.props.rights.includes(String(right));

  rowIdentifier = (r) => r.uuid;

  filtersToQueryParams = (state) => {
    let params = Object.keys(state.filters)
      .filter((f) => !!state.filters[f]["filter"])
      .map((f) => state.filters[f]["filter"]);
    params.push(`first: ${state.pageSize}`);
    if (!!state.afterCursor) {
      params.push(`after: "${state.afterCursor}"`);
    }
    if (!!state.beforeCursor) {
      params.push(`before: "${state.beforeCursor}"`);
    }
    if (!!state.orderBy) {
      params.push(`orderBy: ["${state.orderBy}"]`);
    }
    return params;
  };

  headers = () => {
    let result = [
      "microCatchment.code",
      "microCatchment.name",
      "microCatchment.district",
      "microCatchment.ta",
      "microCatchment.gvh",
      "microCatchment.type",
      "microCatchment.dateFrom",
      "microCatchment.dateTo",
    ];
    if (this.hasRight(RIGHT_MICRO_CATCHMENT_DELETE)) {
      result.push(null);
    }
    return result;
  };

  itemFormatters = () => {
    const { intl, modulesManager, history } = this.props;
    let result = [
      (mc) => mc.code,
      (mc) => mc.name,
      (mc) => mc.district?.name || "",
      (mc) =>
        (mc.traditionalAuthorities || [])
          .map((ta) => ta?.location?.name)
          .filter(Boolean)
          .join(", "),
      (mc) =>
        (mc.gvhs || [])
          .map((gvh) => gvh?.location?.name)
          .filter(Boolean)
          .join(", "),
      (mc) => mc.type,
      (mc) => formatDateFromISO(modulesManager, intl, mc.dateFrom),
      (mc) => formatDateFromISO(modulesManager, intl, mc.dateTo),
    ];
    if (this.hasRight(RIGHT_MICRO_CATCHMENT_DELETE)) {
      result.push((mc) =>
        mc.validityTo ? null : (
          <Button startIcon={<DeleteIcon />} disabled={!!mc.clientMutationId} onClick={() => this.onDelete(mc)}>
            {formatMessage(intl, "location", "microCatchment.delete.button")}
          </Button>
        ),
      );
    }
    return result;
  };

  onDelete = (mc) => {
    const confirmedAction = () =>
      this.props.deleteMicroCatchment(
        mc,
        formatMessageWithValues(this.props.intl, "location", "microCatchment.delete.mutationLabel", { code: mc.code }),
      );

    this.setState({ confirmedAction }, () =>
      this.props.coreConfirm(
        formatMessage(this.props.intl, "location", "microCatchment.delete.confirm.title"),
        formatMessageWithValues(this.props.intl, "location", "microCatchment.delete.confirm.message", {
          code: mc.code,
          name: mc.name,
        }),
      ),
    );
  };

  sorts = () => {
    let result = [
      ["code", true],
      ["name", true],
      ["district", true],
      null,
      null,
      ["type", true],
      ["dateFrom", true],
      ["dateTo", true],
    ];
    if (this.hasRight(RIGHT_MICRO_CATCHMENT_DELETE)) {
      result.push(null);
    }
    return result;
  };

  rowDisabled = (selection, i) => !!i.validityTo;

  rowLocked = (selection, i) => !!i.clientMutationId;

  onDoubleClick = (mc, newTab = false) => {
    historyPush(this.props.modulesManager, this.props.history, "location.route.microCatchment", [mc.uuid], newTab);
  };

  render() {
    const {
      intl,
      fetchingMicroCatchments,
      fetchedMicroCatchments,
      errorMicroCatchments,
      microCatchments,
      microCatchmentsPageInfo,
      microCatchmentsTotalCount,
      classes,
    } = this.props;

    return (
      <div className={classes.searchResults}>
        <Searcher
          module="location"
          FilterPane={MicroCatchmentFilter}
          fetch={this.fetch}
          reset={this.state.reset}
          items={microCatchments}
          itemsPageInfo={microCatchmentsPageInfo}
          fetchingItems={fetchingMicroCatchments}
          fetchedItems={fetchedMicroCatchments}
          errorItems={errorMicroCatchments}
          tableTitle={formatMessageWithValues(intl, "location", "microCatchments.searcher.title", {
            count: microCatchmentsTotalCount || 0,
          })}
          headers={this.headers}
          itemFormatters={this.itemFormatters}
          filtersToQueryParams={this.filtersToQueryParams}
          rowsPerPageOptions={this.rowsPerPageOptions}
          defaultPageSize={this.defaultPageSize}
          rowIdentifier={this.rowIdentifier}
          onDoubleClick={this.onDoubleClick}
          sorts={this.sorts}
          rowDisabled={this.rowDisabled}
          rowLocked={this.rowLocked}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights || [],
  submittingMutation: state.loc.submittingMutation,
  mutation: state.loc.mutation,
  confirmed: state.core.confirmed,
  fetchingMicroCatchments: state.loc.fetchingMicroCatchments,
  fetchedMicroCatchments: state.loc.fetchedMicroCatchments,
  errorMicroCatchments: state.loc.errorMicroCatchments,
  microCatchments: state.loc.microCatchments,
  microCatchmentsPageInfo: state.loc.microCatchmentsPageInfo,
  microCatchmentsTotalCount: state.loc.microCatchmentsTotalCount,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ fetchMicroCatchments, deleteMicroCatchment, coreConfirm, journalize }, dispatch);

export default withModulesManager(
  withHistory(
    connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(MicroCatchmentSearcher)))),
  ),
);
