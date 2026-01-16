"""create tasks table

Revision ID: 002_create_tasks
Revises: 001_create_users
Create Date: 2026-01-15 16:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '002_create_tasks'
down_revision: Union[str, None] = '001_create_users'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Create tasks table with proper security constraints and user isolation.

    Security Considerations:
    - UUID primary key prevents enumeration attacks
    - user_id foreign key ensures referential integrity
    - CASCADE delete ensures orphaned tasks are removed when user is deleted
    - Index on user_id for fast query performance (filtering by user)
    - Timestamps track task creation and updates
    """
    # Create tasks table
    op.create_table(
        'tasks',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_completed', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(
            ['user_id'],
            ['users.id'],
            name='fk_tasks_user_id',
            ondelete='CASCADE'  # Delete tasks when user is deleted
        )
    )

    # Create index on user_id for fast filtering by user
    # This is critical for performance when querying tasks for a specific user
    op.create_index('ix_tasks_user_id', 'tasks', ['user_id'], unique=False)

    # Apply updated_at trigger to tasks table
    # Reuses the trigger function created in 001_create_users migration
    op.execute("""
        CREATE TRIGGER update_tasks_updated_at
        BEFORE UPDATE ON tasks
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    """)


def downgrade() -> None:
    """
    Drop tasks table and related triggers.

    Security Note: This will permanently delete all tasks.
    Use with extreme caution in production.
    """
    # Drop trigger first
    op.execute('DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;')

    # Drop index
    op.drop_index('ix_tasks_user_id', table_name='tasks')

    # Drop table (foreign key constraint is dropped automatically)
    op.drop_table('tasks')
