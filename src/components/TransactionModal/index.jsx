import React, { useState } from "react";
import { Modal } from "@mui/material";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const TransactionModal = ({
  isOpen,
  onClose,
  qrCodeUrl,
  transactionStatus,
}) => {
  const getStatusIcon = () => {
    if (transactionStatus.toLowerCase().includes("signed")) {
      return <CheckCircle className="text-green-500 w-5 h-5 inline-block mr-1" />;
    }
    if (transactionStatus.toLowerCase().includes("rejected")) {
      return <XCircle className="text-red-500 w-5 h-5 inline-block mr-1" />;
    }
    return <Loader2 className="animate-spin text-blue-500 w-5 h-5 inline-block mr-1" />;
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-[#15191E] text-black dark:text-white rounded-xl p-6 shadow-xl w-full max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-center mb-4">
            Scan QR to Sign Transaction
          </h2>

          {qrCodeUrl ? (
            <div className="flex justify-center mb-4">
              <img
                src={qrCodeUrl}
                alt="Scan this QR code with XUMM"
                className="max-w-[250px] rounded-md"
              />
            </div>
          ) : (
            <div className="flex justify-center items-center h-[200px]">
              <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
            </div>
          )}

          <div className="text-center mt-2">
            {getStatusIcon()}
            <span className="font-medium">
              {transactionStatus || "Waiting for signature..."}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TransactionModal;