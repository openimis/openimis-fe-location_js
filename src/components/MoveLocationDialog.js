import React, { Component, Fragment } from 'react';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from 'react-intl';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@material-ui/core';
import {
    formatMessage, withModulesManager,
    TextInput
} from "@openimis/fe-core";
import {
    fetchLocations, clearLocations
} from "../actions";

class MoveLocationDialog extends Component {

    state = {
        currentParent: null,
        l0: null,
        l1: null,
        l2: null
    }

    constructor(props) {
        super(props);
        this.locationTypes = props.modulesManager.getConf("fe-location", "Location.types", ["R", "D", "W", "V"])
    }

    keysFunction = event => {
        if (!!this.props.open) {
            if (event.keyCode === 13) {
                this.props.move(this.state);
            } else if (event.keyCode === 27) {
                this.props.onCancel();
            }
        }
    }

    componentDidMount() {
        document.addEventListener("keydown", this.keysFunction, false);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.keysFunction, false);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!_.isEqual(prevProps.currentParents, this.props.currentParents)) {
            let parents = this.props.currentParents;
            this.setState({
                l0: !!parents ? parents[0] : null,
                l1: !!parents && parents.length > 1 ? parents[1] : null,
                l2: !!parents && parents.length > 2 ? parents[2] : null,
            })
        } else if (!_.isEqual(prevProps.l1s, this.props.l1s)) {
            this.setState({
                l1: null,
                l1s: this.props.l1s,
                l2s: this.props.l2s,
            })
        } else if (!_.isEqual(prevProps.l2s, this.props.l2s)) {
            this.setState({
                l2: null,
                l2s: this.props.l2s,
            })
        }
    }

    handleChange = (i, v) => {
        let state = { ...this.state }
        state[`l${i}`] = v;
        for (let j = i+1; j < 3; j++) {
            state[`l${j}`] = null;
        }
        this.setState(
            { ...state },
            e => this.props.changeState({ [`l${i}`]: v })
        )
    }

    _move = () => {
        let newParent = !!this.state.l2 ? this.state.l2 : !!this.state.l1 ? this.state.l1 : this.state.l0;
        this.props.onMove(newParent)
    }

    render() {
        const { intl, open, title, onCancel, location, currentParents } = this.props;
        if (!location) return null;
        let parent = !!currentParents ? currentParents[currentParents.length - 1] : null;
        return (
            <Dialog
                open={open}
                onClose={onCancel}
            >
                <DialogTitle>{title}</DialogTitle>
                <Divider />
                {!!parent && (
                    <Fragment>
                        <DialogContent>
                            <DialogContentText>
                                <TextInput readOnly module="location"
                                    label="MoveDialog.current"
                                    value={`${parent.code} - ${parent.name}`}
                                />
                            </DialogContentText>
                        </DialogContent>
                        <Divider />
                    </Fragment>
                )}
                <DialogContent>
                    <DialogContentText>
                        <Grid container>
                            <Grid item xs={12}>
                                {formatMessage(intl, "location", "MoveDialog.new")}
                            </Grid>
                            {[0, 1, 2].map(i => {
                                return (i === 0 || !!this.state[`l${i - 1}`]) && (
                                    <Grid key={`select-${i}`} item xs={12}>
                                        <FormControl fullWidth>
                                            <InputLabel id={`reassign-to-label-${i}`}>
                                                {formatMessage(intl, "location", `location.locationType.${i}`)}
                                            </InputLabel>
                                            <Select
                                                labelId={`reassign-to-label-${i}`}
                                                id={`reassign-to-${i}`}
                                                value={this.state[`l${i}`]}
                                                onChange={e => this.handleChange(i, e.target.value)}
                                            >
                                                <MenuItem
                                                    key={`pick-null`}
                                                    value={null}
                                                >
                                                    {formatMessage(intl, "location", "MoveDialog.Parent.None")}
                                                </MenuItem>
                                                {!!this.props[`l${i}s`] && this.props[`l${i}s`]
                                                    .filter(l => l.uuid !== location.uuid)
                                                    .map((l, idx) => <MenuItem
                                                        key={`pick-${idx}`}
                                                        value={l}
                                                    >
                                                        {l.code} - {l.name}
                                                    </MenuItem>)}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                )
                            })}
                        </Grid>
                    </DialogContentText>
                </DialogContent>
                <Divider />
                <DialogActions>
                    <Button onClick={onCancel}>
                        {formatMessage(intl, "location", "MoveDialog.cancel")}
                    </Button>
                    <Button onClick={this._move} color="primary" autoFocus>
                        {formatMessage(intl, "location", "MoveDialog.move")}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}


const mapStateToProps = state => ({
    l0s: state.loc.l0s,
    fetchingL1s: state.loc.fetchingL1s,
    fetchedL1s: state.loc.fetchedL1s,
    l1s: state.loc.l1s,
    errorL1s: state.loc.errorL1s,
    fetchingL2s: state.loc.fetchingL2s,
    fetchedL2s: state.loc.fetchedL2s,
    l2s: state.loc.l2s,
    errorL2s: state.loc.errorL2s,
    submittingMutation: state.loc.submittingMutation,
    mutation: state.loc.mutation,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({
        fetchLocations, clearLocations
    }, dispatch);
};

export default withModulesManager(injectIntl(connect(mapStateToProps, mapDispatchToProps)(
    (MoveLocationDialog)
)));
