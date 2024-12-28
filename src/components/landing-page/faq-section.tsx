'use client';

import { useRef, useState } from "react";
import type { JSX } from "react";
import { CreditCard, Clock, LifeBuoy, Zap, Lock, Sparkles } from "lucide-react";

interface FAQItemProps {
  question: string;
  answer: JSX.Element;
  icon: JSX.Element;
}

const faqList: FAQItemProps[] = [
  {
    question: "Garantia de reembolso em 7 dias",
    answer: (
      <p className="text-neutral-400">
        Oferecemos 7 dias de garantia para você experimentar nossa plataforma sem riscos.
        Se não estiver satisfeito, devolvemos 100% do seu dinheiro.
      </p>
    ),
    icon: <Clock className="h-6 w-6 text-primary" />
  },
  {
    question: "Pagamentos seguros via cartão de crédito",
    answer: (
      <p className="text-neutral-400">
        Aceitamos todos os principais cartões de crédito.
        Seus dados são protegidos com criptografia de ponta a ponta.
      </p>
    ),
    icon: <CreditCard className="h-6 w-6 text-primary" />
  },
  {
    question: "Suporte dedicado",
    answer: (
      <p className="text-neutral-400">
        Nossa equipe de suporte está disponível para ajudar com qualquer problema
        ou dúvida que você possa ter.
      </p>
    ),
    icon: <LifeBuoy className="h-6 w-6 text-primary" />
  },
  {
    question: "Processamento instantâneo",
    answer: (
      <p className="text-neutral-400">
        Seus flashcards são gerados em segundos usando nossa tecnologia de IA avançada.
      </p>
    ),
    icon: <Zap className="h-6 w-6 text-primary" />
  },
  {
    question: "Privacidade e segurança",
    answer: (
      <p className="text-neutral-400">
        Seus dados e documentos são tratados com total confidencialidade e
        armazenados de forma segura.
      </p>
    ),
    icon: <Lock className="h-6 w-6 text-primary" />
  },
  {
    question: "Atualizações constantes",
    answer: (
      <p className="text-neutral-400">
        Estamos sempre melhorando nossa IA e adicionando novos recursos para
        aprimorar sua experiência de estudo.
      </p>
    ),
    icon: <Sparkles className="h-6 w-6 text-primary" />
  }
];

const FaqItem = ({ item }: { item: FAQItemProps }) => {
  const accordion = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <li className="border-b border-neutral-800 last:border-none">
      <button
        className="relative flex gap-4 items-center w-full py-6 text-base font-semibold text-left"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        aria-expanded={isOpen}
      >
        <div className="rounded-lg bg-primary/10 p-2">
          {item.icon}
        </div>
        <span className={`flex-1 text-white ${isOpen ? "text-primary" : ""}`}>
          {item.question}
        </span>
        <svg
          className={`flex-shrink-0 w-4 h-4 ml-auto fill-current text-neutral-400`}
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            y="7"
            width="16"
            height="2"
            rx="1"
            className={`transform origin-center transition duration-200 ease-out ${
              isOpen && "rotate-180"
            }`}
          />
          <rect
            y="7"
            width="16"
            height="2"
            rx="1"
            className={`transform origin-center rotate-90 transition duration-200 ease-out ${
              isOpen && "rotate-180 hidden"
            }`}
          />
        </svg>
      </button>

      <div
        ref={accordion}
        className={`transition-all duration-300 ease-in-out opacity-80 overflow-hidden`}
        style={
          isOpen
            ? { maxHeight: accordion?.current?.scrollHeight, opacity: 1 }
            : { maxHeight: 0, opacity: 0 }
        }
      >
        <div className="pb-6 leading-relaxed">{item.answer}</div>
      </div>
    </li>
  );
};

export function FAQSection() {
  return (
    <section id="faq" className="w-full mx-auto flex min-h-screen justify-center items-center">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="flex flex-col text-left basis-1/2">
            <p className="inline-block font-semibold text-primary mb-4">FAQ</p>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Perguntas Frequentes
            </h2>
            <p className="mt-4 text-lg text-neutral-400">
              Tudo que você precisa saber sobre o Keezmo
            </p>
          </div>

          <ul className="basis-1/2">
            {faqList.map((item, i) => (
              <FaqItem key={i} item={item} />
            ))}
          </ul>
        </div>
    </section>
  );
}