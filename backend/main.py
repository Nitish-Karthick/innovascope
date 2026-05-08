from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import io
import math
import json
import os
from datetime import datetime

from scraper import scrape_live_news
from llm import analyze_tech_text
from auth import verify_password, get_password_hash, create_access_token, decode_access_token
from database import users_col, dashboards_col, queues_col, history_col

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Persistent storage fallback (Removed, using MongoDB) ---

# --- Default fallback data ---
DEFAULT_DATA = {
    "trending": [
        {
            "name": "Generative AI", "category": "Technique", "score": "98.4",
            "change": "14%", "changeType": "up", "color": "accent-cyan",
            "data": [{"v": v} for v in [10, 12, 15, 13, 16, 18, 20, 19, 22, 25, 28, 30]]
        },
        {
            "name": "WebAssembly", "category": "Platform", "score": "84.2",
            "change": "6%", "changeType": "up", "color": "accent-purple",
            "data": [{"v": v} for v in [20, 18, 22, 20, 24, 22, 26, 28, 25, 29, 32, 35]]
        },
        {
            "name": "Zero Trust", "category": "Technique", "score": "76.5",
            "change": "2.1%", "changeType": "up", "color": "emerald-500",
            "data": [{"v": v} for v in [15, 16, 14, 18, 17, 19, 21, 20, 23, 22, 24, 25]]
        },
        {
            "name": "NFTs (Utility)", "category": "Platform", "score": "42.1",
            "change": "8.5%", "changeType": "down", "color": "red-400",
            "data": [{"v": v} for v in [30, 28, 25, 22, 20, 18, 15, 12, 14, 10, 8, 5]]
        }
    ],
    "radar": [
        {"top": "45%", "left": "52%", "color": "bg-white", "glow": "neon-glow-cyan", "label": "React.js (98% sentiment)"},
        {"top": "35%", "left": "60%", "color": "bg-accent-cyan", "label": "Astro (82% hype)"},
        {"bottom": "35%", "left": "40%", "color": "bg-accent-cyan", "label": "Rust (88% growth)"},
        {"top": "25%", "left": "30%", "color": "bg-accent-purple", "label": "Micro-frontends"},
        {"bottom": "30%", "right": "25%", "color": "bg-accent-purple", "label": "SolidJS"},
        {"top": "30%", "right": "35%", "color": "bg-accent-purple", "label": "Kubernetes Operators"},
        {"bottom": "15%", "left": "15%", "color": "bg-red-500", "label": "Legacy SOAP"}
    ],
    "sentiment": {
        "positive": 78,
        "neutral": 15,
        "keywords": ["Qubits", "Encryption Break", "Sycamore", "Error Correction", "Cold Atom"]
    },
    "forecast": [
        {"month": "Jan", "score": 62, "predicted": 60},
        {"month": "Feb", "score": 68, "predicted": 65},
        {"month": "Mar", "score": 71, "predicted": 72},
        {"month": "Apr", "score": 75, "predicted": 74},
        {"month": "May", "score": 80, "predicted": 79},
        {"month": "Jun", "score": 84, "predicted": 83},
        {"month": "Jul", "score": 88, "predicted": 90},
        {"month": "Aug", "score": None, "predicted": 93},
        {"month": "Sep", "score": None, "predicted": 96},
    ],
    "developer_interest": [
        {"name": "Generative AI", "interest": 97, "growth": 14},
        {"name": "WebAssembly", "interest": 82, "growth": 8},
        {"name": "Zero Trust", "interest": 74, "growth": 5},
        {"name": "NFTs (Utility)", "interest": 28, "growth": -12}
    ],
    "media_coverage": [
        {"month": "Jan", "articles": 120},
        {"month": "Feb", "articles": 180},
        {"month": "Mar", "articles": 210},
        {"month": "Apr", "articles": 260},
        {"month": "May", "articles": 310},
        {"month": "Jun", "articles": 390},
        {"month": "Jul", "articles": 450},
    ]
}

# --- User & Auth ---
class RegisterRequest(BaseModel):
    username: str
    password: str
    name: str = ""
    email: str = ""
    role: str = "Analyst"

