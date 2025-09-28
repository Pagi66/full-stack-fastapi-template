#!/usr/bin/env python3
"""
Test script for TraderSimulator service.
This script tests the three main functions of the TraderSimulator.
"""

import sys
import logging
from sqlmodel import Session, select

# Add the backend directory to the path for imports
sys.path.insert(0, '.')

from app.core.db import engine
from app.services.trader_simulator import TraderSimulator
from app.models import User, TraderProfile, TraderTrade, UserTraderCopy, Trade

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_trader_simulator():
    """Test the TraderSimulator service functions."""
    
    logger.info("🚀 Starting TraderSimulator test...")
    
    with Session(engine) as session:
        # Initialize the simulator
        simulator = TraderSimulator()
        
        # Test 1: Initialize trader profiles
        logger.info("📊 Testing trader profile initialization...")
        created_profiles = simulator.initialize_trader_profiles(session)
        logger.info(f"✅ Created {created_profiles} trader profiles")
        
        # Test 2: Generate trader performance metrics
        logger.info("📈 Testing performance metrics generation...")
        updated_traders = simulator.generate_trader_performance(session)
        logger.info(f"✅ Updated performance metrics for {updated_traders} traders")
        
        # Test 3: Simulate trader trades
        logger.info("💹 Testing trader trade simulation...")
        simulation_run = simulator.simulate_trader_trade(session)
        logger.info(
            "✅ Created %d trader trades and %d copied trades",
            len(simulation_run.trader_trades),
            len(simulation_run.follower_trades),
        )
        
        # Test 4: Verify data was created correctly
        logger.info("🔍 Verifying created data...")
        
        # Check trader profiles
        trader_profiles = session.exec(select(TraderProfile)).all()
        logger.info(f"📋 Total trader profiles: {len(trader_profiles)}")
        
        for profile in trader_profiles:
            logger.info(f"   - Trader {profile.user_id}: {profile.risk_tolerance.value} risk")
            if profile.performance_metrics:
                logger.info(f"     Performance: {profile.performance_metrics.get('win_rate', 0)}% win rate")
        
        # Check trader trades
        trader_trades = session.exec(select(TraderTrade)).all()
        logger.info(f"📊 Total trader trades: {len(trader_trades)}")
        
        # Check copied trades
        copied_trades = session.exec(select(Trade)).all()
        logger.info(f"📥 Total copied trades: {len(copied_trades)}")
        
        # Test 5: Test copy trading functionality directly
        if trader_trades:
            logger.info("🔄 Testing direct copy trading...")
            winning_trade = next((t for t in trader_trades if t.is_copyable and t.profit_loss > 0), None)
            if winning_trade:
                copied_records = simulator.copy_trade_to_followers(session, winning_trade)
                logger.info(f"✅ Copied trade to {len(copied_records)} followers")
            else:
                logger.info("ℹ️ No winning trades available for copy testing")
        
        # Display summary
        logger.info("\n🎉 TraderSimulator test completed successfully!")
        logger.info("=" * 50)
        logger.info("📊 SUMMARY:")
        logger.info(f"   Trader Profiles: {len(trader_profiles)}")
        logger.info(f"   Trader Trades: {len(trader_trades)}")
        logger.info(f"   Copied Trades: {len(copied_trades)}")
        
        # Show some example trades
        if trader_trades:
            logger.info("\n📈 EXAMPLE TRADES:")
            for i, trade in enumerate(trader_trades[:3]):  # Show first 3 trades
                status = "WIN" if trade.profit_loss and trade.profit_loss > 0 else "LOSS"
                logger.info(f"   {i+1}. {trade.symbol} - {trade.side.value} - ${trade.profit_loss or 0:.2f} ({status})")

def check_database_state():
    """Check the current state of the database."""
    
    logger.info("\n🔍 Checking database state...")
    
    with Session(engine) as session:
        # Count users
        users = session.exec(select(User)).all()
        logger.info(f"👥 Total users: {len(users)}")
        
        # Show user details
        for user in users:
            logger.info(f"   - {user.email} (Balance: ${user.balance:.2f}, Tier: {user.account_tier.value})")
        
        # Count trader profiles
        trader_profiles = session.exec(select(TraderProfile)).all()
        logger.info(f"📊 Total trader profiles: {len(trader_profiles)}")
        
        # Count copy relationships
        copy_relations = session.exec(select(UserTraderCopy)).all()
        logger.info(f"🔗 Total copy relationships: {len(copy_relations)}")

if __name__ == "__main__":
    try:
        # Check initial database state
        check_database_state()
        
        # Run the main test
        test_trader_simulator()
        
        # Check final database state
        check_database_state()
        
        logger.info("\n✅ All tests completed successfully!")
        
    except Exception as e:
        logger.error(f"❌ Error during testing: {e}")
        import traceback
        logger.error(traceback.format_exc())
        sys.exit(1)
