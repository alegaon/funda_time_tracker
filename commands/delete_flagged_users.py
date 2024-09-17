from flask.cli import with_appcontext
import click
from factory import db
from models import User

@click.command(name='delete_flagged_users')
@with_appcontext
def delete_flagged_users():
    users_to_delete = User.query.filter_by(flagged_for_deletion=True).all()

    if not users_to_delete:
        click.echo("No users flagged for deletion.")
        return

    click.echo(f"{len(users_to_delete)} users flagged for deletion:")
    for user in users_to_delete:
        click.echo(f" - {user.username} (email: {user.email})")
    
    confirm = input("Are you sure you want to delete all flagged users? (yes/no): ").strip().lower()
    if confirm == 'yes':
        for user in users_to_delete:
            db.session.delete(user)
        db.session.commit()
        click.echo("Flagged users deleted successfully.")
    else:
        click.echo("Deletion cancelled.")
