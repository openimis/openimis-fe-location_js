import React, { Component } from "react";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from 'react-intl';
import { formatMessage, AutoSuggestion, withModulesManager } from "@openimis/fe-core";
import _debounce from "lodash/debounce";
import { locationLabel } from "../utils";

const styles = theme => ({
    label: {
        color: theme.palette.primary.main
    }
});

class RegionPicker extends Component {

    onSuggestionSelected = v => this.props.onChange(v, locationLabel(v));

    render() {
        const { intl, value, reset, regions,
            withLabel = true, label,
            preValues = [],
            withPlaceholder, placeholder = null,
            readOnly = false, required = false
        } = this.props;

        return <AutoSuggestion
            items={regions}
            preValues={preValues}
            label={!!withLabel && (label || formatMessage(intl, "location", "RegionPicker.label"))}
            placeholder={!!withPlaceholder ? placeholder || formatMessage(intl, "location", "RegionPicker.placehoder") : null}
            lookup={locationLabel}
            renderSuggestion={a => <span>{locationLabel(a)}</span>}
            getSuggestionValue={locationLabel}
            onSuggestionSelected={this.onSuggestionSelected}
            value={value}
            reset={reset}
            readOnly={readOnly}
            required={required}
        />
    }
}

const mapStateToProps = state => ({
    regions: state.loc.userL0s || [],
});

export default withModulesManager(connect(mapStateToProps)(injectIntl(withTheme(withStyles(styles)(RegionPicker)))));
