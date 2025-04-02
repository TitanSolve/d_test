import React, { useEffect, useState } from "react";
import { WidgetApi} from "matrix-widget-api";
import API_URLS from "../config";

const MatrixClientProvider = () => {
  const [matrixApi, setMatrixApi] = useState(null);
  const [userId, setUserId] = useState(null);
  const [roomId, setRoomId] = useState(null);

  useEffect(() => {
      console.log("🔹 Initializing Widget...");

      // Extract widget ID from the URL parameters
      const widgetId = new URLSearchParams(window.location.search).get("widgetId");
      if (!widgetId) {
          console.error("❌ No widgetId found in URL!");
          return;
      }
      console.log(`✅ Widget ID: ${widgetId}`);

      // Create a new Widget API instance
      const api = new WidgetApi(widgetId);
      console.log("🔹 Matrix Widget API initialized.");

      // Start listening for events
      api.start();
      console.log("✅ Matrix Widget API started.");

      // Request permissions from Matrix
      api.once("action:capabilities", () => {
          console.log("🔹 Requesting widget capabilities...");
          api.send("notify_capabilities", {
              requested: ["m.room.message", "m.room.member"],
          });
          console.log("✅ Capabilities requested.");
      });

      // Fetch User ID
      api.getUserId()
          .then((id) => {
              setUserId(id);
              console.log(`✅ User ID: ${id}`);
          })
          .catch((error) => console.error("❌ Failed to fetch User ID:", error));

      // Fetch Room ID
      api.getRoomId()
          .then((id) => {
              setRoomId(id);
              console.log(`✅ Room ID: ${id}`);
          })
          .catch((error) => console.error("❌ Failed to fetch Room ID:", error));

      // Save API instance
      setMatrixApi(api);

      // Cleanup on unmount
      return () => {
          console.log("🔹 Cleaning up Matrix API...");
          api.stop();
      };
  }, []);

  // Function to send a message
  const sendMessage = () => {
      if (!matrixApi) {
          console.error("❌ Cannot send message: Matrix API is not initialized!");
          return;
      }
      console.log("🔹 Sending message to the room...");
      matrixApi
          .sendRoomEvent("m.room.message", {
              body: "Hello from widget!",
              msgtype: "m.text",
          })
          .then(() => console.log("✅ Message sent successfully."))
          .catch((error) => console.error("❌ Failed to send message:", error));
  };

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h2>Matrix Widget</h2>
            <h2>User: {userId || "Loading..."}</h2>
            <h2>Room: {roomId || "Loading..."}</h2>
            <button onClick={sendMessage}>
                Send Message
            </button>
        </div>
    );
};

export default MatrixClientProvider;