class LoginRequest(BaseModel):
    username: str
    password: str

class SettingsUpdateRequest(BaseModel):
    name: str
    email: str
    role: str
    groq_api_key: str = ""

def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload["sub"]

@app.post("/api/register")
def register(req: RegisterRequest):
    if users_col is None: raise HTTPException(status_code=500, detail="Database not connected")
    if users_col.find_one({"_id": req.username}):
        raise HTTPException(status_code=400, detail="Username already exists")
    
    users_col.insert_one({
        "_id": req.username,
        "password_hash": get_password_hash(req.password),
        "name": req.name or req.username,
        "email": req.email,
        "role": req.role,
        "groq_api_key": ""
    })
    token = create_access_token({"sub": req.username})
    return {"token": token, "user": {"username": req.username, "name": req.name or req.username, "role": req.role}}

@app.post("/api/login")
def login(req: LoginRequest):
    if users_col is None: raise HTTPException(status_code=500, detail="Database not connected")
    user = users_col.find_one({"_id": req.username})
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    token = create_access_token({"sub": req.username})
    return {"token": token, "user": {"username": req.username, "name": user.get("name"), "role": user.get("role", "Analyst")}}

@app.get("/api/user/settings")
def get_settings(username: str = Depends(get_current_user)):
    user = users_col.find_one({"_id": username}) if users_col is not None else {}
    return {
        "username": username,
        "name": user.get("name", username) if user else username,
        "email": user.get("email", "") if user else "",
        "role": user.get("role", "Analyst") if user else "Analyst",
        "groq_api_key": user.get("groq_api_key", "") if user else ""
    }

@app.put("/api/user/settings")
def update_settings(req: SettingsUpdateRequest, username: str = Depends(get_current_user)):
    if users_col is not None:
        users_col.update_one({"_id": username}, {"$set": {
            "name": req.name,
            "email": req.email,
            "role": req.role,
            "groq_api_key": req.groq_api_key
        }})
    return {"message": "Settings updated"}

# --- Data Management ---
def load_data(username: str) -> dict:
    if dashboards_col is not None:
        doc = dashboards_col.find_one({"_id": username})
        if doc: return doc
    return DEFAULT_DATA.copy()

def save_data(username: str, data: dict):
    if dashboards_col is not None:
        dashboards_col.update_one({"_id": username}, {"$set": data}, upsert=True)
        
def load_queue(username: str) -> dict:
    if queues_col is not None:
        doc = queues_col.find_one({"_id": username})
        if doc: return doc
    return {"unprocessed": [], "processed": [], "tech_col": None, "category_col": None, "velocity_col": None, "global_keywords": []}

def save_queue(username: str, queue_data: dict):
    if queues_col is not None:
        queues_col.update_one({"_id": username}, {"$set": queue_data}, upsert=True)

def load_history(username: str) -> list:
    if history_col is not None:
        doc = history_col.find_one({"_id": username})
        if doc: return doc.get("history", [])
    return []

def add_history(username: str, filename: str, rows_processed: int, sentiment):
    if history_col is not None:
        history = load_history(username)
        history.append({
            "id": len(history) + 1,
            "filename": filename,
            "date": datetime.utcnow().isoformat(),
            "rows_processed": rows_processed,
            "sentiment_score": sentiment
        })
        history = history[-50:]
        history_col.update_one({"_id": username}, {"$set": {"history": history}}, upsert=True)

@app.get("/api/user/history")
def get_user_history(username: str = Depends(get_current_user)):
    return {"history": load_history(username)}

# --- Helpers ---
def trend_color(idx: int) -> str:
    colors = ["accent-cyan", "accent-purple", "emerald-500", "red-400"]
    return colors[idx % len(colors)]

def bg_color(idx: int) -> str:
    colors = ["bg-accent-cyan", "bg-accent-purple", "bg-emerald-500", "bg-red-500", "bg-white"]
    return colors[idx % len(colors)]

