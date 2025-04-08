import React, { useState } from "react";
import nft_pic from "../../assets/nft.png";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const ImgLoader = ({ URI, isGroup }) => {
    const [imgLoaded, setImgLoaded] = useState(false);
    const imageUrl = isGroup
        ? URI.replace("ipfs://", "https://ipfs.io/ipfs/")
        : URI.replace("ipfs://", "https://ipfs.io/ipfs/");

        return (
            <div className="mx-auto transform hover:scale-105 transition-transform duration-300 border p-2 rounded-lg shadow-md bg-gradient-to-br from-blue-200 to-purple-300 text-gray-800 font-semibold text-center cursor-pointer">
                {/* Skeleton */}
                {!imgLoaded && (
                    <div className="rounded-xl overflow-hidden">
                        <Skeleton
                            className="mx-auto rounded-lg object-cover shadow-lg w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64 select-none animate-pulse"
                            baseColor="#c7d2fe"
                            highlightColor="#9ca3af"
                        />
                    </div>
                )}
    
                {/* Actual Image */}
                <img
                    src={imageUrl}
                    alt="NFT"
                    onLoad={() => setImgLoaded(true)}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = nft_pic;
                        setImgLoaded(true);
                    }}
                    draggable={false}
                    className={` mx-auto rounded-lg object-cover shadow-md w-32 sm:w-40 md:w-48 lg:w-56 xl:w-64 transition-opacity duration-500 ${imgLoaded ? 'h-32 sm:h-40 md:h-48 lg:h-56 xl:h-64' : 'h-0'}`}
                />
            </div>
        );
}

export default ImgLoader;