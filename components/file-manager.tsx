"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useSecureStorage } from "@/hooks/use-secure-storage"
import { FileText, File, Download, Trash2, Eye, Lock, Search, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface FileManagerProps {
  onBack: () => void
}

export function FileManager({ onBack }: FileManagerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [viewPassword, setViewPassword] = useState("")
  const [downloadPassword, setDownloadPassword] = useState("")
  const [viewContent, setViewContent] = useState<string | null>(null)
  const [isViewing, setIsViewing] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const { getItems, retrieveText, retrieveFile, deleteItem, updateItemName, isLoading, error, clearError } =
    useSecureStorage()

  const items = getItems().filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  const handleView = async (itemId: string) => {
    if (!viewPassword) return

    clearError()
    setIsViewing(true)

    const result = await retrieveText(itemId, viewPassword)
    if (result) {
      setViewContent(result)
    }

    setIsViewing(false)
    setViewPassword("")
  }

  const handleDownload = async (itemId: string) => {
    if (!downloadPassword) return

    clearError()
    setIsDownloading(true)

    const item = items.find((i) => i.id === itemId)
    if (!item) return

    if (item.type === "text") {
      const result = await retrieveText(itemId, downloadPassword)
      if (result) {
        const blob = new Blob([result], { type: "text/plain" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${item.name}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } else {
      const result = await retrieveFile(itemId, downloadPassword)
      if (result) {
        const url = URL.createObjectURL(result.blob)
        const a = document.createElement("a")
        a.href = url
        a.download = result.filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    }

    setIsDownloading(false)
    setDownloadPassword("")
    setSelectedItem(null)
  }

  const handleDelete = (itemId: string) => {
    if (confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
      deleteItem(itemId)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onBack}>
          ← Back to Dashboard
        </Button>
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Encrypted Files</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <File className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No files found</p>
              <p>{searchTerm ? "Try adjusting your search terms" : "Start by adding some encrypted content"}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {item.type === "text" ? (
                      <FileText className="h-6 w-6 text-blue-600" />
                    ) : (
                      <File className="h-6 w-6 text-green-600" />
                    )}
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
                        </span>
                        <span>{formatSize(item.size)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={item.type === "text" ? "default" : "secondary"}>{item.type}</Badge>

                    {item.type === "text" && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>View: {item.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {!viewContent ? (
                              <div className="space-y-3">
                                <div className="space-y-2">
                                  <Label htmlFor="viewPassword">Enter decryption password</Label>
                                  <Input
                                    id="viewPassword"
                                    type="password"
                                    value={viewPassword}
                                    onChange={(e) => setViewPassword(e.target.value)}
                                    placeholder="Password"
                                  />
                                </div>
                                <Button onClick={() => handleView(item.id)} disabled={!viewPassword || isViewing}>
                                  <Lock className="w-4 h-4 mr-2" />
                                  {isViewing ? "Decrypting..." : "Decrypt & View"}
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="bg-slate-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                                  <pre className="whitespace-pre-wrap text-sm">{viewContent}</pre>
                                </div>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setViewContent(null)
                                    setViewPassword("")
                                  }}
                                >
                                  Close
                                </Button>
                              </div>
                            )}
                            {error && (
                              <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                              </Alert>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedItem(item.id)}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Download: {item.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="downloadPassword">Enter decryption password</Label>
                            <Input
                              id="downloadPassword"
                              type="password"
                              value={downloadPassword}
                              onChange={(e) => setDownloadPassword(e.target.value)}
                              placeholder="Password"
                            />
                          </div>
                          <Button onClick={() => handleDownload(item.id)} disabled={!downloadPassword || isDownloading}>
                            <Download className="w-4 h-4 mr-2" />
                            {isDownloading ? "Decrypting..." : "Decrypt & Download"}
                          </Button>
                          {error && (
                            <Alert variant="destructive">
                              <AlertDescription>{error}</AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
