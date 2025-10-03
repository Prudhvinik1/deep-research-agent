from pydantic import BaseModel

class ResearchRequest(BaseModel):
    query: str
    source: str = "web"

class ResearchResponse(BaseModel):
    result: str
    source: str = "web"