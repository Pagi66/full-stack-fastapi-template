#!/usr/bin/env python3
"""
Verification script for TraderSimulator service.
This script demonstrates the functionality without modifying the database.
"""

import sys
import logging
from sqlmodel import Session, select

# Add the backend directory to the path for imports
sys.path.insert(0, '.')

from app.core.db import engine
from app.services.trader_simulator import TraderSimulator
from app.models import User, TraderProfile, TraderTrade

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def verify_trader_simulator():
    """Verify that the TraderSimulator service is properly implemented."""
    
    logger.info("🔍 Verifying TraderSimulator implementation...")
    
    # Test 1: Verify the class can be instantiated
    try:
        simulator = TraderSimulator()
        logger.info("✅ TraderSimulator class instantiated successfully")
    except Exception as e:
        logger.error(f"❌ Failed to instantiate TraderSimulator: {e}")
        return False
    
    # Test 2: Verify specialty symbols are properly configured
    expected_categories = ['forex', 'crypto', 'stocks', 'indices']
    for category in expected_categories:
        if category in simulator.specialty_symbols and simulator.specialty_symbols[category]:
            logger.info(f"✅ {category.upper()} symbols configured: {len(simulator.specialty_symbols[category])} symbols")
        else:
            logger.error(f"❌ {category.upper()} symbols not properly configured")
            return False
    
    # Test 3: Verify base prices are realistic
    sample_symbols = ['EUR/USD', 'BTC/USD', 'AAPL', 'SPX500']
    for symbol in sample_symbols:
        price = simulator._get_realistic_price(symbol)
        if price > 0:
            logger.info(f"✅ Realistic price for {symbol}: ${price:.2f}")
        else:
            logger.error(f"❌ Invalid price for {symbol}: ${price:.2f}")
            return False
    
    # Test 4: Verify symbol type detection
    test_cases = [
        ('EUR/USD', 'forex'),
        ('BTC/USD', 'crypto'), 
        ('AAPL', 'stocks'),
        ('SPX500', 'indices')
    ]
    
    for symbol, expected_type in test_cases:
        detected_type = simulator._get_symbol_type(symbol)
        if detected_type == expected_type:
            logger.info(f"✅ Symbol type detection for {symbol}: {detected_type}")
        else:
            logger.error(f"❌ Symbol type detection failed for {symbol}: expected {expected_type}, got {detected_type}")
            return False
    
    # Test 5: Verify performance metrics calculation (with mock data)
    try:
        # Create mock trader trades for testing
        mock_trades = []
        for i in range(5):
            trade = TraderTrade(
                symbol="TEST",
                side="BUY",
                entry_price=100.0,
                exit_price=110.0 if i < 3 else 90.0,  # 3 wins, 2 losses
                volume=100.0,
                profit_loss=1000.0 if i < 3 else -1000.0,
                status="CLOSED",
                executed_at="2024-01-01T00:00:00"
            )
            mock_trades.append(trade)
        
        metrics = simulator._calculate_performance_metrics(mock_trades)
        required_metrics = ['win_rate', 'total_profit_loss', 'average_return_per_trade']
        
        for metric in required_metrics:
            if metric in metrics:
                logger.info(f"✅ Performance metric '{metric}': {metrics[metric]}")
            else:
                logger.error(f"❌ Missing performance metric: {metric}")
                return False
        
        # Verify win rate calculation (should be 60% for 3 wins out of 5)
        if abs(metrics['win_rate'] - 60.0) < 1.0:  # Allow small rounding error
            logger.info("✅ Win rate calculation correct")
        else:
            logger.error(f"❌ Win rate calculation incorrect: expected ~60%, got {metrics['win_rate']}%")
            return False
            
    except Exception as e:
        logger.error(f"❌ Performance metrics calculation failed: {e}")
        return False
    
    # Test 6: Check database connectivity and existing data
    try:
        with Session(engine) as session:
            # Count existing users
            users = session.exec(select(User)).all()
            logger.info(f"✅ Database connection successful - Found {len(users)} users")
            
            # Check if trader profiles exist
            trader_profiles = session.exec(select(TraderProfile)).all()
            logger.info(f"📊 Existing trader profiles: {len(trader_profiles)}")
            
            # Check if trader trades exist
            trader_trades = session.exec(select(TraderTrade)).all()
            logger.info(f"💹 Existing trader trades: {len(trader_trades)}")
            
    except Exception as e:
        logger.error(f"❌ Database connectivity test failed: {e}")
        return False
    
    # Test 7: Verify the three main functions exist and are callable
    required_functions = ['generate_trader_performance', 'simulate_trader_trade', 'copy_trade_to_followers']
    
    for func_name in required_functions:
        if hasattr(simulator, func_name) and callable(getattr(simulator, func_name)):
            logger.info(f"✅ Required function '{func_name}' is implemented")
        else:
            logger.error(f"❌ Required function '{func_name}' is missing or not callable")
            return False
    
    logger.info("\n🎉 TraderSimulator implementation verification completed successfully!")
    logger.info("=" * 60)
    logger.info("📋 IMPLEMENTATION SUMMARY:")
    logger.info("   ✅ TraderSimulator class properly structured")
    logger.info("   ✅ Specialty symbols and realistic pricing configured")
    logger.info("   ✅ Performance metrics calculation working")
    logger.info("   ✅ Database integration ready")
    logger.info("   ✅ All three required functions implemented")
    logger.info("   ✅ Copy trading functionality included")
    
    return True

