import bcrypt from 'bcrypt';

export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function validatePassword(password: string): string {
    if (password.length < 6) {
        return "Password should have at least 6 digits";
    }
    if (!/[A-Z]/.test(password)) {
        return "Password should have at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
        return "Password should have at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
        return "Password should have at least one number";
    }
    return "";
}

export function validateFieldsUser(user: { email?: string; firstName?: string; lastName?: string; password?: string }): boolean {
    const { email, firstName, lastName, password } = user;

    if (!email || !firstName || !lastName || !password) {
        return false;
    }
    return true;
}


export function hashPassword(password: string): Promise<string> {
    return bcrypt.genSalt(10)
        .then((salt) => bcrypt.hash(password, salt))
        .then((hashedPassword) => hashedPassword);
}

