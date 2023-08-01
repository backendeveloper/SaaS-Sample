import React from 'react';
import ReactDOM from 'react-dom/client';
import {Amplify} from "aws-amplify";
import App from './app/App';
import './i18n';
import reportWebVitals from './reportWebVitals';
import * as serviceWorker from './serviceWorker';
import awsExports from './aws-exports';
import './styles/app-base.css';
import './styles/app-components.css';
import './styles/app-utilities.css';

Amplify.configure({Auth: awsExports});

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>
);

reportWebVitals();
serviceWorker.unregister();
