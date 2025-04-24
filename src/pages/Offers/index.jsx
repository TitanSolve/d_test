import React, { useEffect, useState } from "react";
import OutgoingTransferToggle from "../../components/OutgoingTransferToggle";
import IncomingTransferToggle from "../../components/IncomingTransferToggle";
import API_URLS from "../../config";

const Offers = (membersList, myWalletAddress) => {
  
  const [nftBuyOffers, setNftBuyOffers] = useState([]);
  const [nftSellOffers, setNftSellOffers] = useState([]);
  const [transferOffers, setTransferOffers] = useState([]);
  const [loading, setLoading] = useState(false); // Add loading state
  const [sellOffers, setSellOffers] = useState([]);
/*
  function fetchNFTBuyOffers() {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: myWalletAddress }),
    };
    setLoading(true);
    fetch(`${API_URLS.backendUrl}/getUserNftsWithBuyOffers`, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        console.log("getUserNftsWithBuyOffers---->", data);
        const nftBuyOffers = data
          .filter((item) => item.NftBuyOffers.length > 0)
          .map((item) => ({
            Address: myWalletAddress,
            NFTokenID: item.NFTokenID,
            URI: item.URI,
            nft_serial: item.nft_serial,
            NftBuyOffers: item.NftBuyOffers,
          }));
        setNftBuyOffers(nftBuyOffers);
        console.log(nftBuyOffers, "nft buy offers");
      })
      .catch((error) => console.error("Error fetching NFT buy offers:", error))
      .finally(() => setLoading(false));
  }

  function fetchNftSellOffers() {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: myWalletAddress }),
    };

    console.log("Fetching NFT sell offers...");
    setLoading(true);
    fetch(`${API_URLS.backendUrl}/getMembersNftsWithSellOffers`, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        console.log("getMembersNftsWithSellOffers---->", data);
        const nftSellOffers = [];
        // const nftTransferOffers = [];
        data.forEach((item) => {
          item.NftBuyOffers.forEach((offer) => {
            const offerData = {
              ...offer,
              URI: item.URI,
              Address: myWalletAddress,
              NFTokenID: item.NFTokenID,
            };
            nftSellOffers.push(offerData);
          });
        });
        setNftSellOffers(nftSellOffers);
        // setTransferOffers(nftTransferOffers);
        console.log(nftSellOffers, "nft sell offers");
        // x`x`console.log(nftTransferOffers, "nft transfer offers");
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
*/
  const fetchTransferOffers = async (currentAddress) => {
    const tempAddress = currentAddress.split(":")[0].replace("@", "");
    console.log("tempAddress", tempAddress);
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: tempAddress }),
    };
    console.log("Fetching with requestOptions:", requestOptions);
    setLoading(true);
    await fetch(`${API_URLS.backendUrl}/getMembersNftsWithSellOffers`, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        const filteredOffers = data.flatMap((item) =>
          item.NftBuyOffers.filter(
            (offer) => offer.destination === myWalletAddress
          ).map((offer) => ({
            ...offer,
            URI: item.URI,
            NFTokenID: item.NFTokenID,
          }))
        );
        console.log("transfer filtered offers", filteredOffers);
        setTransferOffers((prevOffers) => [...prevOffers, ...filteredOffers]);
      })
      .catch((error) => {
        console.error("Error fetching or processing data:", error);
      })
      .finally(() => setLoading(false));
  }



  const refreshOffers = () => {
    console.log("Offers->refreshOffers");
    // fetchNFTBuyOffers();
    // fetchNftSellOffers();
    
    membersList.membersList.forEach((member) => {
      fetchTransferOffers(member.userId);
    });
  };

  useEffect(() => {
    refreshOffers();
  }, [membersList]);

  return (
    <div className="h-full overflow-y-auto p-5 bg-gradient-to-br to-gray-100 flex flex-col items-center space-y-2">
      <IncomingTransferToggle title="Incoming transfers" count={7} />
      <OutgoingTransferToggle title="Outgoing transfers" count={6} />
      <OutgoingTransferToggle title="Offers Received" count={0} />
      <OutgoingTransferToggle title="Offers Made" count={3} />
    </div>
  );
};

export default Offers;
