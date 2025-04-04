import React, { useEffect, useState, ReactElement } from "react";
import { useWidgetApi } from '@matrix-widget-toolkit/react';
import { Tabs, Tab, Box } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { STATE_EVENT_ROOM_MEMBER } from "@matrix-widget-toolkit/api";
import { map } from 'rxjs';
import axios from "axios";
import NFTs from "../pages/NFTs";
import Offers from "../pages/Offers";
import API_URLS from "../config";
import nft_default_pic from "../assets/nft.png";

const hexToAscii = (str) => {
  var hexString = str?.toString();
  var strOut = "";
  for (var i = 0; i < hexString?.length; i += 2) {
    strOut += String.fromCharCode(parseInt(hexString.substr(i, 2), 16));
  }
  return strOut;
};

const getImageData = async (nft) => {
  let URI = "";
  URI = hexToAscii(nft?.uri).toString();
  let name = "";

  if (URI === "") {
    try {
      const metadataUrl = `${API_URLS.marketPlace}/api/metadata/${nft?.NFTokenID}`;
      const response = await axios.get(metadataUrl);
      URI = response.data.image;
      name = response.data.name;
    } catch (error) {
      console.log("Error fetching metadata:", error);
    }
  }

  if( URI === "" || URI === undefined || URI === null) {
    URI = nft_default_pic.toString();
    return URI;
  }

  if (URI.startsWith("ipfs")) {
    const httpNftUrl = URI.replace("ipfs://", "https://ipfs.io/ipfs/");
    URI = httpNftUrl;
    // console.log("umang okate URI", httpNftImageUrl);
    // await axios
    //   .get(httpNftUrl)
    //   .then((response) => {
    //     const nftImageUrl = response.data.image || URI;
    //     const httpNftImageUrl = nftImageUrl.replace(
    //       "ipfs://",
    //       "https://ipfs.io/ipfs/"
    //     );
    //     name = response.data.name || name;
    //     URI = httpNftImageUrl;
    //     // console.log("after replace URI", URI);
    //   })
    //   .catch((error) => console.log("Error fetching NFT data:", error));
  }

  if (URI.includes("json")) {
    // console.log("umang okate URI", URI);
    await axios
      .get(URI)
      .then((response) => {
        // console.log("uamng response", response);
        let nftImageUrl = response.data.image || URI;
        // console.log(nftImageUrl, "ukang nftImageURL");
        name = response.data.name || name;
        URI = nftImageUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
        // console.log("JSON URI", URI);
      })
      .catch((error) => console.log("Error umang fetching NFT data:", error));
  }
  nft.URI = URI;
  nft.name = name;

  // console.log("return URI", URI);
  return URI;
};

const MatrixClientProvider = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const widgetApi = useWidgetApi();
  const wgtParameters = widgetApi.widgetParameters
  const [myNftData, setMyNftData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      console.log("widgetApi.widgetParameters : ", wgtParameters);

      try {
        // Load members
        const events = await widgetApi.receiveStateEvents(STATE_EVENT_ROOM_MEMBER);
        const membersList = events.map(item => ({
          name: item.content.displayname,
          userId: item.sender
        }));
        console.log("formattedMembers :", membersList);
        // setMembers(membersList);

        // Now that we have members, extract userIds
        const userIds = membersList.map(member => member.userId.split(":")[0].replace("@", ""));
        console.log("userIds :", userIds);

        // Fetch NFT data
        console.log("Fetching NFT data for addresses:", userIds);
        const response = await fetch(`${API_URLS.backendUrl}/get-users-nfts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            addresses: userIds
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch NFT data");
        }

        const data = await response.json();
        console.log("NFT data (JSON) :", data);
        
        console.time("------------ start");
        // Now merge members with their NFT data
        const mergedMembers = await Promise.all(
          membersList.map(async (member) => {
            const walletAddress = member.userId.split(":")[0].replace("@", "");
            const nfts = data[walletAddress] || [];
        
            const enrichedNfts = await Promise.all(
              nfts.map(async (nft) => {
                const imageURI = await getImageData(nft);
                return {
                  ...nft,
                  imageURI, // add image URI for rendering
                };
              })
            );
        
            return {
              ...member,
              walletAddress,
              nfts: enrichedNfts,
            };
          })
        );
        console.timeEnd("------------ End");

        console.log("Merged members with NFT data:", mergedMembers);
        setMyNftData(mergedMembers);

      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, [widgetApi]);

  const panelVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  return (
    <Box sx={{ width: "100%", borderRadius: 2, boxShadow: 1 }}>
      <Tabs
        value={selectedIndex}
        onChange={(event, newIndex) => setSelectedIndex(newIndex)}
        variant="fullWidth"
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab label="NFTs" />
        <Tab label="Offers" />
      </Tabs>
      <Box sx={{ p: 2, position: "relative", overflow: "hidden" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedIndex}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            {selectedIndex === 0 ? <NFTs myNftData={myNftData} getImageData={getImageData} wgtParameters={wgtParameters} /> : <Offers />}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>

  );
};

export default MatrixClientProvider;
