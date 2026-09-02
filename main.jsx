import React from "react";
import { createRoot } from "react-dom/client";
import { installStorage } from "./storage.js";
import App from "./App.jsx";

/* window.storage has to exist before the app renders, since the sections read
   from it as soon as they mount */
installStorage();

createRoot(document.getElementById("root")).render(<App />);
