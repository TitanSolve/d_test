import React from "react";
import ParticipantCard from "../../components/ParticipantCard";

const NFTs = ({ membersList, myNftData, wgtParameters, getImageData, refreshOffers, widgetApi }) => {
  const myOwnNftData = myNftData.find(nft => nft.name === wgtParameters.displayName);
  const otherNfts = myNftData.filter(nft => nft.name !== wgtParameters.displayName);

  return (
    <div>
      <div className="h-full overflow-y-auto p-2 bg-gradient-to-br to-gray-100 flex flex-col items-center space-y-2">
        <ParticipantCard
          key={0}
          index={0}
          membersList={membersList}
          myNftData={myOwnNftData}
          wgtParameters={wgtParameters}
          getImageData={getImageData}
          refreshOffers={refreshOffers}
          widgetApi={widgetApi}
        />
        {
          otherNfts.map((nft, index) => (
            <ParticipantCard
              key={index}
              index={index + 1}
              membersList={membersList}
              myNftData={nft}
              wgtParameters={wgtParameters}
              getImageData={getImageData}
              refreshOffers={refreshOffers}
              widgetApi={widgetApi}
            />
          ))}
      </div>
    </div>
    // </div>
  );
};

export default NFTs;
