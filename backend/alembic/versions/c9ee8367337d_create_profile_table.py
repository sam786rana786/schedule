"""create_profile_table

Revision ID: c9ee8367337d
Revises: 
Create Date: 2024-11-24 17:46:34.912797

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c9ee8367337d'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if 'profiles' not in inspector.get_table_names():
        op.create_table(
            'profiles',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('full_name', sa.String(), nullable=True),
            sa.Column('company', sa.String(), nullable=True),
            sa.Column('company_logo', sa.String(), nullable=True),
            sa.Column('job_title', sa.String(), nullable=True),
            sa.Column('time_zone', sa.String(), nullable=True),
            sa.Column('bio', sa.String(), nullable=True),
            sa.Column('avatar_url', sa.String(), nullable=True),
            sa.Column('phone', sa.String(), nullable=True),
            sa.Column('welcome_message', sa.String(), nullable=True),
            sa.Column('scheduling_url', sa.String(), nullable=True),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_profiles_user_id'), 'profiles', ['user_id'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_profiles_user_id'), table_name='profiles')
    op.drop_table('profiles')
