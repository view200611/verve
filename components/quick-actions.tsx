"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, FileText, Upload, FolderOpen } from "lucide-react"

interface QuickActionsProps {
  onAddText: () => void
  onUploadFile: () => void
  onViewFiles: () => void
}

export function QuickActions({ onAddText, onUploadFile, onViewFiles }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button onClick={onAddText} className="flex flex-col items-center justify-center gap-1 h-[70px] py-2 px-3">
            <FileText className="h-4 w-4 flex-shrink-0" />
            <div className="text-center">
              <div className="font-medium text-xs leading-tight">Add Text</div>
              <div className="text-[10px] opacity-90 leading-none">Store notes</div>
            </div>
          </Button>

          <Button
            onClick={onUploadFile}
            variant="outline"
            className="flex flex-col items-center justify-center gap-1 h-[70px] py-2 px-3 bg-transparent"
          >
            <Upload className="h-4 w-4 flex-shrink-0" />
            <div className="text-center">
              <div className="font-medium text-xs leading-tight">Upload File</div>
              <div className="text-[10px] opacity-70 leading-none">Store files</div>
            </div>
          </Button>

          <Button
            onClick={onViewFiles}
            variant="outline"
            className="flex flex-col items-center justify-center gap-1 h-[70px] py-2 px-3 bg-transparent"
          >
            <FolderOpen className="h-4 w-4 flex-shrink-0" />
            <div className="text-center">
              <div className="font-medium text-xs leading-tight">Manage Files</div>
              <div className="text-[10px] opacity-70 leading-none">View items</div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
