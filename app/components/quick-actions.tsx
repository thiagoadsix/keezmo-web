'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { File } from 'lucide-react';

export default function QuickActions() {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Button asChild>
        <Link href="/upload">
          <File className="w-4 h-4 mr-2" /> Upload New PDF
        </Link>
      </Button>
    </div>
  );
}
