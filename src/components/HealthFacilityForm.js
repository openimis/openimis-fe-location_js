import React, { Component, Fragment } from "react";
import { injectIntl } from 'react-intl';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import ReplayIcon from "@material-ui/icons/Replay"
import {
    Contributions, ProgressOrError, Form,
    withModulesManager, withHistory, journalize,
} from "@openimis/fe-core";
import HealthFacilityMasterPanel from "../components/HealthFacilityMasterPanel";
import HealthFacilityCatchmentPanel from "../components/HealthFacilityCatchmentPanel";
import { fetchHealthFacility } from "../actions";

const HEALTH_FACILITY_FORM_CONTRIBUTION_KEY = "location.healthFacilityForm";

class HealthFacilityForm extends Component {


    state = {
        lockNew: false,
        reset: 0,
        update: 0,
        healthFacility_uuid: null,
        healthFacility: this._newHealthFacility(),
    }

    constructor(props) {
        super(props);
        this.HealthFacilityPriceListsPanel = props.modulesManager.getRef("location.HealthFacilityPriceListsPanel");
    }

    _newHealthFacility() {
        let hf = {};
        return hf;
    }

    componentDidMount() {
        if (this.props.healthFacility_uuid) {
            this.setState(
                { healthFacility_uuid: this.props.healthFacility_uuid },
                e => this.props.fetchHealthFacility(
                    this.props.modulesManager,
                    this.props.healthFacility_uuid,
                    null
                )
            )
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.fetchedHealthFacility !== this.props.fetchedHealthFacility && !!this.props.fetchedHealthFacility) {
            this.setState(
                { healthFacility: this.props.healthFacility, healthFacility_uuid: this.props.healthFacility.uuid, lockNew: false },
            );
        } else if (prevProps.healthFacility_uuid && !this.props.healthFacility_uuid) {
            this.setState({ healthFacility: this._newHealthFacility(), lockNew: false, healthFacility_uuid: null });
        } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
            this.props.journalize(this.props.mutation);
            this.setState({ reset: this.state.reset + 1 });
        } else if (!prevProps.generating && !!this.props.generating) {
            this.props.generate(this.state.printParam)
        }
    }

    _add = () => {
        this.setState(
            {
                healthFacility: this._newHealthFacility(),
                lockNew: false,
                reset: this.state.reset + 1,
            },
            e => {
                this.props.add();
                this.forceUpdate();
            }
        )
    }

    onEditedChanged = healthFacility => {
        this.setState({ healthFacility })
    }

    canSave = () => {
        if (!this.state.healthFacility.code) return false;
        if (!this.state.healthFacility.name) return false;
        if (!this.state.healthFacility.location) return false;
        if (!this.state.healthFacility.legalForm) return false;
        if (!this.state.healthFacility.level) return false;
        if (!this.state.healthFacility.careType) return false;
        return true;
    }

    reload = () => {
        this.props.fetchHealthFacility(
            this.props.modulesManager,
            this.state.healthFacility_uuid,
            this.state.healthFacility.code
        );
    }

    _save = (healthFacility) => {
        this.setState(
            { lockNew: !healthFacility.uuid }, // avoid duplicates
            e => this.props.save(healthFacility))
    }

    render() {
        const {
            fetchingHealthFacility,
            fetchedHealthFacility,
            errorHealthFacility,
            add, save, back,
        } = this.props
        const { healthFacility_uuid, lockNew } = this.state;
        let readOnly = lockNew || !!this.state.healthFacility.validityTo;
        var actions = [{
            doIt: e => this.reload(healthFacility_uuid),
            icon: <ReplayIcon />,
            onlyIfDirty: !readOnly
        }]        
        return (
            <Fragment>
                <ProgressOrError progress={fetchingHealthFacility} error={errorHealthFacility} />
                {(!!fetchedHealthFacility || !healthFacility_uuid) && (
                    <Fragment>
                        <Form
                            module="location"
                            edited_id={healthFacility_uuid}
                            edited={this.state.healthFacility}
                            reset={this.state.reset}
                            update={this.state.update}
                            title="healthFacility.edit.title"
                            titleParams={{ code: this.state.healthFacility.code }}
                            back={back}
                            add={!!add ? this._add : null}
                            save={!!save ? this._save : null}
                            canSave={this.canSave}
                            reload={(healthFacility_uuid || readOnly) && this.reload}
                            readOnly={readOnly}
                            HeadPanel={HealthFacilityMasterPanel}
                            Panels={[this.HealthFacilityPriceListsPanel, HealthFacilityCatchmentPanel]}
                            onEditedChanged={this.onEditedChanged}
                            actions={actions}
                        />
                        <Contributions contributionKey={HEALTH_FACILITY_FORM_CONTRIBUTION_KEY} />
                    </Fragment>
                )}
            </Fragment>
        )
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
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchHealthFacility, journalize }, dispatch);
};

export default withHistory(withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
    injectIntl(HealthFacilityForm)
)));
