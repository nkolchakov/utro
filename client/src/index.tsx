import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import 'antd/dist/antd.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Config, DAppProvider, Mainnet } from '@usedapp/core';
import env from "react-dotenv";
import NoMatch from './components/NoMatch';
import ScheduleQuiz from './components/ScheduleQuiz';
import ListSchedules from './components/ListSchedules';
import CreateSchedule from './components/create-schedule/CreateSchedule';

if (!env.INFURA_MAINNET_URL) {
  throw new Error('undefined INFURA_MAINNET_URL')
}

const config: Config = {
  readOnlyChainId: Mainnet.chainId,
  readOnlyUrls: {
    [Mainnet.chainId]: env.INFURA_MAINNET_URL
  },
}

ReactDOM.render(
  <React.StrictMode>
    <DAppProvider config={config}>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<App />} >
            <Route path='/create' element={<CreateSchedule />} />
            <Route path='/list' element={<ListSchedules />} />
            <Route path='/morning' element={<ScheduleQuiz />} />
            <Route path="*" element={<NoMatch />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
