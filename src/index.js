import React from 'react';
import { createRoot } from 'react-dom/client';
import { WidgetApiImpl } from '@matrix-widget-toolkit/api';
import { EventDirection, WidgetEventCapability } from 'matrix-widget-api';
import './index.css';
import App from './App';

const widgetApiPromise = WidgetApiImpl.create({
  // You can specify which capabilities should be requested at startup. One
  // can also request capabilities after the application started.
  capabilities: [
    WidgetEventCapability.forStateEvent(
      EventDirection.Receive,
      'm.room.name',
    ),
    WidgetEventCapability.forStateEvent(
      EventDirection.Receive,
      'm.room.power_levels',
    ),
    WidgetEventCapability.forStateEvent(
      EventDirection.Receive,
      'm.room.member',
    ),
  ],
});


const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App widgetApiPromise={widgetApiPromise} />
  </React.StrictMode>,
);