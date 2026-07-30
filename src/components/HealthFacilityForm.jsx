import React, { Component, Fragment } from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import _ from "lodash";

import { styled } from "@mui/material/styles";

import {
  ProgressOrError,
  Form,
  withModulesManager,
  withHistory,
  journalize,
  formatMessageWithValues,
  Helmet,
  parseData,
  historyPush,
  GetIconComponent,
} from "@openimis/fe-core";
import { fetchHealthFacility, clearHealthFacility } from "../actions";
import HealthFacilityMasterPanel from "../components/HealthFacilityMasterPanel";
import HealthFacilityCatchmentPanel from "../components/HealthFacilityCatchmentPanel";
const ReplayIcon = GetIconComponent("Replay")

const HF_FORM_CONTRIBUTION_KEY = "location.HealthFacility";

const StyledHealthFacilityForm = styled('div')(({ theme }) => ({
  '& .lockedPage': theme.page?.locked ?? {},
}));

class HealthFacilityForm extends Component {
  state = {
    reload: false,
    lockNew: false,
    reset: 0,
    update: 0,
    healthFacility_uuid: null,
    healthFacility: this._newHealthFacility(),
    newHealthFacility: true,
    isSaved: false,
  };

  constructor(props) {
    super(props);
    this.HealthFacilityPriceListsPanel = props.modulesManager.getRef("location.HealthFacilityPriceListsPanel");
    this.accCodeMandatory = props.modulesManager.getConf("fe-location", "healthFacilityForm.accCodeMandatory", false);
    this.isHealthFacilityStatusEnabled = props.modulesManager.getConf(
      "fe-location",
      "healthFacilityForm.isHealthFacilityStatusEnabled",
      false,
    );
    this.isHealthFacilityContractMandatory = props.modulesManager.getConf(
      "fe-location",
      "healthFacilityForm.isHealthFacilityContractMandatory",
      false,
    );
  }

  _newHealthFacility() {
    let hf = {};
    return hf;
  }

