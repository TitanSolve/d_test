import React, { useEffect, useState } from "react";
import { WidgetApi, WidgetApiImpl, WidgetApiToWidgetAction } from "matrix-widget-api";
import API_URLS from "../config";

const MatrixClientProvider = () => {
  const [matrixApi, setMatrixApi] = useState(null);
    const [userId, setUserId] = useState(null);
    const [roomId, setRoomId] = useState(null);

    useEffect(() => {
        console.log("🔹 Widget is initializing...");

        // Extract widget ID from the URL
        const widgetId = new URLSearchParams(window.location.search).get("widgetId");
        if (!widgetId) {
            console.error("❌ No widgetId found in URL parameters!");
            return;
        }
        console.log(`✅ Widget ID detected: ${widgetId}`);

        // Initialize Matrix Widget API
        const api = new WidgetApiImpl(widgetId);
        console.log("🔹 Matrix Widget API initialized.");

        api.start();
        console.log("✅ Widget API started.");

        // Request necessary capabilities (e.g., sending messages)
        api.once(`action:${WidgetApiToWidgetAction.Capabilities}`, () => {
            console.log("🔹 Requesting widget capabilities...");
            api.send(WidgetApiToWidgetAction.NotifyCapabilities, {
                requested: ["m.room.message", "m.room.member"],
            });
            console.log("✅ Capabilities requested.");
        });

        // Fetch and log User ID
        api.getUserId()
            .then((id) => {
                setUserId(id);
                console.log(`✅ User ID retrieved: ${id}`);
            })
            .catch((error) => {
                console.error("❌ Failed to fetch user ID:", error);
            });

        // Fetch and log Room ID
        api.getRoomId()
            .then((id) => {
                setRoomId(id);
                console.log(`✅ Room ID retrieved: ${id}`);
            })
            .catch((error) => {
                console.error("❌ Failed to fetch room ID:", error);
            });

        // Save API reference in state
        setMatrixApi(api);
        console.log("✅ Matrix API stored in state.");

        return () => {
            console.log("🔹 Cleaning up widget API...");
            api.stop();
        };
    }, []);

    // Function to send a message to the room
    const sendMessage = () => {
        if (!matrixApi) {
            console.error("❌ Cannot send message: Matrix API not initialized!");
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
