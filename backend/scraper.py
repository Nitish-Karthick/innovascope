import requests
from bs4 import BeautifulSoup
import urllib.parse

def scrape_live_news(tech_name: str) -> tuple[str, list]:
    """
    Scrapes Google News RSS for the given technology name.
    Returns a combined string of the top 5 to 10 recent article titles and descriptions,
    along with a structured list of dictionaries containing title, snippet, and source.
    """
    query = urllib.parse.quote_plus(f"{tech_name} technology")
    url = f"https://news.google.com/rss/search?q={query}&hl=en-US&gl=US&ceid=US:en"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, features="xml") # Needs lxml parser
        items = soup.findAll('item')
        
        # Extract up to top 10 articles
        articles_text = []
        news_list = []
        for i, item in enumerate(items[:10]):
            title = item.title.text if item.title else ""
            description = item.description.text if item.description else ""
            source = item.source.text if item.source else "Google News"
            pub_date = item.pubDate.text if item.pubDate else "Recently"
            
            # Clean HTML from description just in case it contains tags
            clean_desc = BeautifulSoup(description, "html.parser").get_text()
            
            articles_text.append(f"Title: {title}\nDescription: {clean_desc}")
            news_list.append({
                "title": title,
                "snippet": clean_desc[:200] + "..." if len(clean_desc) > 200 else clean_desc,
                "source": source,
                "date": pub_date
            })
            
        combined_text = "\n\n".join(articles_text)
        return combined_text, news_list

    except Exception as e:
        print(f"Error scraping news for {tech_name}: {e}")
        return "", []

if __name__ == "__main__":
    # Test the scraper
    print(scrape_live_news("Generative AI"))
