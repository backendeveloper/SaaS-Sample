'use client';

import GlobalStyles from '@mui/material/GlobalStyles';
import _ from "lodash";
import {memo} from "react";
import {registerComponent} from './MasraffNavItem';
import {Divider} from "@mui/material";
import MasraffNavHorizontalCollapse
    from "@masraff/core/MasraffNavigation/horizontal/types/MasraffNavHorizontalCollapse";
import MasraffNavHorizontalLayout1 from "@masraff/core/MasraffNavigation/horizontal/MasraffNavHorizontalLayout1";
import MasraffNavHorizontalGroup from "@masraff/core/MasraffNavigation/horizontal/types/MasraffNavHorizontalGroup";
import MasraffNavHorizontalItem from "@masraff/core/MasraffNavigation/horizontal/types/MasraffNavHorizontalItem";
import MasraffNavHorizontalLink from "@masraff/core/MasraffNavigation/horizontal/types/MasraffNavHorizontalLink";
import MasraffNavVerticalCollapse from "@masraff/core/MasraffNavigation/vertical/types/MasraffNavVerticalCollapse";
import MasraffNavVerticalGroup from "@masraff/core/MasraffNavigation/vertical/types/MasraffNavVerticalGroup";
import MasraffNavVerticalLayout1 from "@masraff/core/MasraffNavigation/vertical/MasraffNavVerticalLayout1";
import MasraffNavVerticalLayout2 from "@masraff/core/MasraffNavigation/vertical/MasraffNavVerticalLayout2";
import MasraffNavVerticalItem from "@masraff/core/MasraffNavigation/vertical/types/MasraffNavVerticalItem";
import MasraffNavVerticalLink from "@masraff/core/MasraffNavigation/vertical/types/MasraffNavVerticalLink";

const inputGlobalStyles = (
    <GlobalStyles
        styles={(theme) => ({
            '.popper-navigation-list': {
                '& .masraff-list-item': {
                    padding: '8px 12px 8px 12px',
                    height: 40,
                    minHeight: 40,
                    '& .masraff-list-item-text': {
                        padding: '0 0 0 8px',
                    },
                },
                '&.dense': {
                    '& .masraff-list-item': {
                        minHeight: 32,
                        height: 32,
                        '& .masraff-list-item-text': {
                            padding: '0 0 0 8px',
                        },
                    },
                },
            },
        })}
    />
);

registerComponent('vertical-group', MasraffNavVerticalGroup);
registerComponent('vertical-collapse', MasraffNavVerticalCollapse);
registerComponent('vertical-item', MasraffNavVerticalItem);
registerComponent('vertical-link', MasraffNavVerticalLink);
registerComponent('horizontal-group', MasraffNavHorizontalGroup);
registerComponent('horizontal-collapse', MasraffNavHorizontalCollapse);
registerComponent('horizontal-item', MasraffNavHorizontalItem);
registerComponent('horizontal-link', MasraffNavHorizontalLink);
registerComponent('vertical-divider', () => <Divider className="my-16"/>);
registerComponent('horizontal-divider', () => <Divider className="my-16"/>);

const defaultProps = {
    layout: 'vertical'
}

const MasraffNavigation = (props: any) => {
    props = {...defaultProps, ...props};
    const options = _.pick(props, [
        'navigation',
        'layout',
        'active',
        'dense',
        'className',
        'onItemClick',
        'firstLevel',
        'selectedId',
    ]);
    console.log('options: ', {...options});

    if (props.navigation.length > 0) {
        return (
            <>
                {inputGlobalStyles}
                {props.layout === 'horizontal' && <MasraffNavHorizontalLayout1 {...options} />}
                {props.layout === 'vertical' && <MasraffNavVerticalLayout1 {...options} />}
                {props.layout === 'vertical-2' && <MasraffNavVerticalLayout2 {...options} />}
            </>
        );
    }

    return null;
};

export default memo(MasraffNavigation);