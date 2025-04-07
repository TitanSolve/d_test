import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-coverflow";
import './index.css';
import { ChevronLeft, ChevronRight } from "lucide-react";
// import { Modal, Select, Dropdown, Menu, Input, Button, Switch, Typography, Space } from "antd";
import {
  Typography,
  Select,
  MenuItem,
  Switch,
  FormControl,
  InputLabel,
  Modal,
  Box,
} from "@mui/material";
import { DownOutlined, UserOutlined } from "@ant-design/icons";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";


import NFTCard from "../NFT-Card";

const { Text } = Typography;

const ParticipantCard = ({ index, myNftData, wgtParameters, getImageData }) => {
  const [state, setState] = useState({
    sortOrder: "newest",
    isModalOpen: false,
    isSell: true,
    isOldest: true,
    selectedUser: "Alice @rPdshidjjore",
    amount: "",
    token: "XRP"
  });

  const toggleModal = () => setState(prev => ({ ...prev, isModalOpen: !prev.isModalOpen }));
  const toggleSortOrder = () => setState(prev => ({ ...prev, isOldest: !prev.isOldest }));
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

  const openModalWithGroup = (group) => {
    setState((prev) => ({
      ...prev,
      isModalOpen: true,
      selectedGroup: group,
    }));
  };

  const closeModal = () =>
    setState((prev) => ({
      ...prev,
      isModalOpen: false,
      selectedGroup: null,
    }));

  return (
    <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-lg w-full max-w-5xl">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Typography variant="h6" className="text-gray-900 font-bold">
          {myNftData.name === wgtParameters.displayName ? "My NFTs" : myNftData.name}
        </Typography>

        <FormControl size="small" className="w-full sm:w-32">
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
        </FormControl>

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
          swipeable={true}
          centerMode={true}
          containerClass="carousel-container "
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
              <NFTCard key={idx} myNftData={groupedNft} handleClick={() => openModalWithGroup(groupedNft)} />
            ))
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500 font-semibold text-center w-full">
              <p>No NFTs available</p>
            </div>
          )}
        </Carousel>
      </div>

      <Modal
        open={state.isModalOpen}
        onClose={closeModal}
        aria-labelledby="nft-modal-title"
        aria-describedby="nft-modal-description"
      >
        <Box className="absolute top-1/2 left-1/2 w-11/12 sm:w-3/4 md:w-2/3 lg:w-1/2 bg-white rounded-xl shadow-lg transform -translate-x-1/2 -translate-y-1/2 p-6 outline-none">
          <Carousel
            responsive={responsive}
            ssr={true}
            infinite={false}
            draggable={true}
            swipeable={true}
            centerMode={true}
            containerClass="carousel-container"
            itemClass="carousel-item flex justify-center items-center px-2"
            customLeftArrow={
              <button className="absolute left-2 md:left-4 top-1/2 z-20 -translate-y-1/2 bg-white text-gray-800 shadow-md p-2 md:p-3 rounded-full hover:bg-gray-100">
                <ChevronLeft size={20} />
              </button>
            }
            customRightArrow={
              <button className="absolute right-2 md:right-4 top-1/2 z-20 -translate-y-1/2 bg-white text-gray-800 shadow-md p-2 md:p-3 rounded-full hover:bg-gray-100">
                <ChevronRight size={20} />
              </button>
            }
          >
            {state.selectedGroup &&
              state.selectedGroup.map((nftItem, idx) => (
                <NFTCard key={idx} myNftData={[nftItem]} handleClick={() => {}} />
              ))}
          </Carousel>
        </Box>
      </Modal>
    </div>
  );
};

export default ParticipantCard;
