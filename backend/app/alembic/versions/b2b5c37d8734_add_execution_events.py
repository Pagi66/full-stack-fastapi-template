"""Add execution events table for simulation auditing.

Revision ID: b2b5c37d8734
Revises: ab41ef5a2689
Create Date: 2025-09-27 23:45:00.000000

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = "b2b5c37d8734"
down_revision = "ab41ef5a2689"
branch_labels = None
depends_on = None


def upgrade() -> None:
    event_type_enum = sa.Enum(
        "TRADER_SIMULATION",
        "FOLLOWER_PROFIT",
        "MANUAL_ADJUSTMENT",
        name="executioneventtype",
    )
    event_type_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "executionevent",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column(
            "event_type",
            sa.Enum(
                "TRADER_SIMULATION",
                "FOLLOWER_PROFIT",
                "MANUAL_ADJUSTMENT",
                name="executioneventtype",
                create_type=False,
            ),
            nullable=False,
        ),
        sa.Column("description", sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
        sa.Column("amount", sa.Float(), nullable=True),
        sa.Column("payload", sa.JSON(), nullable=True),
        sa.Column("user_id", sa.Uuid(), nullable=True),
        sa.Column("trader_profile_id", sa.Uuid(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["trader_profile_id"], ["traderprofile.id"], ondelete="SET NULL"),
    )
    op.create_index(
        "ix_executionevent_user_created_at",
        "executionevent",
        ["user_id", "created_at"],
    )
    op.create_index(
        "ix_executionevent_trader_created_at",
        "executionevent",
        ["trader_profile_id", "created_at"],
    )


def downgrade() -> None:
    op.drop_index("ix_executionevent_trader_created_at", table_name="executionevent")
    op.drop_index("ix_executionevent_user_created_at", table_name="executionevent")
    op.drop_table("executionevent")
    event_type_enum = sa.Enum(name="executioneventtype")
    event_type_enum.drop(op.get_bind(), checkfirst=True)
