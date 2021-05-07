import React, { Component, Fragment } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { injectIntl } from 'react-intl';
import _ from "lodash";
import DeleteIcon from "@material-ui/icons/Delete";
import {
    withModulesManager, decodeId, formatDateFromISO,
    journalize, coreConfirm,
    Searcher,
} from "@openimis/fe-core";
import HealthFacilityFilter from "./HealthFacilityFilter";
import { fetchHealthFacilitySummaries, deleteHealthFacility } from "../actions";
import {
    formatMessage, formatMessageWithValues,
    PublishedComponent,
} from "@openimis/fe-core";
import { IconButton } from "@material-ui/core";
import { RIGHT_HEALTH_FACILITY_DELETE } from "../constants";

class HealthFacilitiesSearcher extends Component {

    constructor(props) {
        super(props);
        this.rowsPerPageOptions = props.modulesManager.getConf("fe-location", "healthFacilityFilter.rowsPerPageOptions", [10, 20, 50, 100]);
        this.defaultPageSize = props.modulesManager.getConf("fe-location", "healthFacilityFilter.defaultPageSize", 10);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.submittingMutation && !this.props.submittingMutation) {
            this.props.journalize(this.props.mutation);
        } else if (prevProps.confirmed !== this.props.confirmed && !!this.props.confirmed && !!this.state.confirmedAction) {
            this.state.confirmedAction();
        }
    }

    rowIdentifier = (r) => r.uuid

    headers = (filters) => {
        let headers = [
            "healthFacilitySummaries.code",
            "healthFacilitySummaries.name",
            "healthFacilitySummaries.legalForm",
            "healthFacilitySummaries.level",
            "healthFacilitySummaries.careType",
            "healthFacilitySummaries.phone",
            "healthFacilitySummaries.fax",
            "healthFacilitySummaries.email",
            "healthFacilitySummaries.region",
            "healthFacilitySummaries.district",
            "healthFacilitySummaries.validityFrom",
            "healthFacilitySummaries.validityTo",
        ]
        if (this.props.rights.includes(RIGHT_HEALTH_FACILITY_DELETE)) {
            headers.push(null);
        }
        return headers;
    }

    sorts = (filters) => [
        ['code', true],
        ['name', true],
        ['legalForm', true],
        ['level', true],
        ['careType', true],
        null,
        null,
        null,
        null,
        null,
        ['validityFrom', false],
        ['validityTo', false]
    ]

    itemFormatters = (filters) => {
        let formatters = [
            hf => hf.code,
            hf => hf.name,
            hf => !!hf.legalForm ?
                formatMessage(this.props.intl, "location", `healthFacilityLegalForm.${hf.legalForm.code}`) :
                null,
            hf => !!hf.level ?
                formatMessage(this.props.intl, "location", `healthFacilityLevel.${hf.level}`) :
                null,
            hf => <PublishedComponent
                readOnly={true}
                nullLabel="empty"
                pubRef="medical.CareTypePicker" withLabel={false} value={hf.careType}
            />,
            hf => hf.phone,
            hf => hf.fax,
            hf => hf.email,
            hf => hf.location && hf.location.parent ?
                `${hf.location.parent.code} - ${hf.location.parent.name}` :
                null,
            hf => hf.location ?
                `${hf.location.code} - ${hf.location.name}` :
                null,

            hf => formatDateFromISO(
                this.props.modulesManager,
                this.props.intl,
                hf.validityFrom),
            hf => formatDateFromISO(
                this.props.modulesManager,
                this.props.intl,
                hf.validityTo),

        ]
        if (this.props.rights.includes(RIGHT_HEALTH_FACILITY_DELETE)) {
            formatters.push(hf => !!hf.validityTo ? null : <IconButton
                onClick={e => this.onDelete(hf)}>
                <DeleteIcon />
            </IconButton>);
        }
        return formatters;
    }

    rowDisabled = (selection, i) => !!i.validityTo

    onDelete = hf => {
        let confirm = e => this.props.coreConfirm(
            formatMessage(this.props.intl, "location", "deleteHealthFacility.confirm.title"),
            formatMessageWithValues(this.props.intl, "location", "deleteHealthFacility.confirm.message",
                {
                    code: hf.code,
                    name: hf.name,
                }),
        );
        let confirmedAction = () => this.props.deleteHealthFacility(
            hf,
            formatMessageWithValues(
                this.props.intl,
                "location",
                "DeleteHealthFacility.mutationLabel",
                { code: hf.code }
            )
        );
        this.setState(
            { confirmedAction },
            confirm
        )
    }

    rowLocked = (selection, hf) => !!hf.clientMutationId

    render() {
        const {
            intl,
            healthFacilities, healthFacilitiesPageInfo,
            fetchingHealthFacilities, fetchedHealthFacilities, errorHealthFacilities,
            onDoubleClick,
        } = this.props;
        let count = healthFacilitiesPageInfo.totalCount;
        return (
            <Fragment>
                <Searcher
                    module="location"
                    rowsPerPageOptions={this.rowsPerPageOptions}
                    defaultPageSize={this.defaultPageSize}
                    fetch={this.props.fetchHealthFacilitySummaries}
                    cacheFiltersKey="locationHealthFacilitiesSearcher"
                    items={healthFacilities}
                    rowIdentifier={this.rowIdentifier}
                    rowLocked={this.rowLocked}
                    itemsPageInfo={healthFacilitiesPageInfo}
                    fetchingItems={fetchingHealthFacilities}
                    fetchedItems={fetchedHealthFacilities}
                    errorItems={errorHealthFacilities}
                    FilterPane={HealthFacilityFilter}
                    tableTitle={formatMessageWithValues(intl, "location", "healthFacilitySummaries", { count })}
                    headers={this.headers}
                    itemFormatters={this.itemFormatters}
                    rowDisabled={this.rowDisabled}
                    sorts={this.sorts}
                    onDoubleClick={onDoubleClick}
                />
            </Fragment>
        )
    }
}

const mapStateToProps = state => ({
    rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
    userHealthFacilityFullPath: state.loc.userHealthFacilityFullPath,
    submittingMutation: state.loc.submittingMutation,
    mutation: state.loc.mutation,
    confirmed: state.core.confirmed,
    healthFacilities: state.loc.healthFacilities,
    healthFacilitiesPageInfo: state.loc.healthFacilitiesPageInfo,
    fetchingHealthFacilities: state.loc.fetchingHealthFacilities,
    fetchedHealthFacilities: state.loc.fetchedHealthFacilities,
    errorHealthFacilities: state.loc.errorHealthFacilities,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators(
        { fetchHealthFacilitySummaries, deleteHealthFacility, coreConfirm, journalize },
        dispatch);
};

export default withModulesManager(injectIntl(connect(mapStateToProps, mapDispatchToProps)(HealthFacilitiesSearcher)));