from django.db import migrations

def fix_admin_roles(apps, schema_editor):
    User = apps.get_model('api', 'User')
    # Update all superusers to have admin role
    superusers = User.objects.filter(is_superuser=True)
    for user in superusers:
        if user.role != 'admin':
            user.role = 'admin'
            user.save()

def reverse_fix_admin_roles(apps, schema_editor):
    # This is not reversible as we don't know what the original roles were
    pass

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_add_schedule_info_and_instructions'),
    ]

    operations = [
        migrations.RunPython(fix_admin_roles, reverse_fix_admin_roles),
    ] 