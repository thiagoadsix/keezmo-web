'use client'

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { PdfIcon } from "@/src/icons/pdf"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/src/lib/api-client"
import { useToast } from "@/src/hooks/use-toast"
import { PDFDocument } from 'pdf-lib'
import { ProcessStepStatus } from "@/types/process-step"
import { User } from "@/types/user"
import config from "@/config"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"

interface CreateDeckFormProps {
  onSuccess: (deckId: string) => void;
  onProcessingStart: () => void;
  onStepUpdate: (stepId: number, status: ProcessStepStatus) => void;
  onError: (error: string) => void;
}

interface PageRange {
  start: number;
  end: number;
}

export function CreateDeckForm({ onSuccess, onProcessingStart, onStepUpdate, onError }: CreateDeckFormProps) {
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [numCards, setNumCards] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pageRange, setPageRange] = useState<PageRange>({ start: 1, end: 1 });
  const [pageRangeError, setPageRangeError] = useState<string | null>(null);
  const [monthlyLimitError, setMonthlyLimitError] = useState<string | null>(null);
  const [existingPdfs, setExistingPdfs] = useState<{ name: string; uploadDate: Date; url: string }[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [customPdfName, setCustomPdfName] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<'existing' | 'upload' | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchExistingPdfs = async () => {
      const response = await apiClient<{ name: string; uploadDate: Date; url: string }[]>('api/users/pdfs', {
        method: 'GET',
        headers: {
          'x-user-email': user?.emailAddresses[0].emailAddress! || '',
          'x-user-id': user?.id! || '',
        },
      });

      if (response.ok) {
        const pdfs = await response.json();
        setExistingPdfs(pdfs);
      }
    };

    fetchExistingPdfs();
  }, [user?.emailAddresses, user?.id]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      try {
        // Obter dados do usuário para verificar o plano e limite mensal
        const userResponse = await apiClient<User & { pdfsUploadedThisMonth?: number }>('api/users/me', {
          method: 'GET',
          headers: {
            'x-user-email': user?.emailAddresses[0].emailAddress! || ''
          }
        });

        if (!userResponse.ok) {
          throw new Error('Failed to get user data');
        }

        const userData = await userResponse.json();
        const userPlan = userData.plan;
        const pdfsUploadedThisMonth = userData.pdfsUploadedThisMonth || 0;

        // Verificar limite mensal de PDFs baseado no plano
        const maxPdfsPerMonth = config.stripe.plans.find(plan => plan.name === userPlan)?.maxPdfsPerMonth;
        if (maxPdfsPerMonth && pdfsUploadedThisMonth >= maxPdfsPerMonth) {
          setMonthlyLimitError(`Você atingiu o limite mensal de ${maxPdfsPerMonth} PDFs para o plano ${userPlan}`);
          setSelectedFile(null);
          setSelectedFileName(null);
          return;
        }

        // Ler número de páginas do PDF
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
          description: "Não foi possível ler o arquivo PDF. Tente novamente."
        });
        setSelectedFile(null);
        setSelectedFileName(null);
      }
    } else {
      setError('Por favor, selecione um arquivo PDF válido');
      setSelectedFile(null);
      setSelectedFileName(null);
    }
  }

  // Validação do intervalo de páginas
  const validatePageRange = (range: PageRange): boolean => {
    if (range.start < 1 || range.end > totalPages) {
      setPageRangeError('Páginas fora do intervalo válido');
      return false;
    }
    if (range.start > range.end) {
      setPageRangeError('Página inicial deve ser menor que a final');
      return false;
    }
    if (range.end - range.start + 1 > 30) {
      setPageRangeError('Máximo de 30 páginas permitido');
      return false;
    }
    setPageRangeError(null);
    return true;
  }

  const handlePageRangeChange = (field: 'start' | 'end', value: string) => {
    const numValue = value === '' ? '' : parseInt(value);

    setPageRange(prev => {
      const newRange = {
        ...prev,
        [field]: numValue
      };

      // Só valida se ambos os campos tiverem valores
      if (typeof newRange.start === 'number' && typeof newRange.end === 'number') {
        validatePageRange(newRange as PageRange);
      }

      return newRange;
    });
  };

  const handleCreateDeck = async () => {
    if (!title || !numCards || (selectedOption === 'existing' && !selectedPdf) || (selectedOption === 'upload' && !selectedFile)) {
      setError('Por favor, preencha todos os campos obrigatórios')
      return
    }

    if (selectedOption === 'upload' && !customPdfName) {
      setError('Por favor, insira um nome personalizado para o PDF')
      return
    }

    // Validar intervalo de páginas antes de enviar
    if (!validatePageRange(pageRange)) {
      return;
    }

    setIsLoading(true)
    setError(null)
    onProcessingStart()

    try {
      // Deduct credits first
      const creditsNeeded = parseInt(numCards);
      const updateCreditsResponse = await apiClient<User>('api/users/credits', {
        method: 'POST',
        headers: {
          'x-user-email': user?.emailAddresses[0].emailAddress! || ''
        },
        body: JSON.stringify({
          amount: creditsNeeded,
          type: 'use',
          source: 'deck_creation'
        })
      });

      if (!updateCreditsResponse.ok) {
        throw new Error('Failed to update credits');
      }

      // Step 1: Upload PDF to S3 (if a new file is selected)
      let pdfUrl = selectedOption === 'existing' ? selectedPdf : '';

      if (selectedOption === 'upload' && selectedFile) {
        onStepUpdate(1, 'processing');

        const fileName = `${customPdfName}_${Date.now()}.pdf`;

        const response = await apiClient<{ uploadUrl: string }>('api/s3/upload-url', {
          method: 'POST',
          headers: { 'x-user-id': user?.id! },
          body: JSON.stringify({ fileName: fileName }),
        });

        const { uploadUrl } = await response.json();

        await fetch(uploadUrl, {
          method: 'PUT',
          body: selectedFile,
          mode: 'cors'
        });

        onStepUpdate(1, 'completed');

        pdfUrl = `${config.aws.bucketUrl}/${fileName}`;
      }

      // Step 2: Process PDF
      onStepUpdate(2, 'processing');

      const processResponse = await apiClient<{ deckId: string }>('api/rag-pdf', {
        method: 'POST',
        headers: {
          'x-user-email': user?.emailAddresses[0].emailAddress!,
          'Content-Type': 'application/json',
          'x-user-id': user?.id!,
        },
        body: JSON.stringify({
          fileUrl: pdfUrl,
          numCards,
          title,
          description,
          pageStart: pageRange.start,
          pageEnd: pageRange.end,
        }),
      });

      if (!processResponse.ok) {
        throw new Error('Failed to process PDF')
      }

      onStepUpdate(2, 'completed')

      // Step 3: Generate cards
      onStepUpdate(3, 'processing')
      const data = await processResponse.json()
      console.log('data', data)

      if (!data.deckId) {
        throw new Error('No deck ID returned from server')
      }

      console.log('Deck created successfully:', data)
      onStepUpdate(3, 'completed')

      // Add a small delay before showing success
      await new Promise(resolve => setTimeout(resolve, 500))

      // Call onSuccess with the deck ID
      onSuccess(data.deckId)
    } catch (error: any) {
      console.error('Failed to create deck:', error);
      onError('Ocorreu um erro ao criar o deck. Por favor, tente novamente mais tarde, ou entre em contato com o suporte.');

      // Reset processing state if there's an error
      onStepUpdate(1, 'waiting');
      onStepUpdate(2, 'waiting');
      onStepUpdate(3, 'waiting');
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 px-8 py-6">
      {error && (
        <div className="bg-red-500/10 text-red-500 p-4 rounded-md">
          {error}
        </div>
      )}
      {monthlyLimitError && (
        <div className="bg-red-500/10 text-red-500 p-4 rounded-md">
          {monthlyLimitError}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-2 w-full">
          <div>
            <label htmlFor="title">Título</label>
            <span className="text-xs text-red-500">*</span>
          </div>
          <Input
            type="text"
            id="title"
            placeholder="Digite o título do deck"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <div>
            <label htmlFor="total-cards">Total de cards</label>
            <span className="text-xs text-red-500">*</span>
          </div>
          <Input
            type="number"
            id="total-cards"
            placeholder="Digite o total de cards do deck"
            value={numCards}
            onChange={(e) => setNumCards(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full">
        <div>
          <label htmlFor="description">Descrição</label>
        </div>
        <Input
          type="text"
          id="description"
          placeholder="Digite a descrição do deck"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {existingPdfs.length > 0 && (
        <div className="flex flex-col gap-2 w-full">
          <div>
            <label>Selecione uma opção</label>
          </div>
          <div className="flex gap-4">
            <div>
              <input
                type="radio"
                id="existing-pdf-option"
                name="pdf-option"
                value="existing"
                checked={selectedOption === 'existing'}
                onChange={() => setSelectedOption('existing')}
              />
              <label htmlFor="existing-pdf-option" className="ml-2">
                Selecionar PDF existente
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="upload-pdf-option"
                name="pdf-option"
                value="upload"
                checked={selectedOption === 'upload'}
                onChange={() => setSelectedOption('upload')}
              />
              <label htmlFor="upload-pdf-option" className="ml-2">
                Fazer upload de novo PDF
              </label>
            </div>
          </div>
        </div>
      )}

      {selectedOption === 'existing' && existingPdfs.length > 0 && (
        <div className="flex flex-col gap-2 w-full">
          <div>
            <label htmlFor="existing-pdf">Selecione um PDF existente</label>
          </div>
          <Select
            value={selectedPdf || undefined}
            onValueChange={setSelectedPdf}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um PDF" />
            </SelectTrigger>
            <SelectContent>
              {existingPdfs.map((pdf) => (
                <SelectItem key={pdf.url} value={pdf.url}>
                  {pdf.name} - {new Date(pdf.uploadDate).toLocaleDateString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {(selectedOption === 'upload' || existingPdfs.length === 0) && (
        <div className="flex flex-col gap-2 w-full">
          <div>
            <label htmlFor="pdf">Envie o PDF</label>
            <span className="text-xs text-red-500">*</span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            Certifique-se de que o PDF contenha texto selecionável. PDFs com texto em formato de imagem ou apenas imagens não terão um bom resultado.
          </p>
          <div className="w-full flex items-center justify-center">
            <label htmlFor="pdf-upload" className="w-full cursor-pointer">
              <div className={`border-2 border-dashed rounded-lg p-12 w-full flex flex-col items-center justify-center gap-2 transition-colors ${
                selectedFileName
                  ? 'border-primary bg-primary/5'
                  : 'border-neutral-700 hover:border-primary-800'
              }`}>
                <PdfIcon className={selectedFileName ? 'text-primary' : 'text-neutral-400'} />
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
                ) : (
                  <>
                    <p className="text-sm text-neutral-400 text-center">
                      Arraste e solte seu arquivo PDF aqui ou clique para
                      selecionar
                    </p>
                    <p className="text-xs text-neutral-500">
                      Apenas arquivos PDF são aceitos
                    </p>
                  </>
                )}
              </div>
            </label>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <label htmlFor="custom-pdf-name">Nome personalizado do PDF</label>
            <Input
              type="text"
              id="custom-pdf-name"
              placeholder="Digite um nome para o PDF"
              value={customPdfName}
              onChange={(e) => setCustomPdfName(e.target.value)}
            />
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
                      onChange={(e) => handlePageRangeChange('start', e.target.value)}
                      className="w-20"
                    />
                    <span>até</span>
                    <Input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={pageRange.end}
                      onChange={(e) => handlePageRangeChange('end', e.target.value)}
                      className="w-20"
                    />
                  </div>
                  {pageRangeError && (
                    <p className="text-xs text-red-500">{pageRangeError}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between gap-4">
        <Button variant="destructive" asChild>
          <Link href="/decks/create">Cancelar</Link>
        </Button>
        <Button
          onClick={handleCreateDeck}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            'Criar deck'
          )}
        </Button>
      </div>

      {!isLoading && (
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Ao clicar em "Criar deck", você confirma que o PDF contém texto selecionável.</p>
          <p>Lembre-se: PDFs com texto em formato de imagem ou apenas imagens não terão um bom resultado e os créditos não serão recuperados.</p>
        </div>
      )}
    </div>
  )
}