# 🌾 Local Farmer's Crop & Market Portal

> A full-stack web application connecting local farmers directly with buyers — enabling fresh produce trade, real-time order tracking, and smart agricultural insights.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📌 Project Overview

The **Local Farmer's Crop & Market Portal** eliminates middlemen by providing a direct digital marketplace between farmers and buyers. It features role-based access (Farmer, Buyer, Admin), real-time price intelligence, order lifecycle management, and a crop calendar with agricultural tips.

### 🎯 Problem Statement

Indian farmers lose **15-30% of revenue** to middlemen. This portal enables:
- **Farmers** to list crops at fair prices with market rate comparison
- **Buyers** to discover, compare, and order fresh produce directly
- **Admins** to manage the platform, approve farmers, and monitor analytics

---

## ✨ Unique Features (27+)

### 🎨 Visual & UX
| Feature | Description |
|---------|-------------|
| 🌓 Dark / Light Theme | Full theme switching with animated toggle, persisted in localStorage |
| ✨ Page Transitions | Smooth slide-up + fade animations on every page navigation |
| 🎊 Confetti Celebration | 60-piece animated confetti on successful orders |
| 🔔 Notification Center | Bell icon with pulsing dot + contextual notification panel |
| 💬 Toast System | Beautiful slide-in/out notifications replacing all alerts |

### 🔍 Search & Discovery
| Feature | Description |
|---------|-------------|
| 🎤 Voice Search | Web Speech API-powered hands-free crop search |
| ⌨️ Command Palette | `Ctrl+K` opens VS Code-style instant navigation & search |
| 🏷️ Category Filters | One-click emoji pills: 🌾 Grain · 🥬 Veggie · 🍎 Fruit · 🌶️ Spice · 🫘 Pulse |
| ❤️ Wishlist | Heart toggle to save favorite crops (persisted locally) |

### 📊 Data Intelligence
| Feature | Description |
|---------|-------------|
| 📈 Live Price Ticker | Stock-market-style scrolling bar with ▲▼ % delta vs market rate |
| 💹 Price Delta Badges | "▲15% vs market" (green) or "▼8%" (red) on every crop card |
| 🟢 Freshness Meter | Animated bar: Fresh → Limited → Low Stock |
| 📉 SVG Sparklines | Inline trend visualization in marketplace header |
| 🔢 Animated Counters | Dashboard stats count up from zero with cubic easing |
| 📊 Admin Bar Chart | Animated CSS chart showing user distribution by role |

### ⚖️ Comparison & Analysis
| Feature | Description |
|---------|-------------|
| ⚖️ Crop Compare | Select 2 crops → side-by-side comparison with winner highlighting |
| 🔥 Hot Demand Pulse | Pulsing amber glow on high-demand crops |

### 🗓️ Season Intelligence
| Feature | Description |
|---------|-------------|
| 🌧️ Season Advisor | Auto-detects Kharif/Rabi/Zaid season from system date |
| 📅 Calendar Filters | "● In season now" indicators on relevant crops |
| 👋 Smart Greeting | Time-based: "Good morning ☀️, Ravi" / "Good evening 🌆" |

### 🛠️ Productivity Tools
| Feature | Description |
|---------|-------------|
| 🖨️ Print Invoice | One-click styled printable receipt for any order |
| 📥 Export CSV | Admin can export user data to CSV file |
| 🛤️ Order Timeline | Visual 4-step tracker: Pending → Confirmed → Shipped → Delivered |
| 🔄 Backend Monitor | Auto-pings server every 5s, shows/hides offline banner |

---

## 🏗️ Tech Stack

