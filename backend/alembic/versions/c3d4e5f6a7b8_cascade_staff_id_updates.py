"""add ON UPDATE CASCADE to FKs referencing users.staff_id

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-07-14 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'c3d4e5f6a7b8'
down_revision: Union[str, None] = 'b2c3d4e5f6a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# (table, constraint_name, column, ondelete)
FK_SPECS = [
    ('bookings', 'bookings_user_id_fkey', 'user_id', 'CASCADE'),
    ('notifications', 'notifications_user_id_fkey', 'user_id', 'CASCADE'),
    ('audit_logs', 'audit_logs_actor_id_fkey', 'actor_id', 'SET NULL'),
    ('changelogs', 'changelogs_author_id_fkey', 'author_id', 'SET NULL'),
    ('app_settings', 'app_settings_updated_by_fkey', 'updated_by', 'SET NULL'),
]


def upgrade() -> None:
    for table, constraint_name, column, ondelete in FK_SPECS:
        op.drop_constraint(constraint_name, table, type_='foreignkey')
        op.create_foreign_key(
            constraint_name, table, 'users', [column], ['staff_id'],
            ondelete=ondelete, onupdate='CASCADE',
        )


def downgrade() -> None:
    for table, constraint_name, column, ondelete in FK_SPECS:
        op.drop_constraint(constraint_name, table, type_='foreignkey')
        op.create_foreign_key(
            constraint_name, table, 'users', [column], ['staff_id'],
            ondelete=ondelete,
        )
