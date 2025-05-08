import React, { useEffect, Suspense } from "react";
import { MuiWidgetApiProvider } from "@matrix-widget-toolkit/mui";
import { BrowserRouter } from "react-router-dom";
import { WidgetParameter } from "@matrix-widget-toolkit/api";
import MatrixClientProvider from "./components/MatrixClientProvider";
import { ThemeProvider } from "./context/ThemeContext";
import xrpl from "xrpl";

function App({ widgetApiPromise }) {
  // useEffect(() => {
  //   const loadOffer = async () => {
  //     const xrpl = require("xrpl");
  //     const client = new xrpl.Client("wss://s2.ripple.com");
  //     await client.connect();

  //     const destinationAddress = "r9syfthWEycVKuy9bz2awsxrTNK3NBBT6h";
  //     const wallets = [
  //       "rpxot3Z1EgQMpGR4n3jopgrPdTSXaDqmxS",
  //       "rnPoaP9Hb2YZ1hj6JyYbHGRvUS69cyfqry",
  //       "rwLohLFAT2zDooHcusuWVQRc7R81q4nKNK",
  //       "rfbDjnzr9riELQZtn95REQhR7fiyKyGM77",
  //       "rfdmLaLLtBzHUrq2SjtnZemY39XM9jPYwL",
  //       "r34VdeAwi8qs1KF3DTn5T3Y5UAPmbBNWpX",
  //     ];

  //     const rippleEpoch = 946684800;
  //     const now = Math.floor(Date.now() / 1000);

  //     const results = [];

  //     // Reusable wrapper for safe XRPL requests
  //     const safeRequest = async (request) => {
  //       try {
  //         return await client.request(request);
  //       } catch (err) {
  //         console.warn(
  //           "⚠️ XRPL request failed:",
  //           request.command,
  //           err?.message
  //         );
  //         return null;
  //       }
  //     };

  //     for (const account of wallets) {
  //       try {
  //         const nftResponse = await safeRequest({
  //           command: "account_nfts",
  //           account,
  //           ledger_index: "validated",
  //         });

  //         if (!nftResponse?.result?.account_nfts) {
  //           results.push({ wallet: account, offers: [] });
  //           continue;
  //         }

  //         const ownedNftIds = new Set(
  //           nftResponse.result.account_nfts.map((nft) => nft.NFTokenID)
  //         );

  //         const nftOwnerMap = new Map();
  //         nftResponse.result.account_nfts.forEach((nft) => {
  //           nftOwnerMap.set(nft.NFTokenID, account);
  //         });

  //         const offerResponse = await safeRequest({
  //           command: "account_objects",
  //           account,
  //           type: "nft_offer",
  //           ledger_index: "validated",
  //         });

  //         // console.log(
  //         //   "✅ Wallet-based Offer Results (JSON):\n",
  //         //   JSON.stringify(offerResponse, null, 2)
  //         // );

  //         if (!offerResponse?.result?.account_objects) {
  //           results.push({ wallet: account, offers: [] });
  //           continue;
  //         }

  //         const allOffers = offerResponse.result.account_objects;
  //         const chunks = [];
  //         const chunkSize = Math.ceil(allOffers.length / 4);
  //         for (let i = 0; i < allOffers.length; i += chunkSize) {
  //           chunks.push(allOffers.slice(i, i + chunkSize));
  //         }

  //         const confirmedOffers = [];

  //         for (const chunk of chunks) {
  //           for (const offer of chunk) {
  //             const ledgerRes = await safeRequest({
  //               command: "ledger_entry",
  //               index: offer.index,
  //             });

  //             if (!ledgerRes?.result?.node) continue;

  //             const ledgerOffer = ledgerRes.result.node;
  //             const isSell =
  //               (ledgerOffer.Flags &
  //                 xrpl.NFTokenCreateOfferFlags.tfSellNFToken) !==
  //               0;

  //             const isValid =
  //               typeof ledgerOffer.Amount === "string" &&
  //               typeof ledgerOffer.NFTokenID === "string" &&
  //               ledgerOffer.Destination === destinationAddress &&
  //               (!ledgerOffer.Expiration || ledgerOffer.Expiration > now - rippleEpoch) &&
  //               (
  //                 // ✅ Sell offer: must own the NFT
  //                 (isSell && ownedNftIds.has(ledgerOffer.NFTokenID)) ||
  //                 // ✅ Buy offer: must NOT own the NFT
  //                 (!isSell && !ownedNftIds.has(ledgerOffer.NFTokenID))
  //               );
  //               // (!isSell || ledgerOffer.Owner === account); //&&

  //             if (isValid) {
  //               confirmedOffers.push({
  //                 offerId: ledgerOffer.index,
  //                 nftId: ledgerOffer.NFTokenID,
  //                 amount: ledgerOffer.Amount,
  //                 isSell,
  //                 destination: ledgerOffer.Destination,
  //                 owner: ledgerOffer.Owner, // still the offer creator
  //                 nftOwner: nftOwnerMap.get(ledgerOffer.NFTokenID) || null, // ✅ new field
  //               });
  //             }
  //           }
  //         }

  //         results.push({ wallet: account, offers: confirmedOffers });
  //       } catch (err) {
  //         console.warn(`❌ Failed to process wallet ${account}:`, err.message);
  //         results.push({ wallet: account, offers: [] });
  //       }
  //     }

  //     await client.disconnect();

  //     console.log("✅ Wallet-based Offer Results (JSON):\n", results);
  //   };
  //   loadOffer();
  // }, []);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <Suspense fallback={<></>}>
          <MuiWidgetApiProvider
            widgetApiPromise={widgetApiPromise}
            widgetRegistration={{
              name: "P2P-NFT-Widget",
              type: "com.example.clock",
              data: { title: "P2P-NFT-Widget" },
              requiredParameters: [WidgetParameter.DeviceId],
            }}
          >
            <MatrixClientProvider />
          </MuiWidgetApiProvider>
        </Suspense>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
