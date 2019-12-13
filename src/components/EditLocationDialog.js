import React, { Component } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Grid
} from '@material-ui/core';
import { injectIntl } from 'react-intl';
import {
    withModulesManager,
    formatMessage,
    TextInput, NumberInput
} from "@openimis/fe-core";
import _ from "lodash";

class EditLocationDialog extends Component {

    state = {
        data: {},
    }

    constructor(props) {
        super(props);
        this.codeMaxLength = props.modulesManager.getConf("fe-location", "locationForm.codeMaxLength", 8);
    }

    keysFunction = event => {
        if (!!this.props.open) {
            if (event.keyCode === 13) {
                if (this.canSave()) {
                    this.props.onSave(this.state.data);
                }
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
        if (!_.isEqual(prevProps.location, this.props.location)) {
            this.setState({ data: this.props.location });
        }
    }

    changeData = (k, v) => {
        let data = { ...this.state.data };
        data[k] = v;
        this.setState({ data });
    }

    canSave = () => !!this.state.data && !!this.state.data.code && !!this.state.data.name

    render() {
        const { intl, open, title, onSave, onCancel, withCaptation = false } = this.props;
        return (
            <Dialog
                open={open}
                onClose={onCancel}
            >
                <DialogTitle>{title}</DialogTitle>
                <Divider />
                <DialogContent>
                    <DialogContentText>
                        <TextInput
                            module="location"
                            label="EditDialog.code"
                            autoFocus={true}
                            value={!!this.state.data ? this.state.data.code : null}
                            onChange={v => this.changeData('code', v)}
                            inputProps={{
                                "maxLength": this.codeMaxLength,
                            }}
                        />
                        <TextInput
                            module="location"
                            label="EditDialog.name"
                            value={!!this.state.data ? this.state.data.name : null}
                            onChange={v => this.changeData('name', v)}
                        />
                        {withCaptation && (
                            <Grid container>
                                <Grid item xs={6}>
                                    <NumberInput
                                        module="location"
                                        label="EditDialog.male"
                                        value={!!this.state.data ? this.state.data.malePopulation : null}
                                        onChange={v => this.changeData('malePopulation', v)}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <NumberInput
                                        module="location"
                                        label="EditDialog.female"
                                        value={!!this.state.data ? this.state.data.femalePopulation : null}
                                        onChange={v => this.changeData('femalePopultaion', v)}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <NumberInput
                                        module="location"
                                        label="EditDialog.other"
                                        value={!!this.state.data ? this.state.data.otherPopulation : null}
                                        onChange={v => this.changeData('otherPopultaion', v)}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <NumberInput
                                        module="location"
                                        label="EditDialog.family"
                                        value={!!this.state.data ? this.state.data.families : null}
                                        onChange={v => this.changeData('families', v)}
                                    />
                                </Grid>
                            </Grid>
                        )}
                    </DialogContentText>
                </DialogContent>
                <Divider />
                <DialogActions>
                    <Button onClick={onCancel}>
                        {formatMessage(intl, "location", "EditDialog.cancel")}
                    </Button>
                    <Button onClick={e => onSave(this.state.data)} color="primary" autoFocus disabled={!this.canSave()}>
                        {formatMessage(intl, "location", "EditDialog.save")}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}


export default withModulesManager(injectIntl(EditLocationDialog));