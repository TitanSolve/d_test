import React, { useEffect, useState } from "react";
import OutgoingTransferToggle from "../../components/OutgoingTransferToggle";
import IncomingTransferToggle from "../../components/IncomingTransferToggle";
import OfferMadeToggle from "../../components/OfferMadeToggle";
import OfferReceivedToggle from "../../components/OfferReceivedToggle";
import API_URLS from "../../config";
import LoadingOverlay from "../../components/LoadingOverlay";

const Offers = ({
  membersList,
  myDisplayName,
  myWalletAddress,
  myNftData,
  widgetApi,
  isRefreshing,
  updateUsersNFTs,
  incomingOffer,
  cancelledOffer,
}) => {
  const [receivedOffers, setReceivedOffers] = useState([]);
  const [madeOffers, setMadeOffers] = useState([]);
  const [incomingTransferOffers, setIncomingTransferOffers] = useState([]);
  const [loading, setLoading] = useState(false); // Add loading state
  const [sellOffers, setSellOffers] = useState([]);
  const [usersOffer, setUsersOffer] = useState([]);

  useEffect(() => {
    console.log("Offers->useEffect->incoming offer", incomingOffer);
    if (incomingOffer) {
      console.log("incomingOffer", incomingOffer);

      const walletNftMap = {};
      const nftMapById = new Map();
      myNftData.forEach((member) => {
        member.groupedNfts.forEach((group) => {
          group.nfts.forEach((nft) => {
            nftMapById.set(nft.nftokenID, { ...nft });
          });
        });
        const wallet = member.walletAddress;
        const nftIds = member.groupedNfts.flatMap((group) =>
          group.nfts.map((nft) => nft.nftokenID)
        );
        walletNftMap[wallet] = new Set(nftIds);
      });

      console.log(
        "incomingOffer detail--->",
        !incomingOffer.offer.isSell,
        walletNftMap[myWalletAddress].has(incomingOffer.nft.nftokenID),
        incomingOffer.offer.destination,
        myWalletAddress
      );

      if (
        (!incomingOffer.offer.isSell &&
          walletNftMap[myWalletAddress].has(incomingOffer.nft.nftokenID)) ||
        incomingOffer.offer.destination === myWalletAddress
      ) {
        console.log("incomingOffer accepted-----");
        setReceivedOffers((prev) => [...prev, incomingOffer]);
      }
    }
  }, [incomingOffer]);

  useEffect(() => {
    if (cancelledOffer?.length > 0) {
      console.log("Offers->useEffect->cancelled offer", cancelledOffer);

      const cancelledIds = new Set(cancelledOffer);

      setMadeOffers((prev) =>
        prev.filter((offer) => !cancelledIds.has(offer.offer.offerId))
      );
      setReceivedOffers((prev) =>
        prev.filter((offer) => !cancelledIds.has(offer.offer.offerId))
      );
    }
  }, [cancelledOffer]);

  useEffect(() => {
    console.log("Offers->useEffect->isRefreshing", isRefreshing);
    if (isRefreshing !== undefined && isRefreshing !== 0) {
      refreshOffers();
    }
  }, [isRefreshing]);

  useEffect(() => {
    console.log("Offers->useEffect", membersList, myWalletAddress);
    if (myWalletAddress === "" || membersList.length < 1) return;
    refreshOffers();
  }, [membersList, myWalletAddress]);

  async function fetchReceivedBuyOffers() {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: myWalletAddress }),
    };

    console.log("Fetching NFT buy offers...", requestOptions);

    try {
      const response = await fetch(
        `${API_URLS.backendUrl}/getUserNftsWithBuyOffers`,
        requestOptions
      );
      const data = await response.json();
      console.log("getUserNftsWithBuyOffers ---->", data);

      const memberData = myNftData.find(
        (u) => u.userId.split(":")[0].replace("@", "") === myWalletAddress
      );

      const nftMap = {};
      if (memberData?.groupedNfts?.length) {
        for (const group of memberData.groupedNfts) {
          for (const nft of group.nfts) {
            nftMap[nft.nftokenID] = { ...nft };
          }
        }
      }

      const filteredOffers = data.flatMap((item) =>
        item.NftBuyOffers.map((offer) => {
          const nftMeta = nftMap[item.NFTokenID];
          return {
            ...offer,
            URI: item.URI,
            NFTokenID: item.NFTokenID,
            ...(nftMeta && {
              imageURI: nftMeta.imageURI,
              name: nftMeta.metadata?.name,
              // nftMetadata: nftMeta,
            }),
          };
        })
      );

      setNftBuyOffers(filteredOffers);
      console.log(filteredOffers, "nft buy offers");
    } catch (error) {
      console.error("Error fetching NFT buy offers:", error);
    } finally {
      console.log("fetchReceivedBuyOffers is finished");
    }
  }

  async function fetchSellOffers() {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: myWalletAddress }),
    };
    console.log("Fetching NFT sell offers...", requestOptions);
    try {
      const response = await fetch(
        `${API_URLS.backendUrl}/getMembersNftsWithSellOffers`,
        requestOptions
      );
      const data = await response.json();

      const memberData = myNftData.find(
        (u) => u.userId.split(":")[0].replace("@", "") === myWalletAddress
      );

      const nftMap = {};
      if (memberData?.groupedNfts?.length) {
        for (const group of memberData.groupedNfts) {
          for (const nft of group.nfts) {
            nftMap[nft.nftokenID] = { ...nft };
          }
        }
      }

      const filteredOffers = data.flatMap((item) =>
        item.NftBuyOffers.map((offer) => {
          const nftMeta = nftMap[item.NFTokenID];
          return {
            ...offer,
            URI: item.URI,
            NFTokenID: item.NFTokenID,
            ...(nftMeta && {
              imageURI: nftMeta.imageURI,
              name: nftMeta.metadata?.name,
              nft: nftMeta,
            }),
          };
        })
      );

      // setNftSellOffers(filteredOffers);
      return filteredOffers;
    } catch (error) {
      console.error("Error fetching NFT sell offers:", error);
    } finally {
      console.log("fetchSellOffer is finished");
    }
  }

  // function fetchAccountOffers(currentaddress) {
  //   const tempAddress = currentaddress.split(":")[0].replace("@", "");
  //   const requestOptions = {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ address: tempAddress }),
  //   };

  //   console.log("Fetching with requestOptions:", requestOptions);
  //   fetch(`${API_URLS.backendUrl}/get-users-nfts`, requestOptions)
  //     .then((response) => response.json())
  //     .then((data) => {
  //       console.log(
  //         "Raw data received for objects:",
  //         data,
  //         "adddress",
  //         address
  //       );
  //       console.log(Array.isArray(data), "yoyoyo yo");

  //       const filteredOffers = data
  //         .filter((offer) => offer.Flags === 1 && offer.Destination === address)
  //         .map((offer) => ({
  //           ...offer,
  //           // Spread the offer properties
  //         }));
  //       console.log("account filtered offers", filteredOffers);
  //       setSellOffers((prevOffers) => [...prevOffers, ...filteredOffers]);
  //       console.log("selloffers umang", sellOffers);
  //     });
  // }

  // function fetchNFTData(nfts) {}
  // useEffect(() => {
  //   roomMembers.map((member) => {
  //     fetchAccountOffers(member);
  //     console.log("yoyoyoy", sellOffers);
  //   });

  //   // fetchNFTData(sellOffers);
  //   console.log("Sell and transfer offers", sellOffers);
  // }, [roomMembers]);

  const fetchIncomingTransferOffers = async (currentAddress) => {
    const tempAddress = currentAddress.split(":")[0].replace("@", "");

    // Skip if the address is own wallet
    if (tempAddress === myWalletAddress) return [];

    try {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: tempAddress }),
      };

      const response = await fetch(
        `${API_URLS.backendUrl}/getMembersNftsWithSellOffers`,
        requestOptions
      );
      const data = await response.json();
      const memberData = myNftData.find((u) => u.userId === currentAddress);

      const nftMap = {};
      if (memberData?.groupedNfts?.length) {
        for (const group of memberData.groupedNfts) {
          for (const nft of group.nfts) {
            nftMap[nft.nftokenID] = {
              ...nft,
            };
          }
        }
      }

      // ✅ Build filtered offers and merge matching NFT metadata
      const filteredOffers = data.flatMap((item) =>
        item.NftBuyOffers.filter(
          (offer) => offer.destination === myWalletAddress
        ).map((offer) => {
          const nftMeta = nftMap[item.NFTokenID];
          return {
            ...offer,
            URI: item.URI,
            NFTokenID: item.NFTokenID,
            ...(nftMeta && {
              imageURI: nftMeta.imageURI,
              name: nftMeta.metadata?.name,
            }),
          };
        })
      );
      return filteredOffers;
    } catch (error) {
      console.error(`Error fetching data for ${tempAddress}:`, error);
      return [];
    }
  };

  // const fetchOutgoingTransferOffers = async () => {

  //   try {
  //     const requestOptions = {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ address: myWalletAddress }),
  //     };

  //     const response = await fetch(`${API_URLS.backendUrl}/getMembersNftsWithSellOffers`, requestOptions);
  //     const data = await response.json();

  //     const filteredOffers = data.flatMap((item) =>
  //       item.NftBuyOffers.filter(
  //         (offer) => offer.destination === myWalletAddress
  //       ).map((offer) => ({
  //         ...offer,
  //         URI: item.URI,
  //         NFTokenID: item.NFTokenID,
  //       }))
  //     );

  //     return filteredOffers;
  //   } catch (error) {
  //     console.error(`Error fetching data for ${myWalletAddress}:`, error);
  //     return [];
  //   }
  // };

  const fetchAllUsersOfers = async () => {
    const usersWalletAddresses = membersList.map((member) =>
      member.userId.split(":")[0].replace("@", "")
    );
    const allUserNamesByWalletAddress = membersList.reduce((acc, member) => {
      const wallet = member.userId.split(":")[0].replace("@", "");
      const name = member.name;
      acc[wallet] = name;
      return acc;
    }, {});
    console.log("allUserNamesByWalletAddress", allUserNamesByWalletAddress);

    const payload = {
      wallets: usersWalletAddresses,
    };
    const response = await fetch(
      `${API_URLS.backendUrl}/getUserOfferForWallets`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
    const offerData = await response.json(); // [{ wallet, offers: [...] }]
    console.log("✅ Users' offers:", offerData);

    // Step 2: Build NFT mapping from mergedMembers
    const walletNftMap = {};
    const nftMapById = new Map();
    myNftData.forEach((member) => {
      member.groupedNfts.forEach((group) => {
        group.nfts.forEach((nft) => {
          nftMapById.set(nft.nftokenID, { ...nft });
        });
      });
      const wallet = member.walletAddress;
      const nftIds = member.groupedNfts.flatMap((group) =>
        group.nfts.map((nft) => nft.nftokenID)
      );
      walletNftMap[wallet] = new Set(nftIds);
    });
    console.log("NFT mapping for each wallet:", walletNftMap);

    // Step 3: Organize offers
    const result = offerData.map(({ wallet, offers }) => {
      const nftSet = walletNftMap[wallet] || new Set();

      const sellOffers = [];
      const buyOffers = [];
      const receivedOffers_ = [];

      // Classify this wallet's own offers
      for (const offer of offers) {
        const offerOwnerName = allUserNamesByWalletAddress[offer.offerOwner];
        if (offer.isSell && nftSet.has(offer.nftId)) {
          sellOffers.push({
            offer: { ...offer, offerOwnerName: offerOwnerName },
            nft: nftMapById.get(offer.nftId),
          });
        } else if (!offer.isSell && !nftSet.has(offer.nftId)) {
          buyOffers.push({
            offer: { ...offer, offerOwnerName: offerOwnerName },
            nft: nftMapById.get(offer.nftId),
          });
        }
      }

      // Find incoming buy offers from others for this wallet's NFTs
      for (const other of offerData) {
        if (other.wallet === wallet) continue;

        for (const offer of other.offers) {
          const offerOwnerName = allUserNamesByWalletAddress[offer.offerOwner];
          if (
            (!offer.isSell && nftSet.has(offer.nftId)) ||
            offer.destination === myWalletAddress
          ) {
            receivedOffers_.push({
              offer: { ...offer, offerOwnerName: offerOwnerName },
              nft: nftMapById.get(offer.nftId),
            });
          }
        }
      }

      return {
        wallet,
        madeOffers: [...sellOffers, ...buyOffers],
        receivedOffers: receivedOffers_,
      };
    });

    console.log("🎯 Final user offers (made + received):", result);

    setUsersOffer(result);
    const offerForMyWallet = result.find(
      (offer) => offer.wallet === myWalletAddress
    );

    // Update made offers with proper error handling
    if (offerForMyWallet) {
      const madeOffers_ = offerForMyWallet.madeOffers || [];
      console.log("madeOffers", madeOffers_);
      setMadeOffers(madeOffers_);

      const receivedOffers_ = offerForMyWallet.receivedOffers || [];
      console.log("receivedOffers", receivedOffers_);
      setReceivedOffers(receivedOffers_);
    } else {
      // If no offers found for the wallet, set empty arrays
      setMadeOffers([]);
      setReceivedOffers([]);
    }
  };

  const refreshOffers = async () => {
    console.log("Offers->refreshOffers", myWalletAddress);
    setLoading(true);

    try {
      // Transfer----------
      // const allOffersArrays = await Promise.all(
      //   membersList.map((member) => fetchIncomingTransferOffers(member.userId))
      // );
      // // Flatten all arrays into one
      // const allFilteredOffers = allOffersArrays.flat();
      // console.log("incoming transfers", allFilteredOffers);
      // setIncomingTransferOffers(allFilteredOffers);
      // ---------------------------

      //Sell Offers
      // await fetchSellOffers();
      //---------------------

      //Buy Offers
      // await fetchReceivedBuyOffers();
      //---------------------

      await fetchAllUsersOfers();
    } catch (error) {
      console.error("Error refreshing offers:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <LoadingOverlay message="Loading..." />
      ) : (
        <div className="h-full overflow-y-auto p-5 bg-gradient-to-br to-gray-100 flex flex-col items-center space-y-2">
          <button
            onClick={refreshOffers}
            className="fixed top-4 left-4 z-50 p-2 md:p-3 rounded-full bg-gray-100 dark:bg-[#15191E] text-gray-800 dark:text-white shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out border border-gray-300 dark:border-gray-700 backdrop-blur-md"
          >
            update
          </button>

          <IncomingTransferToggle
            title="Incoming transfers"
            incomingTransfers={receivedOffers}
            onAction={refreshOffers}
            myOwnWalletAddress={myWalletAddress}
            updateUsersNFTs={updateUsersNFTs}
            widgetApi={widgetApi}
            myDisplayName={myDisplayName}
          />
          <OutgoingTransferToggle
            title="Outgoing transfers"
            outgoingTransfers={madeOffers}
            onAction={refreshOffers}
            myOwnWalletAddress={myWalletAddress}
          />
          <OfferReceivedToggle
            title="Offers Received"
            madeOffers={madeOffers}
            receivedOffers={receivedOffers}
            myDisplayName={myDisplayName}
            myOwnWalletAddress={myWalletAddress}
            onAction={refreshOffers}
            refreshSellOffers={fetchSellOffers}
            widgetApi={widgetApi}
            updateUsersNFTs={updateUsersNFTs}
          />
          <OfferMadeToggle
            title="Offers Made"
            madeOffers={madeOffers}
            myOwnWalletAddress={myWalletAddress}
            onAction={refreshOffers}
          />
        </div>
      )}
    </>
  );
};

export default Offers;
