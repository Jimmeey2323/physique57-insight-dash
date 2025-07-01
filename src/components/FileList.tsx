
import React from 'react';
import { X, FileText, File, FileMinus, FileUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FileListProps {
  files: File[];
  onRemove: (index: number) => void;
  onProcessFiles: () => void;
  fileTypes: Record<string, string>;
}

const FileList: React.FC<FileListProps> = ({ files, onRemove, onProcessFiles, fileTypes }) => {
  if (files.length === 0) return null;

  const getFileIcon = (fileName: string) => {
    const fileType = Object.entries(fileTypes).find(([type, pattern]) => {
      return new RegExp(pattern, 'i').test(fileName);
    })?.[0];

    switch (fileType) {
      case 'new':
        return <FileUp className="h-5 w-5 text-blue-500" />;
      case 'bookings':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'payments':
        return <File className="h-5 w-5 text-amber-500" />;
      default:
        return <FileMinus className="h-5 w-5 text-gray-500" />;
    }
  };

  const getFileType = (fileName: string) => {
    const fileType = Object.entries(fileTypes).find(([type, pattern]) => {
      return new RegExp(pattern, 'i').test(fileName);
    })?.[0];

    switch (fileType) {
      case 'new':
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">New</Badge>;
      case 'bookings':
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Bookings</Badge>;
      case 'payments':
        return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Payments</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Unknown</Badge>;
    }
  };

  return (
    <div className="w-full animate-fade-in">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-medium">Uploaded Files</h3>
        <Button onClick={onProcessFiles} disabled={files.length === 0} className="button-hover">
          Process Files
        </Button>
      </div>

      <div className="rounded-lg overflow-hidden border bg-white/60 backdrop-blur-sm">
        <ul className="divide-y">
          {files.map((file, index) => (
            <li 
              key={`${file.name}-${index}`}
              className={cn(
                "flex items-center justify-between p-3.5 group transition-all",
                "hover:bg-accent/50"
              )}
            >
              <div className="flex items-center space-x-3">
                <span className="flex-shrink-0">
                  {getFileIcon(file.name)}
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-medium truncate max-w-[200px] sm:max-w-xs md:max-w-sm">
                    {file.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <div className="ml-2">{getFileType(file.name)}</div>
              </div>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onRemove(index)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove file</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Remove file</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FileList;