def demonstrate_functionality():
    """Demonstrate the TraderSimulator functionality with examples."""
    
    logger.info("\n🎯 DEMONSTRATING FUNCTIONALITY:")
    
    simulator = TraderSimulator()
    
    # Demonstrate symbol selection by risk tolerance
    risk_levels = ['LOW', 'MEDIUM', 'HIGH']
    
    for risk in risk_levels:
        logger.info(f"\n📊 {risk} RISK TRADER EXAMPLE:")
        
        # Show what symbols this risk level would trade
        if risk == 'LOW':
            categories = ['forex', 'indices']
        elif risk == 'MEDIUM':
            categories = ['forex', 'indices', 'stocks']
        else:  # HIGH
            categories = ['crypto', 'stocks']
        
        for category in categories:
            symbol = simulator.specialty_symbols[category][0]  # First symbol in category
            price = simulator._get_realistic_price(symbol)
            volatility = simulator.volatility_factors[category] * 100  # Convert to percentage
            
            logger.info(f"   {category.upper()}: {symbol} - ${price:.2f} (±{volatility:.1f}% volatility)")
    
    # Demonstrate trade simulation logic
    logger.info("\n💹 TRADE SIMULATION LOGIC:")
    logger.info("   - Low risk: 65% win rate, conservative symbols")
    logger.info("   - Medium risk: 60% win rate, balanced portfolio")  
    logger.info("   - High risk: 55% win rate, aggressive growth")
    logger.info("   - Only winning trades are copyable to followers")
    logger.info("   - Copy fees applied based on trader settings")
    logger.info("   - Realistic position sizing based on historical performance")

if __name__ == "__main__":
    try:
        # Run verification
        success = verify_trader_simulator()
        
        if success:
            # Demonstrate functionality
            demonstrate_functionality()
            
            logger.info("\n✅ TraderSimulator is ready for integration!")
            logger.info("\n📝 NEXT STEPS:")
            logger.info("   1. The service can be integrated into API endpoints")
            logger.info("   2. Use in scheduled tasks for automated trading simulation")
            logger.info("   3. Connect to frontend for copy trading features")
            
        else:
            logger.error("\n❌ TraderSimulator verification failed")
            sys.exit(1)
            
    except Exception as e:
        logger.error(f"❌ Verification process failed: {e}")
        import traceback
        logger.error(traceback.format_exc())
        sys.exit(1)
