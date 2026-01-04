# core/protocol/types.py
from pydantic import BaseModel
from typing import Literal, Union
from enum import Enum

class Phase(str, Enum):
    PLANNING = "planning"
    RESEARCHING = "researching"
    SYNTHESIZING = "synthesizing"

class Status(str, Enum):
    IDLE = "idle"
    WORKING = "working"
    COMPLETE = "complete"
    ERROR = "error"

class Mode(str, Enum):
    CHAT = "chat"
    PLAN = "plan"
    RESEARCH = "research"

class ContentDelta(BaseModel):
    type: Literal["content_delta"] = "content_delta"
    text: str

class PhaseStatus(BaseModel):
    type: Literal["phase_status"] = "phase_status"
    phase: Phase
    status: Status

class Progress(BaseModel):
    type: Literal["progress"] = "progress"
    percent: int
    message: str

class ToolCall(BaseModel):
    type: Literal["tool_call"] = "tool_call"
    tool: str
    query: str

class ToolResult(BaseModel):
    type: Literal["tool_result"] = "tool_result"
    tool: str
    success: bool
    summary: str
    artifact_id: str | None = None
    error: str | None = None

class Complete(BaseModel):
    type: Literal["complete"] = "complete"

class Aborted(BaseModel):
    type: Literal["aborted"] = "aborted"
    partial_saved: bool

class Error(BaseModel):
    type: Literal["error"] = "error"
    message: str
    recoverable: Literal[False] = False

class Ready(BaseModel):
    type: Literal["ready"] = "ready"
    protocol_version: str
    capabilities: list[str]

ProtocolEvent = Union[
    ContentDelta, PhaseStatus, Progress, ToolCall, ToolResult,
    Complete, Aborted, Error, Ready
]

class ProtocolEnvelope(BaseModel):
    session_id: str
    request_id: str
    seq: int
    timestamp: int
    event: ProtocolEvent
