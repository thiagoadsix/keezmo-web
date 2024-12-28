import Link from "next/link";
import { Mail } from "lucide-react";
import { XIcon } from "@/src/icons/x";
import { InstagramIcon } from "@/src/icons/instagram";
import config from "@/config";

export function Footer() {
  return (
    <footer id="footer" className="bg-neutral-900/50 border-t border-neutral-800">
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-8 px-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {config.app.name}
              </span>
            </Link>
            <p className="mt-4 text-sm text-neutral-400">
              Flashcards potencializados por IA para um aprendizado eficiente
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-3 text-white">Produto</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#features" className="text-sm text-neutral-400 transition-colors hover:text-primary">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#plans" className="text-sm text-neutral-400 transition-colors hover:text-primary">
                  Preços
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-3 text-white">Empresa</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-neutral-400 transition-colors hover:text-primary">
                  Sobre
                </Link>
              </li>
              <li>
                <Link href="/tos" className="text-sm text-neutral-400 transition-colors hover:text-primary">
                  Termos de Serviço
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-sm text-neutral-400 transition-colors hover:text-primary">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold mb-3 text-white">Contato</h3>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 transition-colors hover:text-primary"
                aria-label="Siga-nos no Instagram"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 transition-colors hover:text-primary"
                aria-label="Siga-nos no X"
              >
                <XIcon className="h-5 w-5" />
              </a>
              <a
                href="mailto:contact@keezmo.com"
                className="text-neutral-400 transition-colors hover:text-primary"
                aria-label="Entre em contato por email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-800 py-8">
          <p className="text-sm text-neutral-400 text-center">
            © {new Date().getFullYear()} {config.app.name}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}