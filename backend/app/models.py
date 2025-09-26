import uuid
from datetime import date, datetime
from enum import Enum

from pydantic import EmailStr
from sqlalchemy import Column, JSON
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


class TradeSimulationStatus(str, Enum):
    OPEN = "open"
    CLOSED = "closed"


class RiskTolerance(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class CopyStatus(str, Enum):
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    STOPPED = "STOPPED"



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
    trade_simulations: list["TradeSimulation"] = Relationship(back_populates="user", cascade_delete=True)
    daily_performance: list["DailyPerformance"] = Relationship(back_populates="user", cascade_delete=True)
    account_summaries: list["AccountSummary"] = Relationship(back_populates="user", cascade_delete=True)
    trader_profile: "TraderProfile" = Relationship(back_populates="user", cascade_delete=True)
    user_trader_copies: list["UserTraderCopy"] = Relationship(back_populates="user", cascade_delete=True)


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


class TradeSimulationBase(SQLModel):
    symbol: str = Field(max_length=20)
    direction: str = Field(max_length=4)
    volume: float = Field(gt=0)
    entry_price: float
    exit_price: float | None = None
    profit_loss: float | None = None
    status: str = Field(max_length=10)
    opened_at: datetime = Field(default_factory=datetime.utcnow)
    closed_at: datetime | None = None


class TradeSimulationCreate(TradeSimulationBase):
    user_id: uuid.UUID | None = None


class TradeSimulationUpdate(TradeSimulationBase):
    symbol: str | None = None
    direction: str | None = None
    volume: float | None = None
    entry_price: float | None = None
    status: str | None = None


class TradeSimulation(TradeSimulationBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    user: User = Relationship(back_populates="trade_simulations")


class TradeSimulationPublic(TradeSimulationBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime


class TradeSimulationsPublic(SQLModel):
    data: list[TradeSimulationPublic]
    count: int


class MarketDataCacheBase(SQLModel):
    symbol: str = Field(max_length=20, primary_key=True)
    current_price: float | None = None
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    daily_high: float | None = None
    daily_low: float | None = None
    price_change: float | None = None


class MarketDataCacheCreate(MarketDataCacheBase):
    pass


class MarketDataCacheUpdate(MarketDataCacheBase):
    symbol: str | None = None


class MarketDataCache(MarketDataCacheBase, table=True):
    pass


class MarketDataCachePublic(MarketDataCacheBase):
    pass


class MarketDataCacheCollection(SQLModel):
    data: list[MarketDataCachePublic]
    count: int


# Trader Profile Models
class TraderProfileBase(SQLModel):
    trading_strategy: str | None = Field(default=None, max_length=500)
    risk_tolerance: RiskTolerance = RiskTolerance.MEDIUM
    performance_metrics: dict | None = Field(default=None, sa_column=Column(JSON))
    is_public: bool = Field(default=False)
    copy_fee_percentage: float = Field(default=0.0, ge=0, le=100)
    minimum_copy_amount: float = Field(default=100.0, gt=0)
    total_copiers: int = Field(default=0)
    total_assets_under_copy: float = Field(default=0.0)
    average_monthly_return: float = Field(default=0.0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class TraderProfileCreate(TraderProfileBase):
    user_id: uuid.UUID


class TraderProfileUpdate(TraderProfileBase):
    trading_strategy: str | None = None
    risk_tolerance: RiskTolerance | None = None
    is_public: bool | None = None
    copy_fee_percentage: float | None = None
    minimum_copy_amount: float | None = None


class TraderProfile(TraderProfileBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", unique=True)
    user: User = Relationship(back_populates="trader_profile")
    user_trader_copies: list["UserTraderCopy"] = Relationship(back_populates="trader_profile", cascade_delete=True)
    trader_trades: list["TraderTrade"] = Relationship(back_populates="trader_profile", cascade_delete=True)


class TraderProfilePublic(TraderProfileBase):
    id: uuid.UUID
    user_id: uuid.UUID


class TraderProfilesPublic(SQLModel):
    data: list[TraderProfilePublic]
    count: int


# User Trader Copy Models
class UserTraderCopyBase(SQLModel):
    copy_amount: float = Field(gt=0)
    copy_started_at: datetime = Field(default_factory=datetime.utcnow)
    copy_status: CopyStatus = CopyStatus.ACTIVE
    copy_settings: dict | None = Field(default=None, sa_column=Column(JSON))


class UserTraderCopyCreate(UserTraderCopyBase):
    user_id: uuid.UUID
    trader_profile_id: uuid.UUID


class UserTraderCopyUpdate(UserTraderCopyBase):
    copy_amount: float | None = None
    copy_status: CopyStatus | None = None


class UserTraderCopy(UserTraderCopyBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id")
    trader_profile_id: uuid.UUID = Field(foreign_key="traderprofile.id")
    user: User = Relationship(back_populates="user_trader_copies")
    trader_profile: TraderProfile = Relationship(back_populates="user_trader_copies")


class UserTraderCopyPublic(UserTraderCopyBase):
    id: uuid.UUID
    user_id: uuid.UUID
    trader_profile_id: uuid.UUID


class UserTraderCopiesPublic(SQLModel):
    data: list[UserTraderCopyPublic]
    count: int


# Trader Trade Models
class TraderTradeBase(SQLModel):
    symbol: str = Field(max_length=50)
    side: TradeSide = TradeSide.BUY
    entry_price: float
    exit_price: float | None = None
    volume: float = Field(gt=0)
    profit_loss: float | None = None
    status: TradeStatus = TradeStatus.OPEN
    executed_at: datetime = Field(default_factory=datetime.utcnow)
    is_copyable: bool = Field(default=True)
    notes: str | None = Field(default=None, max_length=500)


class TraderTradeCreate(TraderTradeBase):
    trader_profile_id: uuid.UUID


class TraderTradeUpdate(TraderTradeBase):
    symbol: str | None = None
    side: TradeSide | None = None
    entry_price: float | None = None
    volume: float | None = None
    status: TradeStatus | None = None
    is_copyable: bool | None = None


class TraderTrade(TraderTradeBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    trader_profile_id: uuid.UUID = Field(foreign_key="traderprofile.id")
    trader_profile: TraderProfile = Relationship(back_populates="trader_trades")


class TraderTradePublic(TraderTradeBase):
    id: uuid.UUID
    trader_profile_id: uuid.UUID


class TraderTradesPublic(SQLModel):
    data: list[TraderTradePublic]
    count: int
