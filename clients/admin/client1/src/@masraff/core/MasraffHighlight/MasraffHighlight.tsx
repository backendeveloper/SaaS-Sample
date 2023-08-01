'use client';

import {styled} from "@mui/material/styles";
import {useEffect, useMemo, useRef} from "react";
import clsx from "clsx";
import * as Prism from 'prismjs';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-diff';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-perl';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-sass';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-typescript';
import 'prismjs/prism';

const defaultProps = {
    component: 'code'
}

const MasraffHighlight = (props: any) => {
    props = { ...defaultProps, ...props };
    const { async, children, className, component: Wrapper } = props;

    const domNode = useRef(null);

    useEffect(() => {
        if (domNode.current) {
            Prism.highlightElement(domNode.current, async);
        }
    }, [children, async]);

    return useMemo(() => {
        const trimCode = () => {
            let sourceString = children;

            if (typeof sourceString === 'object' && sourceString.default) {
                sourceString = sourceString.default;
            }

            // Split the source into lines
            const sourceLines = sourceString.split('\n');

            // Remove the first and the last line of the source
            // code if they are blank lines. This way, the html
            // can be formatted properly while using masraff-highlight
            // component
            if (!sourceLines[0].trim()) {
                sourceLines.shift();
            }

            if (!sourceLines[sourceLines.length - 1].trim()) {
                sourceLines.pop();
            }

            // Find the first non-whitespace char index in
            // the first line of the source code
            const indexOfFirstChar = sourceLines[0].search(/\S|$/);

            // Generate the trimmed source
            let sourceRaw = '';

            // Iterate through all the lines
            sourceLines.forEach((line: any, index: any) => {
                // Trim the beginning white space depending on the index
                // and concat the source code
                sourceRaw += line.substr(indexOfFirstChar, line.length);

                // If it's not the last line...
                if (index !== sourceLines.length - 1) {
                    // Add a line break at the end
                    sourceRaw = `${sourceRaw}\n`;
                }
            });
            return sourceRaw || '';
        };

        return (
            <>
                <Wrapper ref={domNode} className={clsx('border', className)}>
                    {/* {trimCode()} */}
                    {trimCode()}
                </Wrapper>
            </>
        );
    }, [children, className]);
};

export default styled(MasraffHighlight)``;