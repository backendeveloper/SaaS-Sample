import settingsConfig from "app/configs/settingsConfig";
import MasraffUtils from '@masraff/utils';
import Link from 'next/link'
import { Navigate } from 'react-router-dom';
import dashboardsConfigs from '../main/dashboards/dashboardsConfigs';
import MasraffLoading from '@masraff/core/MasraffLoading';
import pagesConfigs from '../main/pages/pagesConfigs';
import { usePathname } from 'next/navigation'

const routeConfigs: any[] = [
    // ...appsConfigs,
    ...dashboardsConfigs,
    ...pagesConfigs,
    // ...authRoleExamplesConfigs,
    // ...userInterfaceConfigs,
    // DocumentationConfig,
    // SignOutConfig,
    // SignInConfig,
    // SignUpConfig,
];

// @ts-ignore
const routes = [
    ...MasraffUtils.generateRoutesFromConfigs(routeConfigs, settingsConfig.defaultAuth),
    {
        path: '/',
        element: <Navigate to="dashboards/analytics" />,
        // element: <Link href="dashboards/analytics"/>,
        auth: settingsConfig.defaultAuth,
    },
    {
        path: 'loading',
        element: <MasraffLoading />,
    },
    {
        path: '*',
        element: <Navigate to="pages/error/404" />,
    }
];

export default routes;