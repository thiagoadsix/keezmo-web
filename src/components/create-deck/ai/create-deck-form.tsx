"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { PdfIcon } from "@/src/icons/pdf";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/src/lib/api-client";
import { useToast } from "@/src/hooks/use-toast";
import { PDFDocument } from "pdf-lib";
import { ProcessStepStatus } from "@/types/process-step";
import { User } from "@/types/user";
import config from "@/config";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";

interface CreateDeckFormProps {
  onSuccess: (deckId: string) => void;
  onProcessingStart: (option: "upload" | undefined) => void;
  onStepUpdate: (stepId: number, status: ProcessStepStatus) => void;
  onError: (error: string) => void;
}

interface PageRange {
  start: number;
  end: number;
}

export function CreateDeckForm({
  onSuccess,
  onProcessingStart,
  onStepUpdate,
  onError,
}: CreateDeckFormProps) {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pageRange, setPageRange] = useState<PageRange>({ start: 1, end: 1 });
  const [pageRangeError, setPageRangeError] = useState<string | null>(null);
  const [monthlyLimitError, setMonthlyLimitError] = useState<boolean>(false);
  const { toast } = useToast();
  const [inputType, setInputType] = useState<"file" | "url">("file");
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      try {
        const userResponse = await apiClient<
          User & { pdfsUploadedThisMonth?: number }
        >("api/users/me", {
          method: "GET",
          headers: {
            "x-user-email": user?.emailAddresses[0].emailAddress! || "",
          },
        });

        if (!userResponse.ok) {
          throw new Error("Failed to get user data");
        }

        const userData = await userResponse.json();
        const userPlan = userData.plan;
        const pdfsUploadedThisMonth = userData.pdfsUploadedThisMonth || 0;

        const maxPdfsPerMonth = config.stripe.plans.find(
          (plan) => plan.name === userPlan
        )?.maxPdfsPerMonth;
        if (maxPdfsPerMonth && pdfsUploadedThisMonth >= maxPdfsPerMonth) {
          setMonthlyLimitError(true);
          setIsDialogOpen(true);
          setSelectedFile(null);
          setSelectedFileName(null);
          return;
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pageCount = pdfDoc.getPageCount();

        setTotalPages(pageCount);
        setPageRange({ start: 1, end: Math.min(pageCount, 30) });
        setSelectedFile(file);
        setSelectedFileName(file.name);
        setError(null);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro ao ler PDF",
          description: "Não foi possível ler o arquivo PDF. Tente novamente.",
        });
        setSelectedFile(null);
        setSelectedFileName(null);
      }
    } else {
      setError("Por favor, selecione um arquivo PDF válido");
      setSelectedFile(null);
      setSelectedFileName(null);
    }
  };

  const validatePageRange = (range: PageRange): boolean => {
    if (range.start < 1 || range.end > totalPages) {
      setPageRangeError("Páginas fora do intervalo válido");
      return false;
    }
    if (range.start > range.end) {
      setPageRangeError("Página inicial deve ser menor que a final");
      return false;
    }
    if (range.end - range.start + 1 > 30) {
      setPageRangeError("Máximo de 30 páginas permitido");
      return false;
    }
    setPageRangeError(null);
    return true;
  };

  const handlePageRangeChange = (field: "start" | "end", value: string) => {
    const numValue = value === "" ? "" : parseInt(value);

    setPageRange((prev) => {
      const newRange = {
        ...prev,
        [field]: numValue,
      };

      if (
        typeof newRange.start === "number" &&
        typeof newRange.end === "number"
      ) {
        validatePageRange(newRange as PageRange);
      }

      return newRange;
    });
  };

  const handleInputTypeChange = (type: "file" | "url") => {
    setInputType(type);
    if (type === "file" && error) {
      setSelectedFile(null);
      setSelectedFileName(null);
      setError(null);
    }
    if (type === "url" && urlError) {
      setUrl("");
      setUrlError(null);
    }
  };

  const handleCreateDeck = async () => {
    if (monthlyLimitError) {
      setIsDialogOpen(true);
      return;
    }
    if (inputType === "file" && !selectedFile) {
      setError(
        "Para criar o deck, é necessário selecionar um arquivo PDF/DOCX."
      );
      return;
    }

    if (inputType === "url") {
      if (!url) {
        setUrlError("Por favor, insira uma URL.");
        return;
      }
      if (!isValidUrl(url)) {
        setUrlError("URL inválida. Por favor, insira uma URL válida.");
        return;
      }
    }

    if (!validatePageRange(pageRange)) {
      return;
    }

    setIsLoading(true);
    setError(null);
    onProcessingStart("upload");

    try {
      onStepUpdate(1, "processing");

      let fileUrl = "";

      if (inputType === "file") {
        const fileName = `${selectedFileName}_${Date.now()}.pdf`;

        const response = await apiClient<{ uploadUrl: string }>(
          "api/s3/upload-url",
          {
            method: "POST",
            headers: { "x-user-id": user?.id! },
            body: JSON.stringify({ fileName: fileName, pageCount: totalPages }),
          }
        );

        const { uploadUrl } = await response.json();

        await fetch(uploadUrl, {
          method: "PUT",
          body: selectedFile,
          mode: "cors",
          headers: { "Content-Type": "application/pdf" },
        });

        fileUrl = uploadUrl;
      } else {
        console.log("url", url);
      }

      onStepUpdate(1, "completed");

      onStepUpdate(2, "processing");

      const processResponse = await apiClient<{
        deckId: string;
        deckTitle: string;
      }>("api/rag-pdf", {
        method: "POST",
        headers: {
          "x-user-email": user?.emailAddresses[0].emailAddress!,
          "Content-Type": "application/json",
          "x-user-id": user?.id!,
        },
        body: JSON.stringify({
          fileUrl: inputType === "file" ? fileUrl : undefined,
          url: inputType === "url" ? url : undefined,
          pageStart: pageRange.start,
          pageEnd: pageRange.end,
        }),
      });

      if (!processResponse.ok) {
        throw new Error("Failed to process PDF");
      }

      onStepUpdate(2, "completed");

      onStepUpdate(3, "processing");
      const data = await processResponse.json();
      console.log("data", data);

      if (!data.deckId) {
        throw new Error("No deck ID returned from server");
      }

      onStepUpdate(3, "completed");

      await new Promise((resolve) => setTimeout(resolve, 500));

      onSuccess(data.deckId);
    } catch (error: any) {
      console.error("Failed to create deck:", error);
      onError(
        "Ocorreu um erro ao criar o deck. Por favor, tente novamente mais tarde, ou entre em contato com o suporte."
      );

      onStepUpdate(1, "waiting");
      onStepUpdate(2, "waiting");
      onStepUpdate(3, "waiting");
    } finally {
      setIsLoading(false);
    }
  };

  const isValidUrl = (url: string): boolean => {
    // Implement URL validation logic here
    // Return true if the URL is valid, false otherwise
    return true; // Placeholder, actual implementation needed
  };

  return (
    <div className="flex flex-col gap-6 px-8 py-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Criar deck</h1>
        <p className="text-sm text-neutral-500">
          Crie um deck a partir de um arquivo PDF ou de uma URL.
        </p>
      </div>

      <Tabs defaultValue="file" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            onClick={() => handleInputTypeChange("file")}
            value="file"
          >
            Arquivo
          </TabsTrigger>
          <TabsTrigger onClick={() => handleInputTypeChange("url")} value="url">
            URL
          </TabsTrigger>
        </TabsList>
        <TabsContent value="file">
          <Card>
            <CardHeader>
              <CardTitle>Arquivo</CardTitle>
              <CardDescription>
                Envie um arquivo PDF/DOCX para criar um novo deck.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full flex items-center justify-center">
                <label htmlFor="pdf-upload" className="w-full cursor-pointer">
                  <div
                    className={`border-2 border-dashed rounded-lg p-12 w-full flex flex-col items-center justify-center gap-2 transition-colors ${
                      selectedFileName
                        ? "border-primary bg-primary/5"
                        : error
                          ? "border-red-500 bg-red-500/10"
                          : "border-neutral-700 hover:border-primary-800"
                    }`}
                  >
                    <PdfIcon
                      className={
                        selectedFileName
                          ? "text-primary"
                          : error
                            ? "text-red-500"
                            : "text-neutral-400"
                      }
                    />
                    <input
                      type="file"
                      id="pdf-upload"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    {selectedFileName ? (
                      <>
                        <p className="text-sm text-primary font-medium">
                          {selectedFileName}
                        </p>
                        <p className="text-xs text-neutral-400">
                          Clique para trocar o arquivo
                        </p>
                      </>
                    ) : error ? (
                      <p className="text-sm text-red-500">{error}</p>
                    ) : (
                      <>
                        <p className="text-sm text-neutral-400 text-center">
                          Arraste e solte seu arquivo aqui ou clique para
                          selecionar
                        </p>
                        <p className="text-xs text-neutral-500">
                          Apenas arquivos PDF/DOCX são aceitos
                        </p>
                      </>
                    )}
                  </div>
                  {totalPages > 0 && (
                    <div className="mt-4 space-y-4">
                      <div className="text-sm text-neutral-400">
                        Total de páginas: {totalPages}
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm">
                          Intervalo de páginas (máx. 30 páginas)
                        </label>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min={1}
                              max={totalPages}
                              value={pageRange.start}
                              onChange={(e) =>
                                handlePageRangeChange("start", e.target.value)
                              }
                              className="w-20"
                            />
                            <span>até</span>
                            <Input
                              type="number"
                              min={1}
                              max={totalPages}
                              value={pageRange.end}
                              onChange={(e) =>
                                handlePageRangeChange("end", e.target.value)
                              }
                              className="w-20"
                            />
                          </div>
                          {pageRangeError && (
                            <p className="text-xs text-red-500">
                              {pageRangeError}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="url">
          <Card>
            <CardHeader>
              <CardTitle>URL</CardTitle>
              <CardDescription>
                Insira uma URL para criar um novo deck.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Insira a URL"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setUrlError(null);
                }}
                className={urlError ? "border-red-500" : ""}
              />
              {urlError && (
                <p className="text-red-500 text-sm mt-1">{urlError}</p>
              )}
              <p className="text-xs text-neutral-500 mt-2">
                Exemplos de URLs compatíveis:
                <br />
                - https://example.com/file.pdf
                <br />- https://docs.google.com/document/d/1234567890abcdefg
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between gap-4">
        <Button variant="destructive" asChild>
          <Link href="/decks/create">Cancelar</Link>
        </Button>

        <Button onClick={handleCreateDeck} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            "Criar deck"
          )}
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Limite Mensal Atingido</DialogTitle>
            <DialogDescription>
              Você atingiu o limite mensal de PDFs para o seu plano.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
