'use client'

import withReducer from 'app/store/withReducer';
import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { getWidgets, selectWidgets } from './store/widgetsSlice';
import _ from 'lodash';
import MasraffPageSimple from "@masraff/core/MasraffPageSimple";
import AnalyticsDashboardAppHeader from './AnalyticsDashboardAppHeader';
import {Typography} from "@mui/material";
import reducer from './store';

const AnalyticsDashboardApp = () => {
    const dispatch = useDispatch();
    const widgets = useSelector(selectWidgets);

    useEffect(() => {
        // @ts-ignore
        dispatch(getWidgets());
    }, [dispatch]);

    return (
        <MasraffPageSimple
            header={<AnalyticsDashboardAppHeader />}
            content={
                <>
                    {useMemo(() => {
                        const container = {
                            show: {
                                transition: {
                                    staggerChildren: 0.06,
                                },
                            },
                        };

                        const item = {
                            hidden: { opacity: 0, y: 20 },
                            show: { opacity: 1, y: 0 },
                        };

                        return (
                            !_.isEmpty(widgets) && (
                                <motion.div
                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-32 w-full p-24 md:p-32"
                                    variants={container}
                                    initial="hidden"
                                    animate="show"
                                >
                                    {/*<motion.div variants={item} className="sm:col-span-2 lg:col-span-3">*/}
                                    {/*    <VisitorsOverviewWidget />*/}
                                    {/*</motion.div>*/}

                                    {/*<motion.div variants={item} className="sm:col-span-2 lg:col-span-1 ">*/}
                                    {/*    <ConversionsWidget />*/}
                                    {/*</motion.div>*/}

                                    {/*<motion.div variants={item} className="sm:col-span-2 lg:col-span-1 ">*/}
                                    {/*    <ImpressionsWidget />*/}
                                    {/*</motion.div>*/}

                                    {/*<motion.div variants={item} className="sm:col-span-2 lg:col-span-1 ">*/}
                                    {/*    <VisitsWidget />*/}
                                    {/*</motion.div>*/}

                                    {/*<motion.div variants={item} className="sm:col-span-2 lg:col-span-3">*/}
                                    {/*    <VisitorsVsPageViewsWidget />*/}
                                    {/*</motion.div>*/}

                                    <div className="w-full mt-16 sm:col-span-3">
                                        <Typography className="text-2xl font-semibold tracking-tight leading-6">
                                            Your Audience
                                        </Typography>
                                        <Typography className="font-medium tracking-tight" color="text.secondary">
                                            Demographic properties of your users
                                        </Typography>
                                    </div>

                                    <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-32 w-full">
                                        {/*<motion.div variants={item} className="">*/}
                                        {/*    <NewVsReturningWidget />*/}
                                        {/*</motion.div>*/}
                                        {/*<motion.div variants={item} className="">*/}
                                        {/*    <GenderWidget />*/}
                                        {/*</motion.div>*/}
                                        {/*<motion.div variants={item} className="">*/}
                                        {/*    <AgeWidget />*/}
                                        {/*</motion.div>*/}
                                        {/*<motion.div variants={item} className="">*/}
                                        {/*    <LanguageWidget />*/}
                                        {/*</motion.div>*/}
                                    </div>
                                </motion.div>
                            )
                        );
                    }, [widgets])}
                </>
            }
        />
    );
};

export default withReducer('analyticsDashboardApp', reducer)(AnalyticsDashboardApp);