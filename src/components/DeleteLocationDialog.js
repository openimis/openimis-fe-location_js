import React, { Component, Fragment } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormControl,
    Select,
    InputLabel,
    MenuItem
} from '@material-ui/core';
import { injectIntl } from 'react-intl';
import { formatMessage } from "@openimis/fe-core";

const ACTION_DROP = "drop";
const ACTION_REASSIGN = "reassign";

class DeleteLocationDialog extends Component {

    state = {
        newParent: null,
        action: ACTION_DROP,
    }

    keysFunction = event => {
        if (!!this.props.open) {
            if (event.keyCode === 13) {
                this.props.onDelete(this.state);
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

    handleChange = (k, v) => this.setState({ [k]: v })

    render() {
        const { intl, open, type, title, confirm, drop, reassign, reassignLocations, onDelete, onCancel } = this.props;
        return (
            <Dialog
                open={open}
                onClose={onCancel}
            >
                <DialogTitle>{title}</DialogTitle>
                <Divider />
                <DialogContent>
                    <DialogContentText>
                        {!reassignLocations && confirm}
                        {!!reassignLocations && !reassignLocations.length && drop}
                        {!!reassignLocations && !!reassignLocations.length && (
                            <RadioGroup value={this.state.action} onChange={e => this.handleChange('action', e.target.value)}>
                                <FormControlLabel
                                    value={ACTION_DROP}
                                    control={<Radio color={this.state.action === ACTION_DROP ? "primary" : "default"} />}
                                    label={drop} />
                                <FormControlLabel
                                    value={ACTION_REASSIGN}
                                    control={<Radio color={this.state.action === ACTION_REASSIGN ? "primary" : "default"} />}
                                    label={reassign} />
                                {this.state.action === ACTION_REASSIGN &&
                                    <FormControl>
                                        <InputLabel id="reassign-to-label">{type}</InputLabel>
                                        <Select
                                            labelId="reassign-to-label"
                                            id="reassign-to"
                                            value={this.state.newParent}
                                            onChange={e => this.handleChange('newParent', e.target.value)}
                                        >
                                            {reassignLocations
                                                .map((l, idx) => <MenuItem
                                                    key={`pick-${idx}`}
                                                    value={l.uuid}
                                                >
                                                    {l.code} - {l.name}
                                                </MenuItem>)}
                                        </Select>
                                    </FormControl>
                                }
                            </RadioGroup>
                        )}
                    </DialogContentText>
                </DialogContent>
                <Divider />
                <DialogActions>
                    <Button onClick={onCancel}>
                        {formatMessage(intl, "location", "DeleteDialog.cancel")}
                    </Button>
                    <Button onClick={e => onDelete(this.state)} color="primary" autoFocus>
                        {formatMessage(intl, "location", "DeleteDialog.delete")}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}


export default injectIntl(DeleteLocationDialog);