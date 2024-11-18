import os
from django.core.management.base import BaseCommand
from accounts.models import MyUser  # Replace with the correct import path for your custom user model

class Command(BaseCommand):
    help = 'Create superuser if not exists'

    def handle(self, *args, **kwargs):
        # Get superuser details from environment variables or set defaults
        email = os.getenv('SUPERUSER_EMAIL', 'admin@gmail.com')
        password = os.getenv('SUPERUSER_PASSWORD', 'adminpassword1230')
        
        try:
            # Check if the superuser already exists
            if not MyUser.objects.filter(email=email).exists():
                # Create the superuser if not exists
                MyUser.objects.create_superuser(email, password)
                self.stdout.write(self.style.SUCCESS(f"Superuser {email} created successfully"))
            else:
                self.stdout.write(self.style.SUCCESS(f"Superuser {email} already exists"))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error creating superuser: {e}"))
