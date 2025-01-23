"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
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
        Experimente a plataforma sem riscos. Se não gostar, devolvemos seu dinheiro.
      </p>
    ),
    icon: <Clock className="h-6 w-6 text-primary" />,
  },
  {
    question: "Pagamentos seguros",
    answer: (
      <p className="text-neutral-400">
        Aceitamos cartões de crédito e usamos criptografia para proteger seus dados.
      </p>
    ),
    icon: <CreditCard className="h-6 w-6 text-primary" />,
  },
  {
    question: "Suporte dedicado",
    answer: (
      <p className="text-neutral-400">
        Conte com nossa equipe para tirar dúvidas e resolver problemas rapidamente.
      </p>
    ),
    icon: <LifeBuoy className="h-6 w-6 text-primary" />,
  },
  {
    question: "Processamento instantâneo",
    answer: (
      <p className="text-neutral-400">
        Seus flashcards são gerados em poucos segundos com IA de última geração.
      </p>
    ),
    icon: <Zap className="h-6 w-6 text-primary" />,
  },
  {
    question: "Privacidade e segurança",
    answer: (
      <p className="text-neutral-400">
        Seus dados e documentos são armazenados de forma segura e totalmente confidencial.
      </p>
    ),
    icon: <Lock className="h-6 w-6 text-primary" />,
  },
  {
    question: "Atualizações constantes",
    answer: (
      <p className="text-neutral-400">
        Nosso sistema está em constante evolução para melhorar sua experiência.
      </p>
    ),
    icon: <Sparkles className="h-6 w-6 text-primary" />,
  },
  {
    question: "Geração rápida de flashcards",
    answer: (
      <p className="text-neutral-400">
        Converta PDFs em flashcards interativos em minutos e foque no que importa.
      </p>
    ),
    icon: <Zap className="h-6 w-6 text-primary" />,
  },
  {
    question: "Retenção de longo prazo",
    answer: (
      <p className="text-neutral-400">
        Reter conhecimento é fácil com nosso sistema de repetição espaçada.
      </p>
    ),
    icon: <Clock className="h-6 w-6 text-primary" />,
  },
];

const FaqItem = ({ item }: { item: FAQItemProps }) => {
  const accordion = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <li className="border-b border-neutral-800 last:border-none">
      <button
        className="relative flex gap-4 items-center w-full py-4 text-base font-semibold text-left"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        aria-expanded={isOpen}
      >
        <div className="rounded-lg bg-primary/10 p-2">{item.icon}</div>
        <span className={`flex-1 text-white ${isOpen ? "text-primary" : ""}`}>
          {item.question}
        </span>
      </button>
      <div
        ref={accordion}
        className="transition-all duration-300 ease-in-out opacity-80 overflow-hidden"
        style={
          isOpen
            ? { maxHeight: accordion?.current?.scrollHeight, opacity: 1 }
            : { maxHeight: 0, opacity: 0 }
        }
      >
        <div className="pb-4 leading-relaxed">{item.answer}</div>
      </div>
    </li>
  );
};

export function FAQSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const section = document.getElementById("faq");
      if (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.75) {
          setIsVisible(true);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.section
      id="faq"
      className="w-full mx-auto flex min-h-screen justify-center items-center py-8"
      initial={{ opacity: 0, y: 50 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-screen-xl px-4 md:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col text-left md:w-1/2 space-y-4">
            <p className="inline-block font-semibold text-primary">FAQ</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Perguntas Frequentes
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-neutral-400">
              Saiba como o Keezmo pode transformar sua forma de estudar
              com flashcards gerados instantaneamente.
            </p>
          </div>

          <ul className="md:w-1/2 space-y-2">
            {faqList.map((item, i) => (
              <FaqItem key={i} item={item} />
            ))}
          </ul>
        </div>
      </div>
    </motion.section>
  );
}
