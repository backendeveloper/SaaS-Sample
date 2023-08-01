'use client';

import {
    ClickAwayListener, IconButton,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Paper,
    Popper,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import MasraffSvgIcon from "@masraff/core/MasraffSvgIcon";
import _ from "lodash";
import {styled} from "@mui/material/styles";
import {memo, useEffect, useReducer, useRef} from "react";
import clsx from "clsx";
import withRouter from "@masraff/core/withRouter";
import Autosuggest from "react-autosuggest";
import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";

const Root = styled('div')(({theme}: any) => ({
    '& .MasraffSearch-container': {
        position: 'relative',
    },

    '& .MasraffSearch-suggestionsContainerOpen': {
        position: 'absolute',
        zIndex: 1,
        marginTop: theme.spacing(),
        left: 0,
        right: 0,
    },

    '& .MasraffSearch-suggestion': {
        display: 'block',
    },

    '& .MasraffSearch-suggestionsList': {
        margin: 0,
        padding: 0,
        listStyleType: 'none',
    },

    '& .MasraffSearch-input': {
        transition: theme.transitions.create(['background-color'], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.short,
        }),
        '&:focus': {
            backgroundColor: theme.palette.background.paper,
        },
    },
}));

const renderInputComponent = (inputProps: any) => {
    const {
        variant, inputRef = () => {
        }, ref, ...other
    } = inputProps;
    return (
        <div className="w-full relative">
            {variant === 'basic' ? (
                // Outlined
                <>
                    <TextField
                        fullWidth
                        InputProps={{
                            inputRef: (node: any) => {
                                ref(node);
                                inputRef(node);
                            },
                            classes: {
                                input: 'MasraffSearch-input py-0 px-16 h-40 md:h-48 ltr:pr-48 rtl:pl-48',
                                notchedOutline: 'rounded-8',
                            },
                        }}
                        variant="outlined"
                        {...other}
                    />
                    <MasraffSvgIcon
                        className="absolute top-0 ltr:right-0 rtl:left-0 h-40 md:h-48 w-48 p-12 pointer-events-none"
                        color="action"
                    >
                        heroicons-outline:search
                    </MasraffSvgIcon>
                </>
            ) : (
                // Standard
                <TextField
                    fullWidth
                    InputProps={{
                        disableUnderline: true,
                        inputRef: (node: any) => {
                            ref(node);
                            inputRef(node);
                        },
                        classes: {
                            input: 'MasraffSearch-input py-0 px-16 h-48 md:h-64',
                        },
                    }}
                    variant="standard"
                    {...other}
                />
            )}
        </div>
    );
};

const renderSuggestion = (suggestion: any, {query, isHighlighted}: any): any => {
    const matches = match(suggestion.title, query);
    const parts = parse(suggestion.title, matches);

    return (
        <MenuItem selected={isHighlighted} component="div">
            <ListItemIcon className="min-w-40">
                {suggestion.icon ? (
                    <MasraffSvgIcon>{suggestion.icon}</MasraffSvgIcon>
                ) : (
                    <span className="text-20 w-24 font-semibold uppercase text-center">
            {suggestion.title[0]}
          </span>
                )}
            </ListItemIcon>
            <ListItemText
                primary={parts.map((part: any, index: any) =>
                        part.highlight ? (
                            <span key={String(index)} style={{fontWeight: 600}}>
              {part.text}
            </span>
                        ) : (
                            <strong key={String(index)} style={{fontWeight: 300}}>
                                {part.text}
                            </strong>
                        )
                )}
            />
        </MenuItem>
    );
};

const getSuggestions = (value: any, data: any) => {
    const inputValue = _.deburr(value.trim()).toLowerCase();
    const inputLength = inputValue.length;
    let count = 0;

    return inputLength === 0
        ? []
        : data.filter((suggestion: any) => {
            // @ts-ignore
            const keep = count < 10 && match(suggestion.title, inputValue).length > 0;

            if (keep) {
                count += 1;
            }

            return keep;
        });
};

const getSuggestionValue = (suggestion: any) => suggestion.title;

const initialState = {
    searchText: '',
    search: false,
    navigation: null,
    suggestions: [],
    noSuggestions: false,
};

const reducer = (state: any, action: any) => {
    switch (action.type) {
        case 'open': {
            return {
                ...state,
                opened: true,
            };
        }
        case 'close': {
            return {
                ...state,
                opened: false,
                searchText: '',
            };
        }
        case 'setSearchText': {
            return {
                ...state,
                searchText: action.value,
            };
        }
        case 'setNavigation': {
            return {
                ...state,
                navigation: action.value,
            };
        }
        case 'updateSuggestions': {
            const suggestions = getSuggestions(action.value, state.navigation);
            const isInputBlank = action.value.trim() === '';
            const noSuggestions = !isInputBlank && suggestions.length === 0;

            return {
                ...state,
                suggestions,
                noSuggestions,
            };
        }
        case 'clearSuggestions': {
            return {
                ...state,
                suggestions: [],
                noSuggestions: false,
            };
        }
        case 'decrement': {
            return {count: state.count - 1};
        }
        default: {
            throw new Error();
        }
    }
};

const defaultProps = {
    navigation: [],
    variant: 'full',
    placeholder: 'Search',
    noResults: 'No results..',
    trigger: (
        <IconButton className="w-40 h-40" size="large">
            <MasraffSvgIcon>heroicons-outline:search</MasraffSvgIcon>
        </IconButton>
    )
}

