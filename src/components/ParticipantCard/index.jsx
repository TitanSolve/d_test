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
    collection: "Issuer"
  });

  const xrpl = require('xrpl');

  const [filterType, setFilterType] = useState("issuer"); // Default mode
  const [filteredNfts, setFilteredNfts] = useState(myNftData.groupedNfts); // Default to Issuer grouping
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedNFTGroup, setSelectedNFTGroup] = useState(null);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [selectedNftForOffer, setSelectedNftForOffer] = useState(null);

  const toggleSellMode = () => setState(prev => ({ ...prev, isSell: !prev.isSell }));
  const updateField = (field, value) =>
    setState((prev) => ({ ...prev, [field]: value }));

  const responsive = {
    superLargeDesktop: { breakpoint: { max: 4000, min: 1280 }, items: 4 },
    desktop: { breakpoint: { max: 1280, min: 700 }, items: 3 },
    tablet: { breakpoint: { max: 700, min: 400 }, items: 2 },
    mobile: { breakpoint: { max: 400, min: 0 }, items: 1 },
  };

  const openPreviewModal = (group) => {
    setSelectedNFTGroup(group);
    setPreviewModalOpen(true);
  };

  const closePreviewModal = () => {
    setPreviewModalOpen(false);
    setSelectedNFTGroup(null);
  };

  const openOfferModal = async (nft) => {
    setSelectedNftForOffer(nft);

    const client = new xrpl.Client("wss://xrplcluster.com/");
    await client.connect();
    console.log("Connected to wss://xrplcluster.com/.");

    const response = await client.request({
      command: 'nft_info',
      nft_id: nft.NFTokenID
    });

    console.log("response------->", response);

    const nftData = response.result;
    console.log("nftData------->", nftData);
    const uriHex = nftData.URI;
    console.log("uriHex------->", uriHex);

    if (!uriHex) {
      throw new Error('No URI found for this NFT');
    }

    // Step 3: Decode the URI from hexadecimal
    const uri = xrpl.convertHexToString(uriHex);
    console.log("------------>URI", uri);

    // Step 4: Fetch the metadata (assuming an HTTP URL)
    const metadataResponse = await axios.get(uri);
    console.log("metadataResponse------>", metadataResponse);
    const metadata = metadataResponse.data;
    console.log("metadataResponse.data------>", metadataResponse.data);

    // Step 5: Extract traits (assuming ERC-721-like standard)
    const traits = metadata.attributes;
    console.log("traits------>", traits);

    setOfferModalOpen(true);
  };

  const closeOfferModal = () => {
    setOfferModalOpen(false);
    setSelectedNftForOffer(null);
  };

  useEffect(() => {
    console.log(`NFT grouping changed to: ${filterType}`);

    // Grouping logic
    const regrouped = {};
    myNftData.groupedNfts.flatMap(group =>
      group.nfts.forEach(nft => {
        const key = filterType === "issuer" ? nft.Issuer : nft.NFTokenTaxon;
        if (!regrouped[key]) regrouped[key] = [];
        regrouped[key].push(nft);
      })
    );

    const newGrouped = Object.entries(regrouped).map(([key, nfts]) => ({
      [filterType]: key,
      nfts
    }));

    setFilteredNfts(newGrouped);

    console.log("Filtered NFTs:", newGrouped);

  }, [filterType, myNftData]);

  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
  };

  return (
    <div className="p-4 border border-gray-200 rounded-2xl shadow-lg w-full max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Typography variant="h6" className="font-bold">
          {myNftData.name === wgtParameters.displayName ? "My NFTs" : myNftData.name}
        </Typography>

        <FormControl size="small" className="w-full sm:w-32">
          <InputLabel id={`token-select-label-${index}`}>NFTs</InputLabel>
          <Select
            labelId={`token-select-label-${index}`}
            id={`token-select-${index}`}
            value={filterType}
            label="NFTs"
            onChange={handleFilterChange}
          >
            <MenuItem value="issuer">Issuer</MenuItem>
            <MenuItem value="taxon">Taxon</MenuItem>
          </Select>
        </FormControl>

        {/* <div className="flex items-center gap-2 hidden sm:flex">
          <Typography
            variant="body2"
            className={state.isOldest ? "text-black font-semibold" : "text-gray-400"}
          >
            Oldest
          </Typography>
          <Switch
            checked={!state.isOldest}
            onChange={() => updateField("isOldest", !state.isOldest)}
            color="primary"
          />
          <Typography
            variant="body2"
            className={!state.isOldest ? "text-black font-semibold" : "text-gray-400"}
          >
            Newest
          </Typography>
        </div> */}
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
              className="absolute left-2 md:left-4 top-1/2 z-20 -translate-y-1/2 bg-white text-gray-800 shadow-md p-2 md:p-3 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
              aria-label="Previous"
            >
              <ChevronLeft size={20} className="md:size-6" />
            </button>
          }
          customRightArrow={
            <button
              className="absolute right-2 md:right-4 top-1/2 z-20 -translate-y-1/2 bg-white text-gray-800 shadow-md p-2 md:p-3 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
              aria-label="Next"
            >
              <ChevronRight size={20} className="md:size-6" />
            </button>
          }
        >
          {filteredNfts.length > 0 ? (
            filteredNfts.map((groupedNft, idx) => (
              <div key={idx} onClick={() => openPreviewModal(groupedNft)} className="cursor-pointer">
                {/* <div key={idx} onClick={() => openOfferModal(nft)} className="cursor-pointer hover:scale-105 transition-transform duration-300"></div> */}
                <NFTCard myNftData={groupedNft} isGroup={true} isImgOnly={false} />
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-32 font-semibold text-center w-full">
              <p>No NFTs available</p>
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
        <Box className="absolute top-1/2 left-1/2 w-11/12 bg-white rounded-2xl shadow-2xl transform -translate-x-1/2 -translate-y-1/2 p-4 sm:p-6 md:p-8 outline-none border border-gray-200">
          <Typography variant="h6" className="font-bold overflow-hidden">
            {selectedNFTGroup && (
              filterType === "issuer" ? "Issuer : " + selectedNFTGroup.nfts[0].Issuer : "Taxon : " + selectedNFTGroup.nfts[0].NFTokenTaxon
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
                <button className="absolute left-2 md:left-4 top-1/2 z-20 -translate-y-1/2 bg-white text-gray-800 shadow-lg p-2 md:p-3 rounded-full hover:bg-gray-100 transition duration-200 ease-in-out">
                  <ChevronLeft size={20} />
                </button>
              }
              customRightArrow={
                <button className="absolute right-2 md:right-4 top-1/2 z-20 -translate-y-1/2 bg-white text-gray-800 shadow-lg p-2 md:p-3 rounded-full hover:bg-gray-100 transition duration-200 ease-in-out">
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
              className="bg-white rounded-xl p-6 shadow-lg max-w-[90%] md:max-w-[500px] w-full mx-auto top-1/2 left-1/2 absolute transform -translate-x-1/2 -translate-y-1/2"
            >
              <NFTCard myNftData={selectedNftForOffer} isGroup={false} isImgOnly={true} />
              <Typography
                variant="subtitle1"
                className="text-center font-semibold text-black"
              >
                {selectedNftForOffer.originTokenName}
              </Typography>

              <Typography variant="subtitle2" className="text-center font-semibold text-black overflow-hidden" >
                Issuer : {selectedNftForOffer.Issuer}
              </Typography>
              <Typography variant="subtitle2" className="text-center font-semibold text-black" >
                TransferFee : {selectedNftForOffer.TransferFee}
              </Typography>

              {!(selectedNftForOffer.userName === wgtParameters.displayName) && (
                <Typography
                  variant="h5"
                  className="text-center font-semibold text-black"
                >
                  Offer to buy from {selectedNftForOffer.userName}
                </Typography>
              )}

              {(selectedNftForOffer.userName === wgtParameters.displayName) && (
                <>
                  <div className="flex justify-center items-center gap-4">
                    <Typography
                      className={`font-medium ${state.isSell ? "text-black" : "text-gray-400"
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
                      className={`font-medium ${!state.isSell ? "text-black " : "text-gray-400"
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
                    className="mb-4 bg-white rounded"
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
                  />
                  <Select
                    value={state.token}
                    onChange={e => updateField("token", e.target.value)}
                    fullWidth
                    size="small"
                    className="bg-white rounded"
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

