"""add user status

Revision ID: f1a2b3c4d5e6
Revises: ccb33219fc4d
Create Date: 2026-07-14 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'f1a2b3c4d5e6'
down_revision: Union[str, None] = 'ccb33219fc4d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('status', sa.String(length=20), nullable=False, server_default='active'))
    op.alter_column('users', 'status', server_default=None)


def downgrade() -> None:
    op.drop_column('users', 'status')
