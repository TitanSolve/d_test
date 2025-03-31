import React from "react";
import OutgoingTransferToggle from "../../components/OutgoingTransferToggle";
import IncomingTransferToggle from "../../components/IncomingTransferToggle";

const Offers = () => {
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
