import json
from groq import Groq

def analyze_tech_text(tech_name: str, scraped_text: str, api_key: str) -> dict:
    """
    Analyzes scraped news text for a technology using Groq (Llama 3.3).
    Throws a ValueError if no API key is provided, enforcing strict quota isolation.
    """
    if not api_key or not str(api_key).strip():
        raise ValueError("MISSING_API_KEY")

    client = Groq(api_key=api_key)

    if not scraped_text.strip():
        return {
            "sentiment_score": 0.5,
            "keywords": ["Emerging", "Undefined", "Quiet Market"],
            "analysis_summary": "No recent market news was found to perform an analysis on."
        }

    prompt = f"""You are an expert market analyst evaluating the sentiment and focus of a specific technology.

Technology Name: {tech_name}

Recent News/Descriptions:
{scraped_text}

Based on the news text provided above, analyze the market sentiment and extract the top current focus areas.

You must strictly return a JSON object with exactly three keys:
1. "sentiment_score": A float between 0.0 (completely pessimistic) and 1.0 (completely optimistic).
2. "keywords": A list of exactly 3 short strings summarizing the technology's current focus, use cases, or key associations found in the text.
3. "analysis_summary": A concise 2-sentence market justification explaining *why* you gave that sentiment score based on the news you read.

Do not include markdown blocks or any other explanation, only valid JSON."""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
        )

        data = json.loads(response.choices[0].message.content)

        # Validate and normalize
        sentiment = float(data.get("sentiment_score", 0.5))
        sentiment = max(0.0, min(1.0, sentiment))

        keywords = data.get("keywords", ["Unknown", "Undefined", "Analysis Failed"])
        if not isinstance(keywords, list):
            keywords = ["Unknown", "Undefined", "Analysis Failed"]
        if len(keywords) > 3:
            keywords = keywords[:3]
        while len(keywords) < 3:
            keywords.append("Unknown")

        summary = data.get("analysis_summary", "No clear justification provided by the model.")

        return {
            "sentiment_score": sentiment,
            "keywords": keywords,
            "analysis_summary": summary
        }

    except Exception as e:
        print(f"Error calling Groq API for {tech_name}: {e}")
        raise ValueError(f"GROQ_API_ERROR: {str(e)}")

if __name__ == "__main__":
    test_text = "Title: React Server Components are great. Description: The community is excited about the new features."
    print(analyze_tech_text("React", test_text, "test_key"))