  componentDidMount() {
    if (this.props.healthFacility_uuid) {
      this.setState((state, props) => ({ healthFacility_uuid: props.healthFacility_uuid }));
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      prevProps.fetchedHealthFacility !== this.props.fetchedHealthFacility &&
      !!this.props.fetchedHealthFacility &&
      !!this.props.healthFacility
    ) {
      this.setState((state, props) => ({
        healthFacility: { ...props.healthFacility, parentLocation: props.healthFacility.location.parent },
        healthFacility_uuid: props.healthFacility.uuid,
        lockNew: false,
        newHealthFacility: false,
      }));
    } else if (prevState.healthFacility_uuid !== this.state.healthFacility_uuid) {
      this.props.fetchHealthFacility(this.props.modulesManager, this.state.healthFacility_uuid, null);
    } else if (prevProps.healthFacility_uuid && !this.props.healthFacility_uuid) {
      this.setState({ healthFacility: this._newHealthFacility(), lockNew: false, healthFacility_uuid: null });
    } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      this.setState((state) => ({ reset: state.reset + 1 }));
    }
  }

  componentWillUnmount() {
    this.props.clearHealthFacility();
  }

  _add = () => {
    this.setState(
      (state) => ({
        healthFacility: this._newHealthFacility(),
        lockNew: false,
        newHealthFacility: true,
        reset: state.reset + 1,
      }),
      (e) => {
        this.props.add();
        this.forceUpdate();
      },
    );
  };

  onEditedChanged = (healthFacility) => {
    this.setState({ healthFacility, newHealthFacility: false });
  };

  canSave = () => {
    // TODO - after such component is available, add contract dates as date range, not two separate dates
    if (_.isEqual(this.props.healthFacility, _.omit(this.state.healthFacility, "parentLocation"))) return false;
    if (this.state.isSaved) return false;
    if (!this.state.healthFacility.code) return false;
    if (this.props.isHFCodeValid === false) return false;
    if (!this.state.healthFacility.name) return false;
    if (!this.state.healthFacility.location) return false;
    if (!this.state.healthFacility.legalForm) return false;
    if (!this.state.healthFacility.level) return false;
    if (!this.state.healthFacility.careType) return false;
    if (this.state.healthFacility.validityTo) return false;
    if (!!this.accCodeMandatory && !this.state.healthFacility.accCode) return false;
    if (!!this.isHealthFacilityStatusEnabled & !this.state.healthFacility.status) return false;
    if (this.isHealthFacilityContractMandatory) {
      return !!this.state.healthFacility.contractStartDate && !!this.state.healthFacility.contractEndDate;
    }
    return true;
  };

  reload = async () => {
    const { modulesManager, history, fetchHealthFacility } = this.props;
    const {
      isSaved,
      reload,
      healthFacility_uuid: healthFacilityUuid,
      healthFacility: { code: healthFacilityCode },
    } = this.state;

    if (healthFacilityUuid) {
      try {
        await fetchHealthFacility(modulesManager, healthFacilityUuid, healthFacilityCode);
      } catch (error) {
        console.error(`[RELOAD_HEALTH_FACILITY]: Fetching HF's details failed. ${error}`);
      }
      this.setState((prevState) => ({ ...prevState, isSaved: false, reload: !reload }));
      return;
    }

    if (isSaved) {
      try {
        const response = await fetchHealthFacility(modulesManager, healthFacilityUuid, healthFacilityCode);
        const createdHealthFacilityUuid = parseData(response.payload.data.healthFacilities)[0].uuid;

        historyPush(modulesManager, history, "location.route.healthFacility", [createdHealthFacilityUuid]);
      } catch (error) {
        console.error(`[RELOAD_HEALTH_FACILITY]: Fetching HF's details failed. ${error}`);
      }
      this.setState((prevState) => ({ ...prevState, isSaved: false, reload: !reload }));
      return;
    }

    this.setState({
      reload: !reload,
      lockNew: false,
      reset: 0,
      update: 0,
      healthFacility_uuid: null,
      healthFacility: this._newHealthFacility(),
      newHealthFacility: true,
      isSaved: false,
    });
  };

  _save = (healthFacility) => {
    this.setState({ lockNew: !healthFacility.uuid, isSaved: true }, (e) => this.props.save(healthFacility));
  };

  render() {
    const { fetchingHealthFacility, fetchedHealthFacility, errorHealthFacility, add, save, back } = this.props;
    const { healthFacility_uuid, lockNew, healthFacility, newHealthFacility, reset, update, isSaved, reload } = this.state;
    let readOnly = lockNew || !!healthFacility.validityTo || isSaved;

    let actions = [
      {
        doIt: this.reload,
        icon: <ReplayIcon />,
        onlyIfDirty: !readOnly && !isSaved,
      },
    ];

    return (
      <StyledHealthFacilityForm>
        <div className={readOnly ? "lockedPage" : null}>
          <Helmet
            title={formatMessageWithValues(this.props.intl, "location", "healthFacility.edit.page.title", {
              code: this.state.healthFacility.code,
            })}
          />
          <ProgressOrError progress={fetchingHealthFacility} error={errorHealthFacility} />
          {(!!fetchedHealthFacility || !healthFacility_uuid) && (
            <Fragment>
              <Form
                reload={reload}
              module="location"
                edited_id={healthFacility_uuid}
                edited={healthFacility}
                reset={reset}
                update={update}
                title="healthFacility.edit.title"
                titleParams={{ code: healthFacility.code }}
                back={back}
                add={!!add && !newHealthFacility ? this._add : null}
                save={!!save ? this._save : null}
                canSave={this.canSave}
                readOnly={readOnly}
                HeadPanel={HealthFacilityMasterPanel}
                Panels={[this.HealthFacilityPriceListsPanel, HealthFacilityCatchmentPanel]}
                onEditedChanged={this.onEditedChanged}
                actions={actions}
                contributedPanelsKey={HF_FORM_CONTRIBUTION_KEY}
                openDirty={save}
              />
            </Fragment>
          )}
        </div>
      </StyledHealthFacilityForm>
    );
  }
}

const mapStateToProps = (state, props) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  userHealthFacilityFullPath: !!state.loc ? state.loc.userHealthFacilityFullPath : null,
  healthFacility: state.loc.healthFacility,
  fetchingHealthFacility: state.loc.fetchingHealthFacility,
  fetchedHealthFacility: state.loc.fetchedHealthFacility,
  errorHealthFacility: state.loc.errorHealthFacility,
  submittingMutation: state.loc.submittingMutation,
  mutation: state.loc.mutation,
  isHFCodeValid: state.loc.validationFields?.HFCode?.isValid,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchHealthFacility, clearHealthFacility, journalize }, dispatch);
};

export { HF_FORM_CONTRIBUTION_KEY };
export { HealthFacilityForm };
export default withHistory(
  withModulesManager(
    connect(mapStateToProps, mapDispatchToProps)(injectIntl(HealthFacilityForm)),
  ),
);
