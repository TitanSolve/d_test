import React, { useEffect, useState } from "react";
import OutgoingTransferToggle from "../../components/OutgoingTransferToggle";
import IncomingTransferToggle from "../../components/IncomingTransferToggle";
import OfferMadeToggle from "../../components/OfferMadeToggle";
import OfferReceivedToggle from "../../components/OfferReceivedToggle";
import API_URLS from "../../config";

const Offers = ({ membersList, myWalletAddress, myNftData }) => {

  const [nftBuyOffers, setNftBuyOffers] = useState([]);
  const [nftSellOffers, setNftSellOffers] = useState([]);
  const [incomingTransferOffers, setIncomingTransferOffers] = useState([]);
  const [loading, setLoading] = useState(false); // Add loading state
  const [sellOffers, setSellOffers] = useState([]);
  
  function fetchReceivedBuyOffers() {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: myWalletAddress }),
    };
    console.log("Fetching NFT buy offers...", requestOptions);
    fetch(`${API_URLS.backendUrl}/getUserNftsWithBuyOffers`, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        console.log("getUserNftsWithBuyOffers---->", data);

        const memberData = myNftData.find((u) => u.userId.split(":")[0].replace("@", "") === myWalletAddress);
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
        const filteredOffers = data.flatMap((item) =>
          item.NftBuyOffers
            .map((offer) => {
              const nftMeta = nftMap[item.NFTokenID];
              return {
                ...offer,
                URI: item.URI,
                NFTokenID: item.NFTokenID,
                ...(nftMeta && {
                  imageURI: nftMeta.imageURI,
                  name: nftMeta.metadata?.name,
                  buyerName: nftMeta.userName,
                  // nftMetadata: nftMeta,
                }),
              };
            })
        );
        setNftBuyOffers(filteredOffers);
        console.log(filteredOffers, "nft buy offers");
      })
      .catch((error) => console.error("Error fetching NFT buy offers:", error))
      .finally(() => setLoading(false));
  }

  function fetchSellOffers() {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: myWalletAddress }),
    };

    console.log("Fetching NFT sell offers...", requestOptions);
    setLoading(true);
    fetch(`${API_URLS.backendUrl}/getMembersNftsWithSellOffers`, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        const memberData = myNftData.find((u) => u.userId.split(":")[0].replace("@", "") === myWalletAddress);
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
        const filteredOffers = data.flatMap((item) =>
          item.NftBuyOffers
            .map((offer) => {
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
        setNftSellOffers(filteredOffers);
        console.log(filteredOffers, "nft sell offers");
      })
      .catch((error) => console.error("Error fetching NFT sell offers:", error))
      .finally(() => setLoading(false));
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

      const response = await fetch(`${API_URLS.backendUrl}/getMembersNftsWithSellOffers`, requestOptions);
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
        item.NftBuyOffers
          .filter((offer) => offer.destination === myWalletAddress)
          .map((offer) => {
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



  const refreshOffers = async () => {
    console.log("Offers->refreshOffers", myWalletAddress);
    setLoading(true);

    try {

      //Transfer----------
      // const allOffersArrays = await Promise.all(
      //   membersList.map((member) => fetchIncomingTransferOffers(member.userId))
      // );
      // // Flatten all arrays into one
      // const allFilteredOffers = allOffersArrays.flat();
      // console.log("incoming transfers", allFilteredOffers);
      // setIncomingTransferOffers(allFilteredOffers);
      //---------------------------

      //Sell Offers
      fetchSellOffers();
      //---------------------

      //Buy Offers
      fetchReceivedBuyOffers();
      //---------------------
    } catch (error) {
      console.error("Error refreshing offers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Offers->useEffect", membersList, myWalletAddress);
    if (myWalletAddress === "" || membersList.length < 1) return;
    refreshOffers();
  }, [membersList, myWalletAddress]);

  return (
    <div className="h-full overflow-y-auto p-5 bg-gradient-to-br to-gray-100 flex flex-col items-center space-y-2">
      <button
        onClick={refreshOffers}
        className="fixed top-4 left-4 z-50 p-2 md:p-3 rounded-full bg-gray-100 dark:bg-[#15191E] text-gray-800 dark:text-white shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out border border-gray-300 dark:border-gray-700 backdrop-blur-md"
      >
        update
      </button>

      <IncomingTransferToggle title="Incoming transfers" incomingTransfers={incomingTransferOffers} onAction={refreshOffers} myOwnWalletAddress={myWalletAddress} />
      <OutgoingTransferToggle title="Outgoing transfers" count={6} />
      <OfferReceivedToggle title="Offers Received" madeOffers={nftSellOffers} receivedOffers={nftBuyOffers} myOwnWalletAddress={myWalletAddress} onAction={refreshOffers} refreshSellOffers={fetchSellOffers} />
      <OfferMadeToggle title="Offers Made" madeOffers={nftSellOffers} myOwnWalletAddress={myWalletAddress} onAction={refreshOffers} />
    </div>
  );
};

export default Offers;
