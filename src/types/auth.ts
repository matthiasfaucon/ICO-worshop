export interface LoginCredentials {
  email: string;
  password: string;
}

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
} 