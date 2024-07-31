from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.backends import default_backend

PUBLIC_EXPONENT_RSA = 65537
KEY_SIZE = 2048

def generate_rsa_keys():
    private_key = rsa.generate_private_key(
        backend=default_backend(),
        key_size=KEY_SIZE,
        public_exponent=PUBLIC_EXPONENT_RSA,
    )

    public_key = private_key.public_key()

    pem_private_key = private_key.private_bytes(
        encryption_algorithm=serialization.NoEncryption(),
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encoding=serialization.Encoding.PEM,
    )

    pem_public_key = public_key.public_bytes(
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
        encoding=serialization.Encoding.PEM,
    )

    public_fd = open("public_key.pem", 'wb')
    private_fd = open("private_key.pem", 'wb')

    public_fd.write(pem_public_key)
    private_fd.write(pem_private_key)
