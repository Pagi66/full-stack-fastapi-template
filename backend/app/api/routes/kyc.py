from __future__ import annotations

import logging
import uuid
from datetime import date, datetime
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlmodel import SQLModel, select

from app.api.deps import CurrentUser, SessionDep, get_current_active_superuser
from app.models import (
    KycDocument,
    KycDocumentPublic,
    KycDocumentType,
    KycDocumentsPublic,
    KycStatus,
    User,
    UserPublic,
    UserProfile,
    UserProfilePublic,
)


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/kyc", tags=["kyc"])

MAX_UPLOAD_SIZE = 10 * 1024 * 1024
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "application/pdf"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf"}
STORAGE_DIR = Path(__file__).resolve().parents[3] / "storage" / "kyc_documents"


class KycSubmission(SQLModel):
    legal_first_name: str
    legal_last_name: str
    date_of_birth: date
    phone_number: str
    address_line_1: str
    address_line_2: str | None = None
    city: str
    state: str
    postal_code: str
    country: str
    tax_id_number: str
    occupation: str
    source_of_funds: str


class KycSubmissionResponse(SQLModel):
    profile: UserProfilePublic
    status: KycStatus
    submitted_at: datetime | None


class KycStatusResponse(SQLModel):
    status: KycStatus
    submitted_at: datetime | None
    approved_at: datetime | None
    rejected_reason: str | None
    notes: str | None


class KycApplicationPublic(SQLModel):
    id: uuid.UUID
    user_id: uuid.UUID
    email: str
    kyc_status: str
    kyc_submitted_at: datetime | None
    legal_first_name: str | None
    legal_last_name: str | None
    date_of_birth: date | None
    phone_number: str | None
    country: str | None
    risk_assessment_score: int


class KycApplicationDetail(SQLModel):
    user: UserPublic
    profile: UserProfilePublic | None
    documents: list[KycDocumentPublic]


class KycRejectionPayload(SQLModel):
    reason: str
    notes: str | None = None


async def notify_admins_kyc_submission(user_id: uuid.UUID) -> None:
    """Placeholder for async notification to admins when a KYC submission is created."""
    logger.info("KYC submission received for user %s", user_id)


def calculate_age(born: date) -> int:
    today = date.today()
    return today.year - born.year - ((today.month, today.day) < (born.month, born.day))


def _determine_risk_score(submission: KycSubmission) -> int:
    base_score = 40
    income_source = submission.source_of_funds.lower()
    if income_source in {"business_income", "investments"}:
        base_score += 10
    elif income_source == "inheritance":
        base_score += 5
    elif income_source == "other":
        base_score += 15

    age = calculate_age(submission.date_of_birth)
    if age < 25:
        base_score += 10
    elif age > 60:
        base_score += 5

    return max(0, min(100, base_score))


def _store_document(
    *,
    user_id: uuid.UUID,
    document_type: KycDocumentType,
    side: str,
    filename: str,
    payload: bytes,
) -> str:
    STORAGE_DIR.mkdir(parents=True, exist_ok=True)
    user_dir = STORAGE_DIR / str(user_id)
    user_dir.mkdir(parents=True, exist_ok=True)

    extension = Path(filename).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file extension",
        )

    unique_name = f"{document_type.value}_{side}_{uuid.uuid4().hex}{extension}"
    destination = user_dir / unique_name
    destination.write_bytes(payload)
    relative_path = Path("storage") / "kyc_documents" / str(user_id) / unique_name
    return str(relative_path)


@router.get("/profile", response_model=UserProfilePublic | None)
def get_profile(session: SessionDep, current_user: CurrentUser) -> UserProfilePublic | None:
    profile = session.exec(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    ).first()
    if not profile:
        return None
    return UserProfilePublic.model_validate(profile)


@router.post("/submit", response_model=KycSubmissionResponse)
async def submit_kyc_information(
    *, session: SessionDep, current_user: CurrentUser, payload: KycSubmission
) -> KycSubmissionResponse:
    if calculate_age(payload.date_of_birth) < 18:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must be at least 18 years old to submit KYC",
        )

    profile = session.exec(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    ).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)

    profile_data = payload.model_dump()
    profile.sqlmodel_update(profile_data)
    profile.risk_assessment_score = _determine_risk_score(payload)
    profile.updated_at = datetime.utcnow()

    session.add(profile)

    now = datetime.utcnow()
    current_user.kyc_status = KycStatus.UNDER_REVIEW
    current_user.kyc_submitted_at = now
    current_user.kyc_approved_at = None
    current_user.kyc_verified_at = None
    current_user.kyc_rejected_reason = None
    current_user.kyc_notes = None

    session.add(current_user)
    session.commit()
    session.refresh(profile)
    session.refresh(current_user)

    await notify_admins_kyc_submission(current_user.id)

    return KycSubmissionResponse(
        profile=UserProfilePublic.model_validate(profile),
        status=current_user.kyc_status,
        submitted_at=current_user.kyc_submitted_at,
    )


@router.get("/status", response_model=KycStatusResponse)
def get_kyc_status(current_user: CurrentUser) -> KycStatusResponse:
    return KycStatusResponse(
        status=current_user.kyc_status,
        submitted_at=current_user.kyc_submitted_at,
        approved_at=current_user.kyc_approved_at,
        rejected_reason=current_user.kyc_rejected_reason,
        notes=current_user.kyc_notes,
    )


