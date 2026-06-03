# Innovascope - Dashboard Prototype 🚀

Innovascope is a web-based automated technology intelligence platform. It ingests datasets of technologies and enriches them by combining real-time news scraping with AI-powered sentiment analysis. 

The application utilizes a **Dual-Engine Architecture**: a scraper engine pulls the latest news about technologies from Google News, and an AI engine (powered by Groq and Llama-3) analyzes the text to determine sentiment scores and extract key industry keywords. The results are beautifully visualized on a high-fidelity React dashboard.

## ✨ Features

- **Automated Data Ingestion:** Upload standard CSV datasets to be queued for analysis.
- **Dual-Engine Enrichment:** 
  - *Scraper Engine:* Automatically pulls the top 10 latest articles via Google News RSS for each technology.
  - *AI Engine:* Passes scraped text to Groq (Llama-3.3-70b) to extract sentiment and core keywords.
- **Dynamic Visualizations:** 
  - **Tech Radar:** A concentric circular map plotting technologies based on sentiment and category.
  - **Trending Sparklines:** Historical velocity visualizations.
  - **Sentiment Donut & Progress Bars:** Aggregate positive vs. neutral sentiment across datasets.
- **Asynchronous Processing:** Processes datasets in batches with a "Load More Intelligence" frontend polling mechanism to prevent UI blocking.
- **Dark Mode UI:** Modern, responsive interface built with React, Vite, and Tailwind CSS.

## 🛠️ Tech Stack

**Frontend:**
- React 19 + Vite
- Tailwind CSS v3.4 (Utility-first styling)
- Recharts (Declarative data visualizations)
- Lucide React (Icons)

**Backend:**
- Python 3 + FastAPI (High-performance API)
- Pandas (Dataframe parsing & manipulation)
- BeautifulSoup4 + Requests (Web scraping)
- Groq SDK (LLM integration)

## 📁 Project Structure

```
dashboard-prototype/
├── backend/                  # Python FastAPI Backend
│   ├── main.py               # Main API routes and entry point
│   ├── llm.py                # Groq integration for sentiment & keyword extraction
│   ├── scraper.py            # Google News RSS scraper
│   ├── requirements.txt      # Python dependencies
│   └── users.example.json    # Example user configuration template
├── src/                      # React Frontend Source Code
│   ├── components/           # UI Components (Charts, Lists, Layout)
│   ├── pages/                # Main views (Dashboard, etc.)
│   ├── App.jsx               # View router / state manager
│   └── index.css             # Tailwind base styles
├── dataset/                  # Initial seed CSV datasets
├── sample_tech_dataset.csv   # Root level sample dataset for easy testing
└── ...
```

## 🚀 Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/Nitish-Karthick/innovascope.git
cd innovascope
```

### 2. Backend Setup
The backend requires Python 3.9+ and a free Groq API key.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure Environment Variables:
   - Copy the `.env.example` file to a new file named `.env`:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and add your `GROQ_API_KEY`.
   - Copy `users.example.json` to `users.json` and insert your API key where prompted. This allows the backend to mock user sessions.
     ```bash
     cp users.example.json users.json
     ```
5. Start the backend server:
   ```bash
   uvicorn main:app --reload
   # Or using python main.py
   ```
   *The backend will run on `http://localhost:8000`.*

### 3. Frontend Setup
1. Open a new terminal and navigate to the project root:
   ```bash
   cd dashboard-prototype
   ```
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will be available at `http://localhost:5173`.*

## 💡 Usage

1. Open `http://localhost:5173` in your browser.
2. If prompted, login as a demo user (e.g., using the admin profile defined in your `users.json`).
3. You can use the built-in demo data, or upload `sample_tech_dataset.csv` via the web interface to see the backend parser process the file.
4. Click **"Load More Intelligence"** on the dashboard to trigger the next batch of LLM/Scraping analysis on the uploaded data.
