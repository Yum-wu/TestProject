from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None


class SessionListResponse(BaseModel):
    sessions: list[str]
    count: int


class StatusResponse(BaseModel):
    status: str
    session_id: str | None = None
