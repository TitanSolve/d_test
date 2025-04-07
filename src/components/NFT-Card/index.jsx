import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import API_URLS from "../../config";
import nft_pic from "../../assets/nft.png";
// className="w-full max-w-xs md:max-w-sm h-auto rounded-lg mx-auto object-cover"
const NFTCard = ({ myNftData }) => {
    return (
        <>
            <div className="transform hover:scale-105 transition-transform duration-300 border p-2 rounded-lg shadow-md bg-gradient-to-br from-blue-200 to-purple-300 text-gray-800 font-semibold text-center cursor-pointer">
                <img
                    src={myNftData.imageURI.replace("ipfs://", "https://ipfs.io/ipfs/")}
                    onError={(e) => { e.target.onerror = null; e.target.src = nft_pic; }}
                    alt="NFT"
                    loading="lazy"
                    className="mx-auto rounded-lg object-cover shadow-md w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64"
                />
            </div>
        </>
    )
}

export default NFTCard;
