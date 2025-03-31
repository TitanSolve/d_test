import React from "react";
import OfferListToggle from "../../components/OfferListToggle";

const Offers = () => {
  return (
    <div className="h-full overflow-y-auto p-5 bg-gradient-to-br to-gray-100 flex flex-col items-center space-y-2">
      <OfferListToggle title="Incoming transfers" count={7} />
      <OfferListToggle title="Outgoing transfers" count={6} />
      <OfferListToggle title="Offers Received" count={0} />
      <OfferListToggle title="Offers Made" count={3} />
    </div>
  );
};

export default Offers;
