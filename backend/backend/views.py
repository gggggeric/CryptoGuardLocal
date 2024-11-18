# pythonProject/backend\backend\backend\views.py
from django.http import HttpResponse, JsonResponse
from .encryption_tool import encrypt_file, decrypt_file, generate_key
import base64
import os

def encrypt_view(request):
    if request.method == 'POST' and 'file' in request.FILES:
        file = request.FILES['file']
        file_name = file.name
        key = generate_key()

        # Save the uploaded file temporarily
        temp_file_path = os.path.join('temp', file_name)
        with open(temp_file_path, 'wb') as f:
            f.write(file.read())

        # Encrypt the file
        encrypt_file(temp_file_path, key)
        encrypted_file_path = temp_file_path + '.enc'

        # Respond with the encrypted file and key
        response = HttpResponse(open(encrypted_file_path, 'rb'), content_type='application/octet-stream')
        response['Content-Disposition'] = f'attachment; filename="{file_name}.enc"'
        response['Encryption-Key'] = base64.b64encode(key).decode()
        
        return response

    return JsonResponse({"error": "File not provided"}, status=400)

def decrypt_view(request):
    if request.method == 'POST' and 'file' in request.FILES:
        file = request.FILES['file']
        key_input = request.POST.get('key')

        # Decode the key
        try:
            key = base64.b64decode(key_input)
            if len(key) != 16:
                return JsonResponse({"error": "Invalid key length"}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"Invalid key: {e}"}, status=400)

        # Save the uploaded encrypted file temporarily
        temp_file_path = os.path.join('temp', file.name)
        with open(temp_file_path, 'wb') as f:
            f.write(file.read())

        # Decrypt the file
        decrypt_file(temp_file_path, key)
        decrypted_file_path = temp_file_path[:-4]  # Removing '.enc'

        # Respond with the decrypted file
        response = HttpResponse(open(decrypted_file_path, 'rb'), content_type='application/octet-stream')
        response['Content-Disposition'] = f'attachment; filename="{decrypted_file_path}"'
        
        return response

    return JsonResponse({"error": "File and key required"}, status=400)
