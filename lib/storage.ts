import { EncryptionService, type EncryptedData } from "./encryption"

export interface StoredItem {
  id: string
  name: string
  type: "text" | "file"
  encryptedData: EncryptedData
  createdAt: string
  updatedAt: string
  size: number // Original size in bytes
}

export class SecureStorageService {
  private static getStorageKey(userId: string): string {
    return `secure_storage_${userId}`
  }

  // Get all stored items for a user
  static getItems(userId: string): StoredItem[] {
    const key = this.getStorageKey(userId)
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  }

  // Save items for a user
  private static saveItems(userId: string, items: StoredItem[]): void {
    const key = this.getStorageKey(userId)
    localStorage.setItem(key, JSON.stringify(items))
  }

  // Generate unique ID for items
  private static generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }

  // Store encrypted text
  static async storeText(
    userId: string,
    name: string,
    content: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const encryptedData = await EncryptionService.encrypt(content, password)

      const item: StoredItem = {
        id: this.generateId(),
        name,
        type: "text",
        encryptedData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        size: new Blob([content]).size,
      }

      const items = this.getItems(userId)
      items.push(item)
      this.saveItems(userId, items)

      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to encrypt and store text" }
    }
  }

  // Store encrypted file
  static async storeFile(userId: string, file: File, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const encryptedData = await EncryptionService.encryptFile(file, password)

      const item: StoredItem = {
        id: this.generateId(),
        name: file.name,
        type: "file",
        encryptedData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        size: file.size,
      }

      const items = this.getItems(userId)
      items.push(item)
      this.saveItems(userId, items)

      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to encrypt and store file" }
    }
  }

  // Retrieve and decrypt text
  static async retrieveText(
    userId: string,
    itemId: string,
    password: string,
  ): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
      const items = this.getItems(userId)
      const item = items.find((i) => i.id === itemId && i.type === "text")

      if (!item) {
        return { success: false, error: "Item not found" }
      }

      const decryptedData = await EncryptionService.decrypt(item.encryptedData, password)
      return { success: true, data: decryptedData }
    } catch (error) {
      return { success: false, error: "Failed to decrypt text. Check your password." }
    }
  }

  // Retrieve and decrypt file
  static async retrieveFile(
    userId: string,
    itemId: string,
    password: string,
  ): Promise<{ success: boolean; blob?: Blob; filename?: string; error?: string }> {
    try {
      const items = this.getItems(userId)
      const item = items.find((i) => i.id === itemId && i.type === "file")

      if (!item) {
        return { success: false, error: "File not found" }
      }

      // Try to determine MIME type from filename
      const mimeType = this.getMimeType(item.name)
      const blob = await EncryptionService.decryptFile(item.encryptedData, password, mimeType)

      return { success: true, blob, filename: item.name }
    } catch (error) {
      return { success: false, error: "Failed to decrypt file. Check your password." }
    }
  }

  // Delete item
  static deleteItem(userId: string, itemId: string): boolean {
    const items = this.getItems(userId)
    const filteredItems = items.filter((item) => item.id !== itemId)

    if (filteredItems.length === items.length) {
      return false // Item not found
    }

    this.saveItems(userId, filteredItems)
    return true
  }

  // Update item name
  static updateItemName(userId: string, itemId: string, newName: string): boolean {
    const items = this.getItems(userId)
    const item = items.find((i) => i.id === itemId)

    if (!item) {
      return false
    }

    item.name = newName
    item.updatedAt = new Date().toISOString()
    this.saveItems(userId, items)
    return true
  }

  // Get storage statistics
  static getStorageStats(userId: string): {
    totalItems: number
    totalSize: number
    textItems: number
    fileItems: number
  } {
    const items = this.getItems(userId)

    return {
      totalItems: items.length,
      totalSize: items.reduce((sum, item) => sum + item.size, 0),
      textItems: items.filter((item) => item.type === "text").length,
      fileItems: items.filter((item) => item.type === "file").length,
    }
  }

  // Simple MIME type detection
  private static getMimeType(filename: string): string {
    const ext = filename.split(".").pop()?.toLowerCase()
    const mimeTypes: Record<string, string> = {
      txt: "text/plain",
      pdf: "application/pdf",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      mp4: "video/mp4",
      mp3: "audio/mpeg",
      zip: "application/zip",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }
    return mimeTypes[ext || ""] || "application/octet-stream"
  }
}
