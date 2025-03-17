# auth_debug.py
import os
import bcrypt
from backend.auth.auth_utils import verify_password, ADMIN_USERNAME, ADMIN_PASSWORD_HASH


def debug_auth():
    print("\n=== Authentication Debug Tool ===\n")

    # Check environment variables
    print(f"ADMIN_USERNAME: {ADMIN_USERNAME}")
    print(f"ADMIN_PASSWORD_HASH exists: {ADMIN_PASSWORD_HASH is not None}")
    if ADMIN_PASSWORD_HASH:
        print(f"Hash length: {len(ADMIN_PASSWORD_HASH)}")
        print(f"First 20 chars of hash: {ADMIN_PASSWORD_HASH[:20]}...")

    # Test with known credentials
    test_password = input("\nEnter the admin password to test: ")

    # Test our verification function
    is_valid = verify_password(test_password, ADMIN_PASSWORD_HASH)
    print(f"\nverify_password result: {is_valid}")

    # Direct bcrypt test as a backup
    direct_result = bcrypt.checkpw(test_password.encode('utf-8'),
                                   ADMIN_PASSWORD_HASH.encode('utf-8'))
    print(f"Direct bcrypt.checkpw result: {direct_result}")

    # Hash the provided password to compare
    new_hash = bcrypt.hashpw(test_password.encode('utf-8'), bcrypt.gensalt())
    print(f"\nNew hash for '{test_password}': {new_hash.decode('utf-8')}")

    print("\n=== Debug Complete ===")


if __name__ == "__main__":
    debug_auth()
