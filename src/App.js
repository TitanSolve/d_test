import React from "react";
import { EventDirection, WidgetEventCapability} from "matrix-widget-api";
import MatrixClientProvider from './components/MatrixClientProvider';
import {MuiCapabilitiesGuard } from '@matrix-widget-toolkit/mui';

function App() {
  return (
    <React.StrictMode>
      <MuiCapabilitiesGuard
        capabilities={[
          WidgetEventCapability.forRoomEvent(
            EventDirection.Receive,
            'net.nordeck.throw_dice',
          ),
        ]}
      >
        <MatrixClientProvider/>
      </MuiCapabilitiesGuard>
    </React.StrictMode>
  );
}

export default App;
