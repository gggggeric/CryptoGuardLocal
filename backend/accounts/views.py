from rest_framework import generics
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model  # Import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer

class RegisterView(generics.CreateAPIView):
    serializer_class = UserSerializer

class LoginView(generics.GenericAPIView):
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')  # Make sure to use 'email'
        password = request.data.get('password')
        
        # Get the user model
        User = get_user_model()
        
        # Find the user by email
        user = User.objects.filter(email=email).first()

        if user is not None and user.check_password(password):  # Check if user exists and password matches
            refresh = RefreshToken.for_user(user)
            return Response({'refresh': str(refresh), 'access': str(refresh.access_token)})
        return Response({'error': 'Invalid credentials'}, status=400)
