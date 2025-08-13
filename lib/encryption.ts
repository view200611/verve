// Encryption service using Web Crypto API for secure client-side encryption
export interface EncryptedData {
  data: string // Base64 encoded encrypted data
  iv: string // Base64 encoded initialization vector
  salt: string // Base64 encoded salt for key derivation
}

export interface StoredItem {
  id: string
  name: string
  type: "text" | "file"
  encryptedData: EncryptedData
  createdAt: string
  updatedAt: string
  size: number // Original size in bytes
}

export class EncryptionService {
  private static readonly ALGORITHM = "AES-GCM"
  private static readonly KEY_LENGTH = 256
  private static readonly IV_LENGTH = 12
  private static readonly SALT_LENGTH = 16

  // Generate a random salt
  private static generateSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH))
  }

  // Generate a random IV
  private static generateIV(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(this.IV_LENGTH))
  }

  // Derive encryption key from password and salt
  private static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"])

    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH,
      },
      false,
      ["encrypt", "decrypt"],
    )
  }

  // Encrypt data with password
  static async encrypt(data: string, password: string): Promise<EncryptedData> {
    const encoder = new TextEncoder()
    const salt = this.generateSalt()
    const iv = this.generateIV()

    const key = await this.deriveKey(password, salt)
    const encodedData = encoder.encode(data)

    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: this.ALGORITHM,
        iv: iv,
      },
      key,
      encodedData,
    )

    return {
      data: this.arrayBufferToBase64(encryptedBuffer),
      iv: this.arrayBufferToBase64(iv),
      salt: this.arrayBufferToBase64(salt),
    }
  }

  // Decrypt data with password
  static async decrypt(encryptedData: EncryptedData, password: string): Promise<string> {
    const salt = this.base64ToArrayBuffer(encryptedData.salt)
    const iv = this.base64ToArrayBuffer(encryptedData.iv)
    const data = this.base64ToArrayBuffer(encryptedData.data)

    const key = await this.deriveKey(password, new Uint8Array(salt))

    try {
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: this.ALGORITHM,
          iv: new Uint8Array(iv),
        },
        key,
        data,
      )

      const decoder = new TextDecoder()
      return decoder.decode(decryptedBuffer)
    } catch (error) {
      throw new Error("Failed to decrypt data. Invalid password or corrupted data.")
    }
  }

  // Encrypt file data
  static async encryptFile(file: File, password: string): Promise<EncryptedData> {
    const arrayBuffer = await file.arrayBuffer()
    const base64Data = this.arrayBufferToBase64(arrayBuffer)
    return this.encrypt(base64Data, password)
  }

  // Decrypt file data and return as Blob
  static async decryptFile(encryptedData: EncryptedData, password: string, mimeType: string): Promise<Blob> {
    const decryptedBase64 = await this.decrypt(encryptedData, password)
    const arrayBuffer = this.base64ToArrayBuffer(decryptedBase64)
    return new Blob([arrayBuffer], { type: mimeType })
  }

  // Utility functions
  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ""
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }
}
