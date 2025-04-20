import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import {
  Typography,
  Select,
  MenuItem,
  Switch,
  Modal,
  Box,
  FormControl,
  InputLabel,
  TextField,
  Chip,
  Button,
  InputAdornment,
} from "@mui/material";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import NFTCard from "../NFT-Card";
import "./index.css";
import xrpl from "xrpl";
import API_URLS from "../../config";

const ParticipantCard = ({
  index,
  membersList,
  myNftData,
  wgtParameters,
  getImageData,
}) => {
  const [state, setState] = useState({
    sortOrder: "newest",
    isSell: true,
    isOldest: true,
    selectedUser: "all",
    amount: "1",
    collection: "collection",
    selectedCollection: "",
    token: "XRP",
  });

  const xrpl = require("xrpl");

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedNFTGroup, setSelectedNFTGroup] = useState(null);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [selectedNftForOffer, setSelectedNftForOffer] = useState(null);
  const [uniqueCurrencies, setUniqueCurrencies] = useState([]);
  const [websocketUrl, setWebsocketUrl] = useState("");
  const [transactionStatus, setTransactionStatus] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isQrModalVisible, setIsQrModalVisible] = useState(false);
  const [sell, setSell] = useState(false);

  const toggleSellMode = () =>
    setState((prev) => ({ ...prev, isSell: !prev.isSell }));
  const updateField = (field, value) =>
    setState((prev) => ({ ...prev, [field]: value }));

  const filteredNfts = myNftData.groupedNfts.filter(
    (group) =>
      group.collection === state.selectedCollection ||
      state.selectedCollection === ""
  );

  const responsive = {
    superLargeDesktop: { breakpoint: { max: 4000, min: 1280 }, items: 4 },
    desktop: { breakpoint: { max: 1280, min: 700 }, items: 3 },
    tablet: { breakpoint: { max: 700, min: 400 }, items: 2 },
    mobile: { breakpoint: { max: 400, min: 0 }, items: 1 },
  };

  const openPreviewModal = (group) => {
    if (group.nfts.length > 1) {
      setSelectedNFTGroup(group);
      setPreviewModalOpen(true);
    } else {
      openOfferModal(group.nfts[0]);
    }
  };

  const closePreviewModal = () => {
    setPreviewModalOpen(false);
    setSelectedNFTGroup(null);
  };

  const openOfferModal = async (nft) => {
    const myName = wgtParameters.displayName;
    const own = membersList.find((u) => u.name === myName /*"This Guy"*/);
    const currentUser = membersList.find((u) => u.name === nft.userName);
    const myTrustLines = own.trustLines;
    const currentUserTrustLines = currentUser.trustLines;
    // console.log("me", own);
    // console.log("MyTrustLines", myTrustLines);
    // console.log("currentUser", currentUser);
    // console.log("currentUserTrustLines", currentUserTrustLines);

    const sharedTrustLines = myTrustLines.filter((myLine) =>
      currentUserTrustLines.some(
        (theirLine) =>
          theirLine.currency === myLine.currency &&
          theirLine.account === myLine.account
      )
    );

    console.log("sharedTrustLines", sharedTrustLines);

    let unique = Array.from(
      new Map(
        sharedTrustLines.map((line) => [
          `${line.account}_${line.currency}`,
          {
            currency: line.currency,
            decodedCurrency: line.decodedCurrency,
          },
        ])
      ).values()
    );

    const hasXRP = unique.some((item) => item.decodedCurrency === "XRP");
    if (!hasXRP) {
      unique.push({ currency: "XRP", decodedCurrency: "XRP" });
    }

    // console.log("uniqueCurrencies : ", unique);

    setUniqueCurrencies(unique);
    setSelectedNftForOffer(nft);
    setOfferModalOpen(true);
  };

  const closeOfferModal = () => {
    setOfferModalOpen(false);
    setSelectedNftForOffer(null);
  };

  const makeOffer = async (isSell, selectedNftForOffer) => {
    console.log("isSell : ", isSell);
    const myName = wgtParameters.displayName;
    const own = membersList.find((u) => u.name === myName /*"This Guy"*/);
    const ownWalletAddress = own.userId?.split(":")[0].replace("@", "");
    let destination = state.selectedUser;

    if (destination !== "all") {
      destination = membersList.find((u) => u.name === destination).userId?.split(":")[0].replace("@", "");
    }

    console.log("own : ", own);
    console.log("selected user : ", state.selectedUser);
    console.log("selected token : ", state.token);
    console.log("selected amount : ", state.amount);
    console.log("selected nftID : ", selectedNftForOffer.nftokenID);
    console.log("selected issuer : ", selectedNftForOffer.issuer);
    console.log("destination : ", destination);

    // const client = new xrpl.Client(API_URLS.xrplMainnetUrl);
    // await client.connect();
    // console.log("Connected to ", API_URLS.xrplMainnetUrl);
    // const sellerWallet = xrpl.Wallet.fromSeed(ownWalletAddress);
    // console.log("sellerWallet : ", sellerWallet);
    // const brokerAddress = API_URLS.brokerWalletAddress;


    const payload = {
      nft: selectedNftForOffer.nftokenID,
      amount: state.amount,
      owner: selectedNftForOffer.issuer,
      receiver: destination,
    };
    console.log("payload for sell", payload);
    console.log("Current destination:", destination);

    try {
      const response = await axios.post(
        `${API_URLS.backendUrl}/create-nft-offer`,
        payload
      );
      console.log("Offer created:", response.data);
      setQrCodeUrl(response.data.refs.qr_png);
      setWebsocketUrl(response.data.refs.websocket_status);
      setIsQrModalVisible(true);
      setSell(false);
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };

  useEffect(() => {
    if (websocketUrl) {
      const ws = new WebSocket(websocketUrl);

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log(data, "data aman in user card qr code");
        if (data.signed) {
          setTransactionStatus(`Transaction signed. TXID: ${data.txid}`);
          console.log(data.txid, "qr code completion");
          console.log(
            transactionStatus,
            "transaction status aman in user card qr code"
          );
          //  setIsModalVisible(false);
        } else if (data.rejected) {
          setTransactionStatus("Transaction rejected");
        }
      };

      return () => {
        ws.close();
      };
    }
  }, [websocketUrl]);

  const collections = [
    ...new Set(myNftData.groupedNfts.map((group) => group.collection)),
  ];

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg w-full max-w-5xl bg-white dark:bg-[#15191E] text-black dark:text-white transition-colors duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Typography
          variant="h6"
          className="font-bold text-black dark:text-white"
        >
          {myNftData.name === wgtParameters.displayName
            ? "My NFTs"
            : myNftData.name}
        </Typography>

        <FormControl
          variant="outlined"
          size="small"
          className="text-black dark:text-white"
        >
          <InputLabel className="text-black dark:text-white">
            Collection
          </InputLabel>
          <Select
            value={state.selectedCollection}
            onChange={(e) => updateField("selectedCollection", e.target.value)}
            label="Collection"
            className="bg-white dark:bg-gray-800 text-black dark:text-white"
            MenuProps={{
              PaperProps: {
                className:
                  "bg-white dark:bg-gray-800 text-black dark:text-white",
              },
            }}
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            {collections.map((collection, idx) => (
              <MenuItem key={idx} value={collection}>
                {collection}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <div className="mt-4">
        <Carousel
          responsive={responsive}
          ssr={true}
          infinite={false}
          draggable={true}
          containerClass="carousel-container"
          itemClass="carousel-item flex justify-center items-center px-2"
          customLeftArrow={
            <button
              className="absolute left-2 md:left-4 top-1/2 z-20 -translate-y-1/2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-md p-2 md:p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
              aria-label="Previous"
            >
              <ChevronLeft size={20} className="md:size-6" />
            </button>
          }
          customRightArrow={
            <button
              className="absolute right-2 md:right-4 top-1/2 z-20 -translate-y-1/2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-md p-2 md:p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
              aria-label="Next"
            >
              <ChevronRight size={20} className="md:size-6" />
            </button>
          }
        >
          {filteredNfts.length > 0 ? (
            filteredNfts.map((groupedNft, idx) => (
              <div
                key={idx}
                onClick={() => openPreviewModal(groupedNft)}
                className="cursor-pointer"
              >
                <NFTCard
                  myNftData={groupedNft}
                  isGroup={true}
                  isImgOnly={false}
                />
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-32 font-semibold text-center w-full">
              <p className="text-black dark:text-white">No NFTs available</p>
            </div>
          )}
        </Carousel>
      </div>

      <Modal
        open={previewModalOpen}
        onClose={closePreviewModal}
        footer={null}
        closable={true}
        maskClosable={true}
        bodyStyle={{ borderRadius: "10px", padding: "24px" }}
      >
        <Box className="absolute top-1/2 left-1/2 w-11/12 bg-white dark:bg-[#15191E] text-black dark:text-white rounded-2xl shadow-2xl transform -translate-x-1/2 -translate-y-1/2 p-4 sm:p-6 md:p-8 outline-none border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <Typography
            variant="h6"
            className="font-bold overflow-hidden text-black dark:text-white"
          >
            {selectedNFTGroup && "Issuer : " + selectedNFTGroup.nfts[0].Issuer}
          </Typography>
          <div className="relative">
            <Carousel
              responsive={responsive}
              ssr={true}
              infinite={false}
              draggable={true}
              swipeable={true}
              containerClass="carousel-container"
              itemClass="carousel-item flex justify-center items-center px-2"
              customLeftArrow={
                <button className="absolute left-2 md:left-4 top-1/2 z-20 -translate-y-1/2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-lg p-2 md:p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-200 ease-in-out">
                  <ChevronLeft size={20} />
                </button>
              }
              customRightArrow={
                <button className="absolute right-2 md:right-4 top-1/2 z-20 -translate-y-1/2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-lg p-2 md:p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-200 ease-in-out">
                  <ChevronRight size={20} />
                </button>
              }
            >
              {selectedNFTGroup &&
                selectedNFTGroup.nfts.map((nft, idx) => (
                  <div
                    key={idx}
                    onClick={() => openOfferModal(nft)}
                    className="cursor-pointer hover:scale-105 transition-transform duration-300"
                  >
                    <NFTCard
                      myNftData={nft}
                      isGroup={false}
                      isImgOnly={false}
                    />
                  </div>
                ))}
            </Carousel>
          </div>
        </Box>
      </Modal>

      <Modal
        open={offerModalOpen}
        onClose={closeOfferModal}
        footer={null}
        closable={true}
        maskClosable={true}
        closeAfterTransition
        bodyStyle={{ borderRadius: "10px", padding: "16px" }}
      >
        <div>
          {selectedNftForOffer !== null && (
            <Box className="bg-white dark:bg-[#15191E] text-black dark:text-white rounded-xl p-6 shadow-lg max-h-[90vh] max-w-full md:max-w-[500px] w-full mx-auto top-1/2 left-1/2 absolute transform -translate-x-1/2 -translate-y-1/2 overflow-y-auto transition-colors duration-300">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <Typography
                    variant="subtitle1"
                    className="font-semibold text-black dark:text-white"
                  >
                    {selectedNftForOffer.metadata.name}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    className="text-sm text-gray-600 dark:text-gray-300"
                  >
                    Issuer: {selectedNftForOffer.issuer} -{" "}
                    {selectedNftForOffer.nftokenTaxon}
                  </Typography>
                </div>
                <Button
                  onClick={closeOfferModal}
                  className="min-w-[36px] h-[36px] text-black dark:text-white"
                  sx={{
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    lineHeight: 1,
                    padding: 0,
                    minHeight: "auto",
                  }}
                >
                  ✕
                </Button>
              </div>

              <NFTCard
                myNftData={selectedNftForOffer}
                isGroup={false}
                isImgOnly={true}
              />
              <Typography
                variant="subtitle2"
                className="text-center font-semibold text-black dark:text-white"
              >
                IssuerFee : {(selectedNftForOffer.transferFee * 1) / 1000} %
              </Typography>

              {selectedNftForOffer.metadata?.attributes?.length > 0 && (
                <div className="mb-6">
                  <Typography
                    variant="subtitle2"
                    className="font-semibold mb-2 text-black dark:text-white"
                  >
                    Attributes
                  </Typography>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                    {selectedNftForOffer.metadata.attributes.map(
                      (attr, idx) => (
                        <Box
                          key={index}
                          className="bg-gray-100 dark:bg-[#1c1f26] rounded-md p-3 w-full transition-colors"
                        >
                          <Typography className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            {attr.trait_type}
                          </Typography>
                          <Typography className="text-black dark:text-white font-semibold mb-1">
                            {attr.value}
                          </Typography>
                          {attr.rarity && (
                            <Chip
                              label={`${attr.rarity}%`}
                              size="small"
                              sx={{
                                backgroundColor: "#6c3df4",
                                color: "white",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                              }}
                            />
                          )}
                        </Box>
                      )
                    )}
                  </div>
                </div>
              )}

              {!(
                selectedNftForOffer.userName === wgtParameters.displayName
              ) && (
                  <Typography
                    variant="h5"
                    className="text-center font-semibold text-black dark:text-white"
                  >
                    Offer to buy from {selectedNftForOffer.userName}
                  </Typography>
                )}

              {selectedNftForOffer.userName === wgtParameters.displayName && (
                <>
                  <div className="flex justify-center items-center gap-4">
                    <Typography
                      className={`font-medium ${state.isSell
                        ? "text-black dark:text-white"
                        : "text-gray-400 dark:text-gray-500"
                        }`}
                    >
                      Sell
                    </Typography>
                    <Switch
                      checked={!state.isSell}
                      onChange={toggleSellMode}
                      color="primary"
                    />
                    <Typography
                      className={`font-medium ${!state.isSell
                        ? "text-black dark:text-white"
                        : "text-gray-400 dark:text-gray-500"
                        }`}
                    >
                      Transfer
                    </Typography>
                  </div>

                  <Select
                    value={state.selectedUser}
                    onChange={(e) =>
                      updateField("selectedUser", e.target.value)
                    }
                    fullWidth
                    variant="outlined"
                    size="small"
                    className="mb-4 bg-white dark:bg-gray-800 dark:text-white rounded"
                    sx={{
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "gray",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "blue",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "green",
                      },
                      "& .MuiInputBase-input": {
                        color: "black",
                      },
                    }}
                  >
                    <MenuItem key={"all"} value={"all"}>
                      All Others
                    </MenuItem>
                    {membersList.map((user) => (
                      <MenuItem key={user.userId} value={user.name}>
                        {user.name}
                      </MenuItem>
                    ))}
                  </Select>
                </>
              )}

              {state.isSell && (
                <div className="flex flex-col md:flex-row gap-3 mb-5">
                  <TextField
                    type="number"
                    label="Amount"
                    value={state.amount}
                    inputProps={{ min: 1 }}
                    onChange={(e) => updateField("amount", e.target.value)}
                    fullWidth
                    size="small"
                    className="bg-white text-black dark:bg-[#15191E] dark:text-white rounded-md"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">🪙</InputAdornment>
                      ),
                      classes: {
                        input: "text-black dark:text-white", // ✅ Tailwind text color for input
                      },
                    }}
                    InputLabelProps={{
                      className: "text-gray-700 dark:text-gray-300", // ✅ Tailwind text color for label
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "green",
                        },
                        "&:hover fieldset": {
                          borderColor: "blue",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "purple",
                        },
                      },
                    }}
                  />
                  <Select
                    value={state.token}
                    onChange={(e) => updateField("token", e.target.value)}
                    fullWidth
                    size="small"
                    className="bg-white dark:bg-gray-800 dark:text-white rounded"
                    sx={{
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "gray", // default border
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "blue", // hover border
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "green", // focused border
                      },
                      "& .MuiInputBase-input": {
                        color: "black dark:white", // 👈 text color
                      },
                    }}
                  >
                    {uniqueCurrencies.map((trustLine) => (
                      <MenuItem
                        key={trustLine.currency}
                        value={trustLine.decodedCurrency}
                      >
                        {trustLine.decodedCurrency}
                      </MenuItem>
                    ))}
                  </Select>
                </div>
              )}

              <div className="text-center">
                <Button
                  variant="contained"
                  size="large"
                  className="rounded-md w-1/2"
                  onClick={() => makeOffer(state.isSell, selectedNftForOffer)}
                >
                  {state.isSell
                    ? !(
                      selectedNftForOffer.userName ===
                      wgtParameters.displayName
                    )
                      ? "Offer Buy"
                      : "Offer Sell"
                    : "Transfer"}
                </Button>
              </div>
            </Box>
          )}
        </div>
      </Modal>
      {/* this modal is for the qr code */}
      <Modal
        // title="Transaction QR Code"
        open={isQrModalVisible}
        // onClose={() => setIsQrModalVisible(false)}
        footer={null}
        closable={true}
        maskClosable={true}
        closeAfterTransition
        bodyStyle={{ borderRadius: "10px", padding: "16px" }}
      >
        {!qrCodeUrl.isEmpty() && (
          <div className="qr-code-container">
            <img
              src={qrCodeUrl}
              alt="Scan this QR code with XUMM to sign the transaction"
            />
          </div>
        )}
        <p>Transaction Status: {transactionStatus}</p>
      </Modal>
    </div>
  );
};

export default ParticipantCard;
