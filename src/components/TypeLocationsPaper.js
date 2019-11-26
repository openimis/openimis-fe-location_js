import React, { Component, Fragment } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Paper, List, ListItem, ListItemText } from "@material-ui/core";
import { Searcher, ProgressOrError } from "@openimis/fe-core";

const styles = theme => ({
    paper: theme.paper.body,
    paperHeader: theme.paper.header,
    paperHeaderTitle: theme.paper.title,
    paperHeaderMessage: theme.paper.message,
    paperHeaderAction: theme.paper.action,

})

class ResultPane extends Component {
    render() {
        const { classes, type, fetching, fetched, error, locations, location, onSelect } = this.props;
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
                            >
                                <ListItemText>{l.code} - {l.name}</ListItemText>
                            </ListItem>))}
                    </List>
                )
                }
            </Fragment>
        )
    }
}

const StyledResultPane = withTheme(
    withStyles(styles)(ResultPane))

class TypeLocationsPaper extends Component {
    render() {
        const { classes, type, fetching, fetched, error, locations, location, onSelect } = this.props;
        return (
            <Paper className={classes.paper}>
                <Searcher module="location"
                    title={`locations.searcher.title.${type}`}
                    resultsPane={<StyledResultPane
                        fetching={fetching}
                        fetched={fetched}
                        error={error}
                        locations={locations}
                        location={location}
                        onSelect={onSelect}
                    />} />
            </Paper>
        )
    }
}

export default withTheme(
    withStyles(styles)(TypeLocationsPaper))