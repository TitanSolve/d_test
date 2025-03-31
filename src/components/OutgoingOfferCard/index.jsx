import React from "react";
import nft_pic from "../../assets/small-nft.png";
import { motion } from "framer-motion";
import { Button } from "antd";

const OutgoingOfferCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row items-center sm:justify-between bg-white p-4 rounded-xl shadow-md w-full max-w-2xl border border-gray-200 space-y-4 sm:space-y-0 sm:space-x-4"
    >
      <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
        <img
          src={nft_pic}
          alt="TextRP Feature Pack"
          className="w-16 h-16 rounded-lg object-cover shadow-sm"
        />
        <div className="flex flex-col text-center sm:text-left overflow-hidden">
          <span className="font-semibold text-gray-900 text-base sm:text-lg truncate w-full">TextRP Feature Pack TextRP Feature Pack TextRP Feature Pack TextRP Feature Pack</span>
          <span className="text-gray-500 text-sm sm:text-base truncate w-full">Exclusive NFT Collection TextRP Feature Pack TextRP Feature Pack TextRP Feature Pack</span>
        </div>
      </div>
      <div className="flex flex-col items-center sm:items-end text-center sm:text-right w-full sm:w-auto">
        <span className="text-lg sm:text-xl font-bold text-gray-900 sm:whitespace-nowrap">12.0 XRP</span>
        <span className="text-gray-500 text-sm sm:text-base sm:whitespace-nowrap">Sell Offer</span>
      </div>
      <Button
        type="primary"
        block
        style={{ borderRadius: "6px", width: "30%", alignItems: "center" }}
      // className="w-full sm:w-auto bg-red-500 text-white px-4 sm:px-5 py-2 rounded-lg hover:bg-red-600 transition shadow-md text-center">
      >
        Cancel
      </Button>
    </motion.div>
  );
};

export default OutgoingOfferCard;
