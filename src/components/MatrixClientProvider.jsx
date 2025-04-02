import React, { useEffect, useState, Suspense, ReactElement } from "react";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { EventDirection, WidgetEventCapability, WidgetApi } from "matrix-widget-api";
import { WidgetApiImpl, WidgetParameter } from '@matrix-widget-toolkit/api';
import { useWidgetApi } from '@matrix-widget-toolkit/react';
import { MuiThemeProvider, MuiWidgetApiProvider } from '@matrix-widget-toolkit/mui';
import { Tabs, Tab, Box } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import NFTs from "../pages/NFTs";
import Offers from "../pages/Offers";


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




const MatrixClientProvider = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const panelVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };
  
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


            <Box sx={{ width: "100%", bgcolor: "background.paper", borderRadius: 2, boxShadow: 1 }}>
              <Tabs
                value={selectedIndex}
                onChange={(event, newIndex) => setSelectedIndex(newIndex)}
                variant="fullWidth"
                textColor="primary"
                indicatorColor="primary"
              >
                <Tab label="NFTs" />
                <Tab label="Offers" />
              </Tabs>
              <Box sx={{ p: 2, position: "relative", overflow: "hidden" }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedIndex}
                    variants={panelVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    {selectedIndex === 0 ? <NFTs /> : <Offers />}
                  </motion.div>
                </AnimatePresence>
              </Box>
            </Box>



          </MuiWidgetApiProvider>
        </Suspense>
      </MuiThemeProvider>
    </BrowserRouter>
  );
};

export default MatrixClientProvider;
