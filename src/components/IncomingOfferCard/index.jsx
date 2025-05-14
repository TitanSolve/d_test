import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import API_URLS from "../../config";
import { Button } from "antd";
import TransactionModal from "../TransactionModal";

const IncomingOfferCard = ({ transfer, index, onAction, myWalletAddress, updateUsersNFTs, widgetApi }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [websocketUrl, setWebsocketUrl] = useState("");
  const [transactionStatus, setTransactionStatus] = useState("");
  const [isQrModalVisible, setIsQrModalVisible] = useState(false);
  const [pendingOfferAction, setPendingOfferAction] = useState(null);

  async function onAcceptTransfer() {
    console.log("Accept clicked for item:", transfer);
    const requestBody = {
      address: myWalletAddress,
      OfferId: transfer.offer.offerId,
      buyOrSell: 0,
    };
    try {
      setPendingOfferAction({
        type: "accept",
      });

      const response = await fetch(`${API_URLS.backendUrl}/accept-offer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(requestBody),
      });
      console.log(requestBody, "requestBody");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data) {
        console.log(data.refs, "data refs");
        setQrCodeUrl(data.refs.qr_png);
        setWebsocketUrl(data.refs.websocket_status);
        setIsQrModalVisible(true);
      }
    } catch (error) {
      console.error("Error during fetch:", error);
    }
  }

  async function onRejectTransfer() {
    console.log("Cancel clicked for item:", transfer);
    setTransactionStatus("");
    const requestBody = {
      account: transfer.offer.offerOwner,
      offerId: transfer.offer.offerId,
    };
    try {
      setPendingOfferAction({
        type: "cancel",
      });
      const response = await fetch(
        `${API_URLS.backendUrl}/cancel-nft-offer-with-sign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );
      console.log(requestBody, "requestBody");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data) {
        console.log(data.refs, "data refs");
        setQrCodeUrl(data.refs.qr_png);
        setWebsocketUrl(data.refs.websocket_status);
        setIsQrModalVisible(true);
      }
    } catch (error) {
      console.error("Error during fetch:", error);
    }
  }

  useEffect(() => {
    if (websocketUrl) {
      const ws = new WebSocket(websocketUrl);

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.signed) {
          setTransactionStatus("Transaction signed");
          setIsQrModalVisible(false);
          console.log("pendingOfferAction-->", pendingOfferAction.type);
          onAction();
          if( pendingOfferAction.type === "accept") { 
            updateUsersNFTs(
              transfer.nft.nftokenID,
              transfer.offer.offerId,
              myWalletAddress,
            );
          }
          setPendingOfferAction(null);
        }  else if( data.signed === false ){
          setIsQrModalVisible(false);
          ws.close();
        } else if (data.rejected) {
          setTransactionStatus("Transaction rejected");
          setPendingOfferAction(null);
        }
      };
      return () => {
        ws.close();
      };
    }
  }, [websocketUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row items-center sm:justify-between bg-white dark:bg-[#15191E] p-4 rounded-xl shadow-md w-full max-w-2xl border border-gray-200 dark:border-gray-700 space-y-4 sm:space-y-0 sm:space-x-4 transition-colors"
    >
      <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
        <img
          src={transfer.nft.imageURI}
          alt="TextRP Feature Pack"
          className="w-16 h-16 rounded-lg object-cover shadow-sm"
        />
        <div className="flex flex-col text-center sm:text-left overflow-hidden">
          <span className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg truncate w-full">
            {transfer.nft.name}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-center sm:items-end text-center sm:text-right w-full sm:w-auto">
        <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base sm:whitespace-nowrap">
          Incoming Transfer Offer
        </span>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between w-full sm:w-auto space-y-4 sm:space-y-0 sm:space-x-4">
        <Button
          type="primary"
          onClick={onAcceptTransfer}
          block
          style={{ borderRadius: "6px", alignItems: "center" }}
          className="dark:bg-green-600 dark:hover:bg-green-500"
        >
          Accept
        </Button>
        <Button
          type="primary"
          onClick={onRejectTransfer}
          block
          style={{ borderRadius: "6px", alignItems: "center" }}
          className="dark:bg-red-600 dark:hover:bg-red-500"
        >
          Deny
        </Button>
      </div>
      <TransactionModal
        isOpen={isQrModalVisible}
        onClose={() => setIsQrModalVisible(false)}
        qrCodeUrl={qrCodeUrl}
        transactionStatus={transactionStatus}
      />
    </motion.div>
  );
};

export default IncomingOfferCard;
