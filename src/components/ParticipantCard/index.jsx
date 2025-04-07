import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation} from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-coverflow";
import { ChevronLeft, ChevronRight } from "lucide-react";
// import { Modal, Select, Dropdown, Menu, Input, Button, Switch, Typography, Space } from "antd";
import { Box, Typography, IconButton, Select, MenuItem, Switch, Modal, Button, Input, Menu, Avatar } from "@mui/material";
import SwipeableViews from "react-swipeable-views";
import { DownOutlined, UserOutlined } from "@ant-design/icons";


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

  const own = myNftData.name === wgtParameters.displayName;
  const nfts = myNftData?.nfts || [];

  const handleStepChange = (step) => {
    setState(prev => ({ ...prev, activeStep: step }));
  };

  const goToPrev = () => {
    setState(prev => ({ ...prev, activeStep: Math.max(prev.activeStep - 1, 0) }));
  };

  const goToNext = () => {
    setState(prev => ({ ...prev, activeStep: Math.min(prev.activeStep + 1, nfts.length - 1) }));
  };

  return (
    <Box className="p-4 border border-gray-200 rounded-2xl bg-white shadow-lg w-full max-w-5xl mx-auto">
      <Box className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Typography variant="h6" className="font-bold text-gray-900">
          {myNftData.name}
        </Typography>

        <Select
          value={state.token}
          // onChange={(e) => updateField('token', e.target.value)}
          className="w-full sm:w-32"
          size="small"
        >
          <MenuItem value="issuer">issuer</MenuItem>
          {/* Add more token options if needed */}
        </Select>

        <Box className="flex items-center gap-2">
          <Typography className={`${state.isOldest ? "text-black" : "text-gray-400"} hidden sm:block`} fontWeight="bold">Oldest</Typography>
          <Switch
            checked={!state.isOldest}
            onChange={toggleSortOrder}
            size="small"
            color="primary"
          />
          <Typography className={`${!state.isOldest ? "text-black" : "text-gray-400"} hidden sm:block`} fontWeight="bold">Newest</Typography>
        </Box>
      </Box>

      <Box className="mt-4 flex items-center justify-center gap-2">
        <IconButton onClick={goToPrev} disabled={state.activeStep === 0}>
          <ChevronLeft size={24} />
        </IconButton>

        <SwipeableViews
          index={state.activeStep}
          onChangeIndex={handleStepChange}
          enableMouseEvents
          className="w-full"
          resistance
        >
          {
            nfts.length > 0 ? nfts.map((nft, i) => (
              <Box key={nft.NFTokenID} className="p-2 sm:p-4 w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
                <NFTCard myNftData={nft} getImageData={getImageData} />
              </Box>
            )) : (
              <Box className="flex items-center justify-center h-32 text-gray-500 font-semibold text-center w-full">
                <p>No NFTs available</p>
              </Box>
            )
          }
        </SwipeableViews>

        <IconButton onClick={goToNext} disabled={state.activeStep >= nfts.length - 1}>
          <ChevronRight size={24} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ParticipantCard;
