'use client';

import {darken, getContrastRatio, lighten, useTheme} from '@mui/material/styles';
import {useEffect, useState} from "react";
import {Controller, useForm} from 'react-hook-form';
import {
    AppBar,
    Button,
    ButtonGroup,
    Dialog,
    DialogActions,
    DialogContent,
    Icon,
    TextField,
    Toolbar,
    Typography
} from "@mui/material";
import {darkPaletteText, lightPaletteText} from "app/configs/themesConfig";
import PalettePreview from "@masraff/core/MasraffSettings/palette-generator/PalettePreview";
import _ from "lodash";
import SectionPreview from "@masraff/core/MasraffSettings/palette-generator/SectionPreview";

const isDark = (color: any) => getContrastRatio(color, '#ffffff') >= 3;

const defaultProps = {
    trigger: (
        <div className="flex flex-col items-center space-y-8 w-128 m-8">
            <SectionPreview section=""/>
            <Typography className="flex-1 text-16 font-bold mb-24">Edit Palette</Typography>
        </div>
    )
}

const PaletteSelector = (props: any) => {
    props = {...defaultProps, ...props};
    const {value} = props;
    const [openDialog, setOpenDialog] = useState(false);
    const theme = useTheme();

    const methods = useForm({
        defaultValues: {},
        mode: 'onChange',
    });

    const {reset, formState, trigger, handleSubmit, watch, control, setValue} = methods;

    const {isValid, dirtyFields, errors} = formState;

    useEffect(() => {
        reset(value);
    }, [value, reset]);

    const form = watch();
    const formType: any | any[] = watch('palette.mode' as any);

    useEffect(() => {
        // console.info(form);
    }, [form]);

    useEffect(() => {
        if (!formType || !openDialog) {
            return;
        }

        // @ts-ignore
        setTimeout(() => trigger(['palette.background.paper', 'palette.background.default']));
    }, [formType, openDialog, trigger]);

    const backgroundColorValidation = (v: any) => {
        if (formType === 'light' && isDark(v)) {
            return 'Must be a light color';
        }
        if (formType === 'dark' && !isDark(v)) {
            return 'Must be a dark color';
        }
        return true;
    };

    /**
     * Open Dialog
     */
    const handleOpenDialog = (ev: any) => {
        ev.preventDefault();
        ev.stopPropagation();
        setOpenDialog(true);
    };

    /**
     * Close Dialog
     */
    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const onSubmit = (formData: any) => {
        props.onChange(formData);
        handleCloseDialog();
    };

    return (
        <>
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/interactive-supports-focus */}
            <div onClick={handleOpenDialog} role="button">
                {props.trigger}
            </div>
            <Dialog
                container={document.body}
                open={openDialog}
                onClose={handleCloseDialog}
                aria-labelledby="form-dialog-title"
                classes={{
                    paper: 'rounded-5 w-full',
                }}
            >
                <AppBar elevation={0} position="static">
                    <Toolbar className="flex w-full">
                        <Icon className="mr-12">palette</Icon>
                        <Typography variant="subtitle1" color="inherit">
                            Edit palette
                        </Typography>
                    </Toolbar>
                </AppBar>

                <DialogContent>
                    <div className="flex w-full">
                        <div className="flex flex-col items-center justify-center p-24 flex-1">
                            <Controller
                                name="palette.mode"
                                control={control}
                                render={({field: {onChange: _onChange, value: _value}}) => (
                                    <ButtonGroup
                                        disableElevation
                                        variant="contained"
                                        color="secondary"
                                        className="mb-32"
                                    >
                                        <Button
                                            onClick={async () => {
                                                _onChange('light');
                                                setValue('palette.text', lightPaletteText, {shouldDirty: true});
                                            }}
                                            variant={_value === 'light' ? 'contained' : 'outlined'}
                                        >
                                            Light
                                        </Button>

                                        <Button
                                            onClick={async () => {
                                                _onChange('dark');
                                                setValue('palette.text', darkPaletteText, {shouldDirty: true});
                                            }}
                                            variant={_value === 'dark' ? 'contained' : 'outlined'}
                                        >
                                            Dark
                                        </Button>
                                    </ButtonGroup>
                                )}
                            />

                            <Controller
                                name="palette.primary.main"
                                control={control}
                                render={({field: {onChange: _onChange, value: _value}}) => (
                                    <TextField
                                        value={_value}
                                        onChange={(ev: any) => {
                                            _onChange(ev.target.value);
                                            setValue('palette.primary.light', lighten(ev.target.value, 0.8), {
                                                shouldDirty: true,
                                            });
                                            setValue('palette.primary.dark', darken(ev.target.value, 0.2), {
                                                shouldDirty: true,
                                            });
                                            setValue(
                                                'palette.primary.contrastText',
                                                theme.palette.getContrastText(ev.target.value),
                                                {shouldDirty: true}
                                            );
                                        }}
                                        type="color"
                                        variant="outlined"
                                        className="mb-32"
                                        label="Primary color"
                                        InputProps={{className: 'w-200  h-32'}}
                                    />
                                )}
                            />

                            <Controller
                                name="palette.secondary.main"
                                control={control}
                                render={({field: {onChange: _onChange, value: _value}}: any) => (
                                    <TextField
                                        value={_value}
                                        onChange={(ev) => {
                                            _onChange(ev.target.value);
                                            setValue('palette.secondary.light', lighten(ev.target.value, 0.8), {
                                                shouldDirty: true,
                                            });
                                            setValue('palette.secondary.dark', darken(ev.target.value, 0.2), {
                                                shouldDirty: true,
                                            });
                                            setValue(
                                                'palette.secondary.contrastText',
                                                theme.palette.getContrastText(ev.target.value),
                                                {shouldDirty: true}
                                            );
                                        }}
                                        type="color"
                                        variant="outlined"
                                        className="mb-32"
                                        label="Secondary color"
                                        InputProps={{className: 'w-200 h-32'}}
                                    />
                                )}
                            />

                            <Controller
                                name="palette.background.paper"
                                control={control}
                                rules={{
                                    validate: {
                                        backgroundColorValidation,
                                    },
                                }}
                                render={({field}: any) => (
                                    <TextField
                                        {...field}
                                        type="color"
                                        variant="outlined"
                                        className="mb-32"
                                        label="Background paper"
                                        InputProps={{className: 'w-200 h-32'}}
                                        error={!!errors?.palette?.background?.paper}
                                        helperText={errors?.palette?.background?.paper?.message}
                                    />
                                )}
                            />

                            <Controller
                                name="palette.background.default"
                                control={control}
                                rules={{
                                    validate: {
                                        backgroundColorValidation,
                                    },
                                }}
                                render={({field}: any) => (
                                    <TextField
                                        {...field}
                                        type="color"
                                        variant="outlined"
                                        className=""
                                        label="Background default"
                                        InputProps={{className: 'w-200 h-32'}}
                                        error={!!errors?.palette?.background?.default}
                                        helperText={errors?.palette?.background?.default?.message}
                                    />
                                )}
                            />
                        </div>

                        <div className="flex flex-col items-center justify-center p-48">
                            <Typography className="text-16 font-semibold mb-16 -mt-48" color="text.secondary">
                                Preview
                            </Typography>
                            <PalettePreview className="" palette={form.palette}/>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions className="flex justify-between p-16">
                    <Button onClick={handleCloseDialog} color="primary">
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        autoFocus
                        onClick={handleSubmit(onSubmit)}
                        disabled={_.isEmpty(dirtyFields) || !isValid}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default PaletteSelector;