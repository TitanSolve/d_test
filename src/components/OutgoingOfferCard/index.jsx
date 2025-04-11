import React from "react";
import nft_pic from "../../assets/small-nft.png";
import { motion } from "framer-motion";
import { Button } from "antd";

const OutgoingOfferCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row items-center sm:justify-between bg-white dark:bg-gray-900 p-4 rounded-xl shadow-md w-full max-w-2xl border border-gray-200 dark:border-gray-700 space-y-4 sm:space-y-0 sm:space-x-4 transition-colors"
    >
      <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
        <img
          src={nft_pic}
          alt="TextRP Feature Pack"
          className="w-16 h-16 rounded-lg object-cover shadow-sm"
        />
        <div className="flex flex-col text-center sm:text-left overflow-hidden">
          <span className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg truncate w-full">TextRP Feature Pack TextRP Feature Pack TextRP Feature Pack TextRP Feature Pack</span>
          <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base truncate w-full">Exclusive NFT Collection TextRP Feature Pack TextRP Feature Pack TextRP Feature Pack</span>
        </div>
      </div>
      <div className="flex flex-col items-center sm:items-end text-center sm:text-right w-full sm:w-auto">
        <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white sm:whitespace-nowrap">12.0 XRP</span>
        <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base sm:whitespace-nowrap">Sell Offer</span>
      </div>
      <Button
        type="primary"
        block
        style={{ borderRadius: "6px", width: "30%", alignItems: "center" }}
        className="dark:bg-red-600 dark:hover:bg-red-500 text-white"
      >
        Cancel
      </Button>
    </motion.div>
  );
};

export default OutgoingOfferCard;
