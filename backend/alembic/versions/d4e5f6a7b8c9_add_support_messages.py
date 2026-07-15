"""add support_messages table

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-07-15 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'd4e5f6a7b8c9'
down_revision: Union[str, None] = 'c3d4e5f6a7b8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'support_messages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('staff_id', sa.String(length=20), nullable=False),
        sa.Column('subject', sa.String(length=150), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='open'),
        sa.Column('admin_reply', sa.Text(), nullable=True),
        sa.Column('replied_by', sa.String(length=20), nullable=True),
        sa.Column('replied_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['staff_id'], ['users.staff_id'], ondelete='CASCADE', onupdate='CASCADE'),
        sa.ForeignKeyConstraint(['replied_by'], ['users.staff_id'], ondelete='SET NULL', onupdate='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_support_messages_staff_id'), 'support_messages', ['staff_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_support_messages_staff_id'), table_name='support_messages')
    op.drop_table('support_messages')
