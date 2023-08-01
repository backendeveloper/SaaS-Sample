// 'use client';
//
// import {Component, forwardRef} from "react";
// // import {withRouter} from "next/navigation";
// // import withRouter from 'react-router';
// // import { withRouter } from 'next/router'
// // import withRouter from "@masraff/core/withRouter";
//
// const withRouterAndRef = (WrappedComponent: any) => {
//     class InnerComponentWithRef extends Component {
//         render() {
//             const {forwardRef, ...rest}: any = this.props;
//             return <WrappedComponent {...rest} ref={forwardRef}/>;
//         }
//     }
//
//     // @ts-ignore
//     const ComponentWithRouter = (InnerComponentWithRef, {withRef: true});
//     return forwardRef((props, ref) => <ComponentWithRouter {...props} forwardRef={ref}/>);
// };
//
// export default withRouterAndRef;