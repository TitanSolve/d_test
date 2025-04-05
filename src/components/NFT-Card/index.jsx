import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import API_URLS from "../../config";
import nft_pic from "../../assets/nft.png";

const NFTCard = ({ myNftData, getImageData }) => {
    const [loading, setLoading] = useState(false);
    const [uri, setUri] = useState("../../assets/nft.png");

    return (
        <>
            <div className="transform hover:scale-105 transition-transform duration-300 border p-2 rounded-lg shadow-md bg-gradient-to-br from-blue-200 to-purple-300 text-gray-800 font-semibold text-center cursor-pointer">
                <img src={myNftData.imageURI.replace("ipfs://", "https://ipfs.io/ipfs/")} alt="NFT" className="w-full max-w-xs md:max-w-sm h-auto rounded-lg mx-auto" />
            </div>
        </>
    )
}

export default NFTCard;
