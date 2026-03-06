from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='activity_level',
            field=models.CharField(
                choices=[
                    ('sedentary', 'Sedentary'),
                    ('lightly_active', 'Lightly Active'),
                    ('moderately_active', 'Moderately Active'),
                    ('very_active', 'Very Active'),
                    ('extra_active', 'Extra Active'),
                ],
                default='moderately_active',
                max_length=20,
            ),
        ),
    ]
