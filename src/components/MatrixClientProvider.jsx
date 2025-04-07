import React, { useEffect, useState, ReactElement } from "react";
import { useWidgetApi } from '@matrix-widget-toolkit/react';
import { Tabs, Tab, Box, Typography, CircularProgress } from "@mui/material";
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

  if (URI === "" || URI === undefined || URI === null) {
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
  const [myNftData, setMyNftData] = useState([]);
  const [loading, setLoading] = useState(true);

  window.addEventListener("message", (event) => {
    console.log("------ event :", event);
    if (event.data?.action === "client_theme") {
      const theme = event.data?.data?.theme;
      console.log("-------------- data:", event.data);
      console.log("-------------- theme:", theme);
      // applyTheme(theme); // light | dark | legacy etc.
    }
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // console.log("widgetApi.widgetParameters : ", widgetApi.widgetParameters);

      try {
        // Load members
        const events = await widgetApi.receiveStateEvents(STATE_EVENT_ROOM_MEMBER);
        const membersList = events.map(item => ({
          name: item.content.displayname,
          userId: item.sender
        }));

        const userIds = membersList.map(member => member.userId.split(":")[0].replace("@", ""));
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

        const mergedMembers = await Promise.all(
          membersList.map(async (member) => {
            const walletAddress = member.userId.split(":")[0].replace("@", "");
            const nfts = data[walletAddress] || [];

            const enrichedNfts = await Promise.all(
              nfts.map(async (nft) => {
                const imageURI = await getImageData(nft);
                return {
                  ...nft,
                  imageURI,
                };
              })
            );

            // Group by NFTokenTaxon
            const groupedNfts = enrichedNfts.reduce((acc, nft) => {
              const taxon = nft.NFTokenTaxon;
              if (!acc[taxon]) {
                acc[taxon] = [];
              }
              acc[taxon].push(nft);
              return acc;
            }, {});

            return {
              ...member,
              walletAddress,
              groupedNfts, // NFTs grouped by NFTokenTaxon
            };
          })
        );

        /*
        const mergedMembers = [
          {
            "name": "Mike | TextRP",
            "userId": "@r34VdeAwi8qs1KF3DTn5T3Y5UAPmbBNWpX:synapse.textrp.io",
            "walletAddress": "r34VdeAwi8qs1KF3DTn5T3Y5UAPmbBNWpX",
            "nfts": [
              {
                "Flags": 8,
                "Issuer": "rGx5vZ9PGxrjSEZeQKMGy3ahTWERXXLN5m",
                "NFTokenID": "00081388AF13C2B065183EFF4701F178C5B08992C0C0413F082F7B85057DC5EC",
                "NFTokenTaxon": 2,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeid7dscfjb2u7hvukdaqtkvpoh7doa3jgvaj322ozqgsqufzvvzgaa/degen-droid-#432.png",
                "nft_serial": 92128748,
                "name": "Degen Droid #432",
                "imageURI": "https://ipfs.io/ipfs/bafybeid7dscfjb2u7hvukdaqtkvpoh7doa3jgvaj322ozqgsqufzvvzgaa/degen-droid-#432.png"
              },
              {
                "Flags": 8,
                "Issuer": "rGx5vZ9PGxrjSEZeQKMGy3ahTWERXXLN5m",
                "NFTokenID": "00081388AF13C2B065183EFF4701F178C5B08992C0C0413F1669D726057DC588",
                "NFTokenTaxon": 5,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeiamora7hzzscvjiqcojmyts7txjozaszairvvqvw5fdtpovmodrda/degen-droid-#394.png",
                "nft_serial": 92128648,
                "name": "Degen Droid #394",
                "imageURI": "https://ipfs.io/ipfs/bafybeiamora7hzzscvjiqcojmyts7txjozaszairvvqvw5fdtpovmodrda/degen-droid-#394.png"
              },
              {
                "Flags": 8,
                "Issuer": "rGx5vZ9PGxrjSEZeQKMGy3ahTWERXXLN5m",
                "NFTokenID": "00081388AF13C2B065183EFF4701F178C5B08992C0C0413F1F154C8A057DC5ED",
                "NFTokenTaxon": 2,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeid7dscfjb2u7hvukdaqtkvpoh7doa3jgvaj322ozqgsqufzvvzgaa/degen-droid-#1275.png",
                "nft_serial": 92128749,
                "name": "Degen Droid #1275",
                "imageURI": "https://ipfs.io/ipfs/bafybeid7dscfjb2u7hvukdaqtkvpoh7doa3jgvaj322ozqgsqufzvvzgaa/degen-droid-#1275.png"
              },
              {
                "Flags": 8,
                "Issuer": "rGx5vZ9PGxrjSEZeQKMGy3ahTWERXXLN5m",
                "NFTokenID": "00081388AF13C2B065183EFF4701F178C5B08992C0C0413F31DB1891057DC5F9",
                "NFTokenTaxon": 5,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeiamora7hzzscvjiqcojmyts7txjozaszairvvqvw5fdtpovmodrda/degen-droid-#1022.png",
                "nft_serial": 92128761,
                "name": "Degen Droid #1022",
                "imageURI": "https://ipfs.io/ipfs/bafybeiamora7hzzscvjiqcojmyts7txjozaszairvvqvw5fdtpovmodrda/degen-droid-#1022.png"
              },
              {
                "Flags": 8,
                "Issuer": "rGx5vZ9PGxrjSEZeQKMGy3ahTWERXXLN5m",
                "NFTokenID": "00081388AF13C2B065183EFF4701F178C5B08992C0C0413F33B56554057DC5B6",
                "NFTokenTaxon": 5,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeiamora7hzzscvjiqcojmyts7txjozaszairvvqvw5fdtpovmodrda/degen-droid-#566.png",
                "nft_serial": 92128694,
                "name": "Degen Droid #566",
                "imageURI": "https://ipfs.io/ipfs/bafybeiamora7hzzscvjiqcojmyts7txjozaszairvvqvw5fdtpovmodrda/degen-droid-#566.png"
              },
              {
                "Flags": 8,
                "Issuer": "rGx5vZ9PGxrjSEZeQKMGy3ahTWERXXLN5m",
                "NFTokenID": "00081388AF13C2B065183EFF4701F178C5B08992C0C0413F35FB1D8B057DC5EE",
                "NFTokenTaxon": 2,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeid7dscfjb2u7hvukdaqtkvpoh7doa3jgvaj322ozqgsqufzvvzgaa/degen-droid-#263.png",
                "nft_serial": 92128750,
                "name": "Degen Droid #263",
                "imageURI": "https://ipfs.io/ipfs/bafybeid7dscfjb2u7hvukdaqtkvpoh7doa3jgvaj322ozqgsqufzvvzgaa/degen-droid-#263.png"
              },
              {
                "Flags": 8,
                "Issuer": "rGx5vZ9PGxrjSEZeQKMGy3ahTWERXXLN5m",
                "NFTokenID": "00081388AF13C2B065183EFF4701F178C5B08992C0C0413F48C0E990057DC5FA",
                "NFTokenTaxon": 5,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeiamora7hzzscvjiqcojmyts7txjozaszairvvqvw5fdtpovmodrda/degen-droid-#1067.png",
                "nft_serial": 92128762,
                "name": "Degen Droid #1067",
                "imageURI": "https://ipfs.io/ipfs/bafybeiamora7hzzscvjiqcojmyts7txjozaszairvvqvw5fdtpovmodrda/degen-droid-#1067.png"
              },
              {
                "Flags": 8,
                "Issuer": "rGx5vZ9PGxrjSEZeQKMGy3ahTWERXXLN5m",
                "NFTokenID": "00081388AF13C2B065183EFF4701F178C5B08992C0C0413F4CE0EE88057DC5EF",
                "NFTokenTaxon": 2,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeid7dscfjb2u7hvukdaqtkvpoh7doa3jgvaj322ozqgsqufzvvzgaa/degen-droid-#1239.png",
                "nft_serial": 92128751,
                "name": "Degen Droid #1239",
                "imageURI": "https://ipfs.io/ipfs/bafybeid7dscfjb2u7hvukdaqtkvpoh7doa3jgvaj322ozqgsqufzvvzgaa/degen-droid-#1239.png"
              },
              {
                "Flags": 8,
                "Issuer": "rGx5vZ9PGxrjSEZeQKMGy3ahTWERXXLN5m",
                "NFTokenID": "00081388AF13C2B065183EFF4701F178C5B08992C0C0413F5FA6BA93057DC5FB",
                "NFTokenTaxon": 5,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeiamora7hzzscvjiqcojmyts7txjozaszairvvqvw5fdtpovmodrda/degen-droid-#1514.png",
                "nft_serial": 92128763,
                "name": "Degen Droid #1514",
                "imageURI": "https://ipfs.io/ipfs/bafybeiamora7hzzscvjiqcojmyts7txjozaszairvvqvw5fdtpovmodrda/degen-droid-#1514.png"
              },
              {
                "Flags": 8,
                "Issuer": "rGx5vZ9PGxrjSEZeQKMGy3ahTWERXXLN5m",
                "NFTokenID": "00081388AF13C2B065183EFF4701F178C5B08992C0C0413F63C6BF89057DC5F0",
                "NFTokenTaxon": 2,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeid7dscfjb2u7hvukdaqtkvpoh7doa3jgvaj322ozqgsqufzvvzgaa/degen-droid-#1442.png",
                "nft_serial": 92128752,
                "name": "Degen Droid #1442",
                "imageURI": "https://ipfs.io/ipfs/bafybeid7dscfjb2u7hvukdaqtkvpoh7doa3jgvaj322ozqgsqufzvvzgaa/degen-droid-#1442.png"
              },
              {
                "Flags": 8,
                "Issuer": "rGx5vZ9PGxrjSEZeQKMGy3ahTWERXXLN5m",
                "NFTokenID": "00081388AF13C2B065183EFF4701F178C5B08992C0C0413F768C8B92057DC5FC",
                "NFTokenTaxon": 5,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeiamora7hzzscvjiqcojmyts7txjozaszairvvqvw5fdtpovmodrda/degen-droid-#1745.png",
                "nft_serial": 92128764,
                "name": "Degen Droid #1745",
                "imageURI": "https://ipfs.io/ipfs/bafybeiamora7hzzscvjiqcojmyts7txjozaszairvvqvw5fdtpovmodrda/degen-droid-#1745.png"
              },
              {
                "Flags": 8,
                "Issuer": "rGx5vZ9PGxrjSEZeQKMGy3ahTWERXXLN5m",
                "NFTokenID": "00081388AF13C2B065183EFF4701F178C5B08992C0C0413F88E6EC2D057DC58D",
                "NFTokenTaxon": 5,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeiamora7hzzscvjiqcojmyts7txjozaszairvvqvw5fdtpovmodrda/degen-droid-#1401.png",
                "nft_serial": 92128653,
                "name": "Degen Droid #1401",
                "imageURI": "https://ipfs.io/ipfs/bafybeiamora7hzzscvjiqcojmyts7txjozaszairvvqvw5fdtpovmodrda/degen-droid-#1401.png"
              },
              {
                "Flags": 8,
                "Issuer": "rGx5vZ9PGxrjSEZeQKMGy3ahTWERXXLN5m",
                "NFTokenID": "00081702AF13C2B065183EFF4701F178C5B08992C0C0413F9192618E057DC5F2",
                "NFTokenTaxon": 3,
                "TransferFee": 5890,
                "URI": "https://ipfs.io/ipfs/QmeQcto1CcP3HUSS5aC2MDNi9gJA1MkgJDfp4AVDapEknA",
                "nft_serial": 92128754,
                "name": "The LurkyDev Bot",
                "imageURI": "https://ipfs.io/ipfs/QmeQcto1CcP3HUSS5aC2MDNi9gJA1MkgJDfp4AVDapEknA"
              },
              {
                "Flags": 8,
                "Issuer": "rGx5vZ9PGxrjSEZeQKMGy3ahTWERXXLN5m",
                "NFTokenID": "00081388AF13C2B065183EFF4701F178C5B08992C0C0413F93B3BE11057DBC78",
                "NFTokenTaxon": 2,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeid7dscfjb2u7hvukdaqtkvpoh7doa3jgvaj322ozqgsqufzvvzgaa/degen-droid-#5.png",
                "nft_serial": 92126328,
                "name": "Degen Droid #5",
                "imageURI": "https://ipfs.io/ipfs/bafybeid7dscfjb2u7hvukdaqtkvpoh7doa3jgvaj322ozqgsqufzvvzgaa/degen-droid-#5.png"
              },
              {
                "Flags": 8,
                "Issuer": "rGx5vZ9PGxrjSEZeQKMGy3ahTWERXXLN5m",
                "NFTokenID": "00081388AF13C2B065183EFF4701F178C5B08992C0C0413F95B26680057DC5E7",
                "NFTokenTaxon": 2,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeid7dscfjb2u7hvukdaqtkvpoh7doa3jgvaj322ozqgsqufzvvzgaa/degen-droid-#1066.png",
                "nft_serial": 92128743,
                "name": "Degen Droid #1066",
                "imageURI": "https://ipfs.io/ipfs/bafybeid7dscfjb2u7hvukdaqtkvpoh7doa3jgvaj322ozqgsqufzvvzgaa/degen-droid-#1066.png"
              },
              {
                "Flags": 8,
                "Issuer": "rGx5vZ9PGxrjSEZeQKMGy3ahTWERXXLN5m",
                "NFTokenID": "00081388AF13C2B065183EFF4701F178C5B08992C0C0413F9A197B42057DBCA5",
                "NFTokenTaxon": 2,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeid7dscfjb2u7hvukdaqtkvpoh7doa3jgvaj322ozqgsqufzvvzgaa/degen-droid-#1575.png",
                "nft_serial": 92126373,
                "name": "Degen Droid #1575",
                "imageURI": "https://ipfs.io/ipfs/bafybeid7dscfjb2u7hvukdaqtkvpoh7doa3jgvaj322ozqgsqufzvvzgaa/degen-droid-#1575.png"
              },
              {
                "Flags": 8,
                "Issuer": "rGx5vZ9PGxrjSEZeQKMGy3ahTWERXXLN5m",
                "NFTokenID": "00081388AF13C2B065183EFF4701F178C5B08992C0C0413FAC983781057DC5E8",
                "NFTokenTaxon": 2,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeid7dscfjb2u7hvukdaqtkvpoh7doa3jgvaj322ozqgsqufzvvzgaa/degen-droid-#66.png",
                "nft_serial": 92128744,
                "name": "Degen Droid #66",
                "imageURI": "https://ipfs.io/ipfs/bafybeid7dscfjb2u7hvukdaqtkvpoh7doa3jgvaj322ozqgsqufzvvzgaa/degen-droid-#66.png"
              },
              {
                "Flags": 8,
                "Issuer": "rGx5vZ9PGxrjSEZeQKMGy3ahTWERXXLN5m",
                "NFTokenID": "00081388AF13C2B065183EFF4701F178C5B08992C0C0413FC37E0886057DC5E9",
                "NFTokenTaxon": 2,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeid7dscfjb2u7hvukdaqtkvpoh7doa3jgvaj322ozqgsqufzvvzgaa/degen-droid-#848.png",
                "nft_serial": 92128745,
                "name": "Degen Droid #848",
                "imageURI": "https://ipfs.io/ipfs/bafybeid7dscfjb2u7hvukdaqtkvpoh7doa3jgvaj322ozqgsqufzvvzgaa/degen-droid-#848.png"
              },
              {
                "Flags": 8,
                "Issuer": "rGx5vZ9PGxrjSEZeQKMGy3ahTWERXXLN5m",
                "NFTokenID": "00081388AF13C2B065183EFF4701F178C5B08992C0C0413FDA63D987057DC5EA",
                "NFTokenTaxon": 2,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeid7dscfjb2u7hvukdaqtkvpoh7doa3jgvaj322ozqgsqufzvvzgaa/degen-droid-#661.png",
                "nft_serial": 92128746,
                "name": "Degen Droid #661",
                "imageURI": "https://ipfs.io/ipfs/bafybeid7dscfjb2u7hvukdaqtkvpoh7doa3jgvaj322ozqgsqufzvvzgaa/degen-droid-#661.png"
              },
              {
                "Flags": 8,
                "Issuer": "rGx5vZ9PGxrjSEZeQKMGy3ahTWERXXLN5m",
                "NFTokenID": "00081388AF13C2B065183EFF4701F178C5B08992C0C0413FF149AA84057DC5EB",
                "NFTokenTaxon": 2,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeid7dscfjb2u7hvukdaqtkvpoh7doa3jgvaj322ozqgsqufzvvzgaa/degen-droid-#660.png",
                "nft_serial": 92128747,
                "name": "Degen Droid #660",
                "imageURI": "https://ipfs.io/ipfs/bafybeid7dscfjb2u7hvukdaqtkvpoh7doa3jgvaj322ozqgsqufzvvzgaa/degen-droid-#660.png"
              },
              {
                "Flags": 8,
                "Issuer": "raDwQzjBoKQ8xzFqKKrAY9JKtuuqWQ3PLt",
                "NFTokenID": "0008177039257A87972B22394E4E1B2E7C07AB36C7BD7401998CB41A05A1D075",
                "NFTokenTaxon": 1056369418,
                "TransferFee": 6000,
                "nft_serial": 94490741,
                "URI": "https://ipfs.io/ipfs/QmTFb8bTxnouU62w66rTHdmTN4vt4XJGgEzbja8HSG3eii",
                "name": "Protector #460",
                "imageURI": "https://ipfs.io/ipfs/QmTFb8bTxnouU62w66rTHdmTN4vt4XJGgEzbja8HSG3eii"
              },
              {
                "Flags": 8,
                "Issuer": "rMAGea7B4RpncJSisk3EJaTgY4QLP9H4gq",
                "NFTokenID": "00082710E5A608694A82CE2495BB52D7CB92086ED4E0D1EC668C7BF9000000A1",
                "NFTokenTaxon": 262341,
                "TransferFee": 10000,
                "URI": "https://ipfs.io/ipfs/bafybeicfnh2rxlet54sadse52zhfyab32x4yiqkkypizjedd3er4ghy3rq/metadata.json",
                "nft_serial": 161,
                "name": "",
                "imageURI": "/static/media/nft.52183f074fccbf8d4453.png"
              },
              {
                "Flags": 8,
                "Issuer": "rH33CxyfF5A4UEPy9ViSfRAcUcCRAD7Pax",
                "NFTokenID": "00082710B0DB541085F5175810305B9CB8936E85D6B88BBDBF3D694705958ED0",
                "NFTokenTaxon": 300,
                "TransferFee": 10000,
                "URI": "https://ipfs.io/ipfs/QmYATTt4hmmFSpcmDFhRftdsYd8VgzCxV3ya3qK8ffsDJZ",
                "nft_serial": 93687504,
                "name": "BOTBUNNY #19",
                "imageURI": "https://ipfs.io/ipfs/QmYATTt4hmmFSpcmDFhRftdsYd8VgzCxV3ya3qK8ffsDJZ"
              },
              {
                "Flags": 8,
                "Issuer": "rL9VSEenU6HiKWvJzBnxcSBnoRxcFh7t7q",
                "NFTokenID": "00081388D2057449CD260B4E304F9686DE9E0798E949999D0ED7F30004EED267",
                "NFTokenTaxon": 2,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeiagcsvhtbbqmy4hmum7ixgkn6tsipor4i3so6wvswjabwhnen7vke/mazemaze-d-#2008.png",
                "nft_serial": 82760295,
                "name": "mazemaze-d #2008",
                "imageURI": "https://ipfs.io/ipfs/bafybeiagcsvhtbbqmy4hmum7ixgkn6tsipor4i3so6wvswjabwhnen7vke/mazemaze-d-#2008.png"
              },
              {
                "Flags": 8,
                "Issuer": "rL9VSEenU6HiKWvJzBnxcSBnoRxcFh7t7q",
                "NFTokenID": "00081388D2057449CD260B4E304F9686DE9E0798E949999D25BDC40104EED268",
                "NFTokenTaxon": 2,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeiagcsvhtbbqmy4hmum7ixgkn6tsipor4i3so6wvswjabwhnen7vke/mazemaze-d-#1037.png",
                "nft_serial": 82760296,
                "name": "mazemaze-d #1037",
                "imageURI": "https://ipfs.io/ipfs/bafybeiagcsvhtbbqmy4hmum7ixgkn6tsipor4i3so6wvswjabwhnen7vke/mazemaze-d-#1037.png"
              },
              {
                "Flags": 8,
                "Issuer": "rL9VSEenU6HiKWvJzBnxcSBnoRxcFh7t7q",
                "NFTokenID": "00081388D2057449CD260B4E304F9686DE9E0798E949999D3CA3950604EED269",
                "NFTokenTaxon": 2,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeiagcsvhtbbqmy4hmum7ixgkn6tsipor4i3so6wvswjabwhnen7vke/mazemaze-d-#560.png",
                "nft_serial": 82760297,
                "name": "mazemaze-d #560",
                "imageURI": "https://ipfs.io/ipfs/bafybeiagcsvhtbbqmy4hmum7ixgkn6tsipor4i3so6wvswjabwhnen7vke/mazemaze-d-#560.png"
              },
              {
                "Flags": 8,
                "Issuer": "r45dcdzSdikLsXjEu1Bpy6WxG2kjpf1Hc9",
                "NFTokenID": "00081388EE3A42955BC04BED2E0A2D9E1FF3559DF44491CC8B96A832058AF995",
                "NFTokenTaxon": 2,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeig27ipdzjg3sk2rlbghr5brbfc3ofe673rpfcugsb2fz7wvjvhpim/pixel-fro-852.png",
                "nft_serial": 92993941,
                "name": "Pixel Fro 852",
                "imageURI": "https://ipfs.io/ipfs/bafybeig27ipdzjg3sk2rlbghr5brbfc3ofe673rpfcugsb2fz7wvjvhpim/pixel-fro-852.png"
              },
              {
                "Flags": 8,
                "Issuer": "r45dcdzSdikLsXjEu1Bpy6WxG2kjpf1Hc9",
                "NFTokenID": "00081388EE3A42955BC04BED2E0A2D9E1FF3559DF44491CCA27C7933058AF996",
                "NFTokenTaxon": 2,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeig27ipdzjg3sk2rlbghr5brbfc3ofe673rpfcugsb2fz7wvjvhpim/pixel-fro-588.png",
                "nft_serial": 92993942,
                "name": "Pixel Fro 588",
                "imageURI": "https://ipfs.io/ipfs/bafybeig27ipdzjg3sk2rlbghr5brbfc3ofe673rpfcugsb2fz7wvjvhpim/pixel-fro-588.png"
              },
              {
                "Flags": 8,
                "Issuer": "rG5DkibGMrZE64PeH5YJ4PFFRsrdpxveKF",
                "NFTokenID": "00081388AC5596E714DB65805B3F3E7CA39A5DA1F9FB28061E426A7205A07BD5",
                "NFTokenTaxon": 2,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeihlolgflr4ck4vr5k4kcolrojh64clnbl63rpcd456pgn7nbtwwrm/squirrel-1111.png",
                "nft_serial": 94403541,
                "name": "Squirrel 1111",
                "imageURI": "https://ipfs.io/ipfs/bafybeihlolgflr4ck4vr5k4kcolrojh64clnbl63rpcd456pgn7nbtwwrm/squirrel-1111.png"
              },
              {
                "Flags": 8,
                "Issuer": "rG5DkibGMrZE64PeH5YJ4PFFRsrdpxveKF",
                "NFTokenID": "00081388AC5596E714DB65805B3F3E7CA39A5DA1F9FB280635283B7305A07BD6",
                "NFTokenTaxon": 2,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeihlolgflr4ck4vr5k4kcolrojh64clnbl63rpcd456pgn7nbtwwrm/squirrel-142.png",
                "nft_serial": 94403542,
                "name": "Squirrel 142",
                "imageURI": "https://ipfs.io/ipfs/bafybeihlolgflr4ck4vr5k4kcolrojh64clnbl63rpcd456pgn7nbtwwrm/squirrel-142.png"
              },
              {
                "Flags": 8,
                "Issuer": "rG5DkibGMrZE64PeH5YJ4PFFRsrdpxveKF",
                "NFTokenID": "00081388AC5596E714DB65805B3F3E7CA39A5DA1F9FB28064C0E0C7005A07BD7",
                "NFTokenTaxon": 2,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeihlolgflr4ck4vr5k4kcolrojh64clnbl63rpcd456pgn7nbtwwrm/squirrel-169.png",
                "nft_serial": 94403543,
                "name": "Squirrel 169",
                "imageURI": "https://ipfs.io/ipfs/bafybeihlolgflr4ck4vr5k4kcolrojh64clnbl63rpcd456pgn7nbtwwrm/squirrel-169.png"
              },
              {
                "Flags": 8,
                "Issuer": "rG5DkibGMrZE64PeH5YJ4PFFRsrdpxveKF",
                "NFTokenID": "00081388AC5596E714DB65805B3F3E7CA39A5DA1F9FB280662F3DD7105A07BD8",
                "NFTokenTaxon": 2,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeihlolgflr4ck4vr5k4kcolrojh64clnbl63rpcd456pgn7nbtwwrm/squirrel-145.png",
                "nft_serial": 94403544,
                "name": "Squirrel 145",
                "imageURI": "https://ipfs.io/ipfs/bafybeihlolgflr4ck4vr5k4kcolrojh64clnbl63rpcd456pgn7nbtwwrm/squirrel-145.png"
              },
              {
                "Flags": 8,
                "Issuer": "r9Lf4jiR2iCn2yu3C8aFViy7gnfnqfE7pb",
                "NFTokenID": "000813885B5E3B208D69921CA91275345628BEED6AE9FC98C994F2A905987B0E",
                "NFTokenTaxon": 0,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeiffgffeaxdiftsvuqdxjjn4dlb23soa65sjuifmvhdyyecf6a4ttm/1369.png",
                "nft_serial": 93879054,
                "name": "1369",
                "imageURI": "https://ipfs.io/ipfs/bafybeiffgffeaxdiftsvuqdxjjn4dlb23soa65sjuifmvhdyyecf6a4ttm/1369.png"
              },
              {
                "Flags": 8,
                "Issuer": "r9Lf4jiR2iCn2yu3C8aFViy7gnfnqfE7pb",
                "NFTokenID": "000813885B5E3B208D69921CA91275345628BEED6AE9FC98E07AC3AA05987B0F",
                "NFTokenTaxon": 0,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeiffgffeaxdiftsvuqdxjjn4dlb23soa65sjuifmvhdyyecf6a4ttm/1417.png",
                "nft_serial": 93879055,
                "name": "1417",
                "imageURI": "https://ipfs.io/ipfs/bafybeiffgffeaxdiftsvuqdxjjn4dlb23soa65sjuifmvhdyyecf6a4ttm/1417.png"
              },
              {
                "Flags": 8,
                "Issuer": "r9Lf4jiR2iCn2yu3C8aFViy7gnfnqfE7pb",
                "NFTokenID": "000813885B5E3B208D69921CA91275345628BEED6AE9FC98F76094AB05987B10",
                "NFTokenTaxon": 0,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeiffgffeaxdiftsvuqdxjjn4dlb23soa65sjuifmvhdyyecf6a4ttm/1388.png",
                "nft_serial": 93879056,
                "name": "1388",
                "imageURI": "https://ipfs.io/ipfs/bafybeiffgffeaxdiftsvuqdxjjn4dlb23soa65sjuifmvhdyyecf6a4ttm/1388.png"
              },
              {
                "Flags": 8,
                "Issuer": "rNkrZB94NDJWnTh3vFSJTNQh6Bgvd5ugmo",
                "NFTokenID": "00080FA096BBFC100461C433B3F4E616D482565D7694B3228B68904405948DA9",
                "NFTokenTaxon": 0,
                "TransferFee": 4000,
                "URI": "https://ipfs.io/ipfs/bafybeihvrp4ieif5uv6ujp3ct3gc2kwjimqk4uaw5j42jgqjs2cuf7jpca/schwepe-#35.png",
                "nft_serial": 93621673,
                "name": "Schwepe #35",
                "imageURI": "https://ipfs.io/ipfs/bafybeihvrp4ieif5uv6ujp3ct3gc2kwjimqk4uaw5j42jgqjs2cuf7jpca/schwepe-#35.png"
              },
              {
                "Flags": 8,
                "Issuer": "rXuRNhustnDwDrdHbyR8wPMTfRFghttPi",
                "NFTokenID": "00081B5805D83C2432A9D529FC19C52DCA8E61C08605C015138AB894058D65F9",
                "NFTokenTaxon": 0,
                "TransferFee": 7000,
                "URI": "https://ipfs.io/ipfs/bafybeiad6ial4x4astudqpwlzi4bfeog56tdvrrysi3lc2yv5mcldxi55u/budzy189.png",
                "nft_serial": 93152761,
                "name": "Budzy189",
                "imageURI": "https://ipfs.io/ipfs/bafybeiad6ial4x4astudqpwlzi4bfeog56tdvrrysi3lc2yv5mcldxi55u/budzy189.png"
              },
              {
                "Flags": 8,
                "Issuer": "rXuRNhustnDwDrdHbyR8wPMTfRFghttPi",
                "NFTokenID": "00081B5805D83C2432A9D529FC19C52DCA8E61C08605C0152A708995058D65FA",
                "NFTokenTaxon": 0,
                "TransferFee": 7000,
                "URI": "https://ipfs.io/ipfs/bafybeiad6ial4x4astudqpwlzi4bfeog56tdvrrysi3lc2yv5mcldxi55u/budzy266.png",
                "nft_serial": 93152762,
                "name": "Budzy266",
                "imageURI": "https://ipfs.io/ipfs/bafybeiad6ial4x4astudqpwlzi4bfeog56tdvrrysi3lc2yv5mcldxi55u/budzy266.png"
              },
              {
                "Flags": 8,
                "Issuer": "rXuRNhustnDwDrdHbyR8wPMTfRFghttPi",
                "NFTokenID": "00081B5805D83C2432A9D529FC19C52DCA8E61C08605C01541565A96058D65FB",
                "NFTokenTaxon": 0,
                "TransferFee": 7000,
                "URI": "https://ipfs.io/ipfs/bafybeiad6ial4x4astudqpwlzi4bfeog56tdvrrysi3lc2yv5mcldxi55u/budzy24.png",
                "nft_serial": 93152763,
                "name": "Budzy24",
                "imageURI": "https://ipfs.io/ipfs/bafybeiad6ial4x4astudqpwlzi4bfeog56tdvrrysi3lc2yv5mcldxi55u/budzy24.png"
              },
              {
                "Flags": 8,
                "Issuer": "rXuRNhustnDwDrdHbyR8wPMTfRFghttPi",
                "NFTokenID": "00081B5805D83C2432A9D529FC19C52DCA8E61C08605C015E5BF1692058D65F7",
                "NFTokenTaxon": 0,
                "TransferFee": 7000,
                "URI": "https://ipfs.io/ipfs/bafybeiad6ial4x4astudqpwlzi4bfeog56tdvrrysi3lc2yv5mcldxi55u/budzy148.png",
                "nft_serial": 93152759,
                "name": "Budzy148",
                "imageURI": "https://ipfs.io/ipfs/bafybeiad6ial4x4astudqpwlzi4bfeog56tdvrrysi3lc2yv5mcldxi55u/budzy148.png"
              },
              {
                "Flags": 8,
                "Issuer": "rXuRNhustnDwDrdHbyR8wPMTfRFghttPi",
                "NFTokenID": "00081B5805D83C2432A9D529FC19C52DCA8E61C08605C015FCA4E793058D65F8",
                "NFTokenTaxon": 0,
                "TransferFee": 7000,
                "URI": "https://ipfs.io/ipfs/bafybeiad6ial4x4astudqpwlzi4bfeog56tdvrrysi3lc2yv5mcldxi55u/budzy200.png",
                "nft_serial": 93152760,
                "name": "Budzy200",
                "imageURI": "https://ipfs.io/ipfs/bafybeiad6ial4x4astudqpwlzi4bfeog56tdvrrysi3lc2yv5mcldxi55u/budzy200.png"
              },
              {
                "Flags": 8,
                "Issuer": "rsbvxRFMqFWeNm1BqzweFcyxsH8bPhpeCd",
                "NFTokenID": "00084E201C8B6F265F9DC42C5BEEC4ADE36BC05D8881B8888B5E8593058DD4F7",
                "NFTokenTaxon": 1,
                "TransferFee": 20000,
                "URI": "https://ipfs.io/ipfs/QmNMkxxcJuag8KckWpNUkCQEE3XbNTXdRnpm2iPuozTPaq",
                "nft_serial": 93181175,
                "name": "Rage",
                "imageURI": "https://ipfs.io/ipfs/QmNMkxxcJuag8KckWpNUkCQEE3XbNTXdRnpm2iPuozTPaq"
              },
              {
                "Flags": 8,
                "Issuer": "rsbvxRFMqFWeNm1BqzweFcyxsH8bPhpeCd",
                "NFTokenID": "00084E201C8B6F265F9DC42C5BEEC4ADE36BC05D8881B888CD5ED4E3058DD447",
                "NFTokenTaxon": 1,
                "TransferFee": 20000,
                "URI": "https://ipfs.io/ipfs/Qmbyu1j7z95Gbyc5t7Ac3BxMp65WHSKiMA29RjWHeogJu4",
                "nft_serial": 93180999,
                "name": "Mike'Dood",
                "imageURI": "https://ipfs.io/ipfs/Qmbyu1j7z95Gbyc5t7Ac3BxMp65WHSKiMA29RjWHeogJu4"
              },
              {
                "Flags": 8,
                "Issuer": "rsRfacvEVocG5rtjV2QcfLEKYyxKnjkjfb",
                "NFTokenID": "00081D4C1A7F52F67365FBD1E206D3DD9F3F0EBE9F780ECA820107A504AF859F",
                "NFTokenTaxon": 22943,
                "TransferFee": 7500,
                "URI": "https://ipfs.io/ipfs/bafybeibvyskyq5ha4xjgrhbefgnyyc2zqbzu7r3v5v7jbvbgk2fq77lg3y/1679695116757.png",
                "nft_serial": 78611871,
                "name": "TextRP Launch Pack #1105",
                "imageURI": "https://ipfs.io/ipfs/bafybeibvyskyq5ha4xjgrhbefgnyyc2zqbzu7r3v5v7jbvbgk2fq77lg3y/1679695116757.png"
              },
              {
                "Flags": 8,
                "Issuer": "rpw5fuWx3VLUrLDihhE6S7mDkvJKYk9e4k",
                "NFTokenID": "00083A980CCE31A393C75676FDEE52B4F8F9F023A42B1F91E94FE57B05AB9D0F",
                "NFTokenTaxon": 209,
                "TransferFee": 15000,
                "URI": "https://ipfs.io/ipfs/bafybeigknumxygcatllavppeffc47hmdxddxhq5nknj52iextczxnbqnfy/cac#107.png",
                "nft_serial": 95132943,
                "name": "CAC#107",
                "imageURI": "https://ipfs.io/ipfs/bafybeigknumxygcatllavppeffc47hmdxddxhq5nknj52iextczxnbqnfy/cac#107.png"
              },
              {
                "Flags": 8,
                "Issuer": "rC14MnbXDM5X8prcq9hL7kcyx3g3qF7qU",
                "NFTokenID": "000813880759DA06F3D8F182B94ED320846DD509B2BFBCFE496F423005A99395",
                "NFTokenTaxon": 0,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeifzsjiyjk2wmzwz7gz5mgqjh5jneoa6vd3mboj7fr64kd3d4w3duu/Squirrel41.png",
                "nft_serial": 94999445,
                "name": "Squirrel41",
                "imageURI": "https://ipfs.io/ipfs/bafybeifzsjiyjk2wmzwz7gz5mgqjh5jneoa6vd3mboj7fr64kd3d4w3duu/Squirrel41.png"
              },
              {
                "Flags": 8,
                "Issuer": "rC14MnbXDM5X8prcq9hL7kcyx3g3qF7qU",
                "NFTokenID": "000813880759DA06F3D8F182B94ED320846DD509B2BFBCFEEDD7FE2C05A99391",
                "NFTokenTaxon": 0,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeifzsjiyjk2wmzwz7gz5mgqjh5jneoa6vd3mboj7fr64kd3d4w3duu/Squirrel5.png",
                "nft_serial": 94999441,
                "name": "Squirrel55",
                "imageURI": "https://ipfs.io/ipfs/bafybeifzsjiyjk2wmzwz7gz5mgqjh5jneoa6vd3mboj7fr64kd3d4w3duu/Squirrel5.png"
              },
              {
                "Flags": 8,
                "Issuer": "rKQkjmocgRWo9AnNRrsgP2EnDxvN44MQxK",
                "NFTokenID": "00080BB8C9F057673FC8D5A78215B8BA9FD5A2A9B7F8540E0F979831059BE995",
                "NFTokenTaxon": 1,
                "TransferFee": 3000,
                "URI": "https://ipfs.io/ipfs/bafybeihtn4toky6o7itnka4rfciib6ueo7f2pvx7332b7rcxtghvzqhlfa/72.png",
                "nft_serial": 94103957,
                "name": "72",
                "imageURI": "https://ipfs.io/ipfs/bafybeihtn4toky6o7itnka4rfciib6ueo7f2pvx7332b7rcxtghvzqhlfa/72.png"
              },
              {
                "Flags": 8,
                "Issuer": "rKQkjmocgRWo9AnNRrsgP2EnDxvN44MQxK",
                "NFTokenID": "00080BB8C9F057673FC8D5A78215B8BA9FD5A2A9B7F8540E267D6930059BE996",
                "NFTokenTaxon": 1,
                "TransferFee": 3000,
                "URI": "https://ipfs.io/ipfs/bafybeihtn4toky6o7itnka4rfciib6ueo7f2pvx7332b7rcxtghvzqhlfa/1803.png",
                "nft_serial": 94103958,
                "name": "1803",
                "imageURI": "https://ipfs.io/ipfs/bafybeihtn4toky6o7itnka4rfciib6ueo7f2pvx7332b7rcxtghvzqhlfa/1803.png"
              },
              {
                "Flags": 8,
                "Issuer": "rKQkjmocgRWo9AnNRrsgP2EnDxvN44MQxK",
                "NFTokenID": "00080BB8C9F057673FC8D5A78215B8BA9FD5A2A9B7F8540E3D633A33059BE997",
                "NFTokenTaxon": 1,
                "TransferFee": 3000,
                "URI": "https://ipfs.io/ipfs/bafybeihtn4toky6o7itnka4rfciib6ueo7f2pvx7332b7rcxtghvzqhlfa/2387.png",
                "nft_serial": 94103959,
                "name": "2387",
                "imageURI": "https://ipfs.io/ipfs/bafybeihtn4toky6o7itnka4rfciib6ueo7f2pvx7332b7rcxtghvzqhlfa/2387.png"
              },
              {
                "Flags": 8,
                "Issuer": "rKQkjmocgRWo9AnNRrsgP2EnDxvN44MQxK",
                "NFTokenID": "00080BB8C9F057673FC8D5A78215B8BA9FD5A2A9B7F8540E6B2EDC35059BE999",
                "NFTokenTaxon": 1,
                "TransferFee": 3000,
                "URI": "https://ipfs.io/ipfs/bafybeihtn4toky6o7itnka4rfciib6ueo7f2pvx7332b7rcxtghvzqhlfa/1017.png",
                "nft_serial": 94103961,
                "name": "1017",
                "imageURI": "https://ipfs.io/ipfs/bafybeihtn4toky6o7itnka4rfciib6ueo7f2pvx7332b7rcxtghvzqhlfa/1017.png"
              },
              {
                "Flags": 8,
                "Issuer": "rKQkjmocgRWo9AnNRrsgP2EnDxvN44MQxK",
                "NFTokenID": "00080BB8C9F057673FC8D5A78215B8BA9FD5A2A9B7F8540E8214AD34059BE99A",
                "NFTokenTaxon": 1,
                "TransferFee": 3000,
                "URI": "https://ipfs.io/ipfs/bafybeihtn4toky6o7itnka4rfciib6ueo7f2pvx7332b7rcxtghvzqhlfa/2769.png",
                "nft_serial": 94103962,
                "name": "2769",
                "imageURI": "https://ipfs.io/ipfs/bafybeihtn4toky6o7itnka4rfciib6ueo7f2pvx7332b7rcxtghvzqhlfa/2769.png"
              },
              {
                "Flags": 8,
                "Issuer": "rKQkjmocgRWo9AnNRrsgP2EnDxvN44MQxK",
                "NFTokenID": "00080BB8C9F057673FC8D5A78215B8BA9FD5A2A9B7F8540E98FA7E37059BE99B",
                "NFTokenTaxon": 1,
                "TransferFee": 3000,
                "URI": "https://ipfs.io/ipfs/bafybeihtn4toky6o7itnka4rfciib6ueo7f2pvx7332b7rcxtghvzqhlfa/1385.png",
                "nft_serial": 94103963,
                "name": "1385",
                "imageURI": "https://ipfs.io/ipfs/bafybeihtn4toky6o7itnka4rfciib6ueo7f2pvx7332b7rcxtghvzqhlfa/1385.png"
              },
              {
                "Flags": 8,
                "Issuer": "rKQkjmocgRWo9AnNRrsgP2EnDxvN44MQxK",
                "NFTokenID": "00080BB8C9F057673FC8D5A78215B8BA9FD5A2A9B7F8540EAFE04F36059BE99C",
                "NFTokenTaxon": 1,
                "TransferFee": 3000,
                "URI": "https://ipfs.io/ipfs/bafybeihtn4toky6o7itnka4rfciib6ueo7f2pvx7332b7rcxtghvzqhlfa/2668.png",
                "nft_serial": 94103964,
                "name": "2668",
                "imageURI": "https://ipfs.io/ipfs/bafybeihtn4toky6o7itnka4rfciib6ueo7f2pvx7332b7rcxtghvzqhlfa/2668.png"
              },
              {
                "Flags": 8,
                "Issuer": "rKQkjmocgRWo9AnNRrsgP2EnDxvN44MQxK",
                "NFTokenID": "00080BB8C9F057673FC8D5A78215B8BA9FD5A2A9B7F8540EC6C62039059BE99D",
                "NFTokenTaxon": 1,
                "TransferFee": 3000,
                "URI": "https://ipfs.io/ipfs/bafybeihtn4toky6o7itnka4rfciib6ueo7f2pvx7332b7rcxtghvzqhlfa/3327.png",
                "nft_serial": 94103965,
                "name": "3327",
                "imageURI": "https://ipfs.io/ipfs/bafybeihtn4toky6o7itnka4rfciib6ueo7f2pvx7332b7rcxtghvzqhlfa/3327.png"
              },
              {
                "Flags": 8,
                "Issuer": "rKQkjmocgRWo9AnNRrsgP2EnDxvN44MQxK",
                "NFTokenID": "00080BB8C9F057673FC8D5A78215B8BA9FD5A2A9B7F8540EDDABF138059BE99E",
                "NFTokenTaxon": 1,
                "TransferFee": 3000,
                "URI": "https://ipfs.io/ipfs/bafybeihtn4toky6o7itnka4rfciib6ueo7f2pvx7332b7rcxtghvzqhlfa/601.png",
                "nft_serial": 94103966,
                "name": "601",
                "imageURI": "https://ipfs.io/ipfs/bafybeihtn4toky6o7itnka4rfciib6ueo7f2pvx7332b7rcxtghvzqhlfa/601.png"
              },
              {
                "Flags": 8,
                "Issuer": "rDeizxSRo6JHjKnih9ivpPkyD2EgXQvhSB",
                "NFTokenID": "000803E88ACAA32313BB87F729EF7DA56BD13C57BE46E3C813BDDC7904804BD7",
                "NFTokenTaxon": 11,
                "TransferFee": 1000,
                "URI": "https://ipfs.io/ipfs/QmQUnge3Gg7fqFXRgVBoAeKSVQ139JupHBk3NPgmcT7ZAE",
                "nft_serial": 75516887,
                "name": "Last of the Old Guard",
                "imageURI": "https://ipfs.io/ipfs/QmQUnge3Gg7fqFXRgVBoAeKSVQ139JupHBk3NPgmcT7ZAE"
              },
              {
                "Flags": 8,
                "Issuer": "rDeizxSRo6JHjKnih9ivpPkyD2EgXQvhSB",
                "NFTokenID": "000803E88ACAA32313BB87F729EF7DA56BD13C57BE46E3C87308125904802EBA",
                "NFTokenTaxon": 12,
                "TransferFee": 1000,
                "URI": "https://ipfs.io/ipfs/QmPrUeUhVB9FGywsocftdykbdwAps85oVwc36FNYUMUqNX",
                "nft_serial": 75509434,
                "name": "Love Is the Ultimate Conspiracy",
                "imageURI": "https://ipfs.io/ipfs/QmPrUeUhVB9FGywsocftdykbdwAps85oVwc36FNYUMUqNX"
              },
              {
                "Flags": 8,
                "Issuer": "rDeizxSRo6JHjKnih9ivpPkyD2EgXQvhSB",
                "NFTokenID": "000803E88ACAA32313BB87F729EF7DA56BD13C57BE46E3C8B8EB4180048047F0",
                "NFTokenTaxon": 11,
                "TransferFee": 1000,
                "URI": "https://ipfs.io/ipfs/QmRkgTE74je3vGtWYyWZKky5PUoo7woBQVWzvZVqek5DFp",
                "nft_serial": 75515888,
                "name": "The Ledger Keeper – Silent Watcher",
                "imageURI": "https://ipfs.io/ipfs/QmRkgTE74je3vGtWYyWZKky5PUoo7woBQVWzvZVqek5DFp"
              },
              {
                "Flags": 8,
                "Issuer": "rDeizxSRo6JHjKnih9ivpPkyD2EgXQvhSB",
                "NFTokenID": "000803E88ACAA32313BB87F729EF7DA56BD13C57BE46E3C8E3C894FF047F2B60",
                "NFTokenTaxon": 4,
                "TransferFee": 1000,
                "URI": "https://ipfs.io/ipfs/Qmdbx55cNxixhERL2aSQqXKLFLAqKT3k3hziWAadHbPaqZ",
                "nft_serial": 75443040,
                "name": "Sir Hodl My Beer",
                "imageURI": "https://ipfs.io/ipfs/Qmdbx55cNxixhERL2aSQqXKLFLAqKT3k3hziWAadHbPaqZ"
              },
              {
                "Flags": 8,
                "Issuer": "r9X5Gc9hzu6s9CpEjAy1YkxWmxeJrSTtCL",
                "NFTokenID": "000813885D8FEF4F6B5DFF069E885A86A0A48B212FF7CF5DEC729F070593DC69",
                "NFTokenTaxon": 3,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeih22dtwtdxtznot7gog4iyalmckbqamy4wi4ozlvyphhkyulih7ei/30.png",
                "nft_serial": 93576297,
                "name": "30",
                "imageURI": "https://ipfs.io/ipfs/bafybeih22dtwtdxtznot7gog4iyalmckbqamy4wi4ozlvyphhkyulih7ei/30.png"
              },
              {
                "Flags": 8,
                "Issuer": "rEvDDyCEbXjLpp2X4kSvGQ4edqFLTvi2qG",
                "NFTokenID": "00081B58A3A202C48BADB13F023611F99B913F8B3097FA2D02603E1C0583B480",
                "NFTokenTaxon": 7,
                "TransferFee": 7000,
                "URI": "https://ipfs.io/ipfs/bafybeidlgfsao24g7wj6cyhohfwq2nbjpr6laaeu2mce6fvaxh2ayp6kcq/Radiancy576.png",
                "nft_serial": 92517504,
                "name": "Radiancy #576",
                "imageURI": "https://ipfs.io/ipfs/bafybeidlgfsao24g7wj6cyhohfwq2nbjpr6laaeu2mce6fvaxh2ayp6kcq/Radiancy576.png"
              },
              {
                "Flags": 8,
                "Issuer": "rfYuatBGcU9gjd89bMPcxNABL2DhFd8Sje",
                "NFTokenID": "00081B5847D9243F76287C3C34F87C0AB342A79536C07F37715454E104B9367A",
                "NFTokenTaxon": 36596,
                "TransferFee": 7000,
                "URI": "https://ipfs.io/ipfs/bafybeigysoa4gzk2aggwislfvok5yigvgvhqsiw3pfninvvaw2zbud6azy/1682182663832.png",
                "nft_serial": 79246970,
                "name": "Duckset Diploquacks #2446",
                "imageURI": "https://ipfs.io/ipfs/bafybeigysoa4gzk2aggwislfvok5yigvgvhqsiw3pfninvvaw2zbud6azy/1682182663832.png"
              },
              {
                "Flags": 8,
                "Issuer": "rfYuatBGcU9gjd89bMPcxNABL2DhFd8Sje",
                "NFTokenID": "00081B5847D9243F76287C3C34F87C0AB342A79536C07F37883A25E204B9367B",
                "NFTokenTaxon": 36596,
                "TransferFee": 7000,
                "URI": "https://ipfs.io/ipfs/bafybeiaybdl7whk5vi6fcsgku2iciihfjdu57nxl4qdx34e7qrcx5l5ymu/1682182656622.png",
                "nft_serial": 79246971,
                "name": "Duckset Diploquacks #2366",
                "imageURI": "https://ipfs.io/ipfs/bafybeiaybdl7whk5vi6fcsgku2iciihfjdu57nxl4qdx34e7qrcx5l5ymu/1682182656622.png"
              },
              {
                "Flags": 8,
                "Issuer": "rUXxqBydzStBVz6fwHcJBzqxbnV7yASnrj",
                "NFTokenID": "00080BB87E8477BC9173037031759D584FF6BA1F3D16EE290C3BC8180583B17D",
                "NFTokenTaxon": 0,
                "TransferFee": 3000,
                "URI": "https://ipfs.io/ipfs/QmPTUnM2U2ncEMBeUCPfGwTkeNAJ8hw9VTusApo8ErRT2F",
                "nft_serial": 92516733,
                "name": "Blazonry 114",
                "imageURI": "https://ipfs.io/ipfs/QmPTUnM2U2ncEMBeUCPfGwTkeNAJ8hw9VTusApo8ErRT2F"
              },
              {
                "Flags": 10,
                "Issuer": "rUXxqBydzStBVz6fwHcJBzqxbnV7yASnrj",
                "NFTokenID": "000A0BB87E8477BC9173037031759D584FF6BA1F3D16EE296F3C3F100583B075",
                "NFTokenTaxon": 0,
                "TransferFee": 3000,
                "URI": "https://ipfs.io/ipfs/bafybeigqjpgoro3mrabqm7og6w3feuiz5vnbyewtda3wfywzvfunzyeuci/blazonry-#98.png",
                "nft_serial": 92516469,
                "name": "Blazonry #98",
                "imageURI": "https://ipfs.io/ipfs/bafybeigqjpgoro3mrabqm7og6w3feuiz5vnbyewtda3wfywzvfunzyeuci/blazonry-#98.png"
              },
              {
                "Flags": 8,
                "Issuer": "rUXxqBydzStBVz6fwHcJBzqxbnV7yASnrj",
                "NFTokenID": "000827107E8477BC9173037031759D584FF6BA1F3D16EE29C9D00D4F0583B1B2",
                "NFTokenTaxon": 2,
                "TransferFee": 10000,
                "URI": "https://ipfs.io/ipfs/bafybeihejepukvd5qfprdwgnbkzu2van5vlw5lleufdrbqyx3dfeapiiou/blazonry-#375.png",
                "nft_serial": 92516786,
                "name": "Blazonry #375",
                "imageURI": "https://ipfs.io/ipfs/bafybeihejepukvd5qfprdwgnbkzu2van5vlw5lleufdrbqyx3dfeapiiou/blazonry-#375.png"
              },
              {
                "Flags": 8,
                "Issuer": "rUXxqBydzStBVz6fwHcJBzqxbnV7yASnrj",
                "NFTokenID": "000827107E8477BC9173037031759D584FF6BA1F3D16EE29E0B5DE4C0583B1B3",
                "NFTokenTaxon": 2,
                "TransferFee": 10000,
                "URI": "https://ipfs.io/ipfs/bafybeihejepukvd5qfprdwgnbkzu2van5vlw5lleufdrbqyx3dfeapiiou/blazonry-#549.png",
                "nft_serial": 92516787,
                "name": "Blazonry #549",
                "imageURI": "https://ipfs.io/ipfs/bafybeihejepukvd5qfprdwgnbkzu2van5vlw5lleufdrbqyx3dfeapiiou/blazonry-#549.png"
              },
              {
                "Flags": 10,
                "Issuer": "rwUAG1P4uyVjCZH39tuGizuD1s6NwvSWWw",
                "NFTokenID": "000A271064FB0350D6F39535FDDC03F479701A994B72DD8C6797A8D005895A35",
                "NFTokenTaxon": 0,
                "TransferFee": 10000,
                "URI": "https://ipfs.io/ipfs/bafybeideflk57rmxd434qh5cptpxbn75avrr6tmglfndkh6bl63f5hn47u/bunoichi27.png",
                "nft_serial": 92887605,
                "name": "bunoichi27",
                "imageURI": "https://ipfs.io/ipfs/bafybeideflk57rmxd434qh5cptpxbn75avrr6tmglfndkh6bl63f5hn47u/bunoichi27.png"
              },
              {
                "Flags": 10,
                "Issuer": "rwUAG1P4uyVjCZH39tuGizuD1s6NwvSWWw",
                "NFTokenID": "000A271064FB0350D6F39535FDDC03F479701A994B72DD8CC74EF1C905895A2E",
                "NFTokenTaxon": 0,
                "TransferFee": 10000,
                "URI": "https://ipfs.io/ipfs/bafybeideflk57rmxd434qh5cptpxbn75avrr6tmglfndkh6bl63f5hn47u/bunoichi13.png",
                "nft_serial": 92887598,
                "name": "bunoichi13",
                "imageURI": "https://ipfs.io/ipfs/bafybeideflk57rmxd434qh5cptpxbn75avrr6tmglfndkh6bl63f5hn47u/bunoichi13.png"
              },
              {
                "Flags": 8,
                "Issuer": "rGxvGE5pQNLt3WQkz98gA1Ymp2n6tNUtmj",
                "NFTokenID": "00083A98AF1D39F2E0BB0FE30354A43281629A0B50F4E6390B8E5AFE0588E74A",
                "NFTokenTaxon": 27,
                "TransferFee": 15000,
                "URI": "https://ipfs.io/ipfs/bafybeicm34e2imfbxkxrmmngki2t22zzlygogii32m43ki5ipbjowv2xyu/xaman-punks-#53.png",
                "nft_serial": 92858186,
                "name": "Xaman Punks #53",
                "imageURI": "https://ipfs.io/ipfs/bafybeicm34e2imfbxkxrmmngki2t22zzlygogii32m43ki5ipbjowv2xyu/xaman-punks-#53.png"
              },
              {
                "Flags": 8,
                "Issuer": "rGxvGE5pQNLt3WQkz98gA1Ymp2n6tNUtmj",
                "NFTokenID": "00083A98AF1D39F2E0BB0FE30354A43281629A0B50F4E6394AB0E7AF0588E816",
                "NFTokenTaxon": 30,
                "TransferFee": 15000,
                "URI": "https://ipfs.io/ipfs/bafybeiaphtqo6jznkt5nzqicudbimthi2ldwubo6imxhotmetqcwkr2wfi/bored-ape-bricks-club-#66.png",
                "nft_serial": 92858390,
                "name": "Bored Ape Bricks Club #66",
                "imageURI": "https://ipfs.io/ipfs/bafybeiaphtqo6jznkt5nzqicudbimthi2ldwubo6imxhotmetqcwkr2wfi/bored-ape-bricks-club-#66.png"
              },
              {
                "Flags": 8,
                "Issuer": "rGAVUGyhdbxQs1G7nwCCFU4w8P4HfgFKD6",
                "NFTokenID": "00081B58AED7E25A9085DF5E80EA66DD1E058557537FC91C94FD727D05A9C195",
                "NFTokenTaxon": 589,
                "TransferFee": 7000,
                "URI": "https://ipfs.io/ipfs/bafybeiflmaxmd7bjnkd6kl7rkwv4no36dx2dytvj32llshf7cr3ppmi7oq/207.png",
                "nft_serial": 95011221,
                "name": "Scrappy #207",
                "imageURI": "https://ipfs.io/ipfs/bafybeiflmaxmd7bjnkd6kl7rkwv4no36dx2dytvj32llshf7cr3ppmi7oq/207.png"
              },
              {
                "Flags": 8,
                "Issuer": "rJ4SUedyLMFmJpAbGwRR98j7fFdcdicJq5",
                "NFTokenID": "00081B58BE87E8FE0D574B41316669E8C18B710A57801F39CAF2C514057C217A",
                "NFTokenTaxon": 1,
                "TransferFee": 7000,
                "URI": "https://ipfs.io/ipfs/bafybeibkbpvq6uowpcgsmbzwgvxsmyy72s2pz43fqgl2ovzhfvb26ww7lu/2568.png",
                "nft_serial": 92021114,
                "name": "Trek #2568",
                "imageURI": "https://ipfs.io/ipfs/bafybeibkbpvq6uowpcgsmbzwgvxsmyy72s2pz43fqgl2ovzhfvb26ww7lu/2568.png"
              },
              {
                "Flags": 8,
                "Issuer": "rPF7yQqH9zrDDTGayAXjXrFJiPoiUhMUTg",
                "NFTokenID": "00081F40FA4DAAF4E453B3D2077D8B23B6BDEA395A67A7220B6DAA1704EC974C",
                "NFTokenTaxon": 1776,
                "TransferFee": 8000,
                "URI": "https://ipfs.io/ipfs/QmWEtsFb6EthMqqd5qMJgagNi7spkYD4y3Ncke1RMTiqyH",
                "nft_serial": 82614092,
                "name": "Xhero#96",
                "imageURI": "https://ipfs.io/ipfs/QmWEtsFb6EthMqqd5qMJgagNi7spkYD4y3Ncke1RMTiqyH"
              },
              {
                "Flags": 8,
                "Issuer": "rp5nzcQu54eQdcELSApdy4F4aKva771dSt",
                "NFTokenID": "0008271012BD5930DE2ED15A2E5057B84461F2FB60CA735B03AE8720059C1786",
                "NFTokenTaxon": 1,
                "TransferFee": 10000,
                "URI": "https://ipfs.io/ipfs/bafybeihwym5mizqqypqdfyh4uhav3ucbxpvojsdcqicfq3tw2gy3iiaws4/5817.jpg",
                "nft_serial": 94115718,
                "name": "Money Minded Community Pixel Collection #5817",
                "imageURI": "https://ipfs.io/ipfs/bafybeihwym5mizqqypqdfyh4uhav3ucbxpvojsdcqicfq3tw2gy3iiaws4/5817.jpg"
              },
              {
                "Flags": 8,
                "Issuer": "rp5nzcQu54eQdcELSApdy4F4aKva771dSt",
                "NFTokenID": "0008271012BD5930DE2ED15A2E5057B84461F2FB60CA735BD5E2E51E059C1784",
                "NFTokenTaxon": 1,
                "TransferFee": 10000,
                "URI": "https://ipfs.io/ipfs/bafybeihwym5mizqqypqdfyh4uhav3ucbxpvojsdcqicfq3tw2gy3iiaws4/7700.jpg",
                "nft_serial": 94115716,
                "name": "Money Minded Community Pixel Collection #7700",
                "imageURI": "https://ipfs.io/ipfs/bafybeihwym5mizqqypqdfyh4uhav3ucbxpvojsdcqicfq3tw2gy3iiaws4/7700.jpg"
              },
              {
                "Flags": 8,
                "Issuer": "r9Lf4jiR2iCn2yu3C8aFViy7gnfnqfE7pb",
                "NFTokenID": "000813885B5E3B208D69921CA91275345628BEED6AE9FC980E4665AC05987B11",
                "NFTokenTaxon": 0,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeiffgffeaxdiftsvuqdxjjn4dlb23soa65sjuifmvhdyyecf6a4ttm/120.png",
                "nft_serial": 93879057,
                "name": "120",
                "imageURI": "https://ipfs.io/ipfs/bafybeiffgffeaxdiftsvuqdxjjn4dlb23soa65sjuifmvhdyyecf6a4ttm/120.png"
              },
              {
                "Flags": 8,
                "Issuer": "r9Lf4jiR2iCn2yu3C8aFViy7gnfnqfE7pb",
                "NFTokenID": "000813885B5E3B208D69921CA91275345628BEED6AE9FC98252C36AD05987B12",
                "NFTokenTaxon": 0,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeiffgffeaxdiftsvuqdxjjn4dlb23soa65sjuifmvhdyyecf6a4ttm/1431.png",
                "nft_serial": 93879058,
                "name": "1431",
                "imageURI": "https://ipfs.io/ipfs/bafybeiffgffeaxdiftsvuqdxjjn4dlb23soa65sjuifmvhdyyecf6a4ttm/1431.png"
              },
              {
                "Flags": 8,
                "Issuer": "r9Lf4jiR2iCn2yu3C8aFViy7gnfnqfE7pb",
                "NFTokenID": "000813885B5E3B208D69921CA91275345628BEED6AE9FC983C1207AE05987B13",
                "NFTokenTaxon": 0,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeiffgffeaxdiftsvuqdxjjn4dlb23soa65sjuifmvhdyyecf6a4ttm/1201.png",
                "nft_serial": 93879059,
                "name": "1201",
                "imageURI": "https://ipfs.io/ipfs/bafybeiffgffeaxdiftsvuqdxjjn4dlb23soa65sjuifmvhdyyecf6a4ttm/1201.png"
              },
              {
                "Flags": 8,
                "Issuer": "r9Lf4jiR2iCn2yu3C8aFViy7gnfnqfE7pb",
                "NFTokenID": "000813885B5E3B208D69921CA91275345628BEED6AE9FC9852F7D8AF05987B14",
                "NFTokenTaxon": 0,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeiffgffeaxdiftsvuqdxjjn4dlb23soa65sjuifmvhdyyecf6a4ttm/1227.png",
                "nft_serial": 93879060,
                "name": "1227",
                "imageURI": "https://ipfs.io/ipfs/bafybeiffgffeaxdiftsvuqdxjjn4dlb23soa65sjuifmvhdyyecf6a4ttm/1227.png"
              },
              {
                "Flags": 8,
                "Issuer": "r9Lf4jiR2iCn2yu3C8aFViy7gnfnqfE7pb",
                "NFTokenID": "000813885B5E3B208D69921CA91275345628BEED6AE9FC9869DDA9B005987B15",
                "NFTokenTaxon": 0,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeiffgffeaxdiftsvuqdxjjn4dlb23soa65sjuifmvhdyyecf6a4ttm/1647.png",
                "nft_serial": 93879061,
                "name": "1647",
                "imageURI": "https://ipfs.io/ipfs/bafybeiffgffeaxdiftsvuqdxjjn4dlb23soa65sjuifmvhdyyecf6a4ttm/1647.png"
              },
              {
                "Flags": 8,
                "Issuer": "r9Lf4jiR2iCn2yu3C8aFViy7gnfnqfE7pb",
                "NFTokenID": "000813885B5E3B208D69921CA91275345628BEED6AE9FC9880C37AB105987B16",
                "NFTokenTaxon": 0,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeiffgffeaxdiftsvuqdxjjn4dlb23soa65sjuifmvhdyyecf6a4ttm/1995.png",
                "nft_serial": 93879062,
                "name": "1995",
                "imageURI": "https://ipfs.io/ipfs/bafybeiffgffeaxdiftsvuqdxjjn4dlb23soa65sjuifmvhdyyecf6a4ttm/1995.png"
              },
              {
                "Flags": 8,
                "Issuer": "r9Lf4jiR2iCn2yu3C8aFViy7gnfnqfE7pb",
                "NFTokenID": "000813885B5E3B208D69921CA91275345628BEED6AE9FC98B2AF21A805987B0D",
                "NFTokenTaxon": 0,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeiffgffeaxdiftsvuqdxjjn4dlb23soa65sjuifmvhdyyecf6a4ttm/1437.png",
                "nft_serial": 93879053,
                "name": "1437",
                "imageURI": "https://ipfs.io/ipfs/bafybeiffgffeaxdiftsvuqdxjjn4dlb23soa65sjuifmvhdyyecf6a4ttm/1437.png"
              },
              {
                "Flags": 8,
                "Issuer": "rUDRQfn1hr84kVqQ42BoLgBsLtRgMWD4k5",
                "NFTokenID": "000880E87B02BDEC677854602C4D776A65081AF702C8EEF1E2387AD8057E6041",
                "NFTokenTaxon": 4,
                "TransferFee": 33000,
                "URI": "https://ipfs.io/ipfs/bafybeig6cr33xbyku5nq2zexsrptvqpicri5m3hichsj6nznrqymqfnc3m/ticket-#213.png",
                "nft_serial": 92168257,
                "name": "TICKET #213",
                "imageURI": "https://ipfs.io/ipfs/bafybeig6cr33xbyku5nq2zexsrptvqpicri5m3hichsj6nznrqymqfnc3m/ticket-#213.png"
              },
              {
                "Flags": 8,
                "Issuer": "rP9jGcAaVjpdqcdHbEckLtRoCYjETxXosj",
                "NFTokenID": "00082AF8F2F9612BC2DF219BDE54777C2EE87D4E0545987814CFD4EC040A1EAA",
                "NFTokenTaxon": 1173038761,
                "TransferFee": 11000,
                "nft_serial": 67772074,
                "URI": "https://ipfs.io/ipfs/QmQkkwkevL8PWqayj51f9WJGDFyV8cD7DwhhECREGfegbe",
                "name": "Budzy966",
                "imageURI": "https://ipfs.io/ipfs/QmQkkwkevL8PWqayj51f9WJGDFyV8cD7DwhhECREGfegbe"
              },
              {
                "Flags": 8,
                "Issuer": "rP9jGcAaVjpdqcdHbEckLtRoCYjETxXosj",
                "NFTokenID": "00082AF8F2F9612BC2DF219BDE54777C2EE87D4E0545987840497033040A1DFF",
                "NFTokenTaxon": 1173038761,
                "TransferFee": 11000,
                "nft_serial": 67771903,
                "URI": "https://ipfs.io/ipfs/QmdS5FvXUsmfiNjXAXT84VRrQSAqQNnGd9wyNXbQM5tDpj",
                "name": "Budzy370",
                "imageURI": "https://ipfs.io/ipfs/QmdS5FvXUsmfiNjXAXT84VRrQSAqQNnGd9wyNXbQM5tDpj"
              },
              {
                "Flags": 8,
                "Issuer": "rP9jGcAaVjpdqcdHbEckLtRoCYjETxXosj",
                "NFTokenID": "00082AF8F2F9612BC2DF219BDE54777C2EE87D4E0545987848A17091040A1F9D",
                "NFTokenTaxon": 1173038761,
                "TransferFee": 11000,
                "nft_serial": 67772317,
                "URI": "https://ipfs.io/ipfs/QmQJtFZyAcib2pfCAf5k4CmqeyrbroBCg92nfDuKbZDdaz",
                "name": "Budzy174",
                "imageURI": "https://ipfs.io/ipfs/QmQJtFZyAcib2pfCAf5k4CmqeyrbroBCg92nfDuKbZDdaz"
              },
              {
                "Flags": 8,
                "Issuer": "rP9jGcAaVjpdqcdHbEckLtRoCYjETxXosj",
                "NFTokenID": "00082AF8F2F9612BC2DF219BDE54777C2EE87D4E0545987897581F75040A1F41",
                "NFTokenTaxon": 1173038761,
                "TransferFee": 11000,
                "nft_serial": 67772225,
                "URI": "https://ipfs.io/ipfs/QmcwRKr9FnG3FLHWuaZL2bsuvcHdzgNNjpMDfCCTfuVSky",
                "name": "Budzy631",
                "imageURI": "https://ipfs.io/ipfs/QmcwRKr9FnG3FLHWuaZL2bsuvcHdzgNNjpMDfCCTfuVSky"
              },
              {
                "Flags": 8,
                "Issuer": "rP9jGcAaVjpdqcdHbEckLtRoCYjETxXosj",
                "NFTokenID": "00082AF8F2F9612BC2DF219BDE54777C2EE87D4E05459878C5B45320040A1DEE",
                "NFTokenTaxon": 1173038761,
                "TransferFee": 11000,
                "nft_serial": 67771886,
                "URI": "https://ipfs.io/ipfs/QmULJMyDKBqrUo9rX5jEGkGyuQYS25Ya8vGhqnk8V5bUzT",
                "name": "Budzy1051",
                "imageURI": "https://ipfs.io/ipfs/QmULJMyDKBqrUo9rX5jEGkGyuQYS25Ya8vGhqnk8V5bUzT"
              },
              {
                "Flags": 8,
                "Issuer": "rP9jGcAaVjpdqcdHbEckLtRoCYjETxXosj",
                "NFTokenID": "00082AF8F2F9612BC2DF219BDE54777C2EE87D4E05459878DD19D2DF040A1FDB",
                "NFTokenTaxon": 1173038761,
                "TransferFee": 11000,
                "nft_serial": 67772379,
                "URI": "https://ipfs.io/ipfs/Qmcpq12CFcubYCoHrT6bMS5EWxHPBw1GHW5KE1oB8wPAYL",
                "name": "Budzy229",
                "imageURI": "https://ipfs.io/ipfs/Qmcpq12CFcubYCoHrT6bMS5EWxHPBw1GHW5KE1oB8wPAYL"
              },
              {
                "Flags": 10,
                "Issuer": "rHoLiJz8tkvzFUz3HyE5AJGvi5vGTTHF3w",
                "NFTokenID": "000A2710B845B785344869CE4963818AD2ABE609076226379E01265E057518C4",
                "NFTokenTaxon": 1,
                "TransferFee": 10000,
                "URI": "https://ipfs.io/ipfs/bafybeigxvwtms2q6tln7c3pnb6mjarmo3zeuuiuumfd26iou2zyaa5bjay/89.png",
                "nft_serial": 91560132,
                "name": "THE SUPER-DUPER, UBER RARE, NON-DERIVATIVE, EXTRA-ORDINARY $DONNIE NFT COLLECTION #89",
                "imageURI": "https://ipfs.io/ipfs/bafybeigxvwtms2q6tln7c3pnb6mjarmo3zeuuiuumfd26iou2zyaa5bjay/89.png"
              },
              {
                "Flags": 8,
                "Issuer": "rGqGAQ3RQgH5UkcDM8fqvZ855HZphMeUHH",
                "NFTokenID": "000822B0ADAB283F8972AAA140FFD5FB528A39470C05996D47C1DFE8057F670E",
                "NFTokenTaxon": 736493889,
                "TransferFee": 8880,
                "nft_serial": 92235534,
                "URI": "https://ipfs.io/ipfs/QmYHqEXDeSmYVMivbSTqi8s6TVynZfbH4NVZcJX2dfRPoh",
                "name": "Building #859",
                "imageURI": "https://ipfs.io/ipfs/QmYHqEXDeSmYVMivbSTqi8s6TVynZfbH4NVZcJX2dfRPoh"
              },
              {
                "Flags": 8,
                "Issuer": "rfakxbdmroQpQzZBL9caDP9RYxmSKuNZj5",
                "NFTokenID": "0008271042E7877ED3BCE4B9CA801B6A61CB6A1E19C3FA1E7EF7835203C346C3",
                "NFTokenTaxon": 12,
                "TransferFee": 10000,
                "URI": "https://ipfs.io/ipfs/QmYxJUkTZrKgtxo9frTw9LVjyvPVP2gGdvGtMA155GVHLd",
                "nft_serial": 63129283,
                "name": "Bender",
                "imageURI": "https://ipfs.io/ipfs/QmYxJUkTZrKgtxo9frTw9LVjyvPVP2gGdvGtMA155GVHLd"
              },
              {
                "Flags": 8,
                "Issuer": "rDfeEFL2wZxpQeQxvVd4adHMf18LJQWRWu",
                "NFTokenID": "0008138884E31ABDEC147BBC188D8296502793CC1C14AFD509BC913705962B9C",
                "NFTokenTaxon": 0,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeifn64lft2f7g6rv2czqp2cjtnqumxjceiskbhfsr6wu2gn3rapr7a/978.png",
                "nft_serial": 93727644,
                "name": "Brad #978",
                "imageURI": "https://ipfs.io/ipfs/bafybeifn64lft2f7g6rv2czqp2cjtnqumxjceiskbhfsr6wu2gn3rapr7a/978.png"
              },
              {
                "Flags": 8,
                "Issuer": "rDfeEFL2wZxpQeQxvVd4adHMf18LJQWRWu",
                "NFTokenID": "0008138884E31ABDEC147BBC188D8296502793CC1C14AFD50FB6E2E905962B4E",
                "NFTokenTaxon": 0,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeifn64lft2f7g6rv2czqp2cjtnqumxjceiskbhfsr6wu2gn3rapr7a/13.png",
                "nft_serial": 93727566,
                "name": "Brad #13",
                "imageURI": "https://ipfs.io/ipfs/bafybeifn64lft2f7g6rv2czqp2cjtnqumxjceiskbhfsr6wu2gn3rapr7a/13.png"
              },
              {
                "Flags": 8,
                "Issuer": "rDfeEFL2wZxpQeQxvVd4adHMf18LJQWRWu",
                "NFTokenID": "0008138884E31ABDEC147BBC188D8296502793CC1C14AFD5269CB3EA05962B4F",
                "NFTokenTaxon": 0,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeifn64lft2f7g6rv2czqp2cjtnqumxjceiskbhfsr6wu2gn3rapr7a/1016.png",
                "nft_serial": 93727567,
                "name": "Brad #1016",
                "imageURI": "https://ipfs.io/ipfs/bafybeifn64lft2f7g6rv2czqp2cjtnqumxjceiskbhfsr6wu2gn3rapr7a/1016.png"
              },
              {
                "Flags": 8,
                "Issuer": "rDfeEFL2wZxpQeQxvVd4adHMf18LJQWRWu",
                "NFTokenID": "0008138884E31ABDEC147BBC188D8296502793CC1C14AFD52D2F0FE80596294D",
                "NFTokenTaxon": 0,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeifn64lft2f7g6rv2czqp2cjtnqumxjceiskbhfsr6wu2gn3rapr7a/906.png",
                "nft_serial": 93727053,
                "name": "Brad #906",
                "imageURI": "https://ipfs.io/ipfs/bafybeifn64lft2f7g6rv2czqp2cjtnqumxjceiskbhfsr6wu2gn3rapr7a/906.png"
              },
              {
                "Flags": 8,
                "Issuer": "rDfeEFL2wZxpQeQxvVd4adHMf18LJQWRWu",
                "NFTokenID": "0008138884E31ABDEC147BBC188D8296502793CC1C14AFD53D8284EB05962B50",
                "NFTokenTaxon": 0,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeifn64lft2f7g6rv2czqp2cjtnqumxjceiskbhfsr6wu2gn3rapr7a/1043.png",
                "nft_serial": 93727568,
                "name": "Brad #1043",
                "imageURI": "https://ipfs.io/ipfs/bafybeifn64lft2f7g6rv2czqp2cjtnqumxjceiskbhfsr6wu2gn3rapr7a/1043.png"
              },
              {
                "Flags": 8,
                "Issuer": "rDfeEFL2wZxpQeQxvVd4adHMf18LJQWRWu",
                "NFTokenID": "0008138884E31ABDEC147BBC188D8296502793CC1C14AFD5641192CA05962A2F",
                "NFTokenTaxon": 0,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeifn64lft2f7g6rv2czqp2cjtnqumxjceiskbhfsr6wu2gn3rapr7a/175.png",
                "nft_serial": 93727279,
                "name": "Brad #175",
                "imageURI": "https://ipfs.io/ipfs/bafybeifn64lft2f7g6rv2czqp2cjtnqumxjceiskbhfsr6wu2gn3rapr7a/175.png"
              },
              {
                "Flags": 8,
                "Issuer": "rDfeEFL2wZxpQeQxvVd4adHMf18LJQWRWu",
                "NFTokenID": "0008271084E31ABDEC147BBC188D8296502793CC1C14AFD56AB61CA005962D06",
                "NFTokenTaxon": 1,
                "TransferFee": 10000,
                "URI": "https://ipfs.io/ipfs/QmdaH5ZY8kU9syVq9qJYCbW1VZMEK4Qav7TcQWYGs3ZHYG",
                "nft_serial": 93728006,
                "name": "Brad #33",
                "imageURI": "https://ipfs.io/ipfs/QmdaH5ZY8kU9syVq9qJYCbW1VZMEK4Qav7TcQWYGs3ZHYG"
              },
              {
                "Flags": 8,
                "Issuer": "rDfeEFL2wZxpQeQxvVd4adHMf18LJQWRWu",
                "NFTokenID": "0008138884E31ABDEC147BBC188D8296502793CC1C14AFD5D4B45B1205962A77",
                "NFTokenTaxon": 0,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeifn64lft2f7g6rv2czqp2cjtnqumxjceiskbhfsr6wu2gn3rapr7a/701.png",
                "nft_serial": 93727351,
                "name": "Brad #701",
                "imageURI": "https://ipfs.io/ipfs/bafybeifn64lft2f7g6rv2czqp2cjtnqumxjceiskbhfsr6wu2gn3rapr7a/701.png"
              },
              {
                "Flags": 8,
                "Issuer": "rDfeEFL2wZxpQeQxvVd4adHMf18LJQWRWu",
                "NFTokenID": "0008138884E31ABDEC147BBC188D8296502793CC1C14AFD5E256AC6205962BC7",
                "NFTokenTaxon": 0,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeifn64lft2f7g6rv2czqp2cjtnqumxjceiskbhfsr6wu2gn3rapr7a/617.png",
                "nft_serial": 93727687,
                "name": "Brad #617",
                "imageURI": "https://ipfs.io/ipfs/bafybeifn64lft2f7g6rv2czqp2cjtnqumxjceiskbhfsr6wu2gn3rapr7a/617.png"
              },
              {
                "Flags": 8,
                "Issuer": "rDfeEFL2wZxpQeQxvVd4adHMf18LJQWRWu",
                "NFTokenID": "0008138884E31ABDEC147BBC188D8296502793CC1C14AFD5F2D6C03605962B9B",
                "NFTokenTaxon": 0,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeifn64lft2f7g6rv2czqp2cjtnqumxjceiskbhfsr6wu2gn3rapr7a/341.png",
                "nft_serial": 93727643,
                "name": "Brad #341",
                "imageURI": "https://ipfs.io/ipfs/bafybeifn64lft2f7g6rv2czqp2cjtnqumxjceiskbhfsr6wu2gn3rapr7a/341.png"
              },
              {
                "Flags": 8,
                "Issuer": "rDfeEFL2wZxpQeQxvVd4adHMf18LJQWRWu",
                "NFTokenID": "0008138884E31ABDEC147BBC188D8296502793CC1C14AFD5F8D111E805962B4D",
                "NFTokenTaxon": 0,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeifn64lft2f7g6rv2czqp2cjtnqumxjceiskbhfsr6wu2gn3rapr7a/1017.png",
                "nft_serial": 93727565,
                "name": "Brad #1017",
                "imageURI": "https://ipfs.io/ipfs/bafybeifn64lft2f7g6rv2czqp2cjtnqumxjceiskbhfsr6wu2gn3rapr7a/1017.png"
              },
              {
                "Flags": 8,
                "Issuer": "rBHXnpooDWK8jJ7cKY6tLjP1ASmFubmEue",
                "NFTokenID": "00081B5870D10394660CA2145AE9D66E68DD13ED1F5778B2697C231E05975584",
                "NFTokenTaxon": 1,
                "TransferFee": 7000,
                "URI": "https://ipfs.io/ipfs/bafybeia66pr3ijesqwfxzqsdk7koa3njnqnhzrbazzxcjyf2u5zkke7hxe/206.png",
                "nft_serial": 93803908,
                "name": "206",
                "imageURI": "https://ipfs.io/ipfs/bafybeia66pr3ijesqwfxzqsdk7koa3njnqnhzrbazzxcjyf2u5zkke7hxe/206.png"
              },
              {
                "Flags": 8,
                "Issuer": "rpbjkoncKiv1LkPWShzZksqYPzKXmUhTW7",
                "NFTokenID": "00081B581189F5687DBB7516339D6CCB5593D96622AD82DF2308C458000019D1",
                "NFTokenTaxon": 52,
                "TransferFee": 7000,
                "nft_serial": 6609,
                "URI": "https://ipfs.io/ipfs/QmTYtdpxFtArqtkJgFqqtX4hXyDreoLkgVL81CiLZBH7n6",
                "name": "XPUNKS #9720",
                "imageURI": "https://ipfs.io/ipfs/QmTYtdpxFtArqtkJgFqqtX4hXyDreoLkgVL81CiLZBH7n6"
              },
              {
                "Flags": 8,
                "Issuer": "rMbCy5D5rD8cGewcprziS9r8wiMyb6opQ4",
                "NFTokenID": "00082710E1F1320473B32EEA2D834B64AFE064EF2B27324E86D2E6A305842607",
                "NFTokenTaxon": 1,
                "TransferFee": 10000,
                "URI": "https://ipfs.io/ipfs/QmXK9Kx2kZ771x65NvxqucmvbBAGqrtmDPaF88z2xnGb1x",
                "nft_serial": 92546567,
                "name": "#28",
                "imageURI": "https://ipfs.io/ipfs/QmXK9Kx2kZ771x65NvxqucmvbBAGqrtmDPaF88z2xnGb1x"
              },
              {
                "Flags": 8,
                "Issuer": "r9X5Gc9hzu6s9CpEjAy1YkxWmxeJrSTtCL",
                "NFTokenID": "000813885D8FEF4F6B5DFF069E885A86A0A48B212FF7CF5D035870060593DC6A",
                "NFTokenTaxon": 3,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeih22dtwtdxtznot7gog4iyalmckbqamy4wi4ozlvyphhkyulih7ei/28.png",
                "nft_serial": 93576298,
                "name": "28",
                "imageURI": "https://ipfs.io/ipfs/bafybeih22dtwtdxtznot7gog4iyalmckbqamy4wi4ozlvyphhkyulih7ei/28.png"
              }
            ]
          },
          {
            "name": "Will | TextRP",
            "userId": "@rfbDjnzr9riELQZtn95REQhR7fiyKyGM77:synapse.textrp.io",
            "walletAddress": "rfbDjnzr9riELQZtn95REQhR7fiyKyGM77",
            "nfts": [
              {
                "Flags": 8,
                "Issuer": "rsRfacvEVocG5rtjV2QcfLEKYyxKnjkjfb",
                "NFTokenID": "00081D4C1A7F52F67365FBD1E206D3DD9F3F0EBE9F780ECA0099FF3804AF82D9",
                "NFTokenTaxon": 412236,
                "TransferFee": 7500,
                "URI": "https://ipfs.io/ipfs/bafybeifbe4gvz5pctvwxb4nh4nhka3emqod3btr2rqsmyymxny4p3b4nlm/X-bridge.png",
                "nft_serial": 78611161,
                "name": "TextRP Feature Pack: X Bridge #328",
                "imageURI": "https://ipfs.io/ipfs/bafybeifbe4gvz5pctvwxb4nh4nhka3emqod3btr2rqsmyymxny4p3b4nlm/X-bridge.png"
              },
              {
                "Flags": 8,
                "Issuer": "rsRfacvEVocG5rtjV2QcfLEKYyxKnjkjfb",
                "NFTokenID": "00081D4C1A7F52F67365FBD1E206D3DD9F3F0EBE9F780ECA87F457C0000000C4",
                "NFTokenTaxon": 22943,
                "TransferFee": 7500,
                "URI": "https://ipfs.io/ipfs/bafybeidgqqdyvvy5l5xxjtkaim22vtxbouqbknwihfwwp5fx2wqdwqq4ku/1679695112062.png",
                "nft_serial": 196,
                "name": "TextRP Launch Pack #1087",
                "imageURI": "https://ipfs.io/ipfs/bafybeidgqqdyvvy5l5xxjtkaim22vtxbouqbknwihfwwp5fx2wqdwqq4ku/1679695112062.png"
              }
            ]
          },
          {
            "name": "This Guy",
            "userId": "@rfdmLaLLtBzHUrq2SjtnZemY39XM9jPYwL:synapse.textrp.io",
            "walletAddress": "rfdmLaLLtBzHUrq2SjtnZemY39XM9jPYwL",
            "nfts": [
              {
                "Flags": 8,
                "Issuer": "rsRfacvEVocG5rtjV2QcfLEKYyxKnjkjfb",
                "NFTokenID": "00081D4C1A7F52F67365FBD1E206D3DD9F3F0EBE9F780ECAC4652EE7000000DD",
                "NFTokenTaxon": 22943,
                "TransferFee": 7500,
                "URI": "https://ipfs.io/ipfs/bafybeihjh5hxqirqyozksrtwkt45de7w3ky7cx3ubogcqehwlaehpokvnm/1679695158497.png",
                "nft_serial": 221,
                "name": "TextRP Launch Pack #1494",
                "imageURI": "https://ipfs.io/ipfs/bafybeihjh5hxqirqyozksrtwkt45de7w3ky7cx3ubogcqehwlaehpokvnm/1679695158497.png"
              },
              {
                "Flags": 8,
                "Issuer": "rsRfacvEVocG5rtjV2QcfLEKYyxKnjkjfb",
                "NFTokenID": "000809C41A7F52F67365FBD1E206D3DD9F3F0EBE9F780ECAC570961F04AF8431",
                "NFTokenTaxon": 6355,
                "TransferFee": 2500,
                "URI": "https://ipfs.io/ipfs/bafybeicl24besquyotgfu4gum64xm62i2ivfbp4sbo35erbdjwe2whde4i/discord-fp.png",
                "nft_serial": 78611505,
                "name": "TextRP Feature Pack: Discord Bridge #320",
                "imageURI": "https://ipfs.io/ipfs/bafybeicl24besquyotgfu4gum64xm62i2ivfbp4sbo35erbdjwe2whde4i/discord-fp.png"
              },
              {
                "Flags": 8,
                "Issuer": "rsRfacvEVocG5rtjV2QcfLEKYyxKnjkjfb",
                "NFTokenID": "000809C41A7F52F67365FBD1E206D3DD9F3F0EBE9F780ECAC6DF68DD04AF8373",
                "NFTokenTaxon": 6355,
                "TransferFee": 2500,
                "URI": "https://ipfs.io/ipfs/bafybeicl24besquyotgfu4gum64xm62i2ivfbp4sbo35erbdjwe2whde4i/discord-fp.png",
                "nft_serial": 78611315,
                "name": "TextRP Feature Pack: Discord Bridge #130",
                "imageURI": "https://ipfs.io/ipfs/bafybeicl24besquyotgfu4gum64xm62i2ivfbp4sbo35erbdjwe2whde4i/discord-fp.png"
              },
              {
                "Flags": 8,
                "Issuer": "rsRfacvEVocG5rtjV2QcfLEKYyxKnjkjfb",
                "NFTokenID": "00081D4C1A7F52F67365FBD1E206D3DD9F3F0EBE9F780ECAC88525F2000000D2",
                "NFTokenTaxon": 22943,
                "TransferFee": 7500,
                "URI": "https://ipfs.io/ipfs/bafybeiamflqwpergmfck3n5u2jbtrts44js624t466owyr2yfrrtddf33y/1679695162803.png",
                "nft_serial": 210,
                "name": "TextRP Launch Pack #1527",
                "imageURI": "https://ipfs.io/ipfs/bafybeiamflqwpergmfck3n5u2jbtrts44js624t466owyr2yfrrtddf33y/1679695162803.png"
              },
              {
                "Flags": 8,
                "Issuer": "rsRfacvEVocG5rtjV2QcfLEKYyxKnjkjfb",
                "NFTokenID": "000809C41A7F52F67365FBD1E206D3DD9F3F0EBE9F780ECACD4535E804AF83A0",
                "NFTokenTaxon": 6355,
                "TransferFee": 2500,
                "URI": "https://ipfs.io/ipfs/bafybeicl24besquyotgfu4gum64xm62i2ivfbp4sbo35erbdjwe2whde4i/discord-fp.png",
                "nft_serial": 78611360,
                "name": "TextRP Feature Pack: Discord Bridge #175",
                "imageURI": "https://ipfs.io/ipfs/bafybeicl24besquyotgfu4gum64xm62i2ivfbp4sbo35erbdjwe2whde4i/discord-fp.png"
              },
              {
                "Flags": 8,
                "Issuer": "rsRfacvEVocG5rtjV2QcfLEKYyxKnjkjfb",
                "NFTokenID": "00081D4C1A7F52F67365FBD1E206D3DD9F3F0EBE9F780ECAD29F8A8B00000079",
                "NFTokenTaxon": 22943,
                "TransferFee": 7500,
                "URI": "https://ipfs.io/ipfs/bafybeid4jywdms7zcn52uvcl5wta2hlfbv45fko2emx7bveybthobtp75i/1679695318380.png",
                "nft_serial": 121,
                "name": "TextRP Launch Pack #2736",
                "imageURI": "https://ipfs.io/ipfs/bafybeid4jywdms7zcn52uvcl5wta2hlfbv45fko2emx7bveybthobtp75i/1679695318380.png"
              },
              {
                "Flags": 8,
                "Issuer": "rsRfacvEVocG5rtjV2QcfLEKYyxKnjkjfb",
                "NFTokenID": "000809C41A7F52F67365FBD1E206D3DD9F3F0EBE9F780ECAD9A524C904AF837F",
                "NFTokenTaxon": 6355,
                "TransferFee": 2500,
                "URI": "https://ipfs.io/ipfs/bafybeicl24besquyotgfu4gum64xm62i2ivfbp4sbo35erbdjwe2whde4i/discord-fp.png",
                "nft_serial": 78611327,
                "name": "TextRP Feature Pack: Discord Bridge #142",
                "imageURI": "https://ipfs.io/ipfs/bafybeicl24besquyotgfu4gum64xm62i2ivfbp4sbo35erbdjwe2whde4i/discord-fp.png"
              },
              {
                "Flags": 8,
                "Issuer": "rsRfacvEVocG5rtjV2QcfLEKYyxKnjkjfb",
                "NFTokenID": "00081D4C1A7F52F67365FBD1E206D3DD9F3F0EBE9F780ECADB4B11E6000000DE",
                "NFTokenTaxon": 22943,
                "TransferFee": 7500,
                "URI": "https://ipfs.io/ipfs/bafybeigrq55224dgihjjokobrre4wacyygafq34bbtiyuaw7j6x5vavmoq/1679695408742.png",
                "nft_serial": 222,
                "name": "TextRP Launch Pack #3477",
                "imageURI": "https://ipfs.io/ipfs/bafybeigrq55224dgihjjokobrre4wacyygafq34bbtiyuaw7j6x5vavmoq/1679695408742.png"
              },
              {
                "Flags": 8,
                "Issuer": "rsRfacvEVocG5rtjV2QcfLEKYyxKnjkjfb",
                "NFTokenID": "000809C41A7F52F67365FBD1E206D3DD9F3F0EBE9F780ECADDC559DC04AF8374",
                "NFTokenTaxon": 6355,
                "TransferFee": 2500,
                "URI": "https://ipfs.io/ipfs/bafybeicl24besquyotgfu4gum64xm62i2ivfbp4sbo35erbdjwe2whde4i/discord-fp.png",
                "nft_serial": 78611316,
                "name": "TextRP Feature Pack: Discord Bridge #131",
                "imageURI": "https://ipfs.io/ipfs/bafybeicl24besquyotgfu4gum64xm62i2ivfbp4sbo35erbdjwe2whde4i/discord-fp.png"
              },
              {
                "Flags": 8,
                "Issuer": "rsRfacvEVocG5rtjV2QcfLEKYyxKnjkjfb",
                "NFTokenID": "00081D4C1A7F52F67365FBD1E206D3DD9F3F0EBE9F780ECAE7AB0EC7000000BD",
                "NFTokenTaxon": 22943,
                "TransferFee": 7500,
                "URI": "https://ipfs.io/ipfs/bafybeihv22r6vzngcwapgilzswk6ctivwzi56zvjg5ong57tpdjpmmg3su/1679695019135.png",
                "nft_serial": 189,
                "name": "TextRP Launch Pack #480",
                "imageURI": "https://ipfs.io/ipfs/bafybeihv22r6vzngcwapgilzswk6ctivwzi56zvjg5ong57tpdjpmmg3su/1679695019135.png"
              },
              {
                "Flags": 8,
                "Issuer": "rsRfacvEVocG5rtjV2QcfLEKYyxKnjkjfb",
                "NFTokenID": "00081D4C1A7F52F67365FBD1E206D3DD9F3F0EBE9F780ECAF23140E5000000DF",
                "NFTokenTaxon": 22943,
                "TransferFee": 7500,
                "URI": "https://ipfs.io/ipfs/bafybeichsgnvmamlddfv27i6r6xugelkin4oyfar4deyzo44taw3p7z3vy/1679695296745.png",
                "nft_serial": 223,
                "name": "TextRP Launch Pack #2562",
                "imageURI": "https://ipfs.io/ipfs/bafybeichsgnvmamlddfv27i6r6xugelkin4oyfar4deyzo44taw3p7z3vy/1679695296745.png"
              },
              {
                "Flags": 8,
                "Issuer": "rU7gwrM3eDgLSi7vn8LvMxHJ17vPonZ8Lt",
                "NFTokenID": "000817027DE54CBD97145C373717BDD069F5CD78B0E0ACD4275DAB5000000BB6",
                "NFTokenTaxon": 1,
                "TransferFee": 5890,
                "URI": "https://arweave.net/sg95PJOkw_rqhf00hgBmD_AcnB2ndhOIzZ_uPUk-Mgg/PNKs._5153.png",
                "nft_serial": 2998,
                "name": "PNKs. 5153",
                "imageURI": "https://arweave.net/sg95PJOkw_rqhf00hgBmD_AcnB2ndhOIzZ_uPUk-Mgg/PNKs._5153.png"
              },
              {
                "Flags": 8,
                "Issuer": "rU7gwrM3eDgLSi7vn8LvMxHJ17vPonZ8Lt",
                "NFTokenID": "000817027DE54CBD97145C373717BDD069F5CD78B0E0ACD42BF15EE100000045",
                "NFTokenTaxon": 1,
                "TransferFee": 5890,
                "URI": "https://arweave.net/sg95PJOkw_rqhf00hgBmD_AcnB2ndhOIzZ_uPUk-Mgg/PNKs._776.png",
                "nft_serial": 69,
                "name": "PNKs. 776",
                "imageURI": "https://arweave.net/sg95PJOkw_rqhf00hgBmD_AcnB2ndhOIzZ_uPUk-Mgg/PNKs._776.png"
              },
              {
                "Flags": 8,
                "Issuer": "rDeizxSRo6JHjKnih9ivpPkyD2EgXQvhSB",
                "NFTokenID": "000803E88ACAA32313BB87F729EF7DA56BD13C57BE46E3C8DA3ABC1704803280",
                "NFTokenTaxon": 12,
                "TransferFee": 1000,
                "URI": "https://ipfs.io/ipfs/QmPrUeUhVB9FGywsocftdykbdwAps85oVwc36FNYUMUqNX",
                "nft_serial": 75510400,
                "name": "Love Is the Ultimate Conspiracy",
                "imageURI": "https://ipfs.io/ipfs/QmPrUeUhVB9FGywsocftdykbdwAps85oVwc36FNYUMUqNX"
              },
              {
                "Flags": 8,
                "Issuer": "r9J3ecRYzF9fknGRKaBLfQmLA86d7WRdUk",
                "NFTokenID": "00081F405AFE7654FFB0F4FA0119C20348565C78C092CD911FFCB92E000000E1",
                "NFTokenTaxon": 594,
                "TransferFee": 8000,
                "URI": "https://ipfs.io/ipfs/bafybeia4czdp2sni7t2bqz3zqylz5titil5tqg6i4wab4lkkxd5ia6mq3m/1674940658214.png",
                "nft_serial": 225,
                "name": "coolpunks_xrp #981",
                "imageURI": "https://ipfs.io/ipfs/bafybeia4czdp2sni7t2bqz3zqylz5titil5tqg6i4wab4lkkxd5ia6mq3m/1674940658214.png"
              },
              {
                "Flags": 8,
                "Issuer": "r9J3ecRYzF9fknGRKaBLfQmLA86d7WRdUk",
                "NFTokenID": "00081F405AFE7654FFB0F4FA0119C20348565C78C092CD9136E28E2F000000E2",
                "NFTokenTaxon": 594,
                "TransferFee": 8000,
                "URI": "https://ipfs.io/ipfs/bafybeic4tsrvfbn7tldg55azboicgdhnuzkdd5xx2kbpe2bvam723fu4aq/1674940740361.png",
                "nft_serial": 226,
                "name": "coolpunks_xrp #1801",
                "imageURI": "https://ipfs.io/ipfs/bafybeic4tsrvfbn7tldg55azboicgdhnuzkdd5xx2kbpe2bvam723fu4aq/1674940740361.png"
              },
              {
                "Flags": 8,
                "Issuer": "r9J3ecRYzF9fknGRKaBLfQmLA86d7WRdUk",
                "NFTokenID": "00081F405AFE7654FFB0F4FA0119C20348565C78C092CD914DC85F2C000000E3",
                "NFTokenTaxon": 594,
                "TransferFee": 8000,
                "URI": "https://ipfs.io/ipfs/bafybeifpfrve4qteayc6opzosuoqrbwjzhaylnjzmychn2rzlkn6c2fmai/1674940596543.png",
                "nft_serial": 227,
                "name": "coolpunks_xrp #357",
                "imageURI": "https://ipfs.io/ipfs/bafybeifpfrve4qteayc6opzosuoqrbwjzhaylnjzmychn2rzlkn6c2fmai/1674940596543.png"
              },
              {
                "Flags": 8,
                "Issuer": "r9J3ecRYzF9fknGRKaBLfQmLA86d7WRdUk",
                "NFTokenID": "00081F405AFE7654FFB0F4FA0119C20348565C78C092CD917B93FDD2000000E5",
                "NFTokenTaxon": 594,
                "TransferFee": 8000,
                "URI": "https://ipfs.io/ipfs/bafybeieoqqle5kwulghfn4xoqxixc4ljzhey7tkj5cw3nflg36bgv3ks2q/1674940657631.png",
                "nft_serial": 229,
                "name": "coolpunks_xrp #978",
                "imageURI": "https://ipfs.io/ipfs/bafybeieoqqle5kwulghfn4xoqxixc4ljzhey7tkj5cw3nflg36bgv3ks2q/1674940657631.png"
              },
              {
                "Flags": 8,
                "Issuer": "rGx5vZ9PGxrjSEZeQKMGy3ahTWERXXLN5m",
                "NFTokenID": "00081702AF13C2B065183EFF4701F178C5B08992C0C0413FBF5E038C057DC5F4",
                "NFTokenTaxon": 3,
                "TransferFee": 5890,
                "URI": "https://ipfs.io/ipfs/QmdncAhhn2u9g3gyB1fhdJV58kNfwWYap8TLosCTbW3sxE",
                "nft_serial": 92128756,
                "name": "TextRP Virtual Assistant",
                "imageURI": "https://ipfs.io/ipfs/QmdncAhhn2u9g3gyB1fhdJV58kNfwWYap8TLosCTbW3sxE"
              },
              {
                "Flags": 8,
                "Issuer": "r4gVnViayjqfLhVm6z95WK55wt3Nnc6Vi8",
                "NFTokenID": "00081B58EDD24D4A9BC0CB6B00E20987135F710DC84CCEEB6AA8826B00000096",
                "NFTokenTaxon": 602,
                "TransferFee": 7000,
                "URI": "https://ipfs.io/ipfs/bafybeigjwqwv6mwv56ogqzhpcutupov5tp3cpqadavtdalifne24vibvhq/1674410025340.png",
                "nft_serial": 150,
                "name": "cPunks w00t #351",
                "imageURI": "https://ipfs.io/ipfs/bafybeigjwqwv6mwv56ogqzhpcutupov5tp3cpqadavtdalifne24vibvhq/1674410025340.png"
              },
              {
                "Flags": 10,
                "Issuer": "rBVJzbbw6dAvzzeYcVsaYnutzVYyKVoNXv",
                "NFTokenID": "000A1388730BECB2B5D3A3C397A418394E6A5956CD0EC360FDBBF92D0000B74B",
                "NFTokenTaxon": 715,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeicazt5iradewxadvvgga2b3tsslrg5mdvpsqxilakdoc65sm3ghv4",
                "nft_serial": 46923,
                "name": "#176",
                "imageURI": "https://ipfs.io/ipfs/bafybeicazt5iradewxadvvgga2b3tsslrg5mdvpsqxilakdoc65sm3ghv4"
              },
              {
                "Flags": 8,
                "Issuer": "raaorpu59mgUoi4sKT7BVGsxJQeDPG4zki",
                "NFTokenID": "0008232837F11BAA53BD596C08A427830819BFFDF380C7A0D1305AF900000137",
                "NFTokenTaxon": 43819,
                "TransferFee": 9000,
                "URI": "https://ipfs.io/ipfs/bafybeib6h2f6vrkfewftmehzlkacrinkc7dstuu5mam5mco2ih3a545c7m/1685871831966.png",
                "nft_serial": 311,
                "name": "Rippler #1422",
                "imageURI": "https://ipfs.io/ipfs/bafybeib6h2f6vrkfewftmehzlkacrinkc7dstuu5mam5mco2ih3a545c7m/1685871831966.png"
              },
              {
                "Flags": 8,
                "Issuer": "rNBn3A1nR1qGBfLX2GpuYjLz2Rq58jjCTS",
                "NFTokenID": "00081B5890813F8A0160A44F65F45169E616660FFC89FC25CD4FAC4C000003EC",
                "NFTokenTaxon": 5579,
                "TransferFee": 7000,
                "URI": "https://ipfs.io/ipfs/bafybeieonioizasox7nhngwmsb7fyytmutzb6pfnfupz7drxnpn4yl26iy/1676496603957.png",
                "nft_serial": 1004,
                "name": "#1461",
                "imageURI": "https://ipfs.io/ipfs/bafybeieonioizasox7nhngwmsb7fyytmutzb6pfnfupz7drxnpn4yl26iy/1676496603957.png"
              },
              {
                "Flags": 8,
                "Issuer": "rMw11vQaot3adzDYyBvPeq7RNSixthcceB",
                "NFTokenID": "00081B58DD40BAE7C778293E191CE0C8CDF3CC17965AB1F51AA857FE0000092D",
                "NFTokenTaxon": 1480758,
                "TransferFee": 7000,
                "nft_serial": 2349,
                "URI": "https://ipfs.io/ipfs/Qmeqj2op6dL7fXMzP2n29XAc61Yc99H51Aq4aoyxh8uGQd",
                "name": "XBOT #1435",
                "imageURI": "https://ipfs.io/ipfs/Qmeqj2op6dL7fXMzP2n29XAc61Yc99H51Aq4aoyxh8uGQd"
              },
              {
                "Flags": 8,
                "Issuer": "rMw11vQaot3adzDYyBvPeq7RNSixthcceB",
                "NFTokenID": "00081B58DD40BAE7C778293E191CE0C8CDF3CC17965AB1F531B238FF0000092E",
                "NFTokenTaxon": 1480758,
                "TransferFee": 7000,
                "nft_serial": 2350,
                "URI": "https://ipfs.io/ipfs/Qmb1Y6CykVPuBg49dhhczNnoXbQWhMx7re4CHFpdj1vs5m",
                "name": "XBOT #4852",
                "imageURI": "https://ipfs.io/ipfs/Qmb1Y6CykVPuBg49dhhczNnoXbQWhMx7re4CHFpdj1vs5m"
              },
              {
                "Flags": 8,
                "Issuer": "rMw11vQaot3adzDYyBvPeq7RNSixthcceB",
                "NFTokenID": "00081B58DD40BAE7C778293E191CE0C8CDF3CC17965AB1F5489CE9FC0000092F",
                "NFTokenTaxon": 1480758,
                "TransferFee": 7000,
                "nft_serial": 2351,
                "URI": "https://ipfs.io/ipfs/QmYRXuWi931z7tHQ2CK9LRdjbVHtCmgdhtSB6vSrzSM9aJ",
                "name": "XBOT #4983",
                "imageURI": "https://ipfs.io/ipfs/QmYRXuWi931z7tHQ2CK9LRdjbVHtCmgdhtSB6vSrzSM9aJ"
              },
              {
                "Flags": 8,
                "Issuer": "rBDSQEigBqiWLP3wCh1PytwAcm9qQUdyg4",
                "NFTokenID": "00081702700B73FA667C45933D43C256BD24AFC99E57DDCB192B93BB00000039",
                "NFTokenTaxon": 367,
                "TransferFee": 5890,
                "URI": "https://bafybeicvm647djwqy2iate3q2i3n2xt7tutegymwvstsi75wkw3q6fxfrq.ipfs.w3s.link/1669904650852.png",
                "nft_serial": 57,
                "name": "Pearl the Shooter Signed #58",
                "imageURI": "https://bafybeicvm647djwqy2iate3q2i3n2xt7tutegymwvstsi75wkw3q6fxfrq.ipfs.w3s.link/1669904650852.png"
              },
              {
                "Flags": 8,
                "Issuer": "rsRfacvEVocG5rtjV2QcfLEKYyxKnjkjfb",
                "NFTokenID": "000809C41A7F52F67365FBD1E206D3DD9F3F0EBE9F780ECA0EDC5B5C04AF8275",
                "NFTokenTaxon": 412236,
                "TransferFee": 2500,
                "URI": "https://ipfs.io/ipfs/bafybeifbe4gvz5pctvwxb4nh4nhka3emqod3btr2rqsmyymxny4p3b4nlm/X-bridge.png",
                "nft_serial": 78611061,
                "name": "TextRP Feature Pack: X Bridge #228",
                "imageURI": "https://ipfs.io/ipfs/bafybeifbe4gvz5pctvwxb4nh4nhka3emqod3btr2rqsmyymxny4p3b4nlm/X-bridge.png"
              },
              {
                "Flags": 8,
                "Issuer": "rsRfacvEVocG5rtjV2QcfLEKYyxKnjkjfb",
                "NFTokenID": "000809C41A7F52F67365FBD1E206D3DD9F3F0EBE9F780ECA104EB81E04AF81B7",
                "NFTokenTaxon": 412236,
                "TransferFee": 2500,
                "URI": "https://ipfs.io/ipfs/bafybeifbe4gvz5pctvwxb4nh4nhka3emqod3btr2rqsmyymxny4p3b4nlm/X-bridge.png",
                "nft_serial": 78610871,
                "name": "TextRP Feature Pack: X Bridge #38",
                "imageURI": "https://ipfs.io/ipfs/bafybeifbe4gvz5pctvwxb4nh4nhka3emqod3btr2rqsmyymxny4p3b4nlm/X-bridge.png"
              },
              {
                "Flags": 8,
                "Issuer": "rsRfacvEVocG5rtjV2QcfLEKYyxKnjkjfb",
                "NFTokenID": "000809C41A7F52F67365FBD1E206D3DD9F3F0EBE9F780ECA10B2178104AF8232",
                "NFTokenTaxon": 412236,
                "TransferFee": 2500,
                "URI": "https://ipfs.io/ipfs/bafybeifbe4gvz5pctvwxb4nh4nhka3emqod3btr2rqsmyymxny4p3b4nlm/X-bridge.png",
                "nft_serial": 78610994,
                "name": "TextRP Feature Pack: X Bridge #161",
                "imageURI": "https://ipfs.io/ipfs/bafybeifbe4gvz5pctvwxb4nh4nhka3emqod3btr2rqsmyymxny4p3b4nlm/X-bridge.png"
              },
              {
                "Flags": 8,
                "Issuer": "rsRfacvEVocG5rtjV2QcfLEKYyxKnjkjfb",
                "NFTokenID": "000809C41A7F52F67365FBD1E206D3DD9F3F0EBE9F780ECA1288E0C604AF81EF",
                "NFTokenTaxon": 412236,
                "TransferFee": 2500,
                "URI": "https://ipfs.io/ipfs/bafybeifbe4gvz5pctvwxb4nh4nhka3emqod3btr2rqsmyymxny4p3b4nlm/X-bridge.png",
                "nft_serial": 78610927,
                "name": "TextRP Feature Pack: X Bridge #94",
                "imageURI": "https://ipfs.io/ipfs/bafybeifbe4gvz5pctvwxb4nh4nhka3emqod3btr2rqsmyymxny4p3b4nlm/X-bridge.png"
              },
              {
                "Flags": 8,
                "Issuer": "rsRfacvEVocG5rtjV2QcfLEKYyxKnjkjfb",
                "NFTokenID": "000809C41A7F52F67365FBD1E206D3DD9F3F0EBE9F780ECA12FC5C4904AF826A",
                "NFTokenTaxon": 412236,
                "TransferFee": 2500,
                "URI": "https://ipfs.io/ipfs/bafybeifbe4gvz5pctvwxb4nh4nhka3emqod3btr2rqsmyymxny4p3b4nlm/X-bridge.png",
                "nft_serial": 78611050,
                "name": "TextRP Feature Pack: X Bridge #217",
                "imageURI": "https://ipfs.io/ipfs/bafybeifbe4gvz5pctvwxb4nh4nhka3emqod3btr2rqsmyymxny4p3b4nlm/X-bridge.png"
              },
              {
                "Flags": 8,
                "Issuer": "rsRfacvEVocG5rtjV2QcfLEKYyxKnjkjfb",
                "NFTokenID": "000809C41A7F52F67365FBD1E206D3DD9F3F0EBE9F780ECA146EBD0B04AF81AC",
                "NFTokenTaxon": 412236,
                "TransferFee": 2500,
                "URI": "https://ipfs.io/ipfs/bafybeifbe4gvz5pctvwxb4nh4nhka3emqod3btr2rqsmyymxny4p3b4nlm/X-bridge.png",
                "nft_serial": 78610860,
                "name": "TextRP Feature Pack: X Bridge #27",
                "imageURI": "https://ipfs.io/ipfs/bafybeifbe4gvz5pctvwxb4nh4nhka3emqod3btr2rqsmyymxny4p3b4nlm/X-bridge.png"
              },
              {
                "Flags": 8,
                "Issuer": "rsRfacvEVocG5rtjV2QcfLEKYyxKnjkjfb",
                "NFTokenID": "000809C41A7F52F67365FBD1E206D3DD9F3F0EBE9F780ECA14D2288E04AF8227",
                "NFTokenTaxon": 412236,
                "TransferFee": 2500,
                "URI": "https://ipfs.io/ipfs/bafybeifbe4gvz5pctvwxb4nh4nhka3emqod3btr2rqsmyymxny4p3b4nlm/X-bridge.png",
                "nft_serial": 78610983,
                "name": "TextRP Feature Pack: X Bridge #150",
                "imageURI": "https://ipfs.io/ipfs/bafybeifbe4gvz5pctvwxb4nh4nhka3emqod3btr2rqsmyymxny4p3b4nlm/X-bridge.png"
              },
              {
                "Flags": 8,
                "Issuer": "rsRfacvEVocG5rtjV2QcfLEKYyxKnjkjfb",
                "NFTokenID": "000809C41A7F52F67365FBD1E206D3DD9F3F0EBE9F780ECA171C50B604AF825F",
                "NFTokenTaxon": 412236,
                "TransferFee": 2500,
                "URI": "https://ipfs.io/ipfs/bafybeifbe4gvz5pctvwxb4nh4nhka3emqod3btr2rqsmyymxny4p3b4nlm/X-bridge.png",
                "nft_serial": 78611039,
                "name": "TextRP Feature Pack: X Bridge #206",
                "imageURI": "https://ipfs.io/ipfs/bafybeifbe4gvz5pctvwxb4nh4nhka3emqod3btr2rqsmyymxny4p3b4nlm/X-bridge.png"
              },
              {
                "Flags": 8,
                "Issuer": "rsRfacvEVocG5rtjV2QcfLEKYyxKnjkjfb",
                "NFTokenID": "000809C41A7F52F67365FBD1E206D3DD9F3F0EBE9F780ECA18F22DFB04AF821C",
                "NFTokenTaxon": 412236,
                "TransferFee": 2500,
                "URI": "https://ipfs.io/ipfs/bafybeifbe4gvz5pctvwxb4nh4nhka3emqod3btr2rqsmyymxny4p3b4nlm/X-bridge.png",
                "nft_serial": 78610972,
                "name": "TextRP Feature Pack: X Bridge #139",
                "imageURI": "https://ipfs.io/ipfs/bafybeifbe4gvz5pctvwxb4nh4nhka3emqod3btr2rqsmyymxny4p3b4nlm/X-bridge.png"
              },
              {
                "Flags": 8,
                "Issuer": "rsRfacvEVocG5rtjV2QcfLEKYyxKnjkjfb",
                "NFTokenID": "000809C41A7F52F67365FBD1E206D3DD9F3F0EBE9F780ECA1AC8FE3804AF81D9",
                "NFTokenTaxon": 412236,
                "TransferFee": 2500,
                "URI": "https://ipfs.io/ipfs/bafybeifbe4gvz5pctvwxb4nh4nhka3emqod3btr2rqsmyymxny4p3b4nlm/X-bridge.png",
                "nft_serial": 78610905,
                "name": "TextRP Feature Pack: X Bridge #72",
                "imageURI": "https://ipfs.io/ipfs/bafybeifbe4gvz5pctvwxb4nh4nhka3emqod3btr2rqsmyymxny4p3b4nlm/X-bridge.png"
              },
              {
                "Flags": 8,
                "Issuer": "rsRfacvEVocG5rtjV2QcfLEKYyxKnjkjfb",
                "NFTokenID": "000809C41A7F52F67365FBD1E206D3DD9F3F0EBE9F780ECA1B3C55A304AF8254",
                "NFTokenTaxon": 412236,
                "TransferFee": 2500,
                "URI": "https://ipfs.io/ipfs/bafybeifbe4gvz5pctvwxb4nh4nhka3emqod3btr2rqsmyymxny4p3b4nlm/X-bridge.png",
                "nft_serial": 78611028,
                "name": "TextRP Feature Pack: X Bridge #195",
                "imageURI": "https://ipfs.io/ipfs/bafybeifbe4gvz5pctvwxb4nh4nhka3emqod3btr2rqsmyymxny4p3b4nlm/X-bridge.png"
              },
              {
                "Flags": 8,
                "Issuer": "rsRfacvEVocG5rtjV2QcfLEKYyxKnjkjfb",
                "NFTokenID": "00081D4C1A7F52F67365FBD1E206D3DD9F3F0EBE9F780ECA3B02C8ED000000D7",
                "NFTokenTaxon": 22943,
                "TransferFee": 7500,
                "URI": "https://ipfs.io/ipfs/bafybeiaqbkr67wfsppoc2tvwjtmhzd5bbuzah6rltlozhrnq3dn3l7b444/1679695226578.png",
                "nft_serial": 215,
                "name": "TextRP Launch Pack #2007",
                "imageURI": "https://ipfs.io/ipfs/bafybeiaqbkr67wfsppoc2tvwjtmhzd5bbuzah6rltlozhrnq3dn3l7b444/1679695226578.png"
              },
              {
                "Flags": 8,
                "Issuer": "rsRfacvEVocG5rtjV2QcfLEKYyxKnjkjfb",
                "NFTokenID": "00081D4C1A7F52F67365FBD1E206D3DD9F3F0EBE9F780ECA51E83BEC000000D8",
                "NFTokenTaxon": 22943,
                "TransferFee": 7500,
                "URI": "https://ipfs.io/ipfs/bafybeihsykqi4votfpgets2og3rft3flpxhjcfnqqua34tg7bua74sp5ji/1679695542424.png",
                "nft_serial": 216,
                "name": "TextRP Launch Pack #4834",
                "imageURI": "https://ipfs.io/ipfs/bafybeihsykqi4votfpgets2og3rft3flpxhjcfnqqua34tg7bua74sp5ji/1679695542424.png"
              },
              {
                "Flags": 8,
                "Issuer": "rsRfacvEVocG5rtjV2QcfLEKYyxKnjkjfb",
                "NFTokenID": "00081D4C1A7F52F67365FBD1E206D3DD9F3F0EBE9F780ECA68CE6AEB000000D9",
                "NFTokenTaxon": 22943,
                "TransferFee": 7500,
                "URI": "https://ipfs.io/ipfs/bafybeifplzgkrehicd3jbidxcotfbez7i5paazyiaz6owe5c5jdk23bzmi/1679695535381.png",
                "nft_serial": 217,
                "name": "TextRP Launch Pack #4759",
                "imageURI": "https://ipfs.io/ipfs/bafybeifplzgkrehicd3jbidxcotfbez7i5paazyiaz6owe5c5jdk23bzmi/1679695535381.png"
              },
              {
                "Flags": 8,
                "Issuer": "rsRfacvEVocG5rtjV2QcfLEKYyxKnjkjfb",
                "NFTokenID": "00081D4C1A7F52F67365FBD1E206D3DD9F3F0EBE9F780ECA8C74F17404AF80E8",
                "NFTokenTaxon": 1015,
                "TransferFee": 7500,
                "URI": "https://ipfs.io/ipfs/bafybeial66tqk65jp3e626yxjyk76jx2pkip2qc7rg6zvykilh6q5d4dqe/55.png",
                "nft_serial": 78610664,
                "name": "TextRP Launch Pack: Opulence Edition #55",
                "imageURI": "https://ipfs.io/ipfs/bafybeial66tqk65jp3e626yxjyk76jx2pkip2qc7rg6zvykilh6q5d4dqe/55.png"
              },
              {
                "Flags": 8,
                "Issuer": "rsRfacvEVocG5rtjV2QcfLEKYyxKnjkjfb",
                "NFTokenID": "00081D4C1A7F52F67365FBD1E206D3DD9F3F0EBE9F780ECA96998CE9000000DB",
                "NFTokenTaxon": 22943,
                "TransferFee": 7500,
                "URI": "https://ipfs.io/ipfs/bafybeicw47bfysmlvuvfkg5zcnleud3dwh7fx4brzurt2k6bpqfpxyjetm/1679695328400.png",
                "nft_serial": 219,
                "name": "TextRP Launch Pack #2835",
                "imageURI": "https://ipfs.io/ipfs/bafybeicw47bfysmlvuvfkg5zcnleud3dwh7fx4brzurt2k6bpqfpxyjetm/1679695328400.png"
              },
              {
                "Flags": 8,
                "Issuer": "rsRfacvEVocG5rtjV2QcfLEKYyxKnjkjfb",
                "NFTokenID": "00081D4C1A7F52F67365FBD1E206D3DD9F3F0EBE9F780ECAAD7FFFE8000000DC",
                "NFTokenTaxon": 22943,
                "TransferFee": 7500,
                "URI": "https://ipfs.io/ipfs/bafybeiawxg57vpmomfe4nqujkytzjassve5r2qn76sbmchowtl6t6agnkq/1679695435704.png",
                "nft_serial": 220,
                "name": "TextRP Launch Pack #3756",
                "imageURI": "https://ipfs.io/ipfs/bafybeiawxg57vpmomfe4nqujkytzjassve5r2qn76sbmchowtl6t6agnkq/1679695435704.png"
              },
              {
                "Flags": 8,
                "Issuer": "rsRfacvEVocG5rtjV2QcfLEKYyxKnjkjfb",
                "NFTokenID": "000809C41A7F52F67365FBD1E206D3DD9F3F0EBE9F780ECAB6CADF6604AF841A",
                "NFTokenTaxon": 6355,
                "TransferFee": 2500,
                "URI": "https://ipfs.io/ipfs/bafybeicl24besquyotgfu4gum64xm62i2ivfbp4sbo35erbdjwe2whde4i/discord-fp.png",
                "nft_serial": 78611482,
                "name": "TextRP Feature Pack: Discord Bridge #297",
                "imageURI": "https://ipfs.io/ipfs/bafybeicl24besquyotgfu4gum64xm62i2ivfbp4sbo35erbdjwe2whde4i/discord-fp.png"
              },
              {
                "Flags": 8,
                "Issuer": "rsRfacvEVocG5rtjV2QcfLEKYyxKnjkjfb",
                "NFTokenID": "000809C41A7F52F67365FBD1E206D3DD9F3F0EBE9F780ECAB8A50CA104AF83D7",
                "NFTokenTaxon": 6355,
                "TransferFee": 2500,
                "URI": "https://ipfs.io/ipfs/bafybeicl24besquyotgfu4gum64xm62i2ivfbp4sbo35erbdjwe2whde4i/discord-fp.png",
                "nft_serial": 78611415,
                "name": "TextRP Feature Pack: Discord Bridge #230",
                "imageURI": "https://ipfs.io/ipfs/bafybeicl24besquyotgfu4gum64xm62i2ivfbp4sbo35erbdjwe2whde4i/discord-fp.png"
              },
              {
                "Flags": 8,
                "Issuer": "rsRfacvEVocG5rtjV2QcfLEKYyxKnjkjfb",
                "NFTokenID": "000809C41A7F52F67365FBD1E206D3DD9F3F0EBE9F780ECABA7F79FC04AF8394",
                "NFTokenTaxon": 6355,
                "TransferFee": 2500,
                "URI": "https://ipfs.io/ipfs/bafybeicl24besquyotgfu4gum64xm62i2ivfbp4sbo35erbdjwe2whde4i/discord-fp.png",
                "nft_serial": 78611348,
                "name": "TextRP Feature Pack: Discord Bridge #163",
                "imageURI": "https://ipfs.io/ipfs/bafybeicl24besquyotgfu4gum64xm62i2ivfbp4sbo35erbdjwe2whde4i/discord-fp.png"
              },
              {
                "Flags": 8,
                "Issuer": "rsRfacvEVocG5rtjV2QcfLEKYyxKnjkjfb",
                "NFTokenID": "000809C41A7F52F67365FBD1E206D3DD9F3F0EBE9F780ECABC59B53F04AF8351",
                "NFTokenTaxon": 6355,
                "TransferFee": 2500,
                "URI": "https://ipfs.io/ipfs/bafybeicl24besquyotgfu4gum64xm62i2ivfbp4sbo35erbdjwe2whde4i/discord-fp.png",
                "nft_serial": 78611281,
                "name": "TextRP Feature Pack: Discord Bridge #96",
                "imageURI": "https://ipfs.io/ipfs/bafybeicl24besquyotgfu4gum64xm62i2ivfbp4sbo35erbdjwe2whde4i/discord-fp.png"
              },
              {
                "Flags": 8,
                "Issuer": "r3LTGFc9bD8iDaBrsbznNp6e1hTygdCSR9",
                "NFTokenID": "00080BB85076B7152363216153FF4F7FFC0948F90B7D4BD374C2D6210000003D",
                "NFTokenTaxon": 249,
                "TransferFee": 3000,
                "URI": "https://ipfs.io/ipfs/bafybeidm627gdf4l76q4ixjqyhmiiqy5v5uzxq5jb32rqhccsaqulcxueu/1669425460268.png",
                "nft_serial": 61,
                "name": "Loopers #3419",
                "imageURI": "https://ipfs.io/ipfs/bafybeidm627gdf4l76q4ixjqyhmiiqy5v5uzxq5jb32rqhccsaqulcxueu/1669425460268.png"
              },
              {
                "Flags": 8,
                "Issuer": "rLNTLnKW19XC3SMjdfFpNYZEQQofqEW2ny",
                "NFTokenID": "000800FAD2F5C68F9FC4CC3229CD7309F61DB5650C655BA405C933C80597FA30",
                "NFTokenTaxon": 3,
                "TransferFee": 250,
                "URI": "https://ipfs.io/ipfs/bafybeidrqavvzby2pl6bvzbeqewplceoqcc5aqrwkqa2et2o2lvpn7vmpe/foundersimage.png",
                "nft_serial": 93846064,
                "name": "Bullish Cafe Founder #45",
                "imageURI": "https://ipfs.io/ipfs/bafybeidrqavvzby2pl6bvzbeqewplceoqcc5aqrwkqa2et2o2lvpn7vmpe/foundersimage.png"
              },
              {
                "Flags": 8,
                "Issuer": "rBNmfMkbqnWzht5tv7ndYm23FEE1LrbfUb",
                "NFTokenID": "000859D8704B7C774785EA46D27B061F6157CAB012F6D83C02FE49280403245C",
                "NFTokenTaxon": 223,
                "TransferFee": 23000,
                "URI": "https://ipfs.io/ipfs/bafybeiaeywa575ijibphzcxgpyaamjlbflquht63zku2knhvkfavmagrvu/ripple effect side a nft2 animation.gif",
                "nft_serial": 67314780,
                "name": "Ripple Effect - Side A (Tsunami Pack)",
                "imageURI": "https://ipfs.io/ipfs/bafybeiaeywa575ijibphzcxgpyaamjlbflquht63zku2knhvkfavmagrvu/ripple effect side a nft2 animation.gif"
              },
              {
                "Flags": 8,
                "Issuer": "rLtgE7FjDfyJy5FGY87zoAuKtH6Bfb9QnE",
                "NFTokenID": "00081770DA305E2EC183969EA8D7FEB01AB4834F15616D0B07A809290000019E",
                "NFTokenTaxon": 16,
                "TransferFee": 6000,
                "nft_serial": 414,
                "URI": "https://ipfs.io/ipfs/QmZ5bbTqhqzuxwFyHy4dPtLzfDNz9jDLJU6zWSHdqbTgqc?filename=QmZ5bbTqhqzuxwFyHy4dPtLzfDNz9jDLJU6zWSHdqbTgqc",
                "name": "XRP STAG #739",
                "imageURI": "https://ipfs.io/ipfs/QmZ5bbTqhqzuxwFyHy4dPtLzfDNz9jDLJU6zWSHdqbTgqc?filename=QmZ5bbTqhqzuxwFyHy4dPtLzfDNz9jDLJU6zWSHdqbTgqc"
              },
              {
                "Flags": 8,
                "Issuer": "rLtgE7FjDfyJy5FGY87zoAuKtH6Bfb9QnE",
                "NFTokenID": "00081770DA305E2EC183969EA8D7FEB01AB4834F15616D0B12C5D5B70000000C",
                "NFTokenTaxon": 16,
                "TransferFee": 6000,
                "nft_serial": 12,
                "URI": "https://ipfs.io/ipfs/QmVGU83QfqcHixsvziJYYLRD3q2uMxfWkUXLrakARWePQk?filename=QmVGU83QfqcHixsvziJYYLRD3q2uMxfWkUXLrakARWePQk",
                "name": "XRP STAG #109",
                "imageURI": "https://ipfs.io/ipfs/QmVGU83QfqcHixsvziJYYLRD3q2uMxfWkUXLrakARWePQk?filename=QmVGU83QfqcHixsvziJYYLRD3q2uMxfWkUXLrakARWePQk"
              },
              {
                "Flags": 8,
                "Issuer": "rLtgE7FjDfyJy5FGY87zoAuKtH6Bfb9QnE",
                "NFTokenID": "00081770DA305E2EC183969EA8D7FEB01AB4834F15616D0B1E8DDA2A0000019F",
                "NFTokenTaxon": 16,
                "TransferFee": 6000,
                "nft_serial": 415,
                "URI": "https://ipfs.io/ipfs/QmbvrPu9QiPpgto1TYZZvyKnZDJD3jaQ4h4GqP6MXCS85n?filename=QmbvrPu9QiPpgto1TYZZvyKnZDJD3jaQ4h4GqP6MXCS85n",
                "name": "XRP STAG #7288",
                "imageURI": "https://ipfs.io/ipfs/QmbvrPu9QiPpgto1TYZZvyKnZDJD3jaQ4h4GqP6MXCS85n?filename=QmbvrPu9QiPpgto1TYZZvyKnZDJD3jaQ4h4GqP6MXCS85n"
              },
              {
                "Flags": 8,
                "Issuer": "rLtgE7FjDfyJy5FGY87zoAuKtH6Bfb9QnE",
                "NFTokenID": "00081770DA305E2EC183969EA8D7FEB01AB4834F15616D0B29ABA6B80000000D",
                "NFTokenTaxon": 16,
                "TransferFee": 6000,
                "nft_serial": 13,
                "URI": "https://ipfs.io/ipfs/QmPfcXi5UwbVMS8GmDdkBviUs7zNPYqTG6wc6t8aU93Dxn?filename=QmPfcXi5UwbVMS8GmDdkBviUs7zNPYqTG6wc6t8aU93Dxn",
                "name": "XRP STAG #804",
                "imageURI": "https://ipfs.io/ipfs/QmPfcXi5UwbVMS8GmDdkBviUs7zNPYqTG6wc6t8aU93Dxn?filename=QmPfcXi5UwbVMS8GmDdkBviUs7zNPYqTG6wc6t8aU93Dxn"
              },
              {
                "Flags": 8,
                "Issuer": "rLtgE7FjDfyJy5FGY87zoAuKtH6Bfb9QnE",
                "NFTokenID": "00081770DA305E2EC183969EA8D7FEB01AB4834F15616D0B30E83ADB00000130",
                "NFTokenTaxon": 16,
                "TransferFee": 6000,
                "nft_serial": 304,
                "URI": "https://ipfs.io/ipfs/Qmee6WFcSrhTUBuzwLPgJTsS69wfzPqCWJFFazeJtwB126?filename=Qmee6WFcSrhTUBuzwLPgJTsS69wfzPqCWJFFazeJtwB126",
                "name": "XRP STAG #3994",
                "imageURI": "https://ipfs.io/ipfs/Qmee6WFcSrhTUBuzwLPgJTsS69wfzPqCWJFFazeJtwB126?filename=Qmee6WFcSrhTUBuzwLPgJTsS69wfzPqCWJFFazeJtwB126"
              },
              {
                "Flags": 8,
                "Issuer": "rLtgE7FjDfyJy5FGY87zoAuKtH6Bfb9QnE",
                "NFTokenID": "00081770DA305E2EC183969EA8D7FEB01AB4834F15616D0B47CE0BDC00000131",
                "NFTokenTaxon": 16,
                "TransferFee": 6000,
                "nft_serial": 305,
                "URI": "https://ipfs.io/ipfs/QmRpt6MB4D1wWhg9VowHHF5daUhzuXrjimYNCVKEYERtwh?filename=QmRpt6MB4D1wWhg9VowHHF5daUhzuXrjimYNCVKEYERtwh",
                "name": "XRP STAG #4077",
                "imageURI": "https://ipfs.io/ipfs/QmRpt6MB4D1wWhg9VowHHF5daUhzuXrjimYNCVKEYERtwh?filename=QmRpt6MB4D1wWhg9VowHHF5daUhzuXrjimYNCVKEYERtwh"
              },
              {
                "Flags": 8,
                "Issuer": "rLtgE7FjDfyJy5FGY87zoAuKtH6Bfb9QnE",
                "NFTokenID": "00081770DA305E2EC183969EA8D7FEB01AB4834F15616D0B4C597C2C000001A1",
                "NFTokenTaxon": 16,
                "TransferFee": 6000,
                "nft_serial": 417,
                "URI": "https://ipfs.io/ipfs/QmdjRaRkTyquJheC5s3CSWFd8iyukDj3kBVjuiQeGedR5q?filename=QmdjRaRkTyquJheC5s3CSWFd8iyukDj3kBVjuiQeGedR5q",
                "name": "XRP STAG #2254",
                "imageURI": "https://ipfs.io/ipfs/QmdjRaRkTyquJheC5s3CSWFd8iyukDj3kBVjuiQeGedR5q?filename=QmdjRaRkTyquJheC5s3CSWFd8iyukDj3kBVjuiQeGedR5q"
              },
              {
                "Flags": 8,
                "Issuer": "rLtgE7FjDfyJy5FGY87zoAuKtH6Bfb9QnE",
                "NFTokenID": "00081770DA305E2EC183969EA8D7FEB01AB4834F15616D0B909F83D400000129",
                "NFTokenTaxon": 16,
                "TransferFee": 6000,
                "nft_serial": 297,
                "URI": "https://ipfs.io/ipfs/QmakLQR2NMkV3WkBjZ9ZZN3t2ZajV4rygeY5A3X4pxNVA4?filename=QmakLQR2NMkV3WkBjZ9ZZN3t2ZajV4rygeY5A3X4pxNVA4",
                "name": "XRP STAG #646",
                "imageURI": "https://ipfs.io/ipfs/QmakLQR2NMkV3WkBjZ9ZZN3t2ZajV4rygeY5A3X4pxNVA4?filename=QmakLQR2NMkV3WkBjZ9ZZN3t2ZajV4rygeY5A3X4pxNVA4"
              },
              {
                "Flags": 8,
                "Issuer": "rLtgE7FjDfyJy5FGY87zoAuKtH6Bfb9QnE",
                "NFTokenID": "00081770DA305E2EC183969EA8D7FEB01AB4834F15616D0BA8F436170000006C",
                "NFTokenTaxon": 16,
                "TransferFee": 6000,
                "nft_serial": 108,
                "URI": "https://ipfs.io/ipfs/QmQpFh15fGQUREG4zi9FBMXMRrBMtgaCvW8YFydot1kgtr?filename=QmQpFh15fGQUREG4zi9FBMXMRrBMtgaCvW8YFydot1kgtr",
                "name": "XRP STAG #1491",
                "imageURI": "https://ipfs.io/ipfs/QmQpFh15fGQUREG4zi9FBMXMRrBMtgaCvW8YFydot1kgtr?filename=QmQpFh15fGQUREG4zi9FBMXMRrBMtgaCvW8YFydot1kgtr"
              },
              {
                "Flags": 8,
                "Issuer": "rLtgE7FjDfyJy5FGY87zoAuKtH6Bfb9QnE",
                "NFTokenID": "00081770DA305E2EC183969EA8D7FEB01AB4834F15616D0BBFDA07180000006D",
                "NFTokenTaxon": 16,
                "TransferFee": 6000,
                "nft_serial": 109,
                "URI": "https://ipfs.io/ipfs/QmZ2Y6E2a44YYDuwNDT52YGDfVgdRjvgfzKjHxVBXKUtsN?filename=QmZ2Y6E2a44YYDuwNDT52YGDfVgdRjvgfzKjHxVBXKUtsN",
                "name": "XRP STAG #4583",
                "imageURI": "https://ipfs.io/ipfs/QmZ2Y6E2a44YYDuwNDT52YGDfVgdRjvgfzKjHxVBXKUtsN?filename=QmZ2Y6E2a44YYDuwNDT52YGDfVgdRjvgfzKjHxVBXKUtsN"
              },
              {
                "Flags": 8,
                "Issuer": "rLtgE7FjDfyJy5FGY87zoAuKtH6Bfb9QnE",
                "NFTokenID": "00081770DA305E2EC183969EA8D7FEB01AB4834F15616D0BD550F6D70000012C",
                "NFTokenTaxon": 16,
                "TransferFee": 6000,
                "nft_serial": 300,
                "URI": "https://ipfs.io/ipfs/QmNheE7r6zNKF3297tyopjBUb13C2d5fzREnoS6jZtDLJu?filename=QmNheE7r6zNKF3297tyopjBUb13C2d5fzREnoS6jZtDLJu",
                "name": "XRP STAG #4404",
                "imageURI": "https://ipfs.io/ipfs/QmNheE7r6zNKF3297tyopjBUb13C2d5fzREnoS6jZtDLJu?filename=QmNheE7r6zNKF3297tyopjBUb13C2d5fzREnoS6jZtDLJu"
              },
              {
                "Flags": 8,
                "Issuer": "rLtgE7FjDfyJy5FGY87zoAuKtH6Bfb9QnE",
                "NFTokenID": "00081770DA305E2EC183969EA8D7FEB01AB4834F15616D0BE0DA2EA000000015",
                "NFTokenTaxon": 16,
                "TransferFee": 6000,
                "nft_serial": 21,
                "URI": "https://ipfs.io/ipfs/QmcrfAMB1SYzkknqgULtpf1stWrQg5iCvjaiXp9j4vJVa4?filename=QmcrfAMB1SYzkknqgULtpf1stWrQg5iCvjaiXp9j4vJVa4",
                "name": "XRP STAG #4499",
                "imageURI": "https://ipfs.io/ipfs/QmcrfAMB1SYzkknqgULtpf1stWrQg5iCvjaiXp9j4vJVa4?filename=QmcrfAMB1SYzkknqgULtpf1stWrQg5iCvjaiXp9j4vJVa4"
              },
              {
                "Flags": 8,
                "Issuer": "rLtgE7FjDfyJy5FGY87zoAuKtH6Bfb9QnE",
                "NFTokenID": "00081770DA305E2EC183969EA8D7FEB01AB4834F15616D0BF7BFFFA100000016",
                "NFTokenTaxon": 16,
                "TransferFee": 6000,
                "nft_serial": 22,
                "URI": "https://ipfs.io/ipfs/Qmd5yaLS4kgdqTwP183BxRmvK3Pi7ULD9ZW9r7CxhArDVQ?filename=Qmd5yaLS4kgdqTwP183BxRmvK3Pi7ULD9ZW9r7CxhArDVQ",
                "name": "XRP STAG #2698",
                "imageURI": "https://ipfs.io/ipfs/Qmd5yaLS4kgdqTwP183BxRmvK3Pi7ULD9ZW9r7CxhArDVQ?filename=Qmd5yaLS4kgdqTwP183BxRmvK3Pi7ULD9ZW9r7CxhArDVQ"
              },
              {
                "Flags": 10,
                "Issuer": "r3PjP4q4U3WW6os3GAPBykzSNfdFiiHNFT",
                "NFTokenID": "000A1A78511569DD226DFBE9472AC240000FCA5F212289F48201D9320000002C",
                "NFTokenTaxon": 1836985589,
                "TransferFee": 6776,
                "URI": "https://ipfs.io/ipfs/bafybeicajnnfhqvqvrihaf5szd5c6neo3vog3myvnrqogtrf2ibyajlj5q",
                "nft_serial": 44,
                "name": "Birds",
                "imageURI": "https://ipfs.io/ipfs/bafybeicajnnfhqvqvrihaf5szd5c6neo3vog3myvnrqogtrf2ibyajlj5q"
              },
              {
                "Flags": 8,
                "Issuer": "rpgGBHg5tV2uPqXr8SKjdD1ZM6w9ou6XNP",
                "NFTokenID": "00081B5812650489C239D0C87AE72A723608D8AA2EA530C45A05B854000013AB",
                "NFTokenTaxon": 18,
                "TransferFee": 7000,
                "URI": "https://ipfs.io/ipfs/bafybeiexajmvlrv7i3rzzhkli665obqtgh6mtxs76nxgzkl4grdmhwvdgy/1667164784310.png",
                "nft_serial": 5035,
                "name": "#2601",
                "imageURI": "https://ipfs.io/ipfs/bafybeiexajmvlrv7i3rzzhkli665obqtgh6mtxs76nxgzkl4grdmhwvdgy/1667164784310.png"
              },
              {
                "Flags": 8,
                "Issuer": "rDREAMers7onfWWwor7m421dAoT2zvdq5K",
                "NFTokenID": "00081D4C8837F61EECD09529A18F8E8A3D63CF6E3473ACCEB031DF5400001802",
                "NFTokenTaxon": 156376265,
                "TransferFee": 7500,
                "nft_serial": 6146,
                "URI": "",
                "name": "",
                "imageURI": "/static/media/nft.52183f074fccbf8d4453.png"
              },
              {
                "Flags": 8,
                "Issuer": "rakm5ks7EScMQRkq1JqmsHvnqc6VZX1WKd",
                "NFTokenID": "000827103F1FD86BC5571D523C9FE3FEDE3BB9E03B760158CA342B460506B5AC",
                "NFTokenTaxon": 1,
                "TransferFee": 10000,
                "URI": "https://ipfs.io/ipfs/QmVxLgFZBaWb4J4j8sHmPWsYidtx89oSe835db2BQhLHko",
                "nft_serial": 84325804,
                "name": "OpulGod #986",
                "imageURI": "https://ipfs.io/ipfs/QmVxLgFZBaWb4J4j8sHmPWsYidtx89oSe835db2BQhLHko"
              },
              {
                "Flags": 8,
                "Issuer": "rGc9v6Add17uWtc45XMnnabk7dtTLfUuoe",
                "NFTokenID": "00081388AB2FE57CFF6C53FCD465A1A615B817ED5D75A5AE5D445FDE000001F0",
                "NFTokenTaxon": 42069,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/QmWFNoX6eUxwHf8nsK1km2DukFah9brtUxds2Vvhfpa4XW",
                "nft_serial": 496,
                "name": "Shiba Professor #496",
                "imageURI": "https://ipfs.io/ipfs/QmWFNoX6eUxwHf8nsK1km2DukFah9brtUxds2Vvhfpa4XW"
              },
              {
                "Flags": 9,
                "Issuer": "rUL4X4nLfarG9jEnsvpvoNgMcrYDaE2XHK",
                "NFTokenID": "000927107C5340F9EEB03B685664F2A614F959CC655FFC816B52B85C000003BB",
                "NFTokenTaxon": 10,
                "TransferFee": 10000,
                "URI": "https://ipfs.io/ipfs/QmXF6XNEaVUgs2XyCD6YCKqPQSJRT3Mi4mWfYkzzZXBCYe",
                "nft_serial": 955,
                "name": "#956",
                "imageURI": "https://ipfs.io/ipfs/QmXF6XNEaVUgs2XyCD6YCKqPQSJRT3Mi4mWfYkzzZXBCYe"
              },
              {
                "Flags": 8,
                "Issuer": "rJKzNgL1icB4rK98Pyu1NHywyUopnBaTMt",
                "NFTokenID": "00080BB8BE11675922B1DB4F40459CF110EA1FBE666D803672AEFAC004DF16C5",
                "NFTokenTaxon": 4000,
                "TransferFee": 3000,
                "URI": "https://ipfs.io/ipfs/QmTtAe7cAuHsk9pQQHQQDMvBsPUWuefCBCHtoeaRYi3bdt",
                "nft_serial": 81729221,
                "name": "#69",
                "imageURI": "https://ipfs.io/ipfs/QmTtAe7cAuHsk9pQQHQQDMvBsPUWuefCBCHtoeaRYi3bdt"
              },
              {
                "Flags": 8,
                "Issuer": "rJKzNgL1icB4rK98Pyu1NHywyUopnBaTMt",
                "NFTokenID": "00080BB8BE11675922B1DB4F40459CF110EA1FBE666D8036A07A98C204DF16C7",
                "NFTokenTaxon": 4000,
                "TransferFee": 3000,
                "URI": "https://ipfs.io/ipfs/QmRhvQvVz4PbpK9oXcoGZiL7Jw4LJC5MZm41Lk4a6UZRYP",
                "nft_serial": 81729223,
                "name": "#53",
                "imageURI": "https://ipfs.io/ipfs/QmRhvQvVz4PbpK9oXcoGZiL7Jw4LJC5MZm41Lk4a6UZRYP"
              },
              {
                "Flags": 8,
                "Issuer": "rJKzNgL1icB4rK98Pyu1NHywyUopnBaTMt",
                "NFTokenID": "000807D0BE11675922B1DB4F40459CF110EA1FBE666D8036F3D1DAC404DF16E1",
                "NFTokenTaxon": 3000,
                "TransferFee": 2000,
                "URI": "https://ipfs.io/ipfs/QmcoQPsvMEi1j4xEBYiL1rRqhcTsMo6mmymSaT3kP4Ze5f",
                "nft_serial": 81729249,
                "name": "#1767",
                "imageURI": "https://ipfs.io/ipfs/QmcoQPsvMEi1j4xEBYiL1rRqhcTsMo6mmymSaT3kP4Ze5f"
              },
              {
                "Flags": 8,
                "Issuer": "rEeZTW64fTwErNvKfh29ZtEBVvy2dtN3kV",
                "NFTokenID": "00081388A0AC3ED1865D08CD9B203C93C84E8C6F8E98E059C477B0FE000005B6",
                "NFTokenTaxon": 5551,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeie3gvrczyocbdqzfkn3zyydvrtb3rzkxtg27bcd2ptnc3pbt562sm/1675633798861.png",
                "nft_serial": 1462,
                "name": "Boxing Beardies #987",
                "imageURI": "https://ipfs.io/ipfs/bafybeie3gvrczyocbdqzfkn3zyydvrtb3rzkxtg27bcd2ptnc3pbt562sm/1675633798861.png"
              },
              {
                "Flags": 8,
                "Issuer": "rEeZTW64fTwErNvKfh29ZtEBVvy2dtN3kV",
                "NFTokenID": "00081388A0AC3ED1865D08CD9B203C93C84E8C6F8E98E059DB5D63FD000005B7",
                "NFTokenTaxon": 5551,
                "TransferFee": 5000,
                "URI": "https://ipfs.io/ipfs/bafybeihbxapoqasnkc56x7ott6pllknb565omqmgspjzdwb3dm25jpdv6i/1675633031565.png",
                "nft_serial": 1463,
                "name": "Boxing Beardies #764",
                "imageURI": "https://ipfs.io/ipfs/bafybeihbxapoqasnkc56x7ott6pllknb565omqmgspjzdwb3dm25jpdv6i/1675633031565.png"
              }
            ]
          },
          {
            "name": "Hayden",
            "userId": "@rpxot3Z1EgQMpGR4n3jopgrPdTSXaDqmxS:synapse.textrp.io",
            "walletAddress": "rpxot3Z1EgQMpGR4n3jopgrPdTSXaDqmxS",
            "nfts": []
          }
        ];
        */
        console.log("Merged members with NFT data:", mergedMembers);
        // setMyNftData(mergedMembers);

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

  return (
    <>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "60vh",
            width: "100%",
            textAlign: "center",
            gap: 2,
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
              ease: "linear",
            }}
          >
            <CircularProgress
              size={48}
              thickness={2}
              sx={{
                color: "#1976d2", // your primary color or theme
              }}
            />
          </motion.div>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              color: "#555",
              mt: 1,
            }}
          >
            Loading...
          </Typography>
        </Box>
      ) : (
        < Box sx={{ width: "100%", borderRadius: 2, boxShadow: 1 }}>
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
                <div style={{ display: selectedIndex === 0 ? "block" : "none" }}>
                  <NFTs myNftData={myNftData} getImageData={getImageData} wgtParameters={widgetApi.widgetParameters} />
                </div>
                <div style={{ display: selectedIndex === 1 ? "block" : "none" }}>
                  <Offers />
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
