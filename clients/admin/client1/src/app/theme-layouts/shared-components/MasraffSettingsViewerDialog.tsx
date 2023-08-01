'use client';

import {useSelector} from "react-redux";
import {useState} from "react";
import clsx from "clsx";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography} from "@mui/material";
import {selectMasraffCurrentSettings} from "app/store/masraff/settingsSlice";
import MasraffSvgIcon from "@masraff/core/MasraffSvgIcon";
import qs from "qs";

const MasraffSettingsViewerDialog = (props: any) => {
    const { className } = props;
    const [openDialog, setOpenDialog] = useState(false);
    const settings = useSelector(selectMasraffCurrentSettings);

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    return (
        <div className={clsx('', className)}>
            <Button
                variant="contained"
                color="secondary"
                className="w-full"
                onClick={handleOpenDialog}
                startIcon={<MasraffSvgIcon>heroicons-solid:code</MasraffSvgIcon>}
            >
                View settings as json/query params
            </Button>

            <Dialog open={openDialog} onClose={handleCloseDialog} aria-labelledby="form-dialog-title">
                <DialogTitle className="">Masraff Settings Viewer</DialogTitle>
                <DialogContent className="">
                    <Typography className="text-16 font-bold mt-24 mb-16">JSON</Typography>

                    {/*<MasraffHighlight component="pre" className="language-json">*/}
                    {/*    {JSON.stringify(settings, null, 2)}*/}
                    {/*</MasraffHighlight>*/}

                    <Typography className="text-16 font-bold mt-24 mb-16">Query Params</Typography>

                    {qs.stringify({
                        defaultSettings: JSON.stringify(settings, { strictNullHandling: true } as any),
                    })}
                </DialogContent>
                <DialogActions>
                    <Button color="secondary" variant="contained" onClick={handleCloseDialog}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default MasraffSettingsViewerDialog;