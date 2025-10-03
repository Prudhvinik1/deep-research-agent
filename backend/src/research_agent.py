from exa_py import Exa
from cerebras.cloud.sdk import Cerebras
import os
import asyncio
from typing import AsyncGenerator

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
    
    async def ask_ai(self, prompt):
        """Get AI response from Cerebras with streaming"""
        try:
            chat_completion = self.cerebras.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model="llama-4-scout-17b-16e-instruct",
                max_tokens=600,
                temperature=0.2,
                stream=True
            )
            full_response = ""
            for chunk in chat_completion:
                content = chunk.choices[0].delta.content
                if content:
                    full_response += content
                    print(content, end="")
                    yield {"type": "ai_chunk", "content": content}
            
            yield {"type": "ai_complete", "full_response": full_response}
            
                
        except Exception as e:
            error_msg = f"Error: Could not get AI response. {str(e)}"
            print(f"Error calling Cerebras API: {e}")
            yield {"type": "ai_error", "error": error_msg}
            


    async def research(self, query: str):
        """ The Main Researching Function That Orchestrates the Entire Research Process"""

        # Start research
        yield {"type": "start", "query": query, "message": "Starting research..."}
        await asyncio.sleep(0.1)

        #1. Web Search
        yield {"type": "search_start", "message": "Searching the web..."}
        await asyncio.sleep(0.1)
        
        web_search_results = self.web_search(query, num_results=5)
        
        #2. Get Contents from Web Search Results
        sources = []
        for i, result in enumerate(web_search_results):
            content = result.text
            title = result.title

            if content and len(content) > 200:
                sources.append({
                    "title": title,
                    "content": content
                })
                
                yield {
                    "type": "search_result", 
                    "title": title,
                    "url": result.url,
                    "index": i + 1,
                    "total": len(web_search_results)
                }
                await asyncio.sleep(0.1)
        
        yield {"type": "search_complete", "sources_found": len(sources)}
        await asyncio.sleep(0.1)
        
        print(f"Found {len(sources)} relevant sources")

        if not sources:
            yield {"type": "error", "message": "No relevant sources found"}
            return
        
        #3. Context for AI Analysis
        yield {"type": "analysis_start", "message": "Analyzing sources with AI..."}
        await asyncio.sleep(0.1)
        
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

        yield {"type": "ai_thinking", "message": "AI is processing the information..."}
        await asyncio.sleep(0.1)

        # Stream AI response
        summary_response = ""
        async for ai_chunk in self.ask_ai(prompt):
            if ai_chunk["type"] == "ai_chunk":
                yield ai_chunk
            elif ai_chunk["type"] == "ai_complete":
                summary_response = ai_chunk["full_response"]
                break
            elif ai_chunk["type"] == "ai_error":
                yield ai_chunk
                return

        yield {
            "type": "analysis_complete", 
            "summary": summary_response,
            "sources_count": len(sources)
        }
        await asyncio.sleep(0.1)

        print("🔍 AI Analysis Complete")

        # Final result
        yield {
            "type": "complete",
            "query": query,
            "summary": summary_response,
            "sources_count": len(sources),
            "message": "Research completed successfully!"
        }
        
    
    def deep_research(self, query: str):
        pass