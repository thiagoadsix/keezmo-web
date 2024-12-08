import Header from "@/app/components/header";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { PdfIcon } from "@/app/icons/pdf";
import Link from "next/link";

export default function CreateDeckPage() {
  return (
    <div className="flex flex-col gap-4">
      <Header
        title="Criar deck"
        mobileTitle="Criar deck"
      />
      <main className="bg-[#10111F] w-full h-full rounded-3xl border">
        <div className="flex flex-col gap-6 px-8 py-6">
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
            />
          </div>

          <div className="flex flex-col gap-2 w-full">
            <div>
              <label htmlFor="pdf">Envie o PDF</label>
              <span className="text-xs text-red-500">*</span>
            </div>
            <div className="w-full flex items-center justify-center">
              <label htmlFor="pdf-upload" className="w-full cursor-pointer">
                <div className="border-2 border-dashed border-neutral-700 rounded-lg p-12 w-full flex flex-col items-center justify-center gap-2 hover:border-primary-800 transition-colors">
                  <PdfIcon className="text-neutral-400" />
                  <input
                    type="file"
                    id="pdf-upload"
                    accept=".pdf"
                    className="hidden"
                  />
                  <p className="text-sm text-neutral-400 text-center">
                    Arraste e solte seu arquivo PDF aqui ou clique para
                    selecionar
                  </p>
                  <p className="text-xs text-neutral-500">
                    Apenas arquivos PDF são aceitos
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-between gap-4">
            <Button variant="destructive" asChild>
              <Link href="/decks">Cancelar</Link>
            </Button>
            <Button>Criar deck</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
