import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Success() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <Navbar />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 93px)", gap: "16px" }}>
        <h2 style={{ fontSize: "32px", fontWeight: 800, color: "#0B1F44", margin: 0 }}>Account created successfully</h2>
        <p style={{ fontSize: "16px", color: "#555", margin: 0 }}>Welcome to THE BLOCK</p>
        <button style={{ marginTop: "16px" }} onClick={() => navigate("/explore")}>Start Exploring</button>
      </div>
    </div>
  );
}