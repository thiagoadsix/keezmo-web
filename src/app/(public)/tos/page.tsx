import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-12 bg-background text-foreground">
      {/* Link para voltar */}
      <Link
        href="/"
        className="inline-flex items-center mb-8 text-primary hover:text-primary/80 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Link>

      {/* Título Principal */}
      <h1 className="text-3xl font-bold mb-4 border-b border-muted pb-2">
        Termos de Serviço
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        Data de vigência: 26 de dezembro de 2024
      </p>

      {/* Índice Navegável */}
      <nav className="mb-12">
        <ul className="list-disc ml-6 space-y-2">
          <li>
            <a
              href="#uso-da-plataforma"
              className="text-primary hover:underline"
            >
              1. Uso da Plataforma
            </a>
          </li>
          <li>
            <a
              href="#politica-de-reembolso"
              className="text-primary hover:underline"
            >
              2. Política de Reembolso
            </a>
          </li>
          <li>
            <a href="#coleta-de-dados" className="text-primary hover:underline">
              3. Coleta de Dados
            </a>
          </li>
          <li>
            <a href="#propriedade" className="text-primary hover:underline">
              4. Propriedade
            </a>
          </li>
          <li>
            <a href="#atualizacoes" className="text-primary hover:underline">
              5. Atualizações dos Termos
            </a>
          </li>
          <li>
            <a href="#lei-aplicavel" className="text-primary hover:underline">
              6. Lei Aplicável
            </a>
          </li>
          <li>
            <a href="#contato" className="text-primary hover:underline">
              7. Entre em Contato Conosco
            </a>
          </li>
        </ul>
      </nav>

      {/* Conteúdo */}
      <div className="prose prose-invert max-w-none space-y-4">
        <div>
          <h2 id="uso-da-plataforma">1. Uso da Plataforma</h2>
          <p>
            O Keezmo fornece uma plataforma para aprender assuntos usando
            flashcards gerados por IA. Os usuários podem criar seus próprios
            flashcards através da plataforma.
          </p>
        </div>
        <div>
          <h2 id="politica-de-reembolso">2. Política de Reembolso</h2>
          <p>
            Os usuários são elegíveis para um reembolso total dentro de 7 dias
            após a compra. Para obter assistência, entre em contato conosco em
            official@keezmo.com.
          </p>
        </div>
        <div>
          <h2 id="coleta-de-dados">3. Coleta de Dados</h2>
          <p>
            Coletamos dados pessoais, incluindo seu nome, endereço de e-mail e
            informações de pagamento, bem como dados não pessoais por meio de
            cookies da web. Para mais detalhes, consulte nossa Política de
            Privacidade em https://keezmo.com/privacy-policy.
          </p>
        </div>
        <div>
          <h2 id="propriedade">4. Propriedade</h2>
          <p>
            Os flashcards criados pelos usuários permanecem de sua propriedade.
            O Keezmo mantém a propriedade da plataforma e seus serviços.
          </p>
        </div>
        <div>
          <h2 id="atualizacoes">5. Atualizações dos Termos de Serviço</h2>
          <p>
            Estes Termos de Serviço podem ser atualizados periodicamente. Os
            usuários serão informados sobre quaisquer alterações por e-mail.
          </p>
        </div>
        <div>
          <h2 id="lei-aplicavel">6. Lei Aplicável</h2>
          <p>Estes Termos de Serviço são regidos pelas leis do Brasil.</p>
        </div>
        <div>
          <h2 id="contato">7. Entre em Contato Conosco</h2>
          <p>
            Se você tiver alguma dúvida ou preocupação sobre estes Termos de
            Serviço, por favor, entre em contato conosco em: E-mail:
            official@keezmo.com
          </p>
        </div>

        <p>Obrigado por usar o Keezmo!</p>
      </div>
    </div>
  );
}
