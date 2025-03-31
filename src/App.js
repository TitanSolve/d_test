import { useState } from "react";
import { Tab, TabGroup, TabList, TabPanels, TabPanel } from "@headlessui/react";
import './App.css';
import NFTs from './pages/NFTs';
import Offers from "./pages/Offers";
import MatrixClientProvider from './components/MatrixClientProvider'; // Import the MatrixClientProvider


function App() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  return (
    <MatrixClientProvider> {/* Wrap Home with MatrixClientProvider */}
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
        <TabPanels className="mt-4">
          <TabPanel className="p-4 bg-white rounded-lg shadow">
            <NFTs />
          </TabPanel>
          <TabPanel className="p-4 bg-white rounded-lg shadow">
            <Offers />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </MatrixClientProvider>
  );
}

export default App;