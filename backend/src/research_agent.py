from exa_py import Exa
from cerebras.cloud.sdk import Cerebras
import os

class ResearchAgent:

    def __init__(self):
        self.exa = Exa(api_key=os.getenv("EXA_API_KEY"))
        self.cerebras = Cerebras(api_key=os.getenv("CEREBRAS_API_KEY"))
    
    def web_search(self, query: str, num_results: int = 5):
        result = self.exa.search_and_contents(
            query=query,
            type="auto",
            num_results=num_results,
            text={"max_characters": 1000}
        )
        return result.results
    
    def ask_ai(self,prompt):
        """Get AI response from Cerebras"""
        try:
            chat_completion = self.cerebras.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-4-scout-17b-16e-instruct",
            max_tokens = 600,
            temperature = 0.2
            )
            print(chat_completion.choices[0].message.content)
            return chat_completion.choices[0].message.content
        except Exception as e:
            print(f"Error calling Cerebras API: {e}")
            return f"Error: Could not get AI response. {str(e)}"


    def research(self, query: str):
        """ The Main Researching Function That Orchestrates the Entire Research Process"""

        #1. Web Search
        web_search_results = self.web_search(query, num_results=5)
        
        #2. Get Contents from Web Search Results
        sources = []
        for result in web_search_results:
            content = result.text
            title = result.title

            if content and len(content) > 200:
                sources.append({
                    "title": title,
                    "content": content
                })
        
        print(f"Found {len(sources)} relevant sources")

        if not sources:
            return {"summary": "No relevant sources found", "insights": []}
        
        #3. Context for AI Analysis
        context = f"Research query: {query}\n\nSources:\n"

        for i, source in enumerate(sources, 1):
            context += f"\nSource {i}:\nTitle: {source['title']}\n\n{source['content']}\n\n"
        
        #4. Summarize Sources
        prompt = f"""{context}

Based on these sources, provide:
1. A comprehensive summary (2-3 sentences)
2. Three key insights as bullet points

Format your response exactly like this:
SUMMARY: [your summary here]

INSIGHTS:
- [insight 1]
- [insight 2]
- [insight 3]"""

        summary_response = self.ask_ai(prompt)

        print("🔍 AI Analysis Complete")

        return {"query": query, "summary": summary_response,"sources": len(sources)}
        
        
    def deep_research(self, query: str):
        pass