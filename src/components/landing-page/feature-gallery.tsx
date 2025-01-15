"use client";

import type { JSX } from "react";
import Image from "next/image";

interface Feature {
  title: string;
  description: string;
  type?: "gif" | "image";
  path?: string;
  alt?: string;
  svg?: JSX.Element;
}

const features: Feature[] = [
  {
    title: "Sistema de Flashcards Inteligente",
    description:
      "Envie seus materiais em PDF, e nossa IA os converte em flashcards interativos. Foco no que realmente importa, economizando tempo.",
    type: "gif",
    path: "https://keezmo-public.s3.us-east-1.amazonaws.com/ai-pdf.gif",
  },
  {
    title: "Aprendizado por Repetição Espaçada",
    description:
      "Use intervalos de revisão para reforçar o que precisa de mais atenção. Retenha conhecimento por mais tempo com menos esforço.",
    type: "gif",
    path: "https://keezmo-public.s3.us-east-1.amazonaws.com/spaced-repetition.gif",
  },
  {
    title: "Visualize seus flashcards",
    description:
      "Veja seus flashcards em vários formatos, como lista, tabela ou gráfico. Escolha o formato que melhor se adapta à sua preferência de aprendizado.",
    type: "gif",
    path: "https://keezmo-public.s3.us-east-1.amazonaws.com/decks.gif",
    alt: "Visualização de flashcards",
  },
  {
    title: "Dashboard para acompanhar seu progresso",
    description:
      "Acompanhe seu progresso em tempo real com nosso dashboard. Veja quais flashcards você já estudou e quais ainda faltam para você revisar.",
    type: "gif",
    path: "https://keezmo-public.s3.us-east-1.amazonaws.com/dashboard.gif",
    alt: "Dashboard de progresso",
  },
  {
    title: "Visualize suas seções de estudos",
    description:
      "Veja suas seções de estudos e acompanhe seu progresso em cada uma delas.",
    type: "gif",
    path: "https://keezmo-public.s3.us-east-1.amazonaws.com/sections.gif",
    alt: "Visualização de seções de estudos",
  },
];

function FeatureSection({ feature, flip = false }: { feature: Feature; flip?: boolean }) {
  const { title, description, path, alt } = feature;
  return (
    <div
      className={`
        flex flex-col-reverse md:flex-row
        items-center justify-between gap-8 md:gap-12 mb-12
        ${flip ? "md:flex-row-reverse" : ""}
      `}
    >
      {/* Texto */}
      <div className="w-full md:w-1/2">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
          {title}
        </h3>
        <p className="text-neutral-400 leading-relaxed">{description}</p>
      </div>

      {/* Imagem/GIF */}
      <div className="w-full md:w-1/2 flex justify-center">
        {path ? (
          <Image
            src={path}
            alt={alt || title}
            className="rounded-xl object-cover"
            width={640}
            height={360}
          />
        ) : (
          <div className="rounded-xl w-[640px] h-[360px]" />
        )}
      </div>
    </div>
  );
}

export   function FeaturesGallery() {
  return (
    <section className="py-12 md:py-20" id="features">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        {/* Título geral da seção */}
        <h2 className="text-center font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight mb-12 text-white">
          Tudo o que você precisa para estudar melhor
        </h2>

        {/* Render de cada feature em seu "bloco" */}
        {features.map((feature, index) => (
          <FeatureSection
            key={feature.title}
            feature={feature}
            flip={index % 2 === 1} // alterna layout a cada item
          />
        ))}
      </div>
    </section>
  );
}
