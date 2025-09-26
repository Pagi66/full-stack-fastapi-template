import random
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlmodel import Session, select

from app.models import (
    User, TraderProfile, TraderTrade, UserTraderCopy, Trade, 
    TradeSide, TradeStatus, RiskTolerance, CopyStatus,
    MarketDataCache, AccountSummary
)


class TraderSimulator:
    """Simulates trader performance and copy trading functionality."""
    
    def __init__(self):
        self.specialty_symbols = {
            'forex': ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD'],
            'crypto': ['BTC/USD', 'ETH/USD', 'ADA/USD', 'SOL/USD', 'DOT/USD'],
            'stocks': ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'NVDA'],
            'indices': ['SPX500', 'NASDAQ', 'DJI', 'FTSE', 'DAX']
        }
        
        # Realistic base prices for simulation
        self.base_prices = {
            'EUR/USD': 1.08, 'GBP/USD': 1.26, 'USD/JPY': 150.0, 'AUD/USD': 0.65, 'USD/CAD': 1.35,
            'BTC/USD': 65000, 'ETH/USD': 3500, 'ADA/USD': 0.45, 'SOL/USD': 120, 'DOT/USD': 6.5,
            'AAPL': 180, 'TSLA': 250, 'MSFT': 420, 'GOOGL': 140, 'AMZN': 175, 'NVDA': 900,
            'SPX500': 5200, 'NASDAQ': 18000, 'DJI': 38000, 'FTSE': 7500, 'DAX': 17500
        }
        
        # Volatility factors by symbol type
        self.volatility_factors = {
            'forex': 0.005,    # 0.5% daily volatility
            'crypto': 0.03,    # 3% daily volatility  
            'stocks': 0.02,    # 2% daily volatility
            'indices': 0.015   # 1.5% daily volatility
        }

    def _get_symbol_type(self, symbol: str) -> str:
        """Determine the type of symbol based on its characteristics."""
        if symbol.endswith('/USD') and len(symbol.split('/')) == 2:
            if symbol in ['BTC/USD', 'ETH/USD', 'ADA/USD', 'SOL/USD', 'DOT/USD']:
                return 'crypto'
            return 'forex'
        elif symbol in ['SPX500', 'NASDAQ', 'DJI', 'FTSE', 'DAX']:
            return 'indices'
        else:
            return 'stocks'

    def _get_realistic_price(self, symbol: str) -> float:
        """Generate realistic current price with volatility."""
        base_price = self.base_prices.get(symbol, 100.0)
        symbol_type = self._get_symbol_type(symbol)
        volatility = self.volatility_factors[symbol_type]
        
        # Simulate price movement with some trend persistence
        price_move = random.uniform(-volatility, volatility)
        return base_price * (1 + price_move)

    def _calculate_performance_metrics(self, trader_trades: List[TraderTrade]) -> Dict[str, Any]:
        """Calculate comprehensive performance metrics for a trader."""
        if not trader_trades:
            return {
                'total_trades': 0,
                'winning_trades': 0,
                'losing_trades': 0,
                'win_rate': 0.0,
                'total_profit_loss': 0.0,
                'average_return_per_trade': 0.0,
                'largest_win': 0.0,
                'largest_loss': 0.0,
                'sharpe_ratio': 0.0,
                'max_drawdown': 0.0
            }
        
        closed_trades = [t for t in trader_trades if t.status == TradeStatus.CLOSED and t.profit_loss is not None]
        if not closed_trades:
            return {
                'total_trades': len(trader_trades),
                'winning_trades': 0,
                'losing_trades': 0,
                'win_rate': 0.0,
                'total_profit_loss': 0.0,
                'average_return_per_trade': 0.0,
                'largest_win': 0.0,
                'largest_loss': 0.0,
                'sharpe_ratio': 0.0,
                'max_drawdown': 0.0
            }
        
        profits = [t.profit_loss for t in closed_trades]
        winning_trades = [p for p in profits if p > 0]
        losing_trades = [p for p in profits if p < 0]
        
        total_profit = sum(profits)
        win_rate = len(winning_trades) / len(closed_trades) if closed_trades else 0
        
        # Calculate Sharpe ratio (simplified)
        avg_return = total_profit / len(closed_trades) if closed_trades else 0
        std_dev = (sum((p - avg_return) ** 2 for p in profits) / len(profits)) ** 0.5 if profits else 1
        sharpe_ratio = avg_return / std_dev if std_dev > 0 else 0
        
        # Calculate max drawdown (simplified)
        running_total = 0
        peak = 0
        max_drawdown = 0
        for profit in profits:
            running_total += profit
            if running_total > peak:
                peak = running_total
            drawdown = peak - running_total
            if drawdown > max_drawdown:
                max_drawdown = drawdown
        
        return {
            'total_trades': len(trader_trades),
            'winning_trades': len(winning_trades),
            'losing_trades': len(losing_trades),
            'win_rate': round(win_rate * 100, 2),  # Percentage
            'total_profit_loss': round(total_profit, 2),
            'average_return_per_trade': round(avg_return, 2),
            'largest_win': round(max(winning_trades) if winning_trades else 0, 2),
            'largest_loss': round(min(losing_trades) if losing_trades else 0, 2),
            'sharpe_ratio': round(sharpe_ratio, 2),
            'max_drawdown': round(max_drawdown, 2)
        }

    def generate_trader_performance(self, db: Session):
        """Generate realistic performance metrics for all traders."""
        # Get all trader profiles
        trader_profiles = db.exec(select(TraderProfile)).all()
        
        for trader_profile in trader_profiles:
            # Get all trades for this trader
            trader_trades = db.exec(
                select(TraderTrade).where(TraderTrade.trader_profile_id == trader_profile.id)
            ).all()
            
            # Calculate performance metrics
            performance_metrics = self._calculate_performance_metrics(trader_trades)
            
            # Update trader profile with new metrics
            trader_profile.performance_metrics = performance_metrics
            
            # Calculate average monthly return based on performance
            if trader_trades:
                total_days = max((datetime.now() - min(t.executed_at for t in trader_trades)).days, 1)
                monthly_return = (performance_metrics['total_profit_loss'] / total_days) * 30
                trader_profile.average_monthly_return = round(monthly_return, 2)
            else:
                trader_profile.average_monthly_return = 0.0
            
            trader_profile.updated_at = datetime.now()
            db.add(trader_profile)
        
        db.commit()
        return len(trader_profiles)

    def simulate_trader_trade(self, db: Session):
        """Simulate realistic trades for active traders."""
        # Get all trader profiles that are public (active traders)
        trader_profiles = db.exec(
            select(TraderProfile).where(TraderProfile.is_public == True)
        ).all()
        
        created_trades = []
        
        for trader_profile in trader_profiles:
            # Determine trading frequency based on risk tolerance
            trade_probability = {
                RiskTolerance.LOW: 0.3,    # 30% chance per simulation
                RiskTolerance.MEDIUM: 0.6, # 60% chance
                RiskTolerance.HIGH: 0.8    # 80% chance
            }.get(trader_profile.risk_tolerance, 0.5)
            
            if random.random() > trade_probability:
                continue  # Skip this trader for now
            
            # Select a random symbol from appropriate category based on risk
            symbol_categories = []
            if trader_profile.risk_tolerance == RiskTolerance.LOW:
                symbol_categories = ['forex', 'indices']
            elif trader_profile.risk_tolerance == RiskTolerance.MEDIUM:
                symbol_categories = ['forex', 'indices', 'stocks']
            else:  # HIGH risk
                symbol_categories = ['crypto', 'stocks']
            
            category = random.choice(symbol_categories)
            symbol = random.choice(self.specialty_symbols[category])
            
            # Get realistic current price
            current_price = self._get_realistic_price(symbol)
            
            # Determine trade outcome based on trader skill (simulated)
            # Better traders have higher win rates
            base_win_rate = {
                RiskTolerance.LOW: 0.65,
                RiskTolerance.MEDIUM: 0.60, 
                RiskTolerance.HIGH: 0.55
            }.get(trader_profile.risk_tolerance, 0.60)
            
            # Adjust win rate based on historical performance if available
            if trader_profile.performance_metrics:
                historical_win_rate = trader_profile.performance_metrics.get('win_rate', 50) / 100
                # Blend historical performance with base rate
                effective_win_rate = (base_win_rate + historical_win_rate) / 2
            else:
                effective_win_rate = base_win_rate
            
            is_win = random.random() < effective_win_rate
            
            # Determine price movement based on win/loss and volatility
            symbol_type = self._get_symbol_type(symbol)
            volatility = self.volatility_factors[symbol_type]
            
            if is_win:
                price_move = random.uniform(0.005, volatility)  # 0.5% to full volatility
            else:
                price_move = random.uniform(-volatility, -0.005)  # -volatility to -0.5%
            
            exit_price = current_price * (1 + price_move)
            
            # Determine realistic volume based on trader's typical behavior
            # Use trader's average trade size or default to reasonable amount
            typical_volume = 1000.0  # Default volume
            if trader_profile.performance_metrics and trader_profile.performance_metrics.get('average_return_per_trade'):
                # Scale volume based on historical performance
                avg_return = abs(trader_profile.performance_metrics['average_return_per_trade'])
                typical_volume = max(100.0, min(10000.0, avg_return * 10))
            
            volume = random.uniform(typical_volume * 0.5, typical_volume * 1.5)
            profit_loss = volume * (exit_price - current_price)
            
            # Create the trader trade
            trader_trade = TraderTrade(
                trader_profile_id=trader_profile.id,
                symbol=symbol,
                side=TradeSide.BUY if is_win else TradeSide.SELL,
                entry_price=round(current_price, 4),
                exit_price=round(exit_price, 4),
                volume=round(volume, 2),
                profit_loss=round(profit_loss, 2),
                status=TradeStatus.CLOSED,
                executed_at=datetime.now(),
                is_copyable=is_win,  # Only copy winning trades
                notes=f"Simulated trade - {'WIN' if is_win else 'LOSS'}"
            )
            
            db.add(trader_trade)
            created_trades.append(trader_trade)
        
        db.commit()
        
        # Copy winning trades to followers
        for trade in created_trades:
            if trade.is_copyable and trade.profit_loss > 0:
                self.copy_trade_to_followers(db, trade)
        
        return len(created_trades)

    def copy_trade_to_followers(self, db: Session, trader_trade: TraderTrade):
        """Copy a successful trader trade to all active followers."""
        # Get all active copy relationships for this trader
        copy_relationships = db.exec(
            select(UserTraderCopy).where(
                UserTraderCopy.trader_profile_id == trader_trade.trader_profile_id,
                UserTraderCopy.copy_status == CopyStatus.ACTIVE
            )
        ).all()
        
        copied_trades = []
        
        for copy_relation in copy_relationships:
            user = db.get(User, copy_relation.user_id)
            if not user or user.balance < copy_relation.copy_amount:
                continue  # Skip users with insufficient balance
            
            # Calculate copy amount based on user's copy settings
            copy_amount = copy_relation.copy_amount
            copy_multiplier = copy_amount / 1000.0  # Base multiplier on $1000
            
            # Scale the trade parameters for the follower
            scaled_volume = trader_trade.volume * copy_multiplier
            scaled_profit_loss = trader_trade.profit_loss * copy_multiplier
            
            # Apply copy fee if applicable
            trader_profile = db.get(TraderProfile, trader_trade.trader_profile_id)
            if trader_profile and trader_profile.copy_fee_percentage > 0:
                fee = scaled_profit_loss * (trader_profile.copy_fee_percentage / 100)
                scaled_profit_loss -= fee
            
            # Create the copied trade for the follower
            follower_trade = Trade(
                user_id=user.id,
                symbol=trader_trade.symbol,
                side=trader_trade.side,
                entry_price=trader_trade.entry_price,
                exit_price=trader_trade.exit_price,
                volume=round(scaled_volume, 2),
                profit_loss=round(scaled_profit_loss, 2),
                status=TradeStatus.CLOSED,
                opened_at=trader_trade.executed_at,
                closed_at=datetime.now(),
                notes=f"Copied from trader {trader_profile.user_id if trader_profile else 'Unknown'}"
            )
            
            # Update user balance
            user.balance += scaled_profit_loss
            
            # Update account summary
            self._update_account_summary(db, user.id, scaled_profit_loss, scaled_profit_loss > 0)
            
            db.add(follower_trade)
            db.add(user)
            copied_trades.append(follower_trade)
        
        db.commit()
        return len(copied_trades)

    def _update_account_summary(self, db: Session, user_id: uuid.UUID, profit_loss: float, is_win: bool):
        """Update user's account summary after a copied trade."""
        summary = db.exec(select(AccountSummary).where(AccountSummary.user_id == user_id)).first()
        
        if not summary:
            summary = AccountSummary(user_id=user_id)
            db.add(summary)
        
        summary.total_trades += 1
        summary.net_profit += profit_loss
        
        if is_win:
            summary.winning_trades += 1
        else:
            summary.losing_trades += 1
        
        summary.win_rate = (summary.winning_trades / summary.total_trades * 100) if summary.total_trades > 0 else 0
        summary.updated_at = datetime.now()
        
        db.add(summary)

    def initialize_trader_profiles(self, db: Session):
        """Initialize trader profiles for users who should be traders."""
        # Get users with premium or VIP accounts who don't have trader profiles
        potential_traders = db.exec(
            select(User).where(
                User.account_tier.in_(['PREMIUM', 'VIP']),
                ~User.id.in_(select(TraderProfile.user_id))
            )
        ).all()
        
        created_profiles = []
        
        for user in potential_traders:
            # Only make some users public traders (30% chance)
            is_public = random.random() < 0.3
            
            # Assign random risk tolerance
            risk_tolerance = random.choice(list(RiskTolerance))
            
            # Create realistic trading strategy based on risk tolerance
            strategies = {
                RiskTolerance.LOW: "Conservative position sizing with focus on forex and indices",
                RiskTolerance.MEDIUM: "Balanced portfolio with mix of stocks and forex",
                RiskTolerance.HIGH: "Aggressive growth strategy focusing on crypto and tech stocks"
            }
            
            trader_profile = TraderProfile(
                user_id=user.id,
                trading_strategy=strategies[risk_tolerance],
                risk_tolerance=risk_tolerance,
                is_public=is_public,
                copy_fee_percentage=random.uniform(0.5, 5.0) if is_public else 0.0,
                minimum_copy_amount=random.choice([100.0, 250.0, 500.0, 1000.0])
            )
            
            db.add(trader_profile)
            created_profiles.append(trader_profile)
        
        db.commit()
        return len(created_profiles)
