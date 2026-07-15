"""add app_settings table

Revision ID: a1b2c3d4e5f6
Revises: f1a2b3c4d5e6
Create Date: 2026-07-14 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = 'f1a2b3c4d5e6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'app_settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('booking_start_time', sa.Time(), nullable=False, server_default='06:00:00'),
        sa.Column('booking_end_time', sa.Time(), nullable=False, server_default='18:00:00'),
        sa.Column('max_booking_duration_minutes', sa.Integer(), nullable=True),
        sa.Column('min_lead_time_minutes', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('max_advance_days', sa.Integer(), nullable=True),
        sa.Column('allow_weekend_bookings', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('default_schedule_view', sa.String(length=10), nullable=False, server_default='week'),
        sa.Column('week_start_day', sa.String(length=10), nullable=False, server_default='monday'),
        sa.Column('show_current_time_indicator', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('email_notifications_enabled', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('daily_summary_enabled', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('daily_summary_hour', sa.Integer(), nullable=False, server_default='17'),
        sa.Column('audit_log_retention_days', sa.Integer(), nullable=True),
        sa.Column('require_decline_reason', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('org_name', sa.String(length=150), nullable=False, server_default='Vaarde Consult Ltd.'),
        sa.Column('support_email', sa.String(length=150), nullable=False, server_default='admin@visalbrokers.com'),
        sa.Column('footer_text', sa.String(length=255), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('updated_by', sa.String(length=20), nullable=True),
        sa.ForeignKeyConstraint(['updated_by'], ['users.staff_id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.execute(
        "INSERT INTO app_settings (id, updated_at) VALUES (1, CURRENT_TIMESTAMP)"
    )


def downgrade() -> None:
    op.drop_table('app_settings')
