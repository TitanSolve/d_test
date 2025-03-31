import React, { useEffect, useState } from "react";
import { createClient } from "matrix-js-sdk";
import API_URLS from "../config";


import { WidgetApi, createWidgetApi } from "matrix-widget-api"; 1



const MatrixClientProvider = ({ children }) => {
  const [client, setClient] = useState(null);
  const [roomInfo, setRoomInfo] = useState({ members: [] });
  const [userInfo, setUserInfo] = useState(null);

  // const widgetApi = createWidgetApi({
  //   postMessage: window.parent.postMessage.bind(window.parent),
  //   receiveMessage: window.addEventListener.bind(window, "message"),
  // });
  // widgetApi.start();
  // // Fetch the Matrix client's theme
  // useEffect(() => {
  //   const fetchTheme = async () => {
  //     try {
  //       // Request permission to read room state
  //       await widgetApi.requestCapabilities(["org.matrix.msc2762.receive_state"]);

  //       const roomId = new URLSearchParams(window.location.search).get("room_id");
  //       console.log("Room ID from URL:", roomId);
  //       if (roomId) {
  //         const themeEvent = await widgetApi.getRoomStateEvent(roomId, "org.matrix.theme");
  //       } else {
  //         // Handle the case where room_id is null
  //         console.error('Room ID is missing from URL parameters.');
  //       }

  //       const currentTheme = themeEvent?.theme || "light"; // Default to light mode
  //       console.log("Current theme:", currentTheme);
  //       setTheme(currentTheme);
  //     } catch (error) {
  //       console.error("Failed to fetch theme:", error);
  //     }
  //   };

  //   fetchTheme();
  // }, []);



  useEffect(() => {
    const initMatrix = async () => {
      try {
        const matrixClient = createClient({
          baseUrl: API_URLS.synapseUrl,
          accessToken: API_URLS.accesstoken,
          userId: "@aman:synapse.textrp.io",
        });
        matrixClient.on("sync", async (state) => {
          if (state === "SYNCING") {
            setClient((prevClient) => prevClient || matrixClient);
          }
        });
        await matrixClient.startClient({ initialSyncLimit: 10 });
      } catch (error) {
        console.error("Error initializing Matrix client:", error);
      }
    };

    initMatrix();
  }, []);

  useEffect(() => {
    const handleEvent = (event) => {
      //  console.log("event aman all events", event);
      if (event.origin === `${API_URLS.elementsUrl}`) {
        console.log("event aman", event);
        console.log("Received message:", event.data);

        const message = event.data;
        if (message.api === "toWidget") {
          switch (message.action) {
            case "capabilities":
              handleCapabilitiesRequest(message);
              break;
            default:
              console.log("Received unknown action:", message.action);
          }

          if (message.data && message.data.userInfo) {
            setUserInfo(message.data.userInfo);
            console.log("User Info received:", message.data.userInfo);
          } else {
            console.log("User Info not found in the message");
          }
        }
      }
    };

    window.addEventListener("message", handleEvent);
    return () => window.removeEventListener("message", handleEvent);
  }, []);

  const handleCapabilitiesRequest = (message) => {
    // console.log("Capabilities request received:", message);
    window.parent.postMessage(
      {
        response: {
          requestId: message.requestId,
        },
      },
      `${API_URLS.elementsUrl}`
    );
  };
  useEffect(() => {
    window.parent.postMessage(
      {
        action: "get_room_info",
      },
      `${API_URLS.elementsUrl}`
    );
  }, []);

  useEffect(() => {
    const fetchRoomsInfo = async () => {
      if (client) {
        console.log("Fetching rooms info...");
        try {
          const rooms = client.getRooms();
          const roomsDetails = rooms.map((room) => ({
            id: room.roomId,
            name: room.name,
            members: room.getJoinedMembers().map((member) => ({
              id: member.userId,
              name: member.name,
            })),
          }));

          // console.log(roomsDetails, "roomsDetails");
          setRoomInfo(roomsDetails); // This should be setRoomsInfo if handling multiple rooms
          // console.log("Rooms fetched:", roomsDetails);
        } catch (error) {
          console.error("Error fetching rooms:", error);
        }
      }
    };

    fetchRoomsInfo();
  }, [client]);

  return (
    <div>
      {roomInfo && roomInfo.members && roomInfo.members.length > 0 ? (
        <div key={roomInfo.id}>
          <h3>{roomInfo.name}</h3>
          <ul>
            {roomInfo.members.map((member) => (
              <li key={member.id}>{member.name}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {children}
    </div>
  );
};

export default MatrixClientProvider;
