# pythonProject/backend/api/views.py

from django.http import HttpResponse, JsonResponse
from rest_framework.decorators import api_view
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from .encryption_tool import encrypt_file, decrypt_file, generate_key
from django.http import HttpResponse
import base64
import os



@api_view(['POST'])
def encrypt_view(request):
    parser_classes = (MultiPartParser, FormParser)
    if 'file' not in request.FILES:
        return Response({"error": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)

    file = request.FILES['file']
    file_name = file.name
    key = generate_key()

    # Ensure 'uploads' directory exists
    upload_dir = os.path.join(os.getcwd(), 'backend', 'api', 'uploads')
    os.makedirs(upload_dir, exist_ok=True)
    temp_file_path = os.path.join(upload_dir, file_name)

    # Save the uploaded file
    with open(temp_file_path, 'wb') as f:
        for chunk in file.chunks():
            f.write(chunk)

    # Encrypt the file
    encrypt_file(temp_file_path, key)
    encrypted_file_path = temp_file_path + '.enc'

    # Prepare the response
    with open(encrypted_file_path, 'rb') as f:
        response_data = {
            "file": base64.b64encode(f.read()).decode(),
            "encryption_key": base64.b64encode(key).decode(),
            "file_name": f"{file_name}.enc"
        }

    # Cleanup: Optionally delete the temporary files
    os.remove(temp_file_path)
    os.remove(encrypted_file_path)

    return Response(response_data, status=status.HTTP_200_OK)

@api_view(['POST'])
def decrypt_view(request):
    parser_classes = (MultiPartParser, FormParser)
    if 'file' not in request.FILES or 'key' not in request.data:
        return Response({"error": "File and key are required."}, status=status.HTTP_400_BAD_REQUEST)

    file = request.FILES['file']
    key_input = request.data.get('key')

    # Decode the key from base64
    try:
        key = base64.b64decode(key_input)
        if len(key) != 16:
            raise ValueError("Invalid key length.")
    except Exception as e:
        return Response({"error": f"Invalid key: {e}"}, status=status.HTTP_400_BAD_REQUEST)

    # Ensure 'uploads' directory exists
    upload_dir = os.path.join(os.getcwd(), 'backend', 'api', 'uploads')
    os.makedirs(upload_dir, exist_ok=True)

    # Save the uploaded encrypted file
    encrypted_file_path = os.path.join(upload_dir, file.name)
    with open(encrypted_file_path, 'wb') as f:
        for chunk in file.chunks():
            f.write(chunk)

    # Decrypt the file
    decrypt_file(encrypted_file_path, key)

    # Construct the decrypted file path
    decrypted_file_path = encrypted_file_path[:-4]  # Remove the '.enc' extension
    print(f"Decrypted file path: {decrypted_file_path}")  # Debugging statement

    # Prepare response with the decrypted file
    with open(decrypted_file_path, 'rb') as f:
        response = HttpResponse(f.read(), content_type='application/octet-stream')
        # Set the original filename for the response
        original_filename = os.path.basename(decrypted_file_path)  # Get the name without path
        response['Content-Disposition'] = f'attachment; filename="{original_filename}"'
        print(f"Response filename: {original_filename}")  # Debugging statement

    # Cleanup: Optionally delete the temporary files
    os.remove(encrypted_file_path)
    os.remove(decrypted_file_path)

    return response

# Add a new ping endpoint for keep-alive purposes
@api_view(['GET'])
def ping(request):
    return JsonResponse({'status': 'ok'}, status=status.HTTP_200_OK)
