# File: backend/app/services/trading_simulator.py
import random
from datetime import datetime, timedelta
from sqlmodel import Session, select
from app.models import User, Transaction, TradeSimulation, MarketDataCache

class TradingSimulator:
    def __init__(self, db: Session):
        self.db = db
        self.win_rate = 0.65  # 65% win rate
        
    def get_current_market_price(self, symbol: str) -> float:
        # Try to get real price from cache, fallback to simulation
        cached = self.db.exec(select(MarketDataCache).where(MarketDataCache.symbol == symbol)).first()
        if cached and (datetime.now() - cached.last_updated).seconds < 300:  # 5 minutes
            return cached.current_price
        
        # Simulate realistic price based on symbol type
        base_prices = {
            'BTC/USD': 65000, 'ETH/USD': 3500, 'SPX500': 5200,
            'AAPL': 180, 'GOOGL': 140, 'MSFT': 420
        }
        base = base_prices.get(symbol, 100)
        volatility = random.uniform(-0.02, 0.02)  # ±2% daily movement
        return base * (1 + volatility)
    
    def simulate_trade_for_user(self, user_id: str) -> TradeSimulation:
        symbols = ['BTC/USD', 'ETH/USD', 'SPX500', 'AAPL', 'GOOGL', 'MSFT']
        symbol = random.choice(symbols)
        current_price = self.get_current_market_price(symbol)
        
        # Determine trade outcome based on win rate
        is_win = random.random() < self.win_rate
        price_move = random.uniform(0.005, 0.03) if is_win else random.uniform(-0.02, -0.005)
        exit_price = current_price * (1 + price_move)
        
        # Realistic volume based on user balance
        user = self.db.get(User, user_id)
        max_volume = float(user.balance) * 0.1  # Max 10% of balance per trade
        volume = random.uniform(0.01, max_volume)
        
        profit_loss = volume * (exit_price - current_price) * (1 if is_win else -1)
        
        trade = TradeSimulation(
            user_id=user_id,
            symbol=symbol,
            direction='BUY' if is_win else 'SELL',  # Simplified logic
            volume=volume,
            entry_price=current_price,
            exit_price=exit_price,
            profit_loss=profit_loss,
            status='closed',
            closed_at=datetime.now()
        )
        
        # Update user balance with real data
        user.balance += profit_loss
        self.db.add(user)
        self.db.add(trade)
        self.db.commit()
        
        return trade
    
    def generate_daily_trades(self, user_id: str, count: int = 3):
        """Generate 1-5 trades per day for a user"""
        trades = []
        for _ in range(random.randint(1, count)):
            trade = self.simulate_trade_for_user(user_id)
            trades.append(trade)
        return trades