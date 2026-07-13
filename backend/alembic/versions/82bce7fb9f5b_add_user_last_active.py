"""add user last_active

Revision ID: 82bce7fb9f5b
Revises: e53bc1d89dd8
Create Date: 2026-07-13 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '82bce7fb9f5b'
down_revision: Union[str, None] = 'e53bc1d89dd8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('last_active', sa.DateTime(), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'last_active')
