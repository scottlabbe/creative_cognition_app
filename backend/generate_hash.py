from auth.auth_utils import hash_password


def main():
    password = input("Enter your admin password: ")
    hashed = hash_password(password)
    print(f"Your password hash is: {hashed}")


if __name__ == "__main__":
    main()
