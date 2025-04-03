import React, { Suspense } from "react";
import { EventDirection, WidgetEventCapability } from "matrix-widget-api";
import { MuiCapabilitiesGuard, MuiThemeProvider, MuiWidgetApiProvider } from '@matrix-widget-toolkit/mui';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { WidgetApiImpl, WidgetParameter } from '@matrix-widget-toolkit/api';
import MatrixClientProvider from './components/MatrixClientProvider';

function App({ widgetApiPromise }) {
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
                    {/* <MuiCapabilitiesGuard
                      capabilities={[
                        WidgetEventCapability.forRoomEvent(
                          EventDirection.Receive,
                          'net.nordeck.throw_dice',
                        ),
                      ]}
                    > */}
                  
              <MatrixClientProvider />

                    {/* </MuiCapabilitiesGuard> */}
          </MuiWidgetApiProvider>
        </Suspense>
      </MuiThemeProvider>
    </BrowserRouter> 
  );
}

export default App;
