# 💱 Myanmar Currency Rate API

![Node.js](https://img.shields.io/badge/Node.js-20%2B-green?logo=node.js)
![Express.js](https://img.shields.io/badge/Express.js-4.x-blue?logo=express)
![Puppeteer](https://img.shields.io/badge/Puppeteer-21%2B-red?logo=puppeteer)
![Status](https://img.shields.io/badge/status-active-brightgreen)

A Node.js and Puppeteer application that scrapes real-time exchange rates from trusted sources and calculates the **Myanmar Kyat (MMK)** rate against various currencies. The data is then exposed via a simple Express API.

---

## 📌 Table of Contents

- [🚀 Features](#-features)
- [📦 Tech Stack](#-tech-stack)
- [📁 Project Structure](#-project-structure)
- [⚙️ Getting Started](#️-getting-started)
- [🐳 Docker](#-docker)
- [🌐 Environment Variables](#-environment-variables)
- [💡 Usage](#-usage)
- [🛠 Troubleshooting](#-troubleshooting)
- [📚 API Endpoint](#-api-endpoint)

---

## 🚀 Features

- ✅ **Real-time Rates:** Fetches the latest exchange rates from reliable sources.
- ✅ **MMK Calculation:** Automatically calculates the MMK rate based on USD.
- ✅ **Puppeteer:** Uses headless Chrome for robust and reliable web scraping.
- ✅ **RESTful API:** Provides a clean and easy-to-use API endpoint.
- ✅ **Dockerized:** Includes a Dockerfile for consistent, containerized deployment.

---

## 📦 Tech Stack

- **Node.js**: The JavaScript runtime environment.
- **Express.js**: A web framework for creating the API server.
- **Puppeteer**: A Node library to control a headless Chrome browser.
- **dotenv**: A zero-dependency module to load environment variables.

---

## 📁 Project Structure

```
api_myanmarExchangeRate/
├── server.js
├── .env.local
├── Dockerfile
├── package.json
├── .gitignore
└── README.md
```

- **`server.js`**: The main application file containing the scraper and Express server logic.
- **`.env.local`**: A file to store the environment variables.
- **`Dockerfile`**: Defines the Docker image for the application.

---

## ⚙️ Getting Started

### 1. Prerequisites

- Node.js (v20 or higher)
- npm
- Docker (optional, but recommended)

### 2. Clone the Repository

```bash
git clone [https://github.com/aunghein-dev/api_myanmarExchangeRate.git](https://github.com/aunghein-dev/api_myanmarExchangeRate.git)
cd api_myanmarExchangeRate
```

### 3. Install Dependencies

```bash
npm install
```

### 5. Run the Server

```bash
node server.js
```

## Example Successful Response

```json
{
  "rates": [
    {
      "country": "United States",
      "currencyCode": "USD",
      "liveRate": "2100.1234"
    },
    {
      "country": "European Union",
      "currencyCode": "EUR",
      "liveRate": "2250.5678"
    }
    // ... more currencies
  ],
  "lastUpdated": "2025-08-13T14:53:31.000Z"
}
```
