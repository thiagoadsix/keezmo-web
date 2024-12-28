import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
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
        Política de Privacidade
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        Data de vigência: 26 de dezembro de 2024
      </p>

      {/* Índice Navegável */}
      <nav className="mb-12">
        <ul className="list-disc ml-6 space-y-2">
          <li>
            <a
              href="#informacoes-coletadas"
              className="text-primary hover:underline"
            >
              1. Informações que Coletamos
            </a>
          </li>
          <li>
            <a
              href="#finalidade-coleta"
              className="text-primary hover:underline"
            >
              2. Finalidade da Coleta de Dados
            </a>
          </li>
          <li>
            <a
              href="#compartilhamento"
              className="text-primary hover:underline"
            >
              3. Compartilhamento de Dados
            </a>
          </li>
          <li>
            <a
              href="#privacidade-criancas"
              className="text-primary hover:underline"
            >
              4. Privacidade das Crianças
            </a>
          </li>
          <li>
            <a
              href="#atualizacoes-politica"
              className="text-primary hover:underline"
            >
              5. Atualizações desta Política
            </a>
          </li>
          <li>
            <a href="#contato" className="text-primary hover:underline">
              6. Entre em Contato Conosco
            </a>
          </li>
        </ul>
      </nav>

      {/* Conteúdo */}
      <div className="prose prose-invert max-w-none space-y-4">
        <div>
          <h2 id="informacoes-coletadas">1. Informações que Coletamos</h2>
          <ul>
            <li>
              <strong>Informações Pessoais:</strong> Coletamos seu nome,
              endereço de e-mail e informações de pagamento para processamento
              de pedidos.
            </li>
            <li>
              <strong>Informações Não Pessoais:</strong> Usamos cookies da web
              para melhorar sua experiência em nosso site.
            </li>
          </ul>
        </div>
        <div>
          <h2 id="finalidade-coleta">2. Finalidade da Coleta de Dados</h2>
          <p>
            Usamos suas informações exclusivamente para processar pedidos e
            fornecer nossos serviços.
          </p>
        </div>
        <div>
          <h2 id="compartilhamento">3. Compartilhamento de Dados</h2>
          <p>Não compartilhamos seus dados pessoais ou não pessoais com terceiros.</p>
        </div>
        <div>
          <h2 id="privacidade-criancas">4. Privacidade das Crianças</h2>
          <p>
            O Keezmo não coleta intencionalmente informações de crianças. Se
            você acredita que uma criança nos forneceu informações pessoais,
            entre em contato conosco imediatamente.
          </p>
        </div>
        <div>
          <h2 id="atualizacoes-politica">5. Atualizações desta Política</h2>
          <p>
            Podemos atualizar esta Política de Privacidade de tempos em tempos.
            Se forem feitas alterações, notificaremos você por e-mail.
          </p>
        </div>
        <div>
          <h2 id="contato">6. Entre em Contato Conosco</h2>
          <p>
            Se você tiver alguma dúvida sobre esta Política de Privacidade,
            entre em contato conosco em:
            <br />
            E-mail: official@keezmo.com
          </p>
        </div>

        <p>Obrigado por confiar no Keezmo.</p>
      </div>
    </div>
  );
}
