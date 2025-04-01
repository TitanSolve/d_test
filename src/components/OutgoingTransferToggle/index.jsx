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
          className="w-full flex items-center justify-between bg-gray-50 text-black px-5 py-3 rounded-xl hover:hover:bg-gray-200 transition shadow-md"
        >
          <span className="text-lg font-semibold">{title}</span>
          <ChevronDownIcon
            className={`w-6 h-6 transition-transform ${isVisible ? "rotate-180" : "rotate-0"}`}
          />
        </button>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 bg-white p-5 rounded-xl shadow-lg border border-gray-200"
          >
            <div className="flex justify-end sm:justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-900  hidden sm:block">Listed Items</span>
              {count > 0 ? (
                <Button 
                    type="primary"
                    // className="flex items-center gap-2 bg-red-500 text-white hover:bg-red-400 px-4 py-2 rounded-lg  transition"
                    style={{ borderRadius: "6px", width: "30%", alignItems: "center" }}
                >
                  <XIcon className="w-5 h-5" /> Cancel All
                </Button>
              ) : (
                <span className="text-gray-500">No listed items available.</span>
              )}
            </div>
            {count > 0 && (
              <div className="space-y-4">
                {[...Array(count)].map((_, index) => (
                  <OutgoingOfferCard key={index} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    );
  };
  

export default OutgoingTransferToggle;