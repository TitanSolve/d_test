import React from "react";
import { Loader2 } from "lucide-react";

const LoadingOverlayForCard = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 pointer-events-none">
      <div className="bg-white/90 dark:bg-[#1e1e1e]/90 rounded-xl p-4 shadow-md pointer-events-auto">
        <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
      </div>
    </div>
  );
};

export default LoadingOverlayForCard;