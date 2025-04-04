import React, { useEffect, useState, ReactElement } from "react";
import { useWidgetApi } from '@matrix-widget-toolkit/react';
import { Tabs, Tab, Box } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { map } from 'rxjs';
import NFTs from "../pages/NFTs";
import Offers from "../pages/Offers";

const MatrixClientProvider = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const widgetApi = useWidgetApi();

  useEffect(() => {
    const logThemeInfo = () => {
      console.log("widgetApi.widgetParameters : ", widgetApi.widgetParameters);
    };

    const intervalId = setInterval(logThemeInfo, 3000);
    return () => clearInterval(intervalId);
  }, [widgetApi]);

  // useEffect(() => {
  //   console.log("------------------------------------")
  //   console.log("Widget Theme changed", widgetApi.widgetParameters.theme);
  //   console.log("------------------------------------")
  // }, [widgetApi.widgetParameters.theme]);

  const panelVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  return (
    <Box sx={{ width: "100%", borderRadius: 2, boxShadow: 1 }}>
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

  );
};

export default MatrixClientProvider;
