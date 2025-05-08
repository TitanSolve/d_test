import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import API_URLS from "../../config";
import { Button } from "antd";
import TransactionModal from "../TransactionModal";
import NFTMessageBox from "../NFTMessageBox";

const OfferReceivedCard = ({
  sellOffers,
  buyOffer,
  index,
  onAction,
  myWalletAddress,
  refreshSellOffers,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [websocketUrl, setWebsocketUrl] = useState("");
  const [websocketAutoMakeSellOfferUrl, setWebsocketAutoMakeSellOfferUrl] =
    useState("");
  const [transactionStatus, setTransactionStatus] = useState("");
  const [isQrModalVisible, setIsQrModalVisible] = useState(false);
  const [madeOffers, setMadeOffers] = useState([]);
  const [isMessageBoxVisible, setIsMessageBoxVisible] = useState(false);
  const [messageBoxType, setMessageBoxType] = useState("success");
  const [messageBoxText, setMessageBoxText] = useState("");
  const [roomMessage, setRommMessage] = useState("");
  const [sendRoomMsg, setSendRoomMsg] = useState(false);

  useEffect(() => {
    if (sendRoomMsg && roomMessage !== "") {
      console.log("sendRoomMsg", sendRoomMsg);
      widgetApi.sendRoomEvent("m.room.message", {
        body: roomMessage,
      });
    }
  }, [sendRoomMsg]);

  useEffect(() => {
    setMadeOffers(sellOffers);
    console.log("OfferReceivedCard->sellOffer-->", sellOffers);
  }, [sellOffers]);

  async function onAcceptOffer() {
    console.log("Accpet clicked for item:", buyOffer);
    console.log("SellOffer--->", madeOffers);

    setTransactionStatus("");

    let isOfferFound = false;
    let sellOfferIndex = "";
    let brokerFee = ((buyOffer.amount * 1 - 12) / 1.01 * 0.01).toFixed(0);
    for (const offer of madeOffers) {
      console.log("offer--->", offer);
      if (offer.NFTokenID === buyOffer.NFTokenID) {
        isOfferFound = true;
        sellOfferIndex = offer.nft_offer_index;
        brokerFee = ((buyOffer.amount * 1 - 12) / 1.01 * 0.01).toFixed(0);
        console.log("brokerFee--->", brokerFee, buyOffer.amount, offer.amount);
        break;
      }
    }
    if (isOfferFound) {
      const requestBody = {
        nftId: buyOffer.NFTokenID,
        buyOfferId: buyOffer.nft_offer_index,
        sellOfferId: sellOfferIndex,
        brokerFee: brokerFee,
      };
      console.log("requestBody--->", requestBody);

      try {
        const response = await fetch(
          `${API_URLS.backendUrl}/broker-accept-offer`,
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

        console.log("response", response);

        const data = await response.json();
        if (data) {
          console.log(data, "data");
          if (data.result.meta.TransactionResult === "tesSUCCESS") {
            setMessageBoxType("success");
            setMessageBoxText("Offer finished successfully");
          } else {
            setMessageBoxType("error");
            setMessageBoxText(data.result.meta.TransactionResult);
          }
          setIsMessageBoxVisible(true);
        }
      } catch (error) {
        console.error("Error during fetch:", error);
      }
    } else {
      console.log("No matching offer found for the selected NFT.");
      let sellAmount = "0";
      sellAmount = (
        (buyOffer.amount * 1 - 12) / 1.01 / 1000000
      ).toString();

      const payload = {
        nft: buyOffer.NFTokenID,
        amount: sellAmount,
        receiver: "all",
        sender: myWalletAddress,
      };
      console.log("payload for sell", payload);
      try {
        const response = await fetch(
          `${API_URLS.backendUrl}/create-nft-offer`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Offer created:", response);
        if (data) {
          console.log(data.refs, "data refs");
          setQrCodeUrl(data.refs.qr_png);
          setWebsocketAutoMakeSellOfferUrl(data.refs.websocket_status);
          setIsQrModalVisible(true);
        }
      } catch (error) {
        console.error("Error creating offer:", error);
      }
    }
  }

  async function onCancelOffer() {
    console.log("Cancel clicked for item:", buyOffer);
    setTransactionStatus("");
    const requestBody = {
      account: buyOffer.owner,
      offerId: buyOffer.nft_offer_index,
    };
    try {
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
        onAction();
        // setQrCodeUrl(data.refs.qr_png);
        // setWebsocketUrl(data.refs.websocket_status);
        // setIsQrModalVisible(true);
      }
    } catch (error) {
      console.error("Error during fetch:", error);
    }
  }

  async function onAcceptAutoMakeSellOfferOffer(refreshedSellOffers) {
    console.log("onAcceptAutoMakeSellOfferOffer item:", buyOffer);
    console.log("SellOffer--->", refreshedSellOffers);

    let isOfferFound = false;
    let sellOfferIndex = "";
    let brokerFee = (parseFloat(buyOffer.amount) * 1.01).toString();
    for (const offer of refreshedSellOffers) {
      console.log("offer--->", offer);
      if (offer.NFTokenID === buyOffer.NFTokenID) {
        isOfferFound = true;
        sellOfferIndex = offer.nft_offer_index;
        brokerFee = ((buyOffer.amount * 1 - 12) / 1.01 * 0.01).toFixed(0);
        break;
      }
    }
    if (isOfferFound) {
      const requestBody = {
        nftId: buyOffer.NFTokenID,
        buyOfferId: buyOffer.nft_offer_index,
        sellOfferId: sellOfferIndex,
        brokerFee: brokerFee,
      };
      console.log("requestBody--->", requestBody);

      try {
        const response = await fetch(
          `${API_URLS.backendUrl}/broker-accept-offer`,
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
          console.log(data, "data");
          // onAction();
          if (data.result.meta.TransactionResult === "tesSUCCESS") {
            setMessageBoxType("success");
            setMessageBoxText("Offer finished successfully");
          } else {
            setMessageBoxType("error");
            setMessageBoxText(data.result.meta.TransactionResult);
          }
          setIsMessageBoxVisible(true);
        }
      } catch (error) {
        console.error("Error during fetch:", error);
      }
    }
  }

  async function refreshSellOfferAndAccept() {
    console.log("refreshSellOfferAndAccept");
    const refreshedSellOffers = await refreshSellOffers();
    console.log("done refreshSellOffers", refreshedSellOffers);
    onAcceptAutoMakeSellOfferOffer(refreshedSellOffers);
  }

  useEffect(() => {
    if (websocketUrl) {
      const ws = new WebSocket(websocketUrl);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.signed) {
          setTransactionStatus("Transaction signed");
          setIsQrModalVisible(false);
          onAction(); //refresh
        } else if (data.rejected) {
          setTransactionStatus("Transaction rejected");
        }
      };
      return () => {
        ws.close();
      };
    }
  }, [websocketUrl]);

  useEffect(() => {
    if (websocketAutoMakeSellOfferUrl) {
      const ws = new WebSocket(websocketAutoMakeSellOfferUrl);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.signed) {
          setTransactionStatus("Transaction signed");
          setIsQrModalVisible(false);
          refreshSellOfferAndAccept();
        } else if (data.rejected) {
          setTransactionStatus("Transaction rejected");
        }
      };
      return () => {
        ws.close();
      };
    }
  }, [websocketAutoMakeSellOfferUrl]);

  function handleCloseMessageBox() {
    setIsMessageBoxVisible(false);
    onAction();
  }

  return (
    <div className="flex flex-col sm:flex-row items-center bg-white dark:bg-[#1a1d21] p-5 rounded-2xl shadow-xl w-full max-w-3xl border border-gray-200 dark:border-gray-700 gap-1 transition-all duration-300">
      <div className="w-full sm:w-auto flex justify-center">
        <img
          src={buyOffer.nft.imageURI}
          alt="NFT Preview"
          className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl object-cover shadow-md border border-gray-300 dark:border-gray-600"
        />
      </div>

      <div className="flex flex-col text-center sm:text-left gap-1 flex-grow">
        <span className="font-semibold text-gray-900 dark:text-white text-lg sm:text-xl truncate">
          {buyOffer.nft.name}
        </span>
      </div>

      <div className="flex flex-col sm:items-end text-center sm:text-right w-full sm:w-auto gap-1">
        <div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            Amount: {(((buyOffer.offer.amount * 1 - 12) / 1.01) / 1000000).toFixed(6)}
            {/* Amount: {(((buyOffer.amount * 1 - 12) * 0.99) / 1000000).toFixed(6)} */}
          </span>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Received Offer
          </p>
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
            Reject
          </Button>
        </div>
      </div>
      <TransactionModal
        isOpen={isQrModalVisible}
        onClose={() => setIsQrModalVisible(false)}
        qrCodeUrl={qrCodeUrl}
        transactionStatus={transactionStatus}
      />
      <NFTMessageBox
        isOpen={isMessageBoxVisible}
        onClose={handleCloseMessageBox}
        type={messageBoxType}
        message={messageBoxText}
      />
    </div>
  );
};

export default OfferReceivedCard;
