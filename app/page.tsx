"use client"

import { useState } from "react"
import { AuthForm } from "@/components/auth-form"
import { StorageStats } from "@/components/storage-stats"
import { RecentItems } from "@/components/recent-items"
import { QuickActions } from "@/components/quick-actions"
import { AddTextForm } from "@/components/add-text-form"
import { UploadFileForm } from "@/components/upload-file-form"
import { FileManager } from "@/components/file-manager"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Shield, Lock, Key, Database, Settings, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function HomePage() {
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [currentView, setCurrentView] = useState<"dashboard" | "add-text" | "upload-file" | "manage-files">("dashboard")
  const { isAuthenticated, user, logout } = useAuth()

  const handleSuccess = () => {
    setCurrentView("dashboard")
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-slate-900">SecureVault</h1>
                <p className="text-slate-600">Your encrypted storage dashboard</p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-600 text-white">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline">{user.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Dashboard Content */}
          {currentView === "dashboard" && (
            <div className="space-y-6">
              {/* Storage Statistics */}
              <StorageStats />

              {/* Main Content Grid */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Items - Takes 2 columns */}
                <div className="lg:col-span-2">
                  <RecentItems />
                </div>

                {/* Quick Actions - Takes 1 column */}
                <div>
                  <QuickActions
                    onAddText={() => setCurrentView("add-text")}
                    onUploadFile={() => setCurrentView("upload-file")}
                    onViewFiles={() => setCurrentView("manage-files")}
                  />
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900 mb-1">End-to-End Encryption Active</h3>
                    <p className="text-sm text-blue-700">
                      All your data is encrypted on your device before storage. Only you have access to your encryption
                      keys.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Replace placeholder views with actual components */}
          {currentView === "add-text" && (
            <AddTextForm onSuccess={handleSuccess} onCancel={() => setCurrentView("dashboard")} />
          )}

          {currentView === "upload-file" && (
            <UploadFileForm onSuccess={handleSuccess} onCancel={() => setCurrentView("dashboard")} />
          )}

          {currentView === "manage-files" && <FileManager onBack={() => setCurrentView("dashboard")} />}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">SecureVault</h1>
          </div>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Your personal encrypted storage solution. Store your sensitive data with military-grade encryption.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg p-6 shadow-sm border text-center">
            <Lock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">End-to-End Encryption</h3>
            <p className="text-slate-600 text-sm">
              Your data is encrypted on your device before it ever leaves your browser.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border text-center">
            <Key className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Zero-Knowledge</h3>
            <p className="text-slate-600 text-sm">
              Only you have access to your encryption keys. We can't see your data.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border text-center">
            <Database className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Secure Storage</h3>
            <p className="text-slate-600 text-sm">
              Your encrypted data is stored securely with multiple backup layers.
            </p>
          </div>
        </div>

        {/* Auth Form */}
        <div className="flex justify-center">
          <AuthForm mode={authMode} onToggleMode={() => setAuthMode(authMode === "login" ? "signup" : "login")} />
        </div>
      </div>
    </div>
  )
}