```
┌─────────────────────────────────────────────────┐
│                   FRONTEND                       │
│  React 19 · CSS-in-JS · Context API             │
│  Zero external UI/chart/animation libraries      │
├─────────────────────────────────────────────────┤
│                   BACKEND                        │
│  Node.js · Express.js · JWT Authentication       │
│  RESTful API · CORS · bcrypt                     │
├─────────────────────────────────────────────────┤
│                   DATABASE                       │
│  MySQL 8.0 · Relational Schema                   │
│  Users · Crops · Orders · Transport · Reviews    │
└─────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
DBMS-mini-project/
│
├── farmer-backend/          # Backend API Server
│   ├── server.js            # Express server with all routes
│   ├── package.json         # Dependencies
│   └── .gitignore
│
└── farmer-frontend/         # React Frontend
    ├── src/
    │   ├── App.js           # Main app (27+ features, ~1600 lines)
    │   ├── index.js          # Entry point
    │   └── index.css         # Base styles
    ├── public/
    │   └── index.html
    ├── package.json
    └── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MySQL** ≥ 8.0
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/Yashwanth7756/DBMS-mini-project.git
cd DBMS-mini-project
```

### 2. Setup the Database

Create a MySQL database and run:

```sql
CREATE DATABASE farmer_market_db;
```

> The backend auto-creates all tables on first run.

### 3. Configure Backend

```bash
cd farmer-backend
npm install
```

Create a `.env` file:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=farmer_market_db
JWT_SECRET=mysecretkey123
PORT=5000
```

### 4. Start Backend

```bash
node server.js
```

> Server runs at `http://localhost:5000`

### 5. Setup & Start Frontend

```bash
cd ../farmer-frontend
npm install
npm start
```

> App opens at `http://localhost:3000`

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT token |

### Crops
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/crops` | List all crops (search, filter) |
| POST | `/api/crops` | Add new crop (farmer only) |
| PUT | `/api/crops/:id` | Update crop |
| DELETE | `/api/crops/:id` | Delete crop |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Get user's orders |
| POST | `/api/orders` | Place new order |
| PUT | `/api/orders/:id/status` | Update order status |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Platform statistics |
| GET | `/api/admin/users` | All users list |
| PUT | `/api/admin/approve/:id` | Approve farmer |
| PUT | `/api/admin/reject/:id` | Reject/revoke user |

### Others
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/crop-calendar` | Sowing & harvest data |
| POST | `/api/reviews` | Add crop review |
| GET | `/api/transport/:id` | Transport details |

---

## 👥 User Roles

| Role | Capabilities |
|------|-------------|
| **Buyer** | Browse market, place orders, track delivery, print invoice, compare crops |
| **Farmer** | List crops, manage inventory, confirm/ship orders, view revenue |
| **Admin** | Approve farmers, view analytics, export data, manage all users |

---



## 🗄️ Database Schema (ER Model)

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  USERS   │────<│  CROPS   │>────│ ORDERS   │
│──────────│     │──────────│     │──────────│
│ user_id  │     │ crop_id  │     │ order_id │
│ name     │     │ crop_name│     │ crop_id  │
│ email    │     │ farmer_id│     │ buyer_id │
│ password │     │ price    │     │ quantity │
│ role     │     │ quantity │     │ total    │
│ location │     │ season   │     │ status   │
│ approved │     │ category │     │ address  │
└──────────┘     └──────────┘     └──────────┘
                                       │
                                  ┌────────────┐
                                  │ TRANSPORT  │
                                  │────────────│
                                  │ driver     │
                                  │ vehicle_no │
                                  │ eta        │
                                  └────────────┘
```

---

## 🧪 Built Without External Libraries

All 27+ features are implemented using **only**:
- React (core hooks: useState, useEffect, useRef, useContext, useCallback, useMemo)
- Vanilla CSS-in-JS (dynamic theme engine)
- Native Web APIs (Speech Recognition, Print, Blob/CSV)

**Zero** external UI framework, chart library, or animation library was used.

---

## 📄 License

This project is part of a DBMS Mini Project for academic evaluation.

---

<p align="center">
  Made with 💚 by <strong>Yashwanth</strong>
</p>
