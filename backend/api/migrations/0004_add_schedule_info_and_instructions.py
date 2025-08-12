# Generated manually to add missing fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_add_missing_fields'),
    ]

    operations = [
        # Add schedule_info field to Course model
        migrations.AddField(
            model_name='course',
            name='schedule_info',
            field=models.TextField(blank=True, null=True),
        ),
        
        # Add instructions field to Exam model
        migrations.AddField(
            model_name='exam',
            name='instructions',
            field=models.TextField(blank=True, null=True),
        ),
    ] 