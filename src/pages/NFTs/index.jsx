import React from "react";
import ParticipantCard from "../../components/ParticipantCard";
import xrpl from "xrpl";

const NFTs = ({ myNftData, wgtParameters, getImageData }) => {
  // myOwnNftData = myNftData.find(nft => nft.name === wgtParameters.)

  return (
    <div>
      {/* <div className="flex items-center justify-center border border-gray-200 rounded-2xl bg-white shadow-lg"> */}
      <div className="h-full overflow-y-auto p-2 bg-gradient-to-br to-gray-100 flex flex-col items-center space-y-2">
        {/* <ParticipantCard
          key={index}
          index={index + 1}
          myNftData={nft}
          wgtParameters={wgtParameters}
          getImageData={getImageData}
        /> */}
        {
          myNftData.map((nft, index) => (
            <ParticipantCard
              key={index}
              index={index + 1}
              myNftData={nft}
              wgtParameters={wgtParameters}
              getImageData={getImageData}
            />
          ))}
      </div>
    </div>
    // </div>
  );
};

export default NFTs;
