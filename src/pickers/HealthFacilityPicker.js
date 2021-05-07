import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from 'react-intl';
import { fetchHealthFacilitiesStr } from "../actions";
import { formatMessage, AutoSuggestion, withModulesManager } from "@openimis/fe-core";
import { healthFacilityLabel } from "../utils";
import _ from "lodash";
import { TextField } from "@material-ui/core";

const styles = theme => ({
    textField: {
        width: "100%",
    },
});

class HealthFacilityPicker extends Component {

    state = {
        healthFacilities: []
    }

    constructor(props) {
        super(props);
        this.selectThreshold = props.modulesManager.getConf("fe-location", "HealthFacilityPicker.selectThreshold", 10);
    }

    componentDidMount() {
        this.setState({ healthFacilities: this.props.healthFacilities });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!_.isEqual(prevProps.healthFacilities, this.props.healthFacilities)) {
            this.setState({ healthFacilities: this.props.healthFacilities })
        } else if (!this.props.userHealthFacilityFullPath) {
            if (!_.isEqual(prevProps.region, this.props.region) ||
                !_.isEqual(prevProps.district, this.props.district) ||
                !_.isEqual(prevProps.level, this.props.level)
            ) {
                this.props.fetchHealthFacilitiesStr(this.props.modulesManager, this.props.region, this.props.district, this.props.value, this.props.level);
            }
        }
    }

    getSuggestions = str => !!str &&
        str.length >= this.props.modulesManager.getConf("fe-location", "healthFacilitiesMinCharLookup", 2) &&
        this.props.fetchHealthFacilitiesStr(this.props.modulesManager, this.props.region, this.props.district, str, this.props.level);

    debouncedGetSuggestion = _.debounce(
        this.getSuggestions,
        this.props.modulesManager.getConf("fe-location", "debounceTime", 800)
    )

    onSuggestionSelected = v => this.props.onChange(v, healthFacilityLabel(v));

    onClear = () => {
        this.setState(
            { healthFacilities: [] },
            e => this.onSuggestionSelected(null)
        );
    }

    render() {
        const { intl, classes, value, reset, userHealthFacilityFullPath, withLabel = true, label,
            readOnly = false, required = false, withNull = true, nullLabel = null } = this.props;
        const { healthFacilities } = this.state;

        if (!!userHealthFacilityFullPath) {
            return <TextField
                label={!!withLabel && (label || formatMessage(intl, "location", "HealthFacilityPicker.label"))}
                className={classes.textField}
                disabled
                value={healthFacilityLabel(userHealthFacilityFullPath)}
            />
        }
        return <AutoSuggestion
            module="location"
            items={healthFacilities}
            label={!!withLabel && (label || formatMessage(intl, "location", "HealthFacilityPicker.label"))}
            lookup={healthFacilityLabel}
            onClear={this.onClear}
            getSuggestions={this.debouncedGetSuggestion}
            renderSuggestion={a => <span>{healthFacilityLabel(a)}</span>}
            getSuggestionValue={healthFacilityLabel}
            onSuggestionSelected={this.onSuggestionSelected}
            value={value}
            reset={reset}
            readOnly={readOnly}
            required={required}
            selectThreshold={this.selectThreshold}
            withNull={withNull}
            nullLabel={nullLabel || formatMessage(intl, "location", "location.HealthFacilityPicker.null")}
        />
    }
}

const mapStateToProps = state => ({
    userHealthFacilityFullPath: state.loc.userHealthFacilityFullPath,
    healthFacilities: state.loc.healthFacilities,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchHealthFacilitiesStr }, dispatch);
};

export default withModulesManager(connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(HealthFacilityPicker)))));
