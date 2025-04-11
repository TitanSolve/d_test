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
  InputAdornment
} from "@mui/material";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import NFTCard from "../NFT-Card";
import './index.css';
import xrpl from "xrpl"


const ParticipantCard = ({ index, membersList, myNftData, wgtParameters, getImageData }) => {
  const [state, setState] = useState({
    sortOrder: "newest",
    isSell: true,
    isOldest: true,
    selectedUser: "Alice @rPdshidjjore",
    amount: "",
    collection: "collection",
    selectedCollection: ""
  });

  const xrpl = require('xrpl');

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedNFTGroup, setSelectedNFTGroup] = useState(null);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [selectedNftForOffer, setSelectedNftForOffer] = useState(null);

  const toggleSellMode = () => setState(prev => ({ ...prev, isSell: !prev.isSell }));
  const updateField = (field, value) =>
    setState((prev) => ({ ...prev, [field]: value }));

  const filteredNfts = myNftData.groupedNfts.filter((group) =>
    group.collection === state.selectedCollection || state.selectedCollection === ""
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
    }
    else {
      openOfferModal(group.nfts[0]);
    }
  };

  const closePreviewModal = () => {
    setPreviewModalOpen(false);
    setSelectedNFTGroup(null);
  };

  const openOfferModal = async (nft) => {
    setSelectedNftForOffer(nft);

    // const client = new xrpl.Client("wss://xrplcluster.com/");
    // await client.connect();
    // console.log("Connected to wss://xrplcluster.com/, nftID:", nft.NFTokenID);

    // const response = await client.request({
    //   command: 'nft_info',
    //   nft_id: nft.NFTokenID
    // });

    // console.log("response------->", response);

    // const nftData = response.result;
    // console.log("nftData------->", nftData);
    // const uriHex = nftData.URI;
    // console.log("uriHex------->", uriHex);

    // if (!uriHex) {
    //   throw new Error('No URI found for this NFT');
    // }

    // // Step 3: Decode the URI from hexadecimal
    // const uri = xrpl.convertHexToString(uriHex);
    // console.log("------------>URI", uri);

    // // Step 4: Fetch the metadata (assuming an HTTP URL)
    // const metadataResponse = await axios.get(uri);
    // console.log("metadataResponse------>", metadataResponse);
    // const metadata = metadataResponse.data;
    // console.log("metadataResponse.data------>", metadataResponse.data);

    // // Step 5: Extract traits (assuming ERC-721-like standard)
    // const traits = metadata.attributes;
    // console.log("traits------>", traits);

    setOfferModalOpen(true);
  };

  const closeOfferModal = () => {
    setOfferModalOpen(false);
    setSelectedNftForOffer(null);
  };

  const collections = [...new Set(myNftData.groupedNfts.map(group => group.collection))];

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg w-full max-w-5xl bg-white dark:bg-gray-900 text-black dark:text-white transition-colors duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Typography variant="h6" className="font-bold text-black dark:text-white">
          {myNftData.name === wgtParameters.displayName ? "My NFTs" : myNftData.name}
        </Typography>

        <FormControl variant="outlined" size="small" className="text-black dark:text-white">
          <InputLabel className="text-black dark:text-white">Collection</InputLabel>
          <Select
            value={state.selectedCollection}
            onChange={(e) => updateField("selectedCollection", e.target.value)}
            label="Collection"
            className="bg-white dark:bg-gray-800 text-black dark:text-white"
            MenuProps={{
              PaperProps: {
                className: 'bg-white dark:bg-gray-800 text-black dark:text-white',
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
              <div key={idx} onClick={() => openPreviewModal(groupedNft)} className="cursor-pointer">
                <NFTCard myNftData={groupedNft} isGroup={true} isImgOnly={false} />
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
        <Box className="absolute top-1/2 left-1/2 w-11/12 bg-white dark:bg-gray-900 text-black dark:text-white rounded-2xl shadow-2xl transform -translate-x-1/2 -translate-y-1/2 p-4 sm:p-6 md:p-8 outline-none border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <Typography variant="h6" className="font-bold overflow-hidden text-black dark:text-white">
            {selectedNFTGroup && (
              "Issuer : " + selectedNFTGroup.nfts[0].Issuer
            )}
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
                  <div key={idx} onClick={() => openOfferModal(nft)} className="cursor-pointer hover:scale-105 transition-transform duration-300">
                    <NFTCard myNftData={nft} isGroup={false} isImgOnly={false} />
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
            <Box
              className="bg-white dark:bg-gray-900 text-black dark:text-white rounded-xl p-6 shadow-lg max-h-[90vh] max-w-full md:max-w-[500px] w-full mx-auto top-1/2 left-1/2 absolute transform -translate-x-1/2 -translate-y-1/2 overflow-y-auto transition-colors duration-300"
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <Typography variant="subtitle1" className="font-semibold text-black dark:text-white">
                    {selectedNftForOffer.metadata.name}
                  </Typography>
                  <Typography variant="subtitle2" className="text-sm text-gray-600 dark:text-gray-300">
                    Issuer: {selectedNftForOffer.issuer} - {selectedNftForOffer.nftokenTaxon}
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
                    minHeight: "auto"
                  }}
                >
                  ✕
                </Button>
              </div>

              <NFTCard myNftData={selectedNftForOffer} isGroup={false} isImgOnly={true} />
              <Typography variant="subtitle2" className="text-center font-semibold text-black dark:text-white" >
                TransferFee : {selectedNftForOffer.transferFee * 1 / 1000} %
              </Typography>

              {selectedNftForOffer.metadata?.attributes?.length > 0 && (
                <div className="mb-6">
                  <Typography variant="subtitle2" className="font-semibold mb-2 text-black dark:text-white">
                    Attributes
                  </Typography>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                    {selectedNftForOffer.metadata.attributes.map((attr, idx) => (
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
                    ))}
                  </div>
                </div>
              )}

              {!(selectedNftForOffer.userName === wgtParameters.displayName) && (
                <Typography
                  variant="h5"
                  className="text-center font-semibold text-black dark:text-white"
                >
                  Offer to buy from {selectedNftForOffer.userName}
                </Typography>
              )}

              {(selectedNftForOffer.userName === wgtParameters.displayName) && (
                <>
                  <div className="flex justify-center items-center gap-4">
                    <Typography
                      className={`font-medium ${state.isSell ? "text-black dark:text-white" : "text-gray-400 dark:text-gray-500"
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
                      className={`font-medium ${!state.isSell ? "text-black dark:text-white" : "text-gray-400 dark:text-gray-500"
                        }`}
                    >
                      Transfer
                    </Typography>
                  </div>

                  <Select
                    value={state.selectedUser}
                    onChange={e => updateField("selectedUser", e.target.value)}
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
                    {membersList.map(user => (
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
                    onChange={e => updateField("amount", e.target.value)}
                    fullWidth
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">🪙</InputAdornment>
                      )
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "green", // default border
                        },
                        "&:hover fieldset": {
                          borderColor: "blue", // hover border
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "purple", // focused border
                        },
                        backgroundColor: "white",
                        color: "black",
                        "@media (prefers-color-scheme: dark)": {
                          backgroundColor: "#1f2937", // Tailwind's gray-800
                          color: "#f9fafb", // Tailwind's gray-50
                        },
                      },
                      "& .MuiInputBase-input": {
                        color: "black",
                        "@media (prefers-color-scheme: dark)": {
                          color: "#f9fafb",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "black",
                        "@media (prefers-color-scheme: dark)": {
                          color: "#f9fafb",
                        },
                      },
                    }}
                  />
                  <Select
                    value={state.token}
                    onChange={e => updateField("token", e.target.value)}
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
                    <MenuItem value="XRP">XRP</MenuItem>
                    <MenuItem value="TokenA">TokenA</MenuItem>
                    <MenuItem value="TokenB">TokenB</MenuItem>
                  </Select>
                </div>
              )}

              <div className="text-center">
                <Button
                  variant="contained"
                  size="large"
                  className="rounded-md w-1/2"
                  onClick={() =>
                    console.log(state.isSell ? "Selling NFT" : "Transferring NFT")
                  }
                >
                  {state.isSell ? (!(selectedNftForOffer.userName === wgtParameters.displayName) ? "Offer Buy" : "Offer Sell") : "Transfer"}
                </Button>
              </div>
            </Box>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ParticipantCard;

