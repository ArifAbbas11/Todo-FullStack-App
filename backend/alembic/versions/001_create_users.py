"""create users table

Revision ID: 001_create_users
Revises:
Create Date: 2026-01-15 15:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001_create_users'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Create users table with proper security constraints.

    Security Considerations:
    - UUID primary key prevents enumeration attacks
    - Email is unique and indexed for fast lookup
    - Password is stored as bcrypt hash (never plaintext)
    - Timestamps track account creation and updates
    """
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email', name='uq_users_email')
    )

    # Create index on email for fast lookup during authentication
    op.create_index('ix_users_email', 'users', ['email'], unique=True)

    # Create trigger function to automatically update updated_at timestamp
    op.execute("""
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ language 'plpgsql';
    """)

    # Apply trigger to users table
    op.execute("""
        CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    """)


def downgrade() -> None:
    """
    Drop users table and related triggers.

    Security Note: This will permanently delete all user accounts.
    Use with extreme caution in production.
    """
    # Drop trigger first
    op.execute('DROP TRIGGER IF EXISTS update_users_updated_at ON users;')

    # Drop trigger function
    op.execute('DROP FUNCTION IF EXISTS update_updated_at_column();')

    # Drop index
    op.drop_index('ix_users_email', table_name='users')

    # Drop table
    op.drop_table('users')
