export interface User {
  id: string;
  username: string;
  email: string | null;
  password_hash: string;
  credits: number;
  role: 'user' | 'admin';
  last_login_date: Date | null;
  created_at: Date;
}

export interface UserDTO {
  id: string;
  username: string;
  email: string | null;
  credits: number;
  role: 'user' | 'admin';
}
