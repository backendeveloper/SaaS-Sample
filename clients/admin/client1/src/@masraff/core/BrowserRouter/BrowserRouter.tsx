// 'use client';
//
// import {useLayoutEffect, useState} from "react";
// // import {Router} from 'react-router-dom';
// import history from '@history';
// import Router from 'next/router';
//
// const BrowserRouter = ({basename, children, window}: any) => {
//     const [state, setState] = useState({
//         action: history.action,
//         location: history.location,
//     });
//
//     useLayoutEffect(() => history.listen(setState), [history]);
//
//     return (
//         <Router
//             basename={basename}
//             location={state.location}
//             navigationType={state.action}
//             navigator={history}
//         >
//             {children}
//         </Router>
//     );
// };
//
// export default BrowserRouter;