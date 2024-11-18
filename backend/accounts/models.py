from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin, Group, Permission
from django.db import models
from django.db.models.signals import post_migrate
from django.dispatch import receiver

class MyUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class MyUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = MyUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    groups = models.ManyToManyField(
        Group,
        related_name='myuser_set',  # Set a unique related_name for this model
        blank=True
    )
    
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='myuser_set',  # Set a unique related_name for this model
        blank=True
    )

@receiver(post_migrate)
def create_predefined_users(sender, **kwargs):
    if sender.name == 'accounts':  # Ensures the signal only runs for this app's migrations
        MyUser = sender.get_model('MyUser')  # Get the custom user model
        try:
            MyUser.objects.get(email='admin@gmail.com')  # Ensure this matches the email you want
        except MyUser.DoesNotExist:
            MyUser.objects.create_superuser('admin@gmail.com', 'adminpassword1230')  # Correct email
            print("Predefined superuser created.")
