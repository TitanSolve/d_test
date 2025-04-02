import React, { useState } from "react";
import { Tab, TabGroup, TabList, TabPanels, TabPanel } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import './App.css';
import NFTs from './pages/NFTs';
import Offers from "./pages/Offers";
import MatrixClientProvider from './components/MatrixClientProvider';

function App() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const panelVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  return (
    <React.StrictMode>
      <MatrixClientProvider>
        <TabGroup selectedIndex={selectedIndex} onChange={setSelectedIndex}>
          <TabList className="flex space-x-1 bg-gray-200 p-1 rounded-xl">
            <Tab
              className={({ selected }) =>
                `w-full py-2 text-sm font-medium leading-5 rounded-lg focus:outline-none transition-all duration-300
              ${selected ? "bg-white shadow" : "text-gray-600"}`
              }
            >
              NFTs
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full py-2 text-sm font-medium leading-5 rounded-lg focus:outline-none transition-all duration-300
              ${selected ? "bg-white shadow" : "text-gray-600"}`
              }
            >
              Offers
            </Tab>
          </TabList>
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedIndex}
                variants={panelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="bg-white rounded-lg shadow"
              >
                {selectedIndex === 0 ? <NFTs /> : <Offers />}
              </motion.div>
            </AnimatePresence>
          </div>
        </TabGroup>
      </MatrixClientProvider>
    </React.StrictMode>
  );
}

export default App;
