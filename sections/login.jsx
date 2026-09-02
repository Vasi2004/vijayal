/* login.jsx
   The password screen. The shared password lives here. */

import { useState } from "react";
import { PixelHouse } from "../scene/pixelart.jsx";

/* ===================== Login ===================== */

export function LoginGate({ onSuccess }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);

  const tryLogin = () => {
    if (pw === "WompWomp") onSuccess();
    else { setError(true); setPw(""); }
  };

  return (
    <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="panel pop-in" style={{ padding: "36px 32px", maxWidth: 380, width: "100%", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center" }}><PixelHouse variant="A" size={80} /></div>
        <h1 style={{ fontSize: 27, fontWeight: 800, margin: "6px 0 2px", lineHeight: 1.2 }}>Vasi & Vijayal's Kutty House</h1>
        <p style={{ margin: "0 0 18px", color: "#7a6647" }}>welcome home, chellam</p>
        <input
          className="field"
          type="password"
          value={pw}
          placeholder="the secret word..."
          onChange={(e) => { setPw(e.target.value); setError(false); }}
          onKeyDown={(e) => { if (e.key === "Enter") tryLogin(); }}
          aria-label="Password"
          style={{ textAlign: "center", marginBottom: 14 }}
        />
        {error && (
          <p className="hand" style={{ color: "#c96a6a", fontSize: 24, margin: "0 0 12px" }}>call your bf ;)</p>
        )}
        <button className="btn btn-green" onClick={tryLogin} style={{ fontSize: 17 }}>come in</button>
      </div>
    </div>
  );
}
