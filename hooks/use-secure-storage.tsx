"use client"

import { useState, useCallback } from "react"
import { SecureStorageService, type StoredItem } from "@/lib/storage"
import { useAuth } from "./use-auth"

export function useSecureStorage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const storeText = useCallback(
    async (name: string, content: string, password: string) => {
      if (!user) throw new Error("User not authenticated")

      setIsLoading(true)
      setError(null)

      try {
        const result = await SecureStorageService.storeText(user.id, name, content, password)
        if (!result.success) {
          setError(result.error || "Failed to store text")
          return false
        }
        return true
      } catch (err) {
        setError("An unexpected error occurred")
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [user],
  )

  const storeFile = useCallback(
    async (file: File, password: string) => {
      if (!user) throw new Error("User not authenticated")

      setIsLoading(true)
      setError(null)

      try {
        const result = await SecureStorageService.storeFile(user.id, file, password)
        if (!result.success) {
          setError(result.error || "Failed to store file")
          return false
        }
        return true
      } catch (err) {
        setError("An unexpected error occurred")
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [user],
  )

  const retrieveText = useCallback(
    async (itemId: string, password: string) => {
      if (!user) throw new Error("User not authenticated")

      setIsLoading(true)
      setError(null)

      try {
        const result = await SecureStorageService.retrieveText(user.id, itemId, password)
        if (!result.success) {
          setError(result.error || "Failed to retrieve text")
          return null
        }
        return result.data || null
      } catch (err) {
        setError("An unexpected error occurred")
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [user],
  )

  const retrieveFile = useCallback(
    async (itemId: string, password: string) => {
      if (!user) throw new Error("User not authenticated")

      setIsLoading(true)
      setError(null)

      try {
        const result = await SecureStorageService.retrieveFile(user.id, itemId, password)
        if (!result.success) {
          setError(result.error || "Failed to retrieve file")
          return null
        }
        return { blob: result.blob!, filename: result.filename! }
      } catch (err) {
        setError("An unexpected error occurred")
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [user],
  )

  const deleteItem = useCallback(
    (itemId: string) => {
      if (!user) throw new Error("User not authenticated")
      return SecureStorageService.deleteItem(user.id, itemId)
    },
    [user],
  )

  const updateItemName = useCallback(
    (itemId: string, newName: string) => {
      if (!user) throw new Error("User not authenticated")
      return SecureStorageService.updateItemName(user.id, itemId, newName)
    },
    [user],
  )

  const getItems = useCallback((): StoredItem[] => {
    if (!user) return []
    return SecureStorageService.getItems(user.id)
  }, [user])

  const getStorageStats = useCallback(() => {
    if (!user) return { totalItems: 0, totalSize: 0, textItems: 0, fileItems: 0 }
    return SecureStorageService.getStorageStats(user.id)
  }, [user])

  return {
    storeText,
    storeFile,
    retrieveText,
    retrieveFile,
    deleteItem,
    updateItemName,
    getItems,
    getStorageStats,
    isLoading,
    error,
    clearError: () => setError(null),
  }
}
