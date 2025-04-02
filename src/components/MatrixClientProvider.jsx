import React, { useEffect, useState, Suspense, ReactElement } from "react";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { EventDirection, WidgetEventCapability } from "matrix-widget-api";
import { WidgetApiImpl, WidgetApi, WidgetParameter } from '@matrix-widget-toolkit/api';
import { MuiThemeProvider, MuiWidgetApiProvider } from '@matrix-widget-toolkit/mui';

// Initiate the widget API on startup. The Client will initiate
// the connection with `capabilities` and we need to make sure
// that the message doesn't get lost while we are initiating React.
const widgetApiPromise = WidgetApiImpl.create({
  // You can specify which capabilities should be requested at startup. One
  // can also request capabilities after the application started.
  capabilities: [
    WidgetEventCapability.forStateEvent(
      EventDirection.Receive,
      'm.room.name',
    ),
  ],
});




const MatrixClientProvider = ({children}) => {
  return (
    <BrowserRouter>
      <MuiThemeProvider>
        <Suspense fallback={<></>}>
          <MuiWidgetApiProvider
            widgetApiPromise={widgetApiPromise}
            widgetRegistration={{
              name: 'P2P-NFT-Widget',
              type: 'com.example.clock',
              data: { title: 'P2P-NFT-Widget' },
              // Device ID is required for the WelcomePage example
              requiredParameters: [WidgetParameter.DeviceId],
            }}
          >
            {children}
          </MuiWidgetApiProvider>
        </Suspense>
      </MuiThemeProvider>
    </BrowserRouter>
  );
};

export default MatrixClientProvider;
