'use client';

import * as React from 'react';
import { ChevronsUpDown } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export interface FileUploadProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onUpload: (file: File) => void;
}

export function FileUpload({ className, onUpload, accept, ...props }: FileUploadProps) {
  const [dragActive, setDragActive] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div
      className={cn(
        'flex justify-center px-6 pt-5 pb-6 mt-1 border-2 border-dashed rounded-md',
        dragActive ? 'border-primary' : 'border-neutral-300 dark:border-neutral-700',
        className
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="space-y-1 text-center">
        <ChevronsUpDown className="mx-auto h-12 w-12 text-neutral-400" />
        <div className="flex text-sm text-neutral-600 dark:text-neutral-400">
          <label
            onClick={handleClick}
            htmlFor="file-upload"
            className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary/50 focus-within:ring-offset-2"
          >
            <span>Upload um arquivo</span>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              ref={inputRef}
              onChange={handleChange}
              accept={accept}
              {...props}
            />
          </label>
          <p className="pl-1">ou arraste e solte</p>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          PNG, JPG, GIF até 10MB
        </p>
      </div>
    </div>
  );
}