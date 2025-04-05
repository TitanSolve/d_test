import React, { useState } from "react";
import nft_pic from "../../assets/nft.png";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Modal, Select, Dropdown, Menu, Input, Button, Switch, Typography, Space } from "antd";
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
  const [loading, setLoading] = useState(false);

  const toggleModal = () => setState(prev => ({ ...prev, isModalOpen: !prev.isModalOpen }));
  const toggleSortOrder = () => setState(prev => ({ ...prev, isOldest: !prev.isOldest }));
  const toggleSellMode = () => setState(prev => ({ ...prev, isSell: !prev.isSell }));
  const updateField = (field, value) => setState(prev => ({ ...prev, [field]: value }));

  const own = myNftData.name === wgtParameters.displayName;

  const userMenu = (
    <Menu onClick={(e) => updateField('selectedUser', e.key)}>
      {["Alice @rPdshidjjore", "Bob @xTysidjjqwe", "Cevin @xTysidjjqwe", "David @xTysidjjqwe"].map(user => (
        <Menu.Item key={user}>
          <Space>
            <UserOutlined />
            {user}
          </Space>
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <>
      <div className="p-2 border border-gray-200 rounded-2xl bg-white shadow-lg w-full max-w-5xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">
            {wgtParameters.displayName}
          </h2>
          <Select
            className="w-24 md:w-32"
            value={state.token}
            onChange={(value) => updateField('token', value)}
            size="large"
          >
            <Select.Option value="issuer">issuer</Select.Option>
          </Select>
          <div className="flex items-center gap-4">
            <Text strong className={state.isOldest ? "text-black hidden sm:block " : "text-gray-400 hidden sm:block"}>Oldest</Text>
            <Switch
              checked={!state.isOldest}
              onChange={toggleSortOrder}
              checkedChildren="Newest"
              unCheckedChildren="Oldest"
              className="bg-gray-300"
            />
            <Text strong className={!state.isOldest ? "text-black hidden sm:block" : "text-gray-400 hidden sm:block"}>Newest</Text>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 space-x-4">
          <button className={`swiper-button-prev-${index} bg-gray-800 hover:bg-gray-700 text-white p-2 md:p-3 rounded-full shadow-lg transition-transform transform hover:scale-110 focus:ring-4 focus:ring-purple-500`}>
            <ChevronLeft size={24} />
          </button>
          <Swiper
            spaceBetween={10}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 }, // Tablets
              768: { slidesPerView: 3 }, // Small desktops
              1024: { slidesPerView: 4 } // Large screens
            }}
            navigation={{ nextEl: `.swiper-button-next-${index}`, prevEl: `.swiper-button-prev-${index}` }}
            // pagination={{ clickable: true }}
            modules={[Navigation]}
            className="rounded-lg overflow-hidden shadow-xl"
          >
            {
              // myNftData.nfts.length > 0 ?
                myNftData.nfts.map((nft) => (
                  <SwiperSlide key={nft.NFTokenID}>
                      <NFTCard myNftData={nft} getImageData={getImageData} />
                  </SwiperSlide>
                ))
                // :
                // <div className="flex flex-col items-center justify-center h-32 text-gray-500 font-semibold text-center">
                //   <p>No NFTs available</p>
                // </div>
            }
          </Swiper>
          <button className={`swiper-button-next-${index} bg-gray-800 hover:bg-gray-700 text-white p-2 md:p-3 rounded-full shadow-lg transition-transform transform hover:scale-110 focus:ring-4 focus:ring-purple-500`}>
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      <Modal
        open={state.isModalOpen}
        onCancel={toggleModal}
        footer={null}
        centered
        closable={false}
        maskClosable={true}
        bodyStyle={{
          borderRadius: '10px',
          padding: "16px"
        }}
        style={{ width: "80%" }}
      >
        <div>
          <img
            src={nft_pic || "/placeholder-image.jpg"}
            alt="NFT"
            className="w-32 h-32 object-cover rounded-md mx-auto mb-3 shadow-lg"
          />

          {!own && (
            <div className="mb-3 flex justify-center">
              <Text strong className="text-black text-center">Offer to buy from Bob</Text>
            </div>
          )}

          {own && (
            <div>
              <div className="flex justify-center items-center gap-4 mb-3">
                <Text strong className={state.isSell ? "text-black" : "text-gray-400"}>Sell</Text>
                <Switch
                  checked={!state.isSell}
                  onChange={toggleSellMode}
                  checkedChildren="Transfer"
                  unCheckedChildren="Sell"
                  className="bg-gray-300"
                />
                <Text strong className={!state.isSell ? "text-black" : "text-gray-400"}>Transfer</Text>
              </div>
              <Dropdown overlay={userMenu} trigger={["click"]} className="mb-3">
                <Button block size="large">
                  <Space>
                    {state.selectedUser}
                    <DownOutlined />
                  </Space>
                </Button>
              </Dropdown>
            </div>
          )}

          {state.isSell && (
            <div className="flex flex-col md:flex-row gap-2 w-full mb-4">
              <Input
                type="number"
                placeholder="Amount"
                value={state.amount}
                onChange={(e) => updateField('amount', e.target.value)}
                size="large"
                className="border rounded"
              />
              <Select
                className="w-full md:w-24"
                value={state.token}
                onChange={(value) => updateField('token', value)}
                size="large"
              >
                <Select.Option value="XRP">XRP</Select.Option>
                <Select.Option value="TokenA">TokenA</Select.Option>
                <Select.Option value="TokenB">TokenB</Select.Option>
              </Select>
            </div>
          )}

          <div className="flex justify-center">
            <Button
              type="primary"
              block
              size="large"
              onClick={() => console.log(state.isSell ? "Selling NFT" : "Transferring NFT")}
              style={{ borderRadius: "6px", width: "30%", alignItems: "center" }}
            >
              {state.isSell ? (!own ? "Offer Buy" : "Offer Sell") : "Transfer"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ParticipantCard;