def sentiment_to_position(sentiment: float, idx: int, total: int):
    top_pct = int((1.0 - sentiment) * 60 + 10)
    left_pct = int((idx / max(total - 1, 1)) * 60 + 20)
    return f"{top_pct}%", f"{left_pct}%"
    
def rebuild_dashboard_data(df: pd.DataFrame, tech_col: str, category_col: str, velocity_col: str, global_keywords: list, username: str):
    total = len(df)
    sentiment_col = "sentiment_score"

    new_trending = []
    for idx, row in df.iterrows():
        name     = str(row[tech_col]) if tech_col else f"Tech {idx + 1}"
        category = str(row[category_col]) if category_col else "General"

        if sentiment_col and not pd.isna(row.get(sentiment_col)):
            raw = float(row[sentiment_col])
            sentiment = raw if raw <= 1.0 else raw / 100.0
        else:
            sentiment = 0.5

        if velocity_col and not pd.isna(row.get(velocity_col)):
            raw_vel = float(row[velocity_col])
            velocity = raw_vel if raw_vel <= 100 else min(raw_vel / 1000, 100)
        else:
            velocity = round(sentiment * 100, 1)

        change_val = int(sentiment * 100 - 50)

        sparkline = []
        for t in range(12):
            base = velocity * (0.6 + 0.4 * (t / 11))
            wave = base + velocity * 0.1 * math.sin(t * 0.8 + idx)
            sparkline.append({"v": round(max(1, wave), 1)})

        new_trending.append({
            "name":       name,
            "category":   category,
            "score":      str(round(velocity, 1)),
            "change":     f"{abs(change_val)}%",
            "changeType": "up" if change_val >= 0 else "down",
            "color":      trend_color(idx),
            "data":       sparkline,
            "analysis_summary": row.get("analysis_summary", ""),
            "recent_news": row.get("recent_news", [])
        })

    new_radar = []
    for idx, row in df.iterrows():
        name = str(row[tech_col]) if tech_col else f"Tech {idx + 1}"
        if sentiment_col and not pd.isna(row.get(sentiment_col)):
            raw = float(row[sentiment_col])
            sentiment = raw if raw <= 1.0 else raw / 100.0
        else:
            sentiment = 0.5

        top_pct, left_pct = sentiment_to_position(sentiment, idx, total)
        new_radar.append({
            "top":   top_pct,
            "left":  left_pct,
            "color": bg_color(idx),
            "label": f"{name} ({int(sentiment * 100)}% sentiment)"
        })

    if sentiment_col:
        raw_scores = pd.to_numeric(df[sentiment_col], errors='coerce').dropna()
        if len(raw_scores) > 0:
            if raw_scores.max() > 1.0:
                raw_scores = raw_scores / 100.0
            avg = raw_scores.mean()
            positive = int(avg * 100)
            negative = int((1.0 - avg) * 100 * 0.3)
            neutral  = max(0, 100 - positive - negative)
        else:
            positive, neutral = 60, 30
    else:
        positive, neutral = 60, 30

    display_keywords = list(set(global_keywords))[:5] if global_keywords else ["Uploaded", "Dataset", "Analysis"]

    if velocity_col:
        vel_scores = pd.to_numeric(df[velocity_col], errors='coerce').dropna()
        base_vel = float(vel_scores.mean()) if len(vel_scores) > 0 else 70.0
    else:
        base_vel = 70.0

    months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep"]
    new_forecast = []
    for i, m in enumerate(months):
        val = round(base_vel * (0.7 + 0.35 * (i / 8)) + math.sin(i * 0.9) * 4, 1)
        predicted = round(val * (1 + 0.04 * (i - 4)), 1)
        new_forecast.append({
            "month": m,
            "score": val if i < 7 else None,
            "predicted": round(predicted, 1)
        })

    sorted_df = df.copy()
    if velocity_col:
        sorted_df = sorted_df.sort_values(velocity_col, ascending=False)
    top5 = sorted_df.head(5)
    new_dev_interest = []
    for _, row in top5.iterrows():
        name = str(row[tech_col]) if tech_col else "Tech"
        vel = float(row[velocity_col]) if velocity_col and not pd.isna(row.get(velocity_col)) else 50.0
        vel = vel if vel <= 100 else min(vel / 10, 100)
        sent = float(row[sentiment_col]) if sentiment_col and not pd.isna(row.get(sentiment_col)) else 0.5
        sent = sent if sent <= 1.0 else sent / 100.0
        growth = int((sent - 0.5) * 100)
        new_dev_interest.append({"name": name, "interest": round(vel, 1), "growth": growth})

    new_media = []
    for i, m in enumerate(months[:7]):
        articles = int(base_vel * (0.8 + 0.5 * (i / 6)) * (1 + 0.15 * math.sin(i * 1.2)))
        new_media.append({"month": m, "articles": articles})

    new_data = {
        "trending":           new_trending,
        "radar":              new_radar,
        "sentiment":          {"positive": positive, "neutral": neutral, "keywords": display_keywords},
        "forecast":           new_forecast,
        "developer_interest": new_dev_interest,
        "media_coverage":     new_media,
    }
    save_data(username, new_data)
    return {"positive": positive, "neutral": neutral}
    