const MasraffSearch = (props: any) => {
    props = { ...defaultProps, ...props };
    const {navigation} = props;

    const [state, dispatch] = useReducer(reducer, initialState);
    const suggestionsNode = useRef(null);
    const popperNode = useRef(null);
    const buttonNode = useRef(null);

    useEffect(() => {
        dispatch({
            type: 'setNavigation',
            value: navigation,
        });
    }, [navigation]);

    const showSearch = (ev: any) => {
        ev.stopPropagation();
        dispatch({type: 'open'});
        document.addEventListener('keydown', escFunction, false);
    };

    const hideSearch = () => {
        dispatch({type: 'close'});
        document.removeEventListener('keydown', escFunction, false);
    };

    const escFunction = (event: any) => {
        if (event.keyCode === 27) {
            hideSearch();
        }
    };

    const handleSuggestionsFetchRequested = ({value}: any) => {
        dispatch({
            type: 'updateSuggestions',
            value,
        });
    };

    const handleSuggestionSelected = (event: any, {suggestion}: any) => {
        event.preventDefault();
        event.stopPropagation();
        if (!suggestion.url) {
            return;
        }
        props.navigate(suggestion.url);
        hideSearch();
    };

    const handleSuggestionsClearRequested = () => {
        dispatch({
            type: 'clearSuggestions',
        });
    };

    const handleChange = (event: any) => {
        dispatch({
            type: 'setSearchText',
            value: event.target.value,
        });
    };

    const handleClickAway = (event: any) => {
        // @ts-ignore
        return (state.opened && (!suggestionsNode.current || !suggestionsNode.current.contains(event.target)) && hideSearch());
    };

    const autosuggestProps = {
        renderInputComponent,
        highlightFirstSuggestion: true,
        suggestions: state.suggestions,
        onSuggestionsFetchRequested: handleSuggestionsFetchRequested,
        onSuggestionsClearRequested: handleSuggestionsClearRequested,
        onSuggestionSelected: handleSuggestionSelected,
        getSuggestionValue,
        renderSuggestion,
    };

    switch (props.variant) {
        case 'basic': {
            return (
                <div className={clsx('flex items-center w-full', props.className)} ref={popperNode}>
                    <Autosuggest
                        {...autosuggestProps}
                        inputProps={{
                            variant: props.variant,
                            placeholder: props.placeholder,
                            value: state.searchText,
                            onChange: handleChange,
                            onFocus: showSearch,
                            InputLabelProps: {
                                shrink: true,
                            },
                            autoFocus: false,
                        }}
                        theme={{
                            container: 'flex flex-1 w-full',
                            suggestionsList: 'MasraffSearch-suggestionsList',
                            suggestion: 'MasraffSearch-suggestion',
                        }}
                        renderSuggestionsContainer={(options: any) => (
                            <Popper
                                anchorEl={popperNode.current}
                                open={Boolean(options.children) || state.noSuggestions}
                                popperOptions={{positionFixed: true} as any}
                                className="z-9999"
                            >
                                <div ref={suggestionsNode}>
                                    <Paper
                                        className="shadow-lg rounded-8 overflow-hidden"
                                        {...options.containerProps}
                                        style={{width: popperNode.current ? popperNode.current.clientWidth : null}}
                                    >
                                        {options.children}
                                        {state.noSuggestions && (
                                            <Typography className="px-16 py-12">{props.noResults}</Typography>
                                        )}
                                    </Paper>
                                </div>
                            </Popper>
                        )}
                    />
                </div>
            );
        }
        case 'full': {
            return (
                <Root className={clsx('flex', props.className)}>
                    <Tooltip title="Click to search" placement="bottom">
                        <div
                            onClick={showSearch}
                            onKeyDown={showSearch}
                            role="button"
                            tabIndex={0}
                            ref={buttonNode}
                        >
                            {props.trigger}
                        </div>
                    </Tooltip>

                    {state.opened && (
                        <ClickAwayListener onClickAway={handleClickAway}>
                            <Paper className="absolute left-0 right-0 top-0 h-full z-9999 shadow-0" square>
                                <div className="flex items-center w-full h-full" ref={popperNode}>
                                    <Autosuggest
                                        {...autosuggestProps}
                                        inputProps={{
                                            placeholder: props.placeholder,
                                            value: state.searchText,
                                            onChange: handleChange,
                                            InputLabelProps: {
                                                shrink: true,
                                            },
                                            autoFocus: true,
                                        }}
                                        theme={{
                                            container: 'flex flex-1 w-full',
                                            suggestionsList: 'MasraffSearch-suggestionsList',
                                            suggestion: 'MasraffSearch-suggestion',
                                        }}
                                        renderSuggestionsContainer={(options: any) => (
                                            <Popper
                                                anchorEl={popperNode.current}
                                                open={Boolean(options.children) || state.noSuggestions}
                                                popperOptions={{positionFixed: true} as any}
                                                className="z-9999"
                                            >
                                                <div ref={suggestionsNode}>
                                                    <Paper
                                                        className="shadow-lg"
                                                        square
                                                        {...options.containerProps}
                                                        style={{
                                                            width: popperNode.current ? popperNode.current.clientWidth : null,
                                                        }}
                                                    >
                                                        {options.children}
                                                        {state.noSuggestions && (
                                                            <Typography
                                                                className="px-16 py-12">{props.noResults}</Typography>
                                                        )}
                                                    </Paper>
                                                </div>
                                            </Popper>
                                        )}
                                    />
                                    <IconButton onClick={hideSearch} className="mx-8" size="large">
                                        <MasraffSvgIcon>heroicons-outline:x</MasraffSvgIcon>
                                    </IconButton>
                                </div>
                            </Paper>
                        </ClickAwayListener>
                    )}
                </Root>
            );
        }
        default: {
            return null;
        }
    }
};

// export default withRouter(memo(MasraffSearch));
export default memo(MasraffSearch);