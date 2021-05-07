import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from 'react-intl';
import { formatMessage, AutoSuggestion, withModulesManager } from "@openimis/fe-core";
import _debounce from "lodash/debounce";
import { locationLabel } from "../utils";
import { fetchLocationsStr } from "../actions";

const styles = theme => ({
    textField: {
        width: "100%",
    },
});

class LocationPicker extends Component {

    state = {
        locations: []
    }

    constructor(props) {
        super(props);
        this.locationTypes = props.modulesManager.getConf("fe-location", "Location.types", ["R", "D", "W", "V"])
        this.selectThreshold = props.modulesManager.getConf("fe-location", "LocationPicker.selectThreshold", 10);
    }

    componentDidMount() {
        this.setState({ locations: this.props.locations });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!_.isEqual(prevProps.locations, this.props.locations)) {
            this.setState({ locations: this.props.locations })
        }
    }

    getSuggestions = str => !!str &&
        str.length >= this.props.modulesManager.getConf("fe-location", "locationMinCharLookup", 2) &&
        this.props.fetchLocationsStr(this.locationTypes, this.props.locationLevel, this.props.parentLocation, str);

    debouncedGetSuggestion = _debounce(
        this.getSuggestions,
        this.props.modulesManager.getConf("fe-location", "debounceTime", 800)
    )

    onSuggestionSelected = v => {
        this.props.onChange(v, locationLabel(v))
    }

    onClear = () => {
        this.setState(
            { locations: [] },
            e => this.onSuggestionSelected(null)
        );
    }

    render() {
        const { intl, locationLevel, value, reset,
            withLabel = true, label = null, withNull = false, nullLabel = null, filterLabels = true,
            preValues = [],
            withPlaceholder, placeholder = null,
            readOnly = false, required = false
        } = this.props;
        const { locations } = this.state;

        return <AutoSuggestion
            module="location"
            items={locations}
            preValues={preValues}
            label={!!withLabel && (label || formatMessage(intl, "location", `Location${locationLevel}Picker.label`))}
            placeholder={!!withPlaceholder ? placeholder || formatMessage(intl, "location", `Location${locationLevel}Picker.placehoder`) : null}
            lookup={locationLabel}
            renderSuggestion={a => <span>{locationLabel(a)}</span>}
            getSuggestions={this.getSuggestions}
            getSuggestionValue={locationLabel}
            onClear={this.onClear}
            onSuggestionSelected={this.onSuggestionSelected}
            value={value}
            reset={reset}
            readOnly={readOnly}
            required={required}
            selectThreshold={this.selectThreshold}
            withNull={withNull}
            nullLabel={nullLabel ||
                filterLabels ?
                formatMessage(intl, "location", `location.Location${locationLevel}Picker.null`) :
                formatMessage(intl, "location", `location.Location${locationLevel}Picker.none`)}
        />
    }
}

const mapStateToProps = (state, props) => ({
    locations: state.loc[`l${props.locationLevel}s`] || [],
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchLocationsStr }, dispatch);
};


export default withModulesManager(connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(LocationPicker)))));
