import React, { useEffect, useState, ReactElement } from "react";
import { useWidgetApi } from '@matrix-widget-toolkit/react';
import { Tabs, Tab, Box } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { map } from 'rxjs';
import NFTs from "../pages/NFTs";
import Offers from "../pages/Offers";

const MatrixClientProvider = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  // const widgetApi = useWidgetApi();
  // const [dices, setDices] = useState([]);

  // useEffect(() => {
  //   setDices([]);

  //   const subscription = widgetApi
  //     .observeRoomEvents('net.nordeck.throw_dice')
  //     .pipe(
  //       map((r) => r.content.pips),
  //     )
  //     .subscribe((d) => {
  //       setDices((l) => [...l, d]);
  //     });

  //   console.log("Dices: ", dices);

  //   return () => {
  //     subscription.unsubscribe();
  //   };
  // }, [widgetApi]);

  // useEffect(() => {
  //   console.log("Dice changed", dices);
  // }, [dices]);


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
