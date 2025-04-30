import React from "react";
import { Loader2 } from "lucide-react";

const LoadingOverlay = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-[#363C43] z-50">
      <Loader2 className="animate-spin text-blue-600 dark:text-blue-400 w-12 h-12 mb-4" />
      <p className="text-lg font-medium text-gray-700 dark:text-gray-300">{message}</p>
    </div>
  );
};

export default LoadingOverlay;