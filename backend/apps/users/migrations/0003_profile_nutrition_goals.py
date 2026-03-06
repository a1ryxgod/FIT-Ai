from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_alter_profile_activity_level'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='calorie_goal',
            field=models.IntegerField(default=2000),
        ),
        migrations.AddField(
            model_name='profile',
            name='protein_goal',
            field=models.IntegerField(default=150),
        ),
        migrations.AddField(
            model_name='profile',
            name='carbs_goal',
            field=models.IntegerField(default=250),
        ),
        migrations.AddField(
            model_name='profile',
            name='fat_goal',
            field=models.IntegerField(default=70),
        ),
    ]
