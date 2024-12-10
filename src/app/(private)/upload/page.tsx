"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { FieldValues } from "react-hook-form";
import { Skeleton } from "@/src/components/ui/skeleton";

const formSchema = z.object({
  pdf: z.instanceof(File),
  title: z.string().min(1, { message: "Please provide a title." }),
  description: z.string().min(1, { message: "Please provide a description." }),
  totalCards: z
    .number()
    .min(1, { message: "Please provide a valid number." })
    .max(30, { message: "Maximum allowed value is 30." })
    .nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export default function UploadPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [availableCredits, setAvailableCredits] = React.useState(20);

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
      title: "",
      description: "",
      totalCards: undefined,
    },
  });

  function onSubmit(values: FormValues) {
    if (values.totalCards !== null && values.totalCards > availableCredits) {
      alert("You do not have enough credits to generate this number of cards.");
      return;
    }
    console.log(values);
  }

  const totalCardsValue = form.watch("totalCards") || 0;

  return (
    <div className="max-w-[75rem] w-full mx-auto p-4">
      <div className="mb-4">
        <Button variant="outline" asChild>
          <Link href="/dashboard">&larr; Back to Dashboard</Link>
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
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6 p-8 border rounded shadow-sm"
          >
            <div className="text-right text-neutral-600 mb-4">
              Available Credits:{" "}
              <span className="font-bold">{availableCredits}</span>
            </div>

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
                          form.setValue("pdf", e.target.files[0]);
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
                    <Input
                      placeholder="Enter a title for the deck"
                      {...field}
                    />
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
                    <Input
                      placeholder="Enter a description for the deck"
                      {...field}
                    />
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
                      value={field.value || ""}
                      onChange={(e) => {
                        const value = e.target.value
                          ? parseInt(e.target.value, 10)
                          : null;
                        form.setValue("totalCards", value);
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  {totalCardsValue > availableCredits && (
                    <p className="text-red-500 text-sm mt-2">
                      You do not have enough credits to generate this number of
                      cards. Available credits: {availableCredits}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={
                totalCardsValue > availableCredits || totalCardsValue === 0
              }
            >
              Upload
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}
