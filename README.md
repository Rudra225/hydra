<div align="center">

# 🐉 Hydra Arbitrage Engine

**High-Frequency Execution & Resilience Dashboard**

<img src="https://img.shields.io/badge/Frontend-React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
<img src="https://img.shields.io/badge/Build-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
<img src="https://img.shields.io/badge/Backend-Python_AsyncIO-3776AB?style=for-the-badge&logo=python&logoColor=white" />
<img src="https://img.shields.io/badge/RealTime-WebSockets-000000?style=for-the-badge&logo=socket.io&logoColor=white" />

<br/>

<img width="1080" height="480" alt="hydra image" src="https://github.com/user-attachments/assets/f4bbe9b2-924c-412a-9cc6-93eadcd0e6c8" />


</div>

---

## 📌 Architectural Overview

The Hydra Engine is a low-latency monitoring and execution pipeline designed to ingest and validate market data streams. This repository contains the **Frontend Dashboard UI** which visualizes the live state of the backend pipeline.

### System Flow
```
┌─────────────────────────────────────────────────────────────┐
│                 LIVE ASYNCHRONOUS DATA MESH                 │
│                 (Multi-Exchange Ingestion)                  │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                  CONSENSUS & SANITY ENGINE                  │
│    • Dynamic Outlier Filtering                              │
│    • Trend & Momentum Anchors                               │
│    • Stateful Recovery Protocols                            │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                  STRATEGY & EXECUTION CORE                  │
│    • Multi-Strategy Execution Routing                       │
│    • Depth-Aware Slippage Modeling                          │
│    • Latency-Adjusted Execution Simulator                   │
└──────────────────────────────┬──────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│   DECENTRALIZED FALLBACK     │ │    REACTIVE DASHBOARD      │
│   (Web3 Oracle Integration)  │ │    React 19 / Vite UI      │
│                              │ │    Live State Sync         │
└──────────────────────────────┘ └────────────────────────────┘
```

---

## ⚡ Core Capabilities (High-Level Overview)

### 1. Multi-Exchange Consensus Validation
To prevent phantom signal execution during flash crashes or API anomalies, incoming data streams undergo rigorous validation:
* **Dynamic Outlier Filtering:** Detects and isolates anomalous price ticks relative to global consensus.
* **Trend & Momentum Anchoring:** Uses advanced moving average models to separate genuine macro volatility from localized exchange noise.
* **Stateful Recovery Protocols:** Employs a strict validation queue for exchanges attempting to reconnect after an outage, ensuring data stability before reintegration.

### 2. Execution Physics & Realistic Market Simulation
Moving beyond naive top-of-book models, the engine accounts for real-world execution barriers:
* **Depth-Aware Slippage:** Calculates effective pricing across dynamic volume tiers, rejecting signals that lack sufficient order book depth.
* **Latency-Adjusted Execution:** Simulates variable network routing delays. If profitable spreads evaporate during the simulated latency window, the trade is safely aborted.
* **Net-Fee Thresholds:** Evaluates viability strictly on post-fee margins.

---

## 📁 Repository Structure

This showcase repository contains the presentation layer of the Hydra architecture:

```text
hydra/
├── frontend/                  # React 19 / Vite Dashboard Application
│   ├── public/                # Static assets and icons
│   ├── src/                   # React components and styling
│   │   ├── App.jsx            # Main dashboard grid and WebSocket listeners
│   │   ├── App.css            # Custom UI styling (Bloomberg Terminal aesthetic)
│   │   └── main.jsx           # React entry point
│   ├── package.json           # Frontend dependencies
│   └── vite.config.js         # Build tooling
└── README.md                  # System architecture documentation
```

---

## 🚀 Running the Dashboard Locally

If you want to spin up the UI to see the frontend architecture:

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Run the development server:**
   ```bash
   npm run dev
   ```
*(Note: Without the proprietary Python backend running locally, the dashboard will display the UI framework but will not populate live WebSocket data).*

---

## 🔒 Intellectual Property & Repository Scope

> [!IMPORTANT]
> **Notice regarding Public Repository contents:**  
> This public showcase repository includes the **Frontend Dashboard UI** and **High-Level System Architecture**.
>
> Core high-frequency execution loops, algorithmic strategies, mathematical models, and proprietary backend services are maintained in a private repository for security and IP protection. A comprehensive architecture walkthrough and demonstration are available upon request during technical interviews.

---

## 👤 Author

**Sudarshan Singh Rathore**  
*Finance & Analytics | Product Architect*  
*Specializing in FinTech Architecture & Quantitative Logic*
