import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-coverflow";
import { ChevronLeft, ChevronRight } from "lucide-react";
// import { Modal, Select, Dropdown, Menu, Input, Button, Switch, Typography, Space } from "antd";
import { Box, Typography, IconButton, Select, MenuItem, Switch, Modal, Button, Input, Menu, Avatar } from "@mui/material";
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
  const nfts = myNftData?.nfts || [];
  const updateField = (field, value) => setState((prev) => ({ ...prev, [field]: value }));

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 1024 },
      items: 4,
    },
    desktop: {
      breakpoint: { max: 1024, min: 768 },
      items: 3,
    },
    tablet: {
      breakpoint: { max: 768, min: 640 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 640, min: 0 },
      items: 1,
    },
  };
  
  return (
    <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-lg w-full max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg md:text-xl font-bold text-gray-900">{myNftData.name}</h2>

        <Select
          className="w-full sm:w-32"
          value={state.token}
          onChange={(value) => updateField("token", value)}
          size="large"
        >
          <Select.Option value="issuer">issuer</Select.Option>
        </Select>

        <div className="flex items-center gap-2">
          <Text strong className={state.isOldest ? "text-black hidden sm:block" : "text-gray-400 hidden sm:block"}>
            Oldest
          </Text>
          <Switch
            checked={!state.isOldest}
            onChange={() => updateField("isOldest", !state.isOldest)}
            className="bg-gray-300"
          />
          <Text strong className={!state.isOldest ? "text-black hidden sm:block" : "text-gray-400 hidden sm:block"}>
            Newest
          </Text>
        </div>
      </div>

      <div className="mt-4">
        <Carousel
          responsive={responsive}
          ssr={true}
          infinite={true}
          containerClass="carousel-container"
          itemClass="carousel-item"
          customLeftArrow={<ChevronLeft size={24} />}
          customRightArrow={<ChevronRight size={24} />}
        >
          {myNftData?.nfts?.length > 0 ? (
            myNftData.nfts.map((nft) => (
              <div key={nft.NFTokenID} className="p-2">
                <NFTCard myNftData={nft} getImageData={getImageData} />
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500 font-semibold text-center w-full">
              <p>No NFTs available</p>
            </div>
          )}
        </Carousel>
      </div>
    </div>
  );
};

export default ParticipantCard;
