import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-coverflow";
import './index.css';
import nft_pic from "../../assets/nft.png";
import { ChevronLeft, ChevronRight } from "lucide-react";
import LazyLoad from 'react-lazyload';

import {
  Typography,
  Select,
  MenuItem,
  Switch,
  FormControl,
  InputLabel,
  Modal,
  Box,
  TextField,
  Button,
  InputAdornment
} from "@mui/material";
import { DownOutlined, UserOutlined } from "@ant-design/icons";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";


import NFTCard from "../NFT-Card";

const { Text } = Typography;

const ParticipantCard = ({ index, membersList, myNftData, wgtParameters, getImageData }) => {
  const [state, setState] = useState({
    sortOrder: "newest",
    isSell: true,
    isOldest: true,
    selectedUser: "Alice @rPdshidjjore",
    amount: "",
    token: "XRP"
  });

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedNFTGroup, setSelectedNFTGroup] = useState(null);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [selectedNftForOffer, setSelectedNftForOffer] = useState(null);

  const toggleSellMode = () => setState(prev => ({ ...prev, isSell: !prev.isSell }));
  const updateField = (field, value) =>
    setState((prev) => ({ ...prev, [field]: value }));

    const responsive = {
      superLargeDesktop: {
        breakpoint: { max: 4000, min: 1280 },
        items: 4,
      },
      desktop: {
        breakpoint: { max: 1280, min: 1024 },
        items: 3,
      },
      tablet: {
        breakpoint: { max: 1024, min: 640 },
        items: 2,
      },
      mobile: {
        breakpoint: { max: 640, min: 0 },
        items: 1,
      },
    };

  const openPreviewModal = (group) => {
    setSelectedNFTGroup(group);
    setPreviewModalOpen(true);
  };

  const closePreviewModal = () => {
    setPreviewModalOpen(false);
    setSelectedNFTGroup(null);
  };

  const openOfferModal = (nft) => {
    setSelectedNftForOffer(nft);
    setOfferModalOpen(true);
  };

  const closeOfferModal = () => {
    setOfferModalOpen(false);
    setSelectedNftForOffer(null);
  };

  return (
    <div className="p-4 border border-gray-200 rounded-2xl shadow-lg w-full max-w-5xl">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Typography variant="h6" className="font-bold">
          {myNftData.name === wgtParameters.displayName ? "My NFTs" : myNftData.name}
        </Typography>

        {/* <FormControl size="small" className="w-full sm:w-32">
          <InputLabel id={`token-select-${index}`}>Token</InputLabel>
          <Select
            labelId={`token-select-${index}`}
            id={`token-select-${index}`}
            value={state.token}
            label="Token"
            onChange={(e) => updateField("token", e.target.value)}
          >
            <MenuItem value="issuer">issuer</MenuItem>
          </Select>
        </FormControl> */}

        <div className="flex items-center gap-2 hidden sm:flex">
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
        </div>
      </div>

      {/* Carousel Section */}
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
            {myNftData.groupedNfts.length > 0 ? (
              myNftData.groupedNfts.map((groupedNft, idx) => (
                <div key={idx} onClick={() => openPreviewModal(groupedNft)} className="cursor-pointer">
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
                className="text-center font-semibold text-black mb-4"
              >
                {selectedNftForOffer.name}
              </Typography>

              {!(selectedNftForOffer.userName === wgtParameters.displayName) && (
                <Typography
                  variant="subtitle1"
                  className="text-center font-semibold text-black mb-4"
                >
                  Offer to buy from {selectedNftForOffer.userName}
                </Typography>
              )}

              {(selectedNftForOffer.userName === wgtParameters.displayName) && (
                <>
                  <div className="flex justify-center items-center gap-4 mb-4">
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
