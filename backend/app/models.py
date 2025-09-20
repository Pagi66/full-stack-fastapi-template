import uuid
from datetime import date, datetime
from enum import Enum

from pydantic import EmailStr
from sqlalchemy import Column
from sqlalchemy import Enum as SAEnum
from sqlmodel import Field, Relationship, SQLModel


class UserRole(str, Enum):
    ADMIN = "ADMIN"
    USER = "USER"



class KycStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"



class AccountTier(str, Enum):
    BASIC = "BASIC"
    STANDARD = "STANDARD"
    PREMIUM = "PREMIUM"
    VIP = "VIP"



class TransactionType(str, Enum):
    DEPOSIT = "DEPOSIT"
    WITHDRAWAL = "WITHDRAWAL"
    ADJUSTMENT = "ADJUSTMENT"



class TransactionStatus(str, Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"



class TradeSide(str, Enum):
    BUY = "BUY"
    SELL = "SELL"



class TradeStatus(str, Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    CANCELLED = "CANCELLED"



class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)
    role: UserRole = UserRole.USER
    account_tier: AccountTier = AccountTier.BASIC
    kyc_status: KycStatus = KycStatus.PENDING
    kyc_notes: str | None = Field(default=None, max_length=255)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    full_name: str | None = Field(default=None, max_length=255)


class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore
    password: str | None = Field(default=None, min_length=8, max_length=40)
    role: UserRole | None = None
    account_tier: AccountTier | None = None
    kyc_status: KycStatus | None = None
    kyc_notes: str | None = Field(default=None, max_length=255)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)


class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    balance: float = Field(default=0.0)
    role: UserRole = Field(
        sa_column=Column(SAEnum(UserRole, name="userrole"), nullable=False, server_default=UserRole.USER.value),
        default=UserRole.USER,
    )
    account_tier: AccountTier = Field(
        sa_column=Column(SAEnum(AccountTier, name="accounttier"), nullable=False, server_default=AccountTier.BASIC.value),
        default=AccountTier.BASIC,
    )
    kyc_status: KycStatus = Field(
        sa_column=Column(SAEnum(KycStatus, name="kycstatus"), nullable=False, server_default=KycStatus.PENDING.value),
        default=KycStatus.PENDING,
    )
    kyc_verified_at: datetime | None = Field(default=None)
    kyc_notes: str | None = Field(default=None, max_length=255)
    last_login_at: datetime | None = Field(default=None)
    oauth_provider: str | None = Field(default=None, max_length=50)
    oauth_provider_id: str | None = Field(default=None, max_length=255)
    oauth_account_email: str | None = Field(default=None, max_length=255)
    refresh_token: str | None = Field(default=None, max_length=512)
    refresh_token_expires_at: datetime | None = Field(default=None)
    failed_login_attempts: int = Field(default=0)
    account_locked_until: datetime | None = Field(default=None)
    items: list["Item"] = Relationship(back_populates="owner", cascade_delete=True)
    transactions: list["Transaction"] = Relationship(back_populates="user", cascade_delete=True)
    trades: list["Trade"] = Relationship(back_populates="user", cascade_delete=True)
    daily_performance: list["DailyPerformance"] = Relationship(back_populates="user", cascade_delete=True)
    account_summaries: list["AccountSummary"] = Relationship(back_populates="user", cascade_delete=True)


class UserPublic(UserBase):
    id: uuid.UUID
    balance: float
    role: UserRole
    account_tier: AccountTier
    kyc_status: KycStatus
    kyc_verified_at: datetime | None
    kyc_notes: str | None
    last_login_at: datetime | None


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


class ItemBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=255)


class ItemCreate(ItemBase):
    pass


class ItemUpdate(ItemBase):
    title: str | None = Field(default=None, min_length=1, max_length=255)  # type: ignore


class Item(ItemBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(foreign_key="user.id", nullable=False, ondelete="CASCADE")
    owner: User | None = Relationship(back_populates="items")


class ItemPublic(ItemBase):
    id: uuid.UUID
    owner_id: uuid.UUID


class ItemsPublic(SQLModel):
    data: list[ItemPublic]
    count: int


class TransactionBase(SQLModel):
    amount: float
    transaction_type: TransactionType = TransactionType.DEPOSIT
    status: TransactionStatus = TransactionStatus.PENDING
    description: str | None = Field(default=None, max_length=255)


class TransactionCreate(TransactionBase):
    user_id: uuid.UUID | None = None


class TransactionUpdate(TransactionBase):
    transaction_type: TransactionType | None = None
    status: TransactionStatus | None = None


class Transaction(TransactionBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    executed_at: datetime | None = Field(default=None)
    user: User = Relationship(back_populates="transactions")


class TransactionPublic(TransactionBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    executed_at: datetime | None


class TransactionsPublic(SQLModel):
    data: list[TransactionPublic]
    count: int


class TradeBase(SQLModel):
    symbol: str = Field(max_length=50)
    side: TradeSide = TradeSide.BUY
    entry_price: float
    exit_price: float | None = None
    volume: float = Field(gt=0)
    profit_loss: float | None = None
    status: TradeStatus = TradeStatus.OPEN
    opened_at: datetime = Field(default_factory=datetime.utcnow)
    closed_at: datetime | None = None
    notes: str | None = Field(default=None, max_length=255)


class TradeCreate(TradeBase):
    user_id: uuid.UUID | None = None


class TradeUpdate(TradeBase):
    symbol: str | None = None
    side: TradeSide | None = None
    entry_price: float | None = None
    volume: float | None = None
    status: TradeStatus | None = None


class Trade(TradeBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id")
    user: User = Relationship(back_populates="trades")


class TradePublic(TradeBase):
    id: uuid.UUID
    user_id: uuid.UUID


class TradesPublic(SQLModel):
    data: list[TradePublic]
    count: int


class DailyPerformanceBase(SQLModel):
    performance_date: date
    profit_loss: float


class DailyPerformanceCreate(DailyPerformanceBase):
    user_id: uuid.UUID | None = None


class DailyPerformance(DailyPerformanceBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    user: User = Relationship(back_populates="daily_performance")


class DailyPerformancePublic(DailyPerformanceBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime


class DailyPerformanceCollection(SQLModel):
    data: list[DailyPerformancePublic]
    count: int


class AccountSummaryBase(SQLModel):
    total_deposits: float = 0.0
    total_withdrawals: float = 0.0
    net_profit: float = 0.0
    total_trades: int = 0
    winning_trades: int = 0
    losing_trades: int = 0
    win_rate: float = 0.0
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class AccountSummary(AccountSummaryBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", unique=True)
    user: User = Relationship(back_populates="account_summaries")


class AccountSummaryPublic(AccountSummaryBase):
    id: uuid.UUID
    user_id: uuid.UUID


class Message(SQLModel):
    message: str


class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole


class TokenPayload(SQLModel):
    sub: str | None = None
    role: UserRole | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=40)

