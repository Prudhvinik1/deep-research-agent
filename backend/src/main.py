from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.datamodels import ResearchRequest, ResearchResponse
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from src.research_agent import ResearchAgent
import asyncio
import json

load_dotenv('.env.local')

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

