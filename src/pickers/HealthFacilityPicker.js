import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from 'react-intl';
import { fetchHealthFacilities } from "../actions";
import { formatMessage, AutoSuggestion, SelectInput, withModulesManager } from "@openimis/fe-core";
import _debounce from "lodash/debounce";
import { healthFacilityLabel } from "../utils";
import _ from "lodash";

const styles = theme => ({
    label: {
        color: theme.palette.primary.main
    }
});

class HealthFacilityPicker extends Component {

    constructor(props) {
        super(props);
        this.selectThreshold = props.modulesManager.getConf("fe-location", "HealthFacilityPicker.selectThreshold", 10);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!_.isEqual(prevProps.district, this.props.district)) {
            this.props.fetchHealthFacilities(this.props.modulesManager, this.props.region, this.props.district, this.props.value);
        }
    }

    getSuggestions = str => !!str &&
        str.length >= this.props.modulesManager.getConf("fe-location", "healthFacilitiesMinCharLookup", 2) &&
        this.props.fetchHealthFacilities(this.props.modulesManager, this.props.region, this.props.district, str);

    debouncedGetSuggestion = _debounce(
        this.getSuggestions,
        this.props.modulesManager.getConf("fe-location", "debounceTime", 800)
    )

    onSuggestionSelected = v => this.props.onChange(v, healthFacilityLabel(v));

    render() {
        const { intl, value, reset, healthFacilities, withLabel = true, label,
            readOnly = false, required = false, withNull = true, nullLabel = null } = this.props;
        if (!value && !!healthFacilities && healthFacilities.length < this.selectThreshold) {
            var options = healthFacilities.map(r => ({ value: r, label: healthFacilityLabel(r) }));
            if (withNull) {
                options.unshift({ value: null, label: nullLabel || formatMessage(intl, "location", "location.HealthFacilityPicker.null") })
            }
            return <SelectInput
                module={"location"}
                strLabel={!!withLabel && (label || formatMessage(intl, "location", "HealthFacilityPicker.label"))}
                options={options}
                value={value}
                onChange={this.onSuggestionSelected}
                readOnly={readOnly}
                required={required}
            />
        } else {
            return <AutoSuggestion
                items={healthFacilities}
                label={!!withLabel && (label || formatMessage(intl, "location", "HealthFacilityPicker.label"))}
                lookup={healthFacilityLabel}
                getSuggestions={this.debouncedGetSuggestion}
                renderSuggestion={a => <span>{healthFacilityLabel(a)}</span>}
                getSuggestionValue={healthFacilityLabel}
                onSuggestionSelected={this.onSuggestionSelected}
                value={value}
                reset={reset}
                readOnly={readOnly}
                required={required}
            />
        }
    }
}

const mapStateToProps = state => ({
    healthFacilities: state.loc.healthFacilities,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchHealthFacilities }, dispatch);
};

export default withModulesManager(connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(HealthFacilityPicker)))));
