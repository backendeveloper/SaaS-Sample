'use client'

import {Button, Typography} from "@mui/material";
import MasraffSvgIcon from "@masraff/core/MasraffSvgIcon";

const AnalyticsDashboardAppHeader = (props: any) => (
    <div className="flex w-full container">
        <div className="flex flex-col sm:flex-row flex-auto sm:items-center min-w-0 p-24 md:p-32 pb-0 md:pb-0">
            <div className="flex flex-col flex-auto">
                <Typography className="text-3xl font-semibold tracking-tight leading-8">
                    Analytics dashboard
                </Typography>
                <Typography className="font-medium tracking-tight" color="text.secondary">
                    Monitor metrics, check reports and review performance
                </Typography>
            </div>
            <div className="flex items-center mt-24 sm:mt-0 sm:mx-8 space-x-12">
                <Button
                    className="whitespace-nowrap"
                    startIcon={<MasraffSvgIcon size={20}>heroicons-solid:cog</MasraffSvgIcon>}
                >
                    Settings
                </Button>
                <Button
                    className="whitespace-nowrap"
                    variant="contained"
                    color="secondary"
                    startIcon={<MasraffSvgIcon size={20}>heroicons-solid:save</MasraffSvgIcon>}
                >
                    Export
                </Button>
            </div>
        </div>
    </div>
);

export default AnalyticsDashboardAppHeader;