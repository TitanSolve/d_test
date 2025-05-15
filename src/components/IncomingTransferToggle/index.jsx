import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import IncomingOfferCard from "../IncomingOfferCard";
import { ChevronDownIcon } from "@heroicons/react/solid";
import { Button } from "antd";

const IncomingListToggle = ({
  title,
  incomingTransfers,
  onAction,
  myOwnWalletAddress,
  updateUsersNFTs,
  widgetApi,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [incomingTransferOffers, setIncomingTransferOffers] = useState([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (incomingTransfers.length > 0) {
      const filteredTransfers = incomingTransfers.filter(
        (transfer) => transfer.offer.amount === "0"
      );
      setIncomingTransferOffers(filteredTransfers);
      setCount(filteredTransfers.length);
    } else {
      setIncomingTransferOffers([]);
      setCount(0);
    }
  }, [incomingTransfers]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-3xl font-extrabold text-center mb-6 dark:text-white text-black">
        {title}
      </h2>

      {count === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400">
          You have no made offers.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            {incomingTransferOffers.map((incomingTransfer, index) => (
              <IncomingOfferCard
                transfer={incomingTransfer}
                key={index}
                onAction={onAction}
                myWalletAddress={myOwnWalletAddress}
                updateUsersNFTs={updateUsersNFTs}
                widgetApi={widgetApi}
              />
            ))}
          </div>
        </div>
      )}
    </div>
    // <div className="w-full max-w-2xl mx-auto p-4">
    //   <button
    //     onClick={() => setIsVisible(!isVisible)}
    //     className="w-full flex items-center justify-between bg-gray-50 dark:bg-gray-800 text-black dark:text-white px-5 py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition shadow-md"
    //   >
    //     <span className="text-lg font-semibold">{title}</span>
    //     <ChevronDownIcon
    //       className={`w-6 h-6 transition-transform ${
    //         isVisible ? "rotate-180" : "rotate-0"
    //       }`}
    //     />
    //   </button>
    //   {isVisible && (
    //     <motion.div
    //       initial={{ opacity: 0, height: 0 }}
    //       animate={{ opacity: 1, height: "auto" }}
    //       exit={{ opacity: 0, height: 0 }}
    //       className="mt-4 bg-white dark:bg-[#15191E] text-black dark:text-white p-5 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors"
    //     >
    //       <div className="flex justify-end sm:justify-between items-center mb-4">
    //         <span className="text-lg font-semibold text-gray-900 dark:text-white hidden sm:block">
    //           Listed Items
    //         </span>
    //         {count > 0 ? (
    //           <div className="flex justify-between items-center gap-2">
    //             <Button
    //               type="primary"
    //               block
    //               // className="flex items-center gap-2 bg-red-500 text-white hover:bg-red-400 px-4 py-2 rounded-lg  transition"
    //               style={{ borderRadius: "6px", alignItems: "center" }}
    //               className="dark:bg-green-600 dark:hover:bg-green-500"
    //             >
    //               Accept All
    //             </Button>
    //             <Button
    //               type="primary"
    //               block
    //               // className="flex items-center gap-2 bg-red-500 text-white hover:bg-red-400 px-4 py-2 rounded-lg  transition"
    //               style={{ borderRadius: "6px", alignItems: "center" }}
    //               className="dark:bg-red-600 dark:hover:bg-red-500"
    //             >
    //               Reject All
    //             </Button>
    //           </div>
    //         ) : (
    //           <span className="text-gray-500 dark:text-gray-400">
    //             No listed items available.
    //           </span>
    //         )}
    //       </div>
    //       {count > 0 && (
    //         <div className="space-y-4">
    //           {incomingTransferOffers.map((incomingTransfer, index) => (
    //             <IncomingOfferCard
    //               transfer={incomingTransfer}
    //               key={index}
    //               onAction={onAction}
    //               myWalletAddress={myOwnWalletAddress}
    //               updateUsersNFTs={updateUsersNFTs}
    //               widgetApi={widgetApi}
    //             />
    //           ))}
    //         </div>
    //       )}
    //     </motion.div>
    //   )}
    // </div>
  );
};

export default IncomingListToggle;
