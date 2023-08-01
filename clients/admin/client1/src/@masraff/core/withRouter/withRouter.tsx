// 'use client';
//
// // import { useLocation, useNavigate } from 'react-router-dom';
// import {usePathname} from "next/navigation";
// // import {useNavigate} from "react-router";
//
// function withRouter(Child: any) {
//     return (props: any) => {
//         const pathname = usePathname();
//         // const location = useLocation();
//         const navigate = useNavigate();
//         return <Child {...props} navigate={navigate} location={pathname}/>;
//     };
// }
//
// export default withRouter;