import React, { Component, Fragment } from "react";
import { injectIntl } from 'react-intl';
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
    Paper, List, ListItem, ListItemText, IconButton,
    ListItemSecondaryAction
} from "@material-ui/core";
import AddIcon from '@material-ui/icons/Add';
import MoveIcon from '@material-ui/icons/Shuffle';
import DeleteIcon from '@material-ui/icons/Delete';
import {
    formatMessage, formatMessageWithValues,
    Searcher, ProgressOrError
} from "@openimis/fe-core";
import EditLocationDialog from "./EditLocationDialog";
import MoveLocationDialog from "./MoveLocationDialog";
import DeleteLocationDialog from "../components/DeleteLocationDialog";

const styles = theme => ({
    paper: theme.paper.body,
    paperHeader: theme.paper.header,
    paperHeaderTitle: theme.paper.title,
    paperHeaderMessage: theme.paper.message,
    paperHeaderAction: theme.paper.action,
    lockedRow: theme.table.lockedRow,
})

class ActionDialogs extends Component {

    render() {
        const { intl, editOpen, moveOpen, delOpen,
            type, currentParents, stateLocation, locations, reassign = false,
            save, move, del, changeState, withCaptation = false
        } = this.props;
        let args = {
            type: formatMessage(intl, "location", `locationType.${type}`),
            code: !!stateLocation ? stateLocation.code : null,
            name: !!stateLocation ? stateLocation.name : null,
        }
        let editTitle = formatMessageWithValues(intl, "location", !stateLocation ? "AddDialog.title" : "EditDialog.title", args);
        if (!!currentParents) {
            let parent = currentParents[currentParents.length - 1]
            editTitle += formatMessageWithValues(intl, "location", "EditDialog.title.of", {
                code: !!parent ? parent.code : null,
                name: !!parent ? parent.name : null
            })
        }
        let children = !!reassign ? formatMessage(intl, "location", `locationType.${type}.children`) : null;
        let directChildren = !!reassign ? formatMessage(intl, "location", `locationType.${type}.directChildren`) : null;
        let reassignLocations = !!reassign ? locations.filter(l => !stateLocation || l.uuid !== stateLocation.uuid) : null;
        return (
            <Fragment>
                <EditLocationDialog
                    title={editTitle}
                    open={editOpen === type}
                    location={stateLocation}
                    onSave={save}
                    onCancel={() => changeState({ editOpen: null })}
                    withCaptation={withCaptation}
                />
                <MoveLocationDialog
                    title={
                        formatMessageWithValues(intl, "location", "MoveDialog.title", args)
                    }
                    open={moveOpen === type}
                    location={stateLocation}
                    locations={locations}
                    currentParents={currentParents}
                    onMove={move}
                    changeState={changeState}
                    onCancel={() => changeState({ moveOpen: null })}
                    withCaptation={withCaptation}
                />
                <DeleteLocationDialog
                    title={
                        formatMessageWithValues(intl, "location", "DeleteDialog.title", args)
                    }
                    type={args.type}
                    confirm={!!reassignLocations ?
                        formatMessageWithValues(intl, "location", "DeleteDialog.confirm", {
                            ...args,
                            children,
                        }) :
                        formatMessageWithValues(intl, "location", "DeleteDialog.confirmSimple", args)}
                    drop={formatMessageWithValues(intl, "location", "DeleteDialog.drop", {
                        ...args,
                        children,
                    })}
                    reassign={formatMessageWithValues(intl, "location", "DeleteDialog.reassign", {
                        ...args,
                        directChildren,
                    })}
                    location={stateLocation}
                    reassignLocations={reassignLocations}
                    open={delOpen === type}
                    onDelete={del}
                    onCancel={() => changeState({ delOpen: null })}
                />
            </Fragment>
        )
    }
}

const StyledActionDialogs = injectIntl(ActionDialogs)

class ResultPane extends Component {
    render() {
        const { classes, type, fetching, fetched, error,
            locations, location, onSelect, onEdit, onDelete, onMove
        } = this.props;
        return (
            <Fragment>
                <ProgressOrError progress={fetching} error={error} />
                {!!fetched && !!locations && (
                    <List component="nav">
                        {locations.map((l, idx) => (
                            <ListItem
                                key={`location-${type}-${idx}`}
                                button
                                selected={location && location.id === l.id}
                                onClick={e => !!onSelect && onSelect(l)}
                                onDoubleClick={e => !!onEdit && onEdit(l)}
                                className={!l.uuid ? classes.lockedRow : null}
                            >
                                <ListItemText>{l.code} - {l.name}</ListItemText>
                                {!!l.uuid &&
                                    <ListItemSecondaryAction>
                                        < IconButton onClick={e => onMove(l)}>
                                            <MoveIcon />
                                        </IconButton>
                                        <IconButton edge="end" onClick={e => onDelete(l, idx)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                }
                            </ListItem>))}
                    </List>
                )}
            </Fragment>
        )
    }
}

const StyledResultPane = withTheme(
    withStyles(styles)(ResultPane))

class TypeLocationsPaper extends Component {
    render() {
        const { classes, onRefresh, onEdit, ...others } = this.props;
        return (
            <Paper className={classes.paper}>
                <StyledActionDialogs {...others} />
                <Searcher
                    module="location"
                    title={`locations.searcher.title.${this.props.type}`}
                    refresh={onRefresh}
                    actions={[{
                        action: e => onEdit(null),
                        icon: <AddIcon />
                    }]}
                    resultsPane={<StyledResultPane onEdit={onEdit} {...others} />} />
            </Paper>
        )
    }
}

export default withTheme(
    withStyles(styles)(TypeLocationsPaper))