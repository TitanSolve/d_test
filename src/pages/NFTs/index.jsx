import React from "react";
import ParticipantCard from "../../components/ParticipantCard";
import xrpl from "xrpl";

const NFTs = () => {
  const generateNFTs = (count) => Array.from({ length: count }, (_, i) => ({ id: i + 1 }));

  const myNFTs = generateNFTs(8);
  const aliceNFTs = generateNFTs(10);
  const bobNFTs = generateNFTs(10);

  async function fetchNFTs(walletAddress) {
    const client = new xrpl.Client("wss://xrplcluster.com"); // Public XRPL node
    await client.connect();
    try {
      const response = await client.request({
        command: "account_nfts",
        account: walletAddress,
        ledger_index: "validated",
      });
      console.log("response", response);
      console.log("response.result", response.result);
      console.log("response.result.nfts", response.result.nfts);
      return response.result.nfts; // Returns an array of NFTs
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      return [];
    } finally {
      client.disconnect();
    }
  }

  return (
    <div>
      {/* <div className="flex items-center justify-center border border-gray-200 rounded-2xl bg-white shadow-lg"> */}
        <div className="h-full overflow-y-auto p-2 bg-gradient-to-br to-gray-100 flex flex-col items-center space-y-2">
          {[
            { title: "My NFTs", nfts: myNFTs, own: true },
            { title: "Alice's NFTs", nfts: aliceNFTs, own: false },
            { title: "A's NFTs", nfts: bobNFTs, own: false },
            { title: "B's NFTs", nfts: bobNFTs, own: false },
            { title: "C's NFTs", nfts: bobNFTs, own: false }
          ].map((participant, index) => (
            <ParticipantCard
              key={index}
              title={participant.title}
              nfts={participant.nfts}
              index={index + 1}
              own={participant.own}
            />
          ))}
        </div>
      </div>
    // </div>
  );
};

export default NFTs;
