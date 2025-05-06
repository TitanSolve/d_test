import React, { useEffect, useState } from "react";
import { useWidgetApi } from '@matrix-widget-toolkit/react';
import { Tabs, Tab, Box, Typography, CircularProgress } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { STATE_EVENT_ROOM_MEMBER } from "@matrix-widget-toolkit/api";
import axios from "axios";
import NFTs from "../pages/NFTs";
import Offers from "../pages/Offers";
import API_URLS from "../config";
import xrpl from "xrpl"
import nft_default_pic from "../assets/nft.png";
import { WidgetApi } from "matrix-widget-api";
import { Tooltip } from "@mui/material";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import "./index.css"
import { Buffer } from "buffer";
import LoadingOverlay from "./LoadingOverlay";

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
  let name = nft.name;

  try {
    const metadataUrl = `${API_URLS.marketPlace}/api/metadata/${nft?.NFTokenID}`;
    const response = await axios.get(metadataUrl);
    URI = response.data.image.replace("ipfs://", "https://ipfs.io/ipfs/");
    name = response.data.name;
  } catch (error) {
    console.log("Error fetching metadata:", error);
  }
  return { name: name, URI: URI };
};

const decodeCurrency = (currency) => {
  try {
    // Return standard 3-letter codes directly
    if (currency.length <= 3) return currency

    // Check if it's a 40-char hex string
    const isHex = /^[A-Fa-f0-9]{40}$/.test(currency)
    if (!isHex) return currency

    // Attempt to decode buffer to ASCII
    const buf = Buffer.from(currency, 'hex')
    const ascii = buf.toString('ascii').replace(/\0/g, '').trim()

    // If the decoded value is printable ASCII, return it
    const isPrintable = /^[\x20-\x7E]+$/.test(ascii)
    return isPrintable ? ascii : currency
  } catch (e) {
    return currency
  }
}

async function getTrustLinesAsArray(wallets) {
  const xrpl = require('xrpl');
  const client = new xrpl.Client(API_URLS.xrplMainnetUrl) // mainnet
  await client.connect()

  // const info = await client.request({
  //   command: "account_info",
  //   account: "r9syfthWEycVKuy9bz2awsxrTNK3NBBT6h",
  //   ledger_index: "validated"
  // });
  // console.log("-------Account info: ", info);

  const trustLinesArray = []

  for (const address of wallets) {
    try {
      const response = await client.request({
        command: "account_lines",
        account: address,
      })

      const decodedLines = response.result.lines.map(line => ({
        ...line,
        currency: line.currency,
        decodedCurrency: decodeCurrency(line.currency)
      }))

      trustLinesArray.push({
        wallet: address,
        trustLines: decodedLines
      })
    } catch (err) {
      trustLinesArray.push({
        wallet: address,
        error: err.data?.error_message || err.message,
        trustLines: []
      })
    }
  }

  await client.disconnect()
  return trustLinesArray;
}

