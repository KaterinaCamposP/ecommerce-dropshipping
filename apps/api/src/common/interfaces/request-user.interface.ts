export interface RequestUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthUser extends RequestUser {
  passwordHash: string | null;
}
