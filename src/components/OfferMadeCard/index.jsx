import React, { useEffect, useState } from "react";
import API_URLS from "../../config";
import { Button } from "antd";
import TransactionModal from "../TransactionModal";
import LoadingOverlayForCard from "../LoadingOverlayForCard";
import NFTMessageBox from "../NFTMessageBox";

const OfferMadeCard = ({ sellOffer, index, onAction, myWalletAddress }) => {
  const [isLoading, setIsLoading] = useState(false);
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

  async function onCancelOffer() {
    console.log("Cancel clicked for item:", sellOffer);
    setTransactionStatus("");
    const requestBody = {
      account: sellOffer.offer.offerOwner,
      offerId: sellOffer.offer.offerId,
    };
    try {
      setIsLoading(true);
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
      setIsLoading(false);
      if (data.meta.TransactionResult === "tesSUCCESS") {
        console.log(data, "returned data");
        setMessageBoxType("success");
        setMessageBoxText("Offer cancelled successfully.");
        setIsMessageBoxVisible(true);
      } else {
        console.log("No data received from the server.");
        setMessageBoxType("error");
        setMessageBoxText("Failed to cancel the offer. \nPlease try again.\n error: " + data.meta.TransactionResult);
        setIsMessageBoxVisible(true);
      }
    } catch (error) {
      console.error("Error during fetch:", error);
    }
  }

  return (
    <>
      {isLoading ? (
        <LoadingOverlayForCard />
      ) : (
        <div className="flex flex-col sm:flex-row items-center bg-white dark:bg-[#1a1d21] p-5 rounded-2xl shadow-xl w-full max-w-3xl border border-gray-200 dark:border-gray-700 gap-1 transition-all duration-300">
          <div className="w-full sm:w-auto flex justify-center">
            <img
              src={sellOffer.nft.imageURI}
              alt="NFT Preview"
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl object-cover shadow-md border border-gray-300 dark:border-gray-600"
            />
          </div>

          <div className="flex flex-col text-center sm:text-left gap-1 flex-grow">
            <span className="font-semibold text-gray-900 dark:text-white text-lg sm:text-xl truncate">
              {sellOffer.nft.name}
            </span>
          </div>

          <div className="flex flex-col sm:items-end text-center sm:text-right w-full sm:w-auto gap-1">
            <div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Amount : {(sellOffer.offer.amount * 1) / 1000000}
              </span>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                { sellOffer.offer.isSell ? "My Sell Offer" : "My Buy Offer" }
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between w-full sm:w-auto space-y-4 sm:space-y-0 sm:space-x-4">
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
          <NFTMessageBox
            isOpen={isMessageBoxVisible}
            onClose={() => setIsMessageBoxVisible(false)}
            type={messageBoxType}
            message={messageBoxText}
          />
        </div>
      )}
    </>
  );
};

export default OfferMadeCard;