@router.get("/documents", response_model=KycDocumentsPublic)
def list_documents(session: SessionDep, current_user: CurrentUser) -> KycDocumentsPublic:
    documents = session.exec(
        select(KycDocument).where(KycDocument.user_id == current_user.id)
    ).all()
    payload = [KycDocumentPublic.model_validate(doc) for doc in documents]
    return KycDocumentsPublic(data=payload, count=len(payload))


@router.post("/documents", response_model=KycDocumentPublic)
async def upload_kyc_document(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    document_type: KycDocumentType = Form(...),
    file: UploadFile = File(...),
    side: str = Form("front"),
) -> KycDocumentPublic:
    side_normalised = side.lower()
    if side_normalised not in {"front", "back"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid document side")
    if document_type == KycDocumentType.PROOF_OF_ADDRESS:
        side_normalised = "front"

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty file upload")
    if len(contents) > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File too large (10MB limit)")
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported file type")

    storage_path = _store_document(
        user_id=current_user.id,
        document_type=document_type,
        side=side_normalised,
        filename=file.filename or f"{document_type.value}.bin",
        payload=contents,
    )
    await file.close()

    document = session.exec(
        select(KycDocument)
        .where(KycDocument.user_id == current_user.id)
        .where(KycDocument.document_type == document_type)
    ).first()

    if not document:
        document = KycDocument(user_id=current_user.id, document_type=document_type)

    if side_normalised == "back":
        document.back_image_url = storage_path
    else:
        document.front_image_url = storage_path

    document.verified = False
    document.verified_by = None
    document.verified_at = None

    session.add(document)
    session.commit()
    session.refresh(document)

    return KycDocumentPublic.model_validate(document)


@router.get(
    "/applications/pending",
    response_model=list[KycApplicationPublic],
    dependencies=[Depends(get_current_active_superuser)],
)
def list_pending_applications(session: SessionDep) -> list[KycApplicationPublic]:
    rows = session.exec(
        select(User, UserProfile)
        .join(UserProfile, UserProfile.user_id == User.id, isouter=True)
        .where(User.kyc_status.in_([KycStatus.PENDING, KycStatus.UNDER_REVIEW]))
         .order_by(User.kyc_submitted_at.desc(), User.email)
    ).all()

    payload: list[KycApplicationPublic] = []
    for user, profile in rows:
        payload.append(
            KycApplicationPublic(
                id=(profile.id if profile else user.id),
                user_id=user.id,
                email=user.email,
                kyc_status=user.kyc_status.value.lower(),
                kyc_submitted_at=user.kyc_submitted_at,
                legal_first_name=profile.legal_first_name if profile else None,
                legal_last_name=profile.legal_last_name if profile else None,
                date_of_birth=profile.date_of_birth if profile else None,
                phone_number=profile.phone_number if profile else None,
                country=profile.country if profile else None,
                risk_assessment_score=profile.risk_assessment_score if profile else 0,
            )
        )
    return payload


@router.get(
    "/applications/{user_id}",
    response_model=KycApplicationDetail,
    dependencies=[Depends(get_current_active_superuser)],
)
def get_application_detail(user_id: uuid.UUID, session: SessionDep) -> KycApplicationDetail:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    profile = session.exec(
        select(UserProfile).where(UserProfile.user_id == user_id)
    ).first()
    documents = session.exec(
        select(KycDocument).where(KycDocument.user_id == user_id)
    ).all()

    return KycApplicationDetail(
        user=UserPublic.model_validate(user),
        profile=UserProfilePublic.model_validate(profile) if profile else None,
        documents=[KycDocumentPublic.model_validate(doc) for doc in documents],
    )


@router.post(
    "/applications/{user_id}/approve",
    response_model=UserPublic,
    dependencies=[Depends(get_current_active_superuser)],
)
def approve_application(
    user_id: uuid.UUID, session: SessionDep, current_user: CurrentUser
) -> UserPublic:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    now = datetime.utcnow()
    user.kyc_status = KycStatus.APPROVED
    user.kyc_approved_at = now
    user.kyc_verified_at = now
    user.kyc_rejected_reason = None
    user.kyc_notes = None

    documents = session.exec(
        select(KycDocument).where(KycDocument.user_id == user_id)
    ).all()
    for document in documents:
        document.verified = True
        document.verified_by = current_user.id
        document.verified_at = now
        session.add(document)

    session.add(user)
    session.commit()
    session.refresh(user)

    return UserPublic.model_validate(user)


@router.post(
    "/applications/{user_id}/reject",
    response_model=UserPublic,
    dependencies=[Depends(get_current_active_superuser)],
)
def reject_application(
    user_id: uuid.UUID,
    payload: KycRejectionPayload,
    session: SessionDep,
) -> UserPublic:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.kyc_status = KycStatus.REJECTED
    user.kyc_approved_at = None
    user.kyc_verified_at = None
    user.kyc_rejected_reason = payload.reason
    user.kyc_notes = payload.notes or payload.reason

    documents = session.exec(
        select(KycDocument).where(KycDocument.user_id == user_id)
    ).all()
    for document in documents:
        document.verified = False
        document.verified_by = None
        document.verified_at = None
        session.add(document)

    session.add(user)
    session.commit()
    session.refresh(user)

    return UserPublic.model_validate(user)