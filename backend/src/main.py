from fastapi import FastAPI
from src.datamodels import ResearchRequest, ResearchResponse
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from src.research_agent import ResearchAgent
import asyncio
import json

load_dotenv('.env.local')

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.post("/research")
async def research(request: ResearchRequest):
    query = request.query
    agent = ResearchAgent()

    async def stream_response():
        async for response in agent.research(query):
            yield f"data: {json.dumps(response)}\n\n"
   
    return StreamingResponse(
        stream_response(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
    )

