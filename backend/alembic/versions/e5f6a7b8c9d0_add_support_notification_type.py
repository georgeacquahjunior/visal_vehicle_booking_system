"""allow support_update in notifications_type_check

Revision ID: e5f6a7b8c9d0
Revises: d4e5f6a7b8c9
Create Date: 2026-07-15 00:00:00.000001

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'e5f6a7b8c9d0'
down_revision: Union[str, None] = 'd4e5f6a7b8c9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

OLD_TYPES = ("submitted", "approved", "declined", "cancelled")
NEW_TYPES = OLD_TYPES + ("support_update",)


def upgrade() -> None:
    op.drop_constraint('notifications_type_check', 'notifications', type_='check')
    op.create_check_constraint('notifications_type_check', 'notifications', "type IN ({})".format(
        ", ".join(f"'{t}'" for t in NEW_TYPES)
    ))


def downgrade() -> None:
    op.drop_constraint('notifications_type_check', 'notifications', type_='check')
    op.create_check_constraint('notifications_type_check', 'notifications', "type IN ({})".format(
        ", ".join(f"'{t}'" for t in OLD_TYPES)
    ))
