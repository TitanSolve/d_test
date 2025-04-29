import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import API_URLS from "../../config";
import {
  Modal,
  Box,
  Button,
} from "@mui/material";


const OfferReceivedCard = ({ sellOffers, buyOffer, index, onAction, myWalletAddress, refreshSellOffers }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [websocketUrl, setWebsocketUrl] = useState("");
  const [transactionStatus, setTransactionStatus] = useState("");
  const [isQrModalVisible, setIsQrModalVisible] = useState(false);
  const [madeOffers, setMadeOffers] = useState([]);
  let isSignforAccept = false;
  let sellAmount = "0";

  useEffect(() => {
    setMadeOffers(sellOffers);
    console.log("sellOffer-->", sellOffers);
  }, [sellOffers]);

  async function onAcceptOffer() {
    console.log("Accpet clicked for item:", buyOffer);
    console.log("SellOffer--->", madeOffers);

    let isOfferFound = false;
    let sellOfferIndex = "";
    let brokerFee = (parseFloat(buyOffer.amount) * 1.01).toString();
    for (const offer of madeOffers) {
      console.log("offer--->", offer);
      if (offer.NFTokenID === buyOffer.NFTokenID) {
        isOfferFound = true;
        sellOfferIndex = offer.nft_offer_index;
        brokerFee = (buyOffer.amount * 1 - offer.amount * 1).toString();
        break;
      }
    }
    if(isOfferFound)
    {
      const requestBody = {
        nftId: buyOffer.NFTokenID,
        buyOfferId: buyOffer.nft_offer_index,
        sellOfferId: sellOfferIndex,
        brokerFee: brokerFee,
      };
      console.log("requestBody--->", requestBody);
  
      try {
        const response = await fetch(`${API_URLS.backendUrl}/broker-accept-offer`, {
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
    else {
      console.log("No matching offer found for the selected NFT.");
      sellAmount = ( (buyOffer.amount * 1 - buyOffer.amount * 1 / 100) / 1000000 ).toString();

      const payload = {
        nft: buyOffer.NFTokenID,
        amount: sellAmount,
        receiver: "all",
        sender: myWalletAddress,
      };
      console.log("payload for sell", payload);
      try {
        const response = await fetch(`${API_URLS.backendUrl}/create-nft-offer`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
        console.log("Offer created:", response);
        if (data) {
          console.log(data.refs, "data refs");
          setQrCodeUrl(data.refs.qr_png);
          setWebsocketUrl(data.refs.websocket_status);
          setIsQrModalVisible(true);
        }

      } catch (error) {
        console.error("Error creating offer:", error);
      }

    }
    
  }

  async function onCancelOffer() {
    console.log("Cancel clicked for item:", buyOffer);
    const requestBody = {
      account: buyOffer.owner,
      offerId: buyOffer.nft_offer_index,
    };
    try {
      isSignforAccept = false;
      const response = await fetch(`${API_URLS.backendUrl}/cancel-nft-offer`, {
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

  async function refreshSellOfferAndAccept()
  {
    console.log("refreshSellOfferAndAccept");
    await refreshSellOffers();
    onAcceptOffer();
  }

  useEffect(() => {
    if (websocketUrl) {
      const ws = new WebSocket(websocketUrl);

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.signed) {
          setTransactionStatus("Transaction signed");
          setIsQrModalVisible(false);
          // onAction();  //refresh

          if (isSignforAccept) { //sign for accept offer
            console.log("sign for accept offer--->", buyOffer);
            refreshSellOfferAndAccept();            
          }
          else{
            onAction(); //refresh
          }

        } else if (data.rejected) {
          setTransactionStatus("Transaction rejected");
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
          src={buyOffer.imageURI}
          alt="TextRP Feature Pack"
          className="w-16 h-16 rounded-lg object-cover shadow-sm"
        />
        <div className="flex flex-col text-center sm:text-left overflow-hidden">
          <span className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg truncate w-full">{buyOffer.name}</span>
          {/* <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base truncate w-full">Exclusive NFT Collection TextRP Feature Pack TextRP Feature Pack TextRP Feature Pack</span> */}
        </div>
      </div>
      <div className="flex flex-col items-center sm:items-end text-center sm:text-right w-full sm:w-auto">
        <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white sm:whitespace-nowrap">{buyOffer.amount * 1 / 1000000} XRP</span>
        <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white sm:whitespace-nowrap">From : {buyOffer.buyerName}</span>
        <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base sm:whitespace-nowrap">Buy Offer</span>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between w-full sm:w-auto space-y-4 sm:space-y-0 sm:space-x-4">
        <Button
          type="primary"
          onClick={onAcceptOffer}
          block
          style={{ borderRadius: "6px", alignItems: "center" }}
          className="dark:bg-green-600 dark:hover:bg-green-500"
        // className="w-full sm:w-auto bg-red-500 text-white px-4 sm:px-5 py-2 rounded-lg hover:bg-red-600 transition shadow-md text-center">
        >
          Accpet
        </Button>
        <Button
          type="primary"
          onClick={onCancelOffer}
          block
          style={{ borderRadius: "6px", alignItems: "center" }}
          className="dark:bg-red-600 dark:hover:bg-red-500"
        // className="w-full sm:w-auto bg-red-500 text-white px-4 sm:px-5 py-2 rounded-lg hover:bg-red-600 transition shadow-md text-center">
        >
          Cancel
        </Button>
      </div>
      {/* this modal is for the qr code */}
      <Modal
        title="Transaction QR Code"
        open={isQrModalVisible}
        onClose={() => setIsQrModalVisible(false)}
        footer={null}
        closable={true}
        maskClosable={true}
        closeAfterTransition
        bodyStyle={{ borderRadius: "10px", padding: "16px" }}
      >
        <div>
          <Box className="bg-white dark:bg-[#15191E] text-black dark:text-white rounded-xl p-6 shadow-lg max-h-[90vh] max-w-full md:max-w-[500px] w-full mx-auto top-1/2 left-1/2 absolute transform -translate-x-1/2 -translate-y-1/2 overflow-y-auto transition-colors duration-300">
            {qrCodeUrl && (
              <div className="">
                <img
                  src={qrCodeUrl}
                  alt="Scan this QR code with XUMM to sign the transaction"
                />
              </div>
            )}
            <p>Transaction Status: {transactionStatus}</p>
          </Box>
        </div>
      </Modal>
    </motion.div>
  );
};

export default OfferReceivedCard;
