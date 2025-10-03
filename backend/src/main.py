from fastapi import FastAPI
from src.datamodels import ResearchRequest, ResearchResponse
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from src.research_agent import ResearchAgent

load_dotenv('.env.local')

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.post("/research")
async def research(request: ResearchRequest):
    query = request.query
    agent = ResearchAgent()
    response = agent.research(query)
   
    return ResearchResponse(
        result=response["summary"],
        source="web"
    )

