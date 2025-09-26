#!/usr/bin/env python3
"""
Script to create test users for admin and regular user roles.
This script creates users with proper authentication configuration.
"""

import sys
import logging
from sqlmodel import Session, select

# Add the backend directory to the path for imports
sys.path.insert(0, '.')

from app.core.db import engine
from app.core.config import settings
from app import crud
from app.models import UserCreate, UserRole, AccountTier, KycStatus

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_test_users():
    """Create test users for admin and regular user roles."""
    
    with Session(engine) as session:
        # Test users to create
        test_users = [
            {
                "email": "testadmin@apex.com",
                "password": "AdminTest123!",
                "full_name": "Test Administrator",
                "role": UserRole.ADMIN,
                "account_tier": AccountTier.PREMIUM,
                "kyc_status": KycStatus.APPROVED,
                "balance": 10000.0,
                "description": "Administrator test account"
            },
            {
                "email": "testuser@apex.com",
                "password": "UserTest123!",
                "full_name": "Test User",
                "role": UserRole.USER,
                "account_tier": AccountTier.STANDARD,
                "kyc_status": KycStatus.APPROVED,
                "balance": 5000.0,
                "description": "Regular user test account"
            },
            {
                "email": "trader@apex.com",
                "password": "TraderTest123!",
                "full_name": "Test Trader",
                "role": UserRole.USER,
                "account_tier": AccountTier.PREMIUM,
                "kyc_status": KycStatus.APPROVED,
                "balance": 25000.0,
                "description": "Active trader test account"
            }
        ]
        
        created_users = []
        
        for user_data in test_users:
            # Check if user already exists
            existing_user = crud.get_user_by_email(session=session, email=user_data["email"])
            
            if existing_user:
                logger.info(f"User {user_data['email']} already exists, skipping...")
                continue
            
            # Create user using the UserCreate model
            user_create = UserCreate(
                email=user_data["email"],
                password=user_data["password"],
                full_name=user_data["full_name"],
                role=user_data["role"],
                account_tier=user_data["account_tier"],
                kyc_status=user_data["kyc_status"]
            )
            
            # Create the user
            user = crud.create_user(session=session, user_create=user_create)
            
            # Set balance if provided
            if user_data.get("balance"):
                user.balance = user_data["balance"]
                session.add(user)
                session.commit()
                session.refresh(user)
            
            created_users.append({
                "email": user.email,
                "role": user.role.value,
                "account_tier": user.account_tier.value,
                "balance": user.balance,
                "is_active": user.is_active,
                "is_superuser": user.is_superuser
            })
            
            logger.info(f"✅ Created user: {user_data['email']} ({user_data['description']})")
        
        # Commit all changes
        session.commit()
        
        # Display created users
        if created_users:
            logger.info("\n📋 Created Test Users:")
            logger.info("=" * 60)
            for user in created_users:
                logger.info(f"Email: {user['email']}")
                logger.info(f"Role: {user['role']}")
                logger.info(f"Account Tier: {user['account_tier']}")
                logger.info(f"Balance: ${user['balance']:,.2f}")
                logger.info(f"Active: {user['is_active']}")
                logger.info(f"Superuser: {user['is_superuser']}")
                logger.info("-" * 40)
        else:
            logger.info("No new users created - all test users already exist.")
        
        return created_users

def test_authentication():
    """Test authentication for created users."""
    
    with Session(engine) as session:
        test_credentials = [
            {"email": "testadmin@apex.com", "password": "AdminTest123!"},
            {"email": "testuser@apex.com", "password": "UserTest123!"},
            {"email": "trader@apex.com", "password": "TraderTest123!"}
        ]
        
        logger.info("\n🔐 Testing Authentication:")
        logger.info("=" * 40)
        
        for creds in test_credentials:
            user = crud.authenticate(
                session=session, 
                email=creds["email"], 
                password=creds["password"]
            )
            
            if user:
                logger.info(f"✅ Authentication successful for: {creds['email']}")
                logger.info(f"   - User ID: {user.id}")
                logger.info(f"   - Role: {user.role.value}")
                logger.info(f"   - Active: {user.is_active}")
            else:
                logger.error(f"❌ Authentication failed for: {creds['email']}")

if __name__ == "__main__":
    logger.info("🚀 Starting test user creation...")
    logger.info(f"Database: {settings.POSTGRES_DB}@{settings.POSTGRES_SERVER}:{settings.POSTGRES_PORT}")
    
    try:
        # Create test users
        created_users = create_test_users()
        
        # Test authentication
        test_authentication()
        
        logger.info("\n🎉 Test user creation completed successfully!")
        logger.info("\n📝 Test Credentials:")
        logger.info("=" * 40)
        logger.info("Admin User:")
        logger.info("  Email: testadmin@apex.com")
        logger.info("  Password: AdminTest123!")
        logger.info("  Role: ADMIN")
        
        logger.info("\nRegular User:")
        logger.info("  Email: testuser@apex.com")
        logger.info("  Password: UserTest123!")
        logger.info("  Role: USER")
        
        logger.info("\nTrader User:")
        logger.info("  Email: trader@apex.com")
        logger.info("  Password: TraderTest123!")
        logger.info("  Role: USER (Premium)")
        
    except Exception as e:
        logger.error(f"❌ Error creating test users: {e}")
        sys.exit(1)
