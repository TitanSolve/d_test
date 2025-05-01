import React from "react";
import nft_pic from "../../assets/small-nft.png";
import { motion } from "framer-motion";
import { Button } from "antd";

const OutgoingOfferCard = () => {
  return (
    <div className="flex flex-col sm:flex-row items-center bg-white dark:bg-[#1a1d21] p-5 rounded-2xl shadow-xl w-full max-w-3xl border border-gray-200 dark:border-gray-700 gap-6 transition-all duration-300">
      <div className="w-full sm:w-auto flex justify-center">
        <img
          src={nft_pic}
          alt="NFT Preview"
          className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl object-cover shadow-md border border-gray-300 dark:border-gray-600"
        />
      </div>

      <div className="flex flex-col text-center sm:text-left gap-1 flex-grow">
        <span className="font-semibold text-gray-900 dark:text-white text-lg sm:text-xl truncate">
          TextRP
        </span>
        <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base truncate">
          Ultra Rare
        </span>
      </div>

      <div className="flex flex-col sm:items-end text-center sm:text-right w-full sm:w-auto gap-2">
        <div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            12.0 XRP
          </span>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Active Transfer Offer
          </p>
        </div>
        <Button
          type="primary"
          className="dark:bg-red-600 dark:hover:bg-red-500 text-white rounded-md font-semibold px-4 py-1"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default OutgoingOfferCard;