def process_batch(batch: list, tech_col: str, api_key: str) -> tuple[list, list]:
    updated = []
    new_keywords = []
    for row in batch:
        name = str(row.get(tech_col, "Unknown Tech"))
        news, news_list = scrape_live_news(name)
        analysis = analyze_tech_text(name, news, api_key)
        
        row_copy = row.copy()
        row_copy["sentiment_score"] = analysis.get("sentiment_score", 0.5)
        row_copy["analysis_summary"] = analysis.get("analysis_summary", "")
        row_copy["recent_news"] = news_list
        new_keywords.extend(analysis.get("keywords", []))
        updated.append(row_copy)
        
    return updated, new_keywords

# --- API Endpoints ---
@app.get("/api/trending")
def get_trending(username: str = Depends(get_current_user)):
    return {"items": load_data(username)["trending"]}

@app.get("/api/radar")
def get_radar(username: str = Depends(get_current_user)):
    return {"points": load_data(username)["radar"]}

@app.get("/api/sentiment")
def get_sentiment(username: str = Depends(get_current_user)):
    return load_data(username)["sentiment"]

@app.get("/api/status")
def get_status(username: str = Depends(get_current_user)):
    queue = load_queue(username)
    has_more = len(queue.get("unprocessed", [])) > 0
    
    # Check if dashboard data exists
    has_data = False
    if dashboards_col is not None:
        has_data = dashboards_col.find_one({"_id": username}) is not None
        
    return {"has_data": has_data, "has_more": has_more}

@app.delete("/api/reset")
def reset_data(username: str = Depends(get_current_user)):
    if dashboards_col is not None: dashboards_col.delete_one({"_id": username})
    if queues_col is not None: queues_col.delete_one({"_id": username})
    return {"message": "Dashboard data reset successfully."}

@app.get("/api/forecast")
def get_forecast(username: str = Depends(get_current_user)):
    return {"data": load_data(username).get("forecast", DEFAULT_DATA["forecast"])}

@app.get("/api/developer-interest")
def get_developer_interest(username: str = Depends(get_current_user)):
    return {"data": load_data(username).get("developer_interest", DEFAULT_DATA["developer_interest"])}

@app.get("/api/media-coverage")
def get_media_coverage(username: str = Depends(get_current_user)):
    return {"data": load_data(username).get("media_coverage", DEFAULT_DATA["media_coverage"])}

