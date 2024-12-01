'use client';

import React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/app/components/ui/form';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { FieldValues } from 'react-hook-form';
import { Skeleton } from '@/app/components/ui/skeleton';

const formSchema = z.object({
  pdf: z.instanceof(File),
  title: z.string().min(1, { message: 'Please provide a title.' }),
  description: z.string().min(1, { message: 'Please provide a description.' }),
  totalCards: z.number().min(1, { message: 'Please provide a valid number.' }).max(30, { message: 'Maximum allowed value is 30.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function UploadPage() {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pdf: undefined,
      title: '',
      description: '',
      totalCards: 1,
    },
  });

  function onSubmit(values: FormValues) {
    console.log(values);
  }

  return (
    <div className="max-w-[75rem] w-full mx-auto p-4">
      <div className="mb-4">
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            &larr; Back to Dashboard
          </Link>
        </Button>
      </div>
      <h1 className="text-3xl font-bold mb-6 text-center">Upload New PDF</h1>

      {isLoading ? (
        <div className="flex flex-col gap-6 p-8 border rounded shadow-sm">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6 p-8 border rounded shadow-sm">
            <FormField
              control={form.control}
              name="pdf"
              render={({ field }: { field: FieldValues }) => (
                <FormItem>
                  <FormLabel>Select PDF</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          form.setValue('pdf', e.target.files[0]);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }: { field: FieldValues }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a title for the deck" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }: { field: FieldValues }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a description for the deck" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="totalCards"
              render={({ field }: { field: FieldValues }) => (
                <FormItem>
                  <FormLabel>Total Cards</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={30}
                      placeholder="Enter the total number of cards (up to 30)"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">Upload</Button>
          </form>
        </Form>
      )}
    </div>
  );
}
