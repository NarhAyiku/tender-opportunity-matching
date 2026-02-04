from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.security import get_db, get_current_user
from app.models.user import User
from app.models.conversation import Conversation, ConversationEvent
from app.schemas.conversation import ConversationOut, ConversationDetailOut, ConversationEventOut

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.get("/", response_model=List[ConversationOut])
def list_conversations(
    conv_type: Optional[str] = Query(None, description="Filter by type: job, internship, scholarship, interview"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all conversations for the current user."""
    q = db.query(Conversation).filter(Conversation.user_id == current_user.id)

    if conv_type:
        q = q.filter(Conversation.type == conv_type)

    return q.order_by(Conversation.last_message_at.desc().nullslast(), Conversation.created_at.desc()).all()


@router.get("/{conversation_id}", response_model=ConversationDetailOut)
def get_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a single conversation with its events."""
    conv = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id, Conversation.user_id == current_user.id)
        .first()
    )
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv


@router.get("/{conversation_id}/events", response_model=List[ConversationEventOut])
def list_conversation_events(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List timeline events for a conversation."""
    conv = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id, Conversation.user_id == current_user.id)
        .first()
    )
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return (
        db.query(ConversationEvent)
        .filter(ConversationEvent.conversation_id == conversation_id)
        .order_by(ConversationEvent.created_at.desc())
        .all()
    )


# ──────────────────────────────────────────────────────────────────────────────
# Helper: auto-create conversation + initial event on application
# ──────────────────────────────────────────────────────────────────────────────

def create_conversation_for_application(
    db: Session,
    user_id: int,
    application_id: int,
    opportunity_id: int,
    opportunity_type: str = "job",
):
    """Called when a user likes/applies to an opportunity.
    Creates a Conversation and an initial 'applied' event."""
    conv = Conversation(
        user_id=user_id,
        application_id=application_id,
        opportunity_id=opportunity_id,
        type=opportunity_type,
    )
    db.add(conv)
    db.flush()  # get conv.id

    event = ConversationEvent(
        conversation_id=conv.id,
        kind="status_update",
        status="applied",
        message="Application submitted",
        actor="system",
    )
    db.add(event)
    return conv
