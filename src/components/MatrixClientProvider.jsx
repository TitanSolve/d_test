import React, { useEffect, useState } from "react";
import { createClient } from "matrix-js-sdk";
import API_URLS from "../config";

const MatrixClientProvider = ({ children }) => {
  const [client, setClient] = useState(null);
  const [theme, setTheme] = useState("light"); // Step 1: Theme state
  const [roomInfo, setRoomInfo] = useState({ members: [] });
  const [userInfo, setUserInfo] = useState(null);

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
      if (event.origin === `${API_URLS.elementsUrl}`) {
        console.log("Received message:", event.data);

        const message = event.data;
        if (message.api === "toWidget") {
          switch (message.action) {
            case "capabilities":
              // handleCapabilitiesRequest(message);
              break;
            case "update_theme":
              // Step 4: Receive theme updates
              if (message.data?.theme) {
                setTheme(message.data.theme);
                console.log("Theme updated to:", message.data.theme);
              }
              break;
            default:
              console.log("Received unknown action:", message.action);
          }

          if (message.data?.userInfo) {
            setUserInfo(message.data.userInfo);
          }
        }
      }
    };

    // Step 2: Listen for theme changes
    window.addEventListener("message", handleEvent);

    // Step 3: Request theme on load
    window.parent.postMessage(
      {
        action: "get_theme",
      },
      `${API_URLS.elementsUrl}`
    );

    return () => window.removeEventListener("message", handleEvent);
  }, []);

  useEffect(() => {
    const fetchRoomsInfo = async () => {
      if (client) {
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

          setRoomInfo(roomsDetails);
        } catch (error) {
          console.error("Error fetching rooms:", error);
        }
      }
    };

    fetchRoomsInfo();
  }, [client]);

  return (
    <div className={theme === "dark" ? "theme-dark" : "theme-light"}>
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
