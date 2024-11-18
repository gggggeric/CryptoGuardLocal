# pythonProject/backend/api/encryption_tool.py

import os
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
from Crypto.Random import get_random_bytes
import base64

def generate_key():
    """Generates a random 16-byte key for AES encryption."""
    return get_random_bytes(16)

def encrypt_file(file_path, key):
    """Encrypts the contents of the file with the provided AES key."""
    cipher = AES.new(key, AES.MODE_CBC)
    with open(file_path, 'rb') as f:
        plaintext = f.read()
    # Pad the plaintext to be a multiple of 16 bytes
    ciphertext = cipher.encrypt(pad(plaintext, AES.block_size))
    
    # Save the encrypted file along with the initialization vector (IV)
    encrypted_file_path = file_path + '.enc'
    with open(encrypted_file_path, 'wb') as f:
        f.write(cipher.iv)
        f.write(ciphertext)
         # Print the encryption key to the console
    print("Encryption Key (base64):", base64.b64encode(key).decode())



def decrypt_file(file_path, key):
    """Decrypts the contents of the file with the provided AES key."""
    with open(file_path, 'rb') as f:
        iv = f.read(16)  # Read the IV from the beginning of the file
        ciphertext = f.read()

    cipher = AES.new(key, AES.MODE_CBC, iv)
    plaintext = unpad(cipher.decrypt(ciphertext), AES.block_size)

    # Save the decrypted content to a new file, removing '.enc' extension
    decrypted_file_path = file_path[:-4]  # Remove the last 4 characters ('.enc')
    
    with open(decrypted_file_path, 'wb') as f:
        f.write(plaintext)

    print(f"Decrypted file saved as: {decrypted_file_path}")  # Confirm the name


