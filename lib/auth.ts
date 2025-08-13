import { createHash } from "crypto"

export interface User {
  id: string
  username: string
  passwordHash: string
  createdAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

// Simple hash function for demo purposes (in production, use bcrypt or similar)
export function hashPassword(password: string): string {
  return createHash("sha256")
    .update(password + "salt")
    .digest("hex")
}

export function generateUserId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

export class AuthService {
  private static USERS_KEY = "encrypted_storage_users"
  private static CURRENT_USER_KEY = "encrypted_storage_current_user"

  static getUsers(): User[] {
    const users = localStorage.getItem(this.USERS_KEY)
    return users ? JSON.parse(users) : []
  }

  static saveUsers(users: User[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users))
  }

  static getCurrentUser(): User | null {
    const user = localStorage.getItem(this.CURRENT_USER_KEY)
    return user ? JSON.parse(user) : null
  }

  static setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(this.CURRENT_USER_KEY)
    }
  }

  static signup(username: string, password: string): { success: boolean; error?: string } {
    const users = this.getUsers()

    // Check if username already exists
    if (users.find((u) => u.username === username)) {
      return { success: false, error: "Username already exists" }
    }

    // Create new user
    const newUser: User = {
      id: generateUserId(),
      username,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    this.saveUsers(users)
    this.setCurrentUser(newUser)

    return { success: true }
  }

  static login(username: string, password: string): { success: boolean; error?: string } {
    const users = this.getUsers()
    const user = users.find((u) => u.username === username)

    if (!user) {
      return { success: false, error: "User not found" }
    }

    if (user.passwordHash !== hashPassword(password)) {
      return { success: false, error: "Invalid password" }
    }

    this.setCurrentUser(user)
    return { success: true }
  }

  static logout(): void {
    this.setCurrentUser(null)
  }
}