const MatrixClientProvider = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const widgetApi = useWidgetApi();
  const [myNftData, setMyNftData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [membersList, setMembersList] = useState([]);
  const { theme, toggleTheme } = useTheme();
  const [myOwnWalletAddress, setMyWalletAddress] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await widgetApi.sendRoomEvent("m.room.message", {
          body: "Hello from the widget!",});
        console.log("Response from sendRoomEvent: ", res);

        
        const events = await widgetApi.receiveStateEvents(STATE_EVENT_ROOM_MEMBER);
        const usersList = events.map(item => ({
          name: item.content.displayname,
          userId: item.sender
        }));

        const userIds = usersList.map(member => member.userId.split(":")[0].replace("@", ""));
        console.log("userIds : ", userIds);
        const trustLinesArray = await getTrustLinesAsArray(userIds);

        const own = usersList.find((u) => u.name === widgetApi.widgetParameters.displayName);
        const ownWalletAddress = own.userId?.split(":")[0].replace("@", "");
        console.log("ownWalletAddress : ", ownWalletAddress);
        setMyWalletAddress(ownWalletAddress);

        const usersWithTrustLines = usersList.map(user => {
          const walletAddress = user.userId.split(":")[0].replace("@", "")
          const trustData = trustLinesArray.find(t => t.wallet === walletAddress)
          return {
            ...user,
            trustLines: trustData?.trustLines || [],
            trustLineError: trustData?.error || null
          }
        })

        console.log("usersWithTrustLines : ", usersWithTrustLines);

        setMembersList(usersWithTrustLines);

        const nft_list = {}; // Use object to group by wallet

        for (const walletAddress of userIds) {
          try {
            const response = await fetch(`${API_URLS.marketPlace}/api/v2/nfts?owner=${walletAddress}`, {
              method: "GET",
              headers: {
                "x-bithomp-token": "0b833219-c387-4b3f-9606-0e4bd82e5862"
              }
            });

            if (!response.ok) {
              throw new Error("Failed to fetch NFT data");
            }

            const data = await response.json();
            const nfts = data.nfts || [];

            const enrichedNfts = await Promise.all(
              nfts.map(async (nft) => {
                const imageURI = nft.metadata?.image?.replace("ipfs://", "https://ipfs.io/ipfs/") || "";
                return {
                  ...nft,
                  imageURI,
                  ownerUsername: nft.ownerDetails?.username || null,
                  collectionName: nft.collection || null
                };
              })
            );

            nft_list[walletAddress] = enrichedNfts; // Assign to wallet key
          } catch (error) {
            console.error(`Error fetching NFTs for ${walletAddress}:`, error.message);
          }
        }

        console.log("Grouped NFT list by wallet:", nft_list);


        // const response = await fetch(`${API_URLS.backendUrl}/get-users-nfts`, {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({
        //     addresses: userIds
        //   }),
        // });

        // if (!response.ok) {
        //   throw new Error("Failed to fetch NFT data");
        // }
        // const data = await response.json();

        // console.log("NFT data:----------------->", data);

        const mergedMembers = await Promise.all(
          usersList.map(async (member) => {
            const walletAddress = member.userId.split(":")[0].replace("@", "");
            const nfts = nft_list[walletAddress] || [];

            const enrichedNfts = await Promise.all(
              nfts.map(async (nft) => {
                const userName = member.name;
                const userId = member.userId;
                return {
                  ...nft,
                  userName,
                  userId
                };
              })
            );

            // Group by Collection
            const collectionMap = {};
            enrichedNfts.forEach((nft) => {
              const key = nft.metadata?.collection?.name || nft.collection; // Create a unique key combining Issuer and Taxon

              if (!collectionMap[key]) {
                collectionMap[key] = [];
              }
              collectionMap[key].push(nft);
            });

            // Convert map to sorted array
            const groupedNfts = Object.entries(collectionMap)
              .map(([key, nfts]) => ({
                collection: String(key),
                nfts,
              }))
              .sort((a, b) => a.collection.localeCompare(b.collection)); // Sort by collection name

            return {
              ...member,
              walletAddress,
              groupedNfts, // Array of { Issuer, NFTokenTaxon, nfts }
            };
          })
        );
        console.log("Merged members with NFT data:", mergedMembers);
        setMyNftData(mergedMembers);



        //load Offer data
        // const client = new xrpl.Client(API_URLS.xrplMainnetUrl);
        // console.log("Connecting to ", API_URLS.xrplMainnetUrl);
        // await client.connect();
        // console.log("Connected to ", API_URLS.xrplMainnetUrl);

        // let allTxs = [];
        // let marker = null;

        // do {
        //   const response = await client.request({
        //     command: "account_tx",
        //     account: "r34VdeAwi8qs1KF3DTn5T3Y5UAPmbBNWpX",
        //     limit: 200,
        //     ...(marker && { marker }) // only include marker if it exists
        //   })

        //   const txs = response.result.transactions
        //   allTxs.push(...txs)
        //   marker = response.result.marker // if there's more, marker will exist
        // } while (marker)

        // console.log("Offers data:---------->", allTxs);

        // const incomingNFTs = [];
        // for (const tx of allTxs) {
        //   const meta = tx.meta
        //   const nodes = meta?.AffectedNodes || [];

        //   let receivedNFTId = null;
        //   let sender = null;

        //   for (const node of nodes) {
        //     // Look for DeletedNode of type NFTokenOffer
        //     if (
        //       node.DeletedNode?.LedgerEntryType === "NFTokenOffer" &&
        //       node.DeletedNode?.FinalFields?.Destination === "r34VdeAwi8qs1KF3DTn5T3Y5UAPmbBNWpX"
        //     ) {
        //       receivedNFTId = node.DeletedNode.FinalFields.NFTokenID
        //       sender = node.DeletedNode.FinalFields.Owner
        //     }
        //   }

        //   if (receivedNFTId) {
        //     incomingNFTs.push({
        //       tokenId: receivedNFTId,
        //       from: sender,
        //       txHash: tx.hash,
        //       date: tx.close_time_iso
        //     })
        //   }
        // }

        // console.log("incomingNFTs----->", incomingNFTs);

      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [widgetApi]);

  const panelVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  const refreshOffers = () => {
    console.log("Refresh Offers");
  }

  return (
    <>
      {loading ? (
        <LoadingOverlay message="Loading..." />
      ) : (
        < Box sx={{
          width: "100%",
          borderRadius: 2,
          boxShadow: 1,
          bgcolor: "background.paper",
          transition: "background-color 0.3s ease",
        }}
          className="dark:bg-[#15191E] dark:text-white bg-white text-black"
        >
          {/* Toggle Button */}
          <Tooltip title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`} arrow>
            <button
              onClick={toggleTheme}
              className="fixed top-4 right-4 z-50 p-2 md:p-3 rounded-full bg-gray-100 dark:bg-[#15191E] text-gray-800 dark:text-white shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out border border-gray-300 dark:border-gray-700 backdrop-blur-md"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
          </Tooltip>

          <Tabs
            value={selectedIndex}
            onChange={(event, newIndex) => setSelectedIndex(newIndex)}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab
              label="NFTs"
              className="text-black dark:text-white"
            />
            <Tab
              label="Offers"
              className="text-black dark:text-white"
            />
          </Tabs>
          <Box sx={{ p: 2, position: "relative", overflow: "hidden" }}>
            <AnimatePresence mode="wait">
              <motion.div
                
                variants={panelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <div style={{ display: selectedIndex === 0 ? "block" : "none" }}>
                  <NFTs membersList={membersList} myNftData={myNftData} getImageData={getImageData} wgtParameters={widgetApi.widgetParameters} refreshOffers={refreshOffers} />
                </div>
                <div style={{ display: selectedIndex === 1 ? "block" : "none" }}>
                  <Offers myWalletAddress={myOwnWalletAddress} membersList={membersList} myNftData={myNftData} />
                </div>

              </motion.div>
            </AnimatePresence>
          </Box>
        </Box >
      )
      }
    </>
  );
};

export default MatrixClientProvider;

