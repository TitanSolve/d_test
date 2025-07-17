import React, { useEffect, useState } from "react";
import { useWidgetApi } from "@matrix-widget-toolkit/react";
import { Tabs, Tab, Box, Typography, CircularProgress } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { STATE_EVENT_ROOM_MEMBER } from "@matrix-widget-toolkit/api";
import axios from "axios";
import NFTs from "../pages/NFTs";
import Offers from "../pages/Offers";
import API_URLS from "../config";
import xrpl from "xrpl";
import nft_default_pic from "../assets/nft.png";
import { WidgetApi } from "matrix-widget-api";
import { Tooltip } from "@mui/material";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import "./index.css";
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
    if (currency.length <= 3) return currency;

    // Check if it's a 40-char hex string
    const isHex = /^[A-Fa-f0-9]{40}$/.test(currency);
    if (!isHex) return currency;

    // Attempt to decode buffer to ASCII
    const buf = Buffer.from(currency, "hex");
    const ascii = buf.toString("ascii").replace(/\0/g, "").trim();

    // If the decoded value is printable ASCII, return it
    const isPrintable = /^[\x20-\x7E]+$/.test(ascii);
    return isPrintable ? ascii : currency;
  } catch (e) {
    return currency;
  }
};

async function getTrustLinesAsArray(wallets) {
  const xrpl = require("xrpl");
  const client = new xrpl.Client(API_URLS.xrplMainnetUrl); // mainnet
  await client.connect();
  const trustLinesArray = [];
  for (const address of wallets) {
    try {
      const response = await client.request({
        command: "account_lines",
        account: address,
      });

      const decodedLines = response.result.lines.map((line) => ({
        ...line,
        currency: line.currency,
        decodedCurrency: decodeCurrency(line.currency),
      }));

      trustLinesArray.push({
        wallet: address,
        trustLines: decodedLines,
      });
    } catch (err) {
      trustLinesArray.push({
        wallet: address,
        error: err.data?.error_message || err.message,
        trustLines: [],
      });
    }
  }

  await client.disconnect();
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
  const [isRefreshing, setIsRefreshing] = useState(0);
  const [incomingOffer, setIncomingOffer] = useState(null);
  const [cancelledOffer, setCancelledOffer] = useState(null);
  const [subscribedUsers, setSubscribedUsers] = useState([]);
  const [client, setClient] = useState(null);
  const xrpl = require("xrpl");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const events = await widgetApi.receiveStateEvents(
          STATE_EVENT_ROOM_MEMBER
        );
        console.log("events : ", events);
        const usersList = events
          .filter((item) => {
            // Only include users with membership state 'join' or having displayname
            return item.content.membership === "join";
          })
          .map((item) => ({
            name: item.content.displayname,
            userId: item.sender,
          }));

        const userIds = usersList.map((member) =>
          member.userId.split(":")[0].replace("@", "")
        );

        const subscribedUsers_ = userIds.filter(
          (userId) => userId !== myOwnWalletAddress
        );
        setSubscribedUsers(subscribedUsers_);

        console.log("userIds : ", userIds);
        const trustLinesArray = await getTrustLinesAsArray(userIds);

        const own = usersList.find(
          (u) => u.name === widgetApi.widgetParameters.displayName
        );
        const ownWalletAddress = own.userId?.split(":")[0].replace("@", "");
        console.log("ownWalletAddress : ", ownWalletAddress);
        setMyWalletAddress(ownWalletAddress);

        const client_ = new xrpl.Client(API_URLS.xrplMainnetUrl);
        await client_.connect();
        console.log("Connected to XRPL");
        setClient(client_);

        const usersWithTrustLines = usersList.map((user) => {
          const walletAddress = user.userId.split(":")[0].replace("@", "");
          const trustData = trustLinesArray.find(
            (t) => t.wallet === walletAddress
          );
          return {
            ...user,
            trustLines: trustData?.trustLines || [],
            trustLineError: trustData?.error || null,
          };
        });

        console.log("usersWithTrustLines : ", usersWithTrustLines);

        setMembersList(usersWithTrustLines);

        const nft_list = {}; // Use object to group by wallet

        for (const walletAddress of userIds) {
          try {
            const response = await fetch(
              `${API_URLS.marketPlace}/api/v2/nfts?owner=${walletAddress}?assets=true`,
              {
                method: "GET",
                headers: {
                  "x-bithomp-token": "0b833219-c387-4b3f-9606-0e4bd82e5862",
                },
              }
            );

            if (!response.ok) {
              throw new Error("Failed to fetch NFT data");
            }

            const data = await response.json();
            const nfts = data.nfts || [];

            const enrichedNfts = await Promise.all(
              nfts.map(async (nft) => {
                const imageURI =
                  nft.metadata?.image
                    ?.replace("ipfs://", "https://ipfs.io/ipfs/")
                    .replace("#", "%23") || "";
                return {
                  ...nft,
                  imageURI,
                  ownerUsername: nft.ownerDetails?.username || null,
                  collectionName: nft.collection || null,
                };
              })
            );

            nft_list[walletAddress] = enrichedNfts; // Assign to wallet key
          } catch (error) {
            console.error(
              `Error fetching NFTs for ${walletAddress}:`,
              error.message
            );
          }
        }

        console.log("Grouped NFT list by wallet:", nft_list);

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
                  userId,
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
    exit: { opacity: 0, x: -50 },
  };

  function refreshOffers() {
    console.log("Refresh Offers--->");
    setIsRefreshing(isRefreshing === 0 ? 1 : isRefreshing === 1 ? 2 : 1);
  }

  function extractOfferIdFromMeta(meta) {
    if (!meta?.AffectedNodes) return null;

    for (const node of meta.AffectedNodes) {
      if (node.CreatedNode?.LedgerEntryType === "NFTokenOffer") {
        return node.CreatedNode.LedgerIndex;
      }
    }
    return null;
  }

  useEffect(() => {
    if (
      !client ||
      !myNftData.length ||
      !myOwnWalletAddress ||
      !subscribedUsers.length
    )
      return;

    console.log("------------------- client.on-------------------");
    console.log("subscribedUsers : ", subscribedUsers);
    console.log("client->isConnected : ", !client.isConnected());

    const allUserNamesByWalletAddress = membersList.reduce((acc, member) => {
      const wallet = member.userId.split(":")[0].replace("@", "");
      const name = member.name;
      acc[wallet] = name;
      return acc;
    }, {});

    const subscribeToAccount = async () => {
      try {
        console.log("📡 Subscribing to accounts:", subscribedUsers);
        await client.request({
          command: "subscribe",
          accounts: subscribedUsers,
        });
        console.log("✅ Successfully subscribed");
      } catch (err) {
        console.warn("❌ Failed to subscribe:", err.message);
      }
    };

    subscribeToAccount();

    const listener = (tx) => {
      console.log("Transaction detected:", tx);
      const type = tx?.tx_json?.TransactionType;
      const validated = tx?.validated;
      if (validated === true) {
        if (
          (type === "NFTokenCreateOffer" ||
            type === "NFTokenCancelOffer" ||
            type === "NFTokenAcceptOffer") &&
          tx?.meta?.TransactionResult === "tesSUCCESS"
        ) {
          console.log("📦 NFT TX Detected:", tx.tx_json);
          if (type === "NFTokenCreateOffer") {
            const offerId = extractOfferIdFromMeta(tx.meta);
            const isSell =
              (tx?.tx_json?.Flags &
                xrpl.NFTokenCreateOfferFlags.tfSellNFToken) !==
              0;
            const account = tx?.tx_json?.Account;
            const owner = tx?.tx_json?.Owner;
            const destination = tx?.tx_json?.Destination;
            const amount = tx?.tx_json?.Amount;
            const nftId = tx?.tx_json?.NFTokenID;
            console.log("myNftData : ", myNftData);
            const nft = myNftData
              .flatMap((user) => user.groupedNfts)
              .flatMap((group) => group.nfts)
              .find((nft) => nft.nftokenID === nftId);
            console.log("nft : ", nft);
            console.log(
              "isSell : ",
              isSell,
              "owner : ",
              owner,
              "myOwnWalletAddress : ",
              myOwnWalletAddress
            );

            if (amount === "0") {
              //transfer offer
              console.log("Incoming Transfer Offer detected", isSell, destination, myOwnWalletAddress );
              if (isSell && destination === myOwnWalletAddress) {
                //buy, sell offer
                console.log("Incoming Transfer Offer detected");
                const offer = {
                  offer: {
                    offerId: offerId,
                    amount: amount,
                    offerOwner: account,
                    offerOwnerName: allUserNamesByWalletAddress[account],
                    nftId: nft.nftokenID,
                    isSell: isSell,
                    destination: destination,
                  },
                  nft: {
                    ...nft,
                  },
                };

                console.log("Incoming Offer detected:", offer);
                setIncomingOffer(offer);
              }
            } else {
              if (!isSell && owner === myOwnWalletAddress) {
                //buy, sell offer
                console.log("Incoming Buy Offer detected");
                const offer = {
                  offer: {
                    offerId: offerId,
                    amount: amount,
                    offerOwner: account,
                    offerOwnerName: allUserNamesByWalletAddress[account],
                    nftId: nft.nftokenID,
                    isSell: isSell,
                    destination: destination,
                  },
                  nft: {
                    ...nft,
                  },
                };

                console.log("Incoming Offer detected:", offer);
                setIncomingOffer(offer);
              }
            }
          } else if (type === "NFTokenCancelOffer") {
            const offerIds = tx?.tx_json?.NFTokenOffers;
            if (offerIds.length > 0) {
              setCancelledOffer(offerIds);
            }
          } else if (type === "NFTokenAcceptOffer") {
            const sellOfferId = tx?.tx_json?.NFTokenSellOffer;
            const buyOfferId = tx?.tx_json?.NFTokenBuyOffer;

            let buyerWallet = null;
            let sellerWallet = null;
            let nftId = null;

            if (tx?.tx_json?.NFTokenBrokerFee > 15) {
              for (const node of tx.meta.AffectedNodes) {
                if (
                  node.DeletedNode &&
                  node.DeletedNode.LedgerEntryType === "NFTokenOffer" &&
                  node.DeletedNode.FinalFields
                ) {
                  const offer = node.DeletedNode.FinalFields;
                  const isSell = (offer.Flags & 1) === 1;
                  nftId = node?.DeletedNode?.FinalFields?.NFTokenID;

                  if (isSell) {
                    sellerWallet = offer.Owner;
                  } else {
                    buyerWallet = offer.Owner;
                  }
                }
              }
            } else {
              buyerWallet = tx?.tx_json?.Account;
              const affectedNodes = tx?.meta?.AffectedNodes;
              const sellOfferNode = affectedNodes.find(
                (node) =>
                  node.DeletedNode?.LedgerEntryType === "NFTokenOffer" &&
                  node.DeletedNode.FinalFields?.Flags === 1
              );
              sellerWallet = sellOfferNode?.DeletedNode?.FinalFields?.Owner;
              nftId = sellOfferNode?.DeletedNode?.FinalFields?.NFTokenID;
            }
            console.log(
              "deatils of the offer",
              sellOfferId,
              buyOfferId,
              buyerWallet,
              sellerWallet,
              nftId
            );
            setCancelledOffer([sellOfferId, buyOfferId]);

            setMyNftData((prevData) => {
              console.log("✅ Starting update for NFT transfer", {
                nftId,
                sellerWallet,
                buyerWallet,
              });

              // Step 1: Find the NFT to transfer BEFORE modifying anything
              const sellerUser = prevData.find(
                (u) => u.walletAddress === sellerWallet
              );
              const nftToTransfer = sellerUser?.groupedNfts
                .flatMap((group) => group.nfts)
                .find((nft) => nft.nftokenID === nftId);

              if (!nftToTransfer) {
                console.warn("❌ NFT to transfer not found");
                return prevData;
              }

              const userName = allUserNamesByWalletAddress[buyerWallet];
              if (userName !== undefined) {
                nftToTransfer.userName = userName;
                nftToTransfer.userId = buyerWallet;
              } else {
                console.error("Buyer wallet address not found in user names");
              }

              console.log("🔄 NFT to transfer found:", nftToTransfer);

              const updatedData = prevData.map((user) => {
                // Step 2: Remove from seller
                if (user.walletAddress === sellerWallet) {
                  const updatedGroups = user.groupedNfts
                    .map((group) => {
                      const filteredNfts = group.nfts.filter(
                        (nft) => nft.nftokenID !== nftId
                      );
                      if (filteredNfts.length === 0) {
                        console.log(
                          `🧹 Removing empty group from seller ${sellerWallet}`,
                          group.collection
                        );
                        return null;
                      }
                      return { ...group, nfts: filteredNfts };
                    })
                    .filter((group) => group !== null);

                  console.log(
                    `✅ Updated groups for seller ${sellerWallet}:`,
                    updatedGroups
                  );

                  return { ...user, groupedNfts: updatedGroups };
                }

                // Step 3: Add to buyer
                else if (user.walletAddress === buyerWallet) {
                  const existingGroup = user.groupedNfts.find(
                    (group) => group.collection === nftToTransfer.collectionName
                  );

                  let newGroupedNfts;
                  if (existingGroup) {
                    newGroupedNfts = user.groupedNfts.map((group) =>
                      group.collection === nftToTransfer.collectionName
                        ? { ...group, nfts: [...group.nfts, nftToTransfer] }
                        : group
                    );
                    console.log(
                      `➕ Added NFT to existing group for buyer ${buyerWallet}`
                    );
                  } else {
                    newGroupedNfts = [
                      ...user.groupedNfts,
                      {
                        collection: nftToTransfer.collectionName,
                        nfts: [nftToTransfer],
                      },
                    ];
                    console.log(
                      `✨ Created new group and added NFT for buyer ${buyerWallet}`
                    );
                  }

                  return { ...user, groupedNfts: newGroupedNfts };
                }

                // Step 4: Unrelated users remain unchanged
                return user;
              });

              console.log("✅ Final updated NFT ownership data:", updatedData);
              return updatedData;
            });
          }
        }
      }
    };

    client.on("transaction", listener);

    // Clean up: remove listener when state changes or component unmounts
    return () => {
      client.off("transaction", listener);
    };
  }, [client, myNftData, myOwnWalletAddress]); // ✅ dependencies

  const updateUsersNFTs = async (nftId, seller, buyer) => {
    console.log("updateUsersNFTs--->", nftId, seller, buyer);

    const selectedUser = myNftData.find(
      (user) => user.walletAddress === seller
    );

    const selectedCollection = selectedUser?.groupedNfts.find((group) =>
      group.nfts.some((nft) => nft.nftokenID === nftId)
    );

    const selectedNft = selectedCollection?.nfts.find(
      (nft) => nft.nftokenID === nftId
    );

    if (!selectedNft) return;

    const updatedMyNftData = myNftData.map((user) => {
      //Remove NFT from seller
      if (user.walletAddress === seller) {
        const updatedCollections = user.groupedNfts
          .map((collection) => {
            if (collection.nfts.some((nft) => nft.nftokenID === nftId)) {
              const remainingNfts = collection.nfts.filter(
                (nft) => nft.nftokenID !== nftId
              );
              if (remainingNfts.length === 0) return null; //Remove empty collection
              return { ...collection, nfts: remainingNfts };
            }
            return collection;
          })
          .filter(Boolean); //Remove null entries

        return {
          ...user,
          groupedNfts: updatedCollections,
        };
      }

      //Add NFT to buyer
      else if (user.walletAddress === buyer) {
        const hasCollection = user.groupedNfts.some(
          (collection) => collection.collection === selectedNft.collectionName
        );

        return {
          ...user,
          groupedNfts: hasCollection
            ? user.groupedNfts.map((collection) => {
                if (collection.collection === selectedNft.collectionName) {
                  return {
                    ...collection,
                    nfts: [...collection.nfts, selectedNft],
                  };
                }
                return collection;
              })
            : [
                ...user.groupedNfts,
                {
                  collection: selectedNft.collectionName,
                  nfts: [selectedNft],
                },
              ],
        };
      }
      // Other users remain unchanged
      return user;
    });
    console.log("✅ updatedMyNftData--->", updatedMyNftData);
    setMyNftData(updatedMyNftData); // <- Apply state change
  };

  return (
    <>
      {loading ? (
        <LoadingOverlay message="Loading..." />
      ) : (
        <Box
          sx={{
            width: "100%",
            borderRadius: 2,
            boxShadow: 1,
            bgcolor: "background.paper",
            transition: "background-color 0.3s ease",
          }}
          className="dark:bg-[#15191E] dark:text-white bg-white text-black"
        >
          <Tooltip
            title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
            arrow
          >
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
            <Tab label="NFTs" className="text-black dark:text-white" />
            <Tab label="Offers" className="text-black dark:text-white" />
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
                <div
                  style={{ display: selectedIndex === 0 ? "block" : "none" }}
                >
                  <NFTs
                    membersList={membersList}
                    myNftData={myNftData}
                    getImageData={getImageData}
                    wgtParameters={widgetApi.widgetParameters}
                    refreshOffers={refreshOffers}
                    widgetApi={widgetApi}
                  />
                </div>
                <div
                  style={{ display: selectedIndex === 1 ? "block" : "none" }}
                >
                  <Offers
                    myWalletAddress={myOwnWalletAddress}
                    myDisplayName={widgetApi.widgetParameters.displayName}
                    membersList={membersList}
                    myNftData={myNftData}
                    widgetApi={widgetApi}
                    isRefreshing={isRefreshing}
                    updateUsersNFTs={updateUsersNFTs}
                    incomingOffer={incomingOffer}
                    cancelledOffer={cancelledOffer}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </Box>
        </Box>
      )}
    </>
  );
};

export default MatrixClientProvider;
