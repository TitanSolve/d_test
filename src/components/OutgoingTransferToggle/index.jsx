import { useState } from "react";
import { motion } from "framer-motion";
import OutgoingOfferCard from "../OutgoingOfferCard";
import { ChevronDownIcon, XIcon } from "@heroicons/react/solid";
import { Button } from "antd";

const OutgoingTransferToggle = ({ title, count }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="w-full flex items-center justify-between bg-gray-50 dark:bg-gray-800 text-black dark:text-white px-5 py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition shadow-md"
      >
        <span className="text-lg font-semibold">{title}</span>
        <ChevronDownIcon
          className={`w-6 h-6 transform transition-transform duration-300 ${isVisible ? "rotate-180" : "rotate-0"}`}
        />
      </button>

      {isVisible && (
        <div className="mt-4 bg-white dark:bg-[#15191E] p-5 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold text-gray-900 dark:text-white hidden sm:block">
              Listed Items
            </span>
            {count > 0 ? (
              <Button
                type="primary"
                className="dark:bg-red-600 dark:hover:bg-red-500 text-white rounded-md font-semibold px-4 py-1"
              >
                <XIcon className="w-5 h-5 mr-1 inline" /> Cancel All
              </Button>
            ) : (
              <span className="text-gray-500 dark:text-gray-400">No listed items available.</span>
            )}
          </div>

          {count > 0 && (
            <div className="space-y-4">
              {[...Array(count)].map((_, index) => (
                <OutgoingOfferCard key={index} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};


export default OutgoingTransferToggle;