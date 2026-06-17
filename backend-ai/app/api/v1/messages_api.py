from fastapi import APIRouter, Depends, HTTPException
from app.core.security import verify_token
from app.config import settings
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/messages", tags=["Messages"])


class BulkMessageRequest(BaseModel):
    recipient_type: str
    recipient_ids: Optional[list[int]] = None
    message_type: str
    subject: Optional[str] = None
    body: str


class MessageResponse(BaseModel):
    status: str
    sent_count: int
    message: str


@router.post("/send-bulk", response_model=MessageResponse)
async def send_bulk_message(req: BulkMessageRequest, user=Depends(verify_token)):
    from sqlalchemy import create_engine, text
    engine = create_engine(settings.database_url_sync)

    if req.recipient_type == "all_students":
        with engine.connect() as conn:
            result = conn.execute(text("SELECT COUNT(*) FROM students WHERE is_active = true"))
            count = result.scalar()
    elif req.recipient_type == "class" and req.recipient_ids:
        ids = ",".join(map(str, req.recipient_ids))
        with engine.connect() as conn:
            result = conn.execute(text(f"SELECT COUNT(*) FROM students WHERE class_id IN ({ids})"))
            count = result.scalar()
    else:
        count = len(req.recipient_ids) if req.recipient_ids else 0

    with engine.connect() as conn:
        conn.execute(
            text("INSERT INTO messages(recipient_type, recipient_ids, message_type, subject, body, sent_by) VALUES(:rt, :rid, :mt, :subj, :body, :sent_by)"),
            {"rt": req.recipient_type, "rid": ",".join(map(str, req.recipient_ids)) if req.recipient_ids else "all", "mt": req.message_type, "subj": req.subject or "", "body": req.body, "sent_by": user.get("userId") or 1},
        )
        conn.commit()

    return MessageResponse(status="sent", sent_count=count, message=f"Bulk {req.message_type} sent to {count} recipient(s)")