@app.post("/api/upload")
async def upload_dataset(file: UploadFile = File(...), username: str = Depends(get_current_user)):
    user = users_col.find_one({"_id": username}) if users_col is not None else None
    api_key = user.get("groq_api_key") if user else None
    if not api_key:
        raise HTTPException(status_code=400, detail="MISSING_API_KEY")

    contents = await file.read()

    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        elif file.filename.endswith('.json'):
            df = pd.read_json(io.BytesIO(contents))
        else:
            return {"error": "Unsupported file type. Please upload a CSV or JSON file."}

        if df.empty:
            return {"error": "The uploaded file is empty."}

        df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

        tech_col      = next((c for c in ["technology", "tech", "name", "tool"] if c in df.columns), None)
        category_col  = next((c for c in ["category", "type", "quadrant"] if c in df.columns), None)
        sentiment_col = next((c for c in ["sentiment_score", "sentiment", "score", "sentiment_positive"] if c in df.columns), None)
        velocity_col  = next((c for c in ["investment_velocity", "velocity", "growth", "total_stars", "stars"] if c in df.columns), None)

        if not tech_col and not sentiment_col and not velocity_col:
            return {
                "error": (
                    f"No recognizable columns found in '{file.filename}'."
                )
            }

        total = len(df)
        all_records = df.to_dict('records')
        
        batch_size = 10
        to_process = all_records[:batch_size]
        unprocessed = all_records[batch_size:]
        
        try:
            updated_batch, new_keywords = process_batch(to_process, tech_col, api_key)
        except ValueError as e:
            if "GROQ_API_ERROR" in str(e):
                err_msg = str(e).replace("GROQ_API_ERROR:", "").strip()
                add_history(username, file.filename, 0, f"Error: {err_msg}")
                raise HTTPException(status_code=400, detail=str(e))
            raise e
        
        queue_data = {
            "unprocessed": unprocessed,
            "processed": updated_batch,
            "tech_col": tech_col,
            "category_col": category_col,
            "velocity_col": velocity_col,
            "global_keywords": new_keywords,
            "filename": file.filename # Save filename for history tracking
        }
        save_queue(username, queue_data)
        
        processed_df = pd.DataFrame(updated_batch)
        stats = rebuild_dashboard_data(processed_df, tech_col, category_col, velocity_col, new_keywords, username)

        has_more = len(unprocessed) > 0
        
        # Add to history if no more items to process, otherwise wait until fully done
        if not has_more:
             add_history(username, file.filename, len(updated_batch), stats["positive"])

        return {
            "filename": file.filename,
            "total_rows": total,
            "processed_rows": len(updated_batch),
            "has_more": has_more,
            "message": f"Successfully analysed top {len(updated_batch)} records! Dashboard has been updated."
        }

    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.post("/api/process-next")
async def process_next_batch(username: str = Depends(get_current_user)):
    user = users_col.find_one({"_id": username}) if users_col is not None else None
    api_key = user.get("groq_api_key") if user else None
    if not api_key:
        raise HTTPException(status_code=400, detail="MISSING_API_KEY")

    queue = load_queue(username)
    unprocessed = queue.get("unprocessed", [])
    
    if not unprocessed:
        return {"has_more": False, "message": "No more items to process."}
        
    batch_size = 10
    to_process = unprocessed[:batch_size]
    remaining = unprocessed[batch_size:]
    
    tech_col = queue.get("tech_col")
    
    try:
        updated_batch, new_keywords = process_batch(to_process, tech_col, api_key)
    except ValueError as e:
        if "GROQ_API_ERROR" in str(e):
            err_msg = str(e).replace("GROQ_API_ERROR:", "").strip()
            filename = queue.get("filename", "unknown_dataset")
            add_history(username, filename, len(queue.get("processed", [])), f"Error: {err_msg}")
            raise HTTPException(status_code=400, detail=str(e))
        raise e
    
    queue["processed"].extend(updated_batch)
    queue["unprocessed"] = remaining
    queue["global_keywords"].extend(new_keywords)
    save_queue(username, queue)
    
    processed_df = pd.DataFrame(queue["processed"])
    stats = rebuild_dashboard_data(
        processed_df, 
        tech_col, 
        queue.get("category_col"), 
        queue.get("velocity_col"), 
        queue["global_keywords"],
        username
    )
    
    has_more = len(remaining) > 0
    if not has_more:
        filename = queue.get("filename", "unknown_dataset")
        add_history(username, filename, len(queue["processed"]), stats["positive"])
    
    return {
        "processed_rows_this_batch": len(updated_batch),
        "total_processed": len(queue["processed"]),
        "has_more": has_more,
        "message": f"Processed {len(updated_batch)} additional records."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
