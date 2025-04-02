import React, { useEffect, useState } from "react";
import { WidgetApi} from "matrix-widget-api";
import API_URLS from "../config";

const MatrixClientProvider = () => {
    const [matrixApi, setMatrixApi] = useState(null);
    const [userId, setUserId] = useState(null);
    const [roomId, setRoomId] = useState(null);
    const [theme, setTheme] = useState("light"); // Default theme

    useEffect(() => {
        console.log("🔹 Initializing Widget...");

        // Extract widget ID from the URL
        const widgetId = new URLSearchParams(window.location.search).get("widgetId");
        if (!widgetId) {
            console.error("❌ No widgetId found in URL!");
            return;
        }
        console.log(`✅ Widget ID: ${widgetId}`);

        // Initialize Matrix API
        const api = new WidgetApi(widgetId);
        console.log("🔹 Matrix Widget API initialized.");

        api.start();
        console.log("✅ Matrix Widget API started.");

        // // Request user and room info
        // api.getUserId()
        //     .then((id) => {
        //         setUserId(id);
        //         console.log(`✅ User ID: ${id}`);
        //     })
        //     .catch((error) => console.error("❌ Failed to fetch User ID:", error));

        // api.getRoomId()
        //     .then((id) => {
        //         setRoomId(id);
        //         console.log(`✅ Room ID: ${id}`);
        //     })
        //     .catch((error) => console.error("❌ Failed to fetch Room ID:", error));

        // Fetch the Matrix client's theme setting
        api.getClient().then((clientInfo) => {
            if (clientInfo.theme) {
                setTheme(clientInfo.theme);
                console.log(`🎨 Detected Theme: ${clientInfo.theme}`);
            }
        });

        // Listen for theme change events
        api.on("action:theme", (event) => {
            console.log("🔹 Theme changed:", event.data.theme);
            setTheme(event.data.theme);
        });

        setMatrixApi(api);

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
