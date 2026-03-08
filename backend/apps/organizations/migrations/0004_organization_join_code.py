import secrets
import string

from django.db import migrations, models


def generate_unique_codes(apps, schema_editor):
    Organization = apps.get_model('organizations', 'Organization')
    chars = string.ascii_uppercase + string.digits
    for org in Organization.objects.filter(join_code=''):
        while True:
            code = ''.join(secrets.choice(chars) for _ in range(8))
            if not Organization.objects.filter(join_code=code).exists():
                org.join_code = code
                org.save(update_fields=['join_code'])
                break


class Migration(migrations.Migration):

    dependencies = [
        ('organizations', '0003_membership_trainer'),
    ]

    operations = [
        # Step 1: add field without unique (blank allowed temporarily)
        migrations.AddField(
            model_name='organization',
            name='join_code',
            field=models.CharField(max_length=8, default='', blank=True),
            preserve_default=False,
        ),
        # Step 2: populate unique codes for existing rows
        migrations.RunPython(generate_unique_codes, migrations.RunPython.noop),
        # Step 3: add unique constraint
        migrations.AlterField(
            model_name='organization',
            name='join_code',
            field=models.CharField(max_length=8, unique=True),
        ),
    ]
