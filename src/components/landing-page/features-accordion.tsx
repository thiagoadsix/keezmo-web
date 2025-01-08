"use client";

import { useState, useRef } from "react";
import type { JSX } from "react";
import Image from "next/image";

interface Feature {
  title: string;
  description: string;
  type?: "video" | "image";
  path?: string;
  format?: string;
  alt?: string;
  svg?: JSX.Element;
}

const features = [
  {
    title: "Sistema de Flashcards Inteligente",
    description:
      "Envie seus materiais em PDF, e nossa IA os converte em flashcards interativos. Foco no que realmente importa, economizando tempo.",
    type: "video",
    path: "/videos/pdf-processing.webm",
    format: "video/webm",
  },
  {
    title: "IA Avançada",
    description:
      "Nossa IA analisa profundamente seus PDFs e cria flashcards otimizados para o seu aprendizado. Estude de forma objetiva e rápida.",
    type: "image",
    path: "/images/ai-analysis.jpg",
    alt: "Análise por IA",
  },
  {
    title: "Aprendizado por Repetição Espaçada",
    description:
      "Use intervalos de revisão para reforçar o que precisa de mais atenção. Retenha conhecimento por mais tempo com menos esforço.",
  },
] as Feature[];

const Item = ({
  feature,
  isOpen,
  setFeatureSelected,
}: {
  index: number;
  feature: Feature;
  isOpen: boolean;
  setFeatureSelected: () => void;
}) => {
  const accordion = useRef<HTMLDivElement | null>(null);
  const { title, description, svg } = feature;

  return (
    <li>
      <button
        className="relative flex gap-2 items-center w-full py-4 text-base font-medium text-left sm:text-lg"
        onClick={(e) => {
          e.preventDefault();
          setFeatureSelected();
        }}
        aria-expanded={isOpen}
      >
        <span className={`duration-100 ${isOpen ? "text-primary" : ""}`}>
          {svg || (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 20.25v-16.5m8.25 8.25h-16.5"
              />
            </svg>
          )}
        </span>
        <span
          className={`flex-1 text-base-content ${
            isOpen ? "text-primary font-semibold" : "text-white"
          }`}
        >
          {title}
        </span>
      </button>

      <div
        ref={accordion}
        className="transition-all duration-300 ease-in-out text-neutral-400 overflow-hidden"
        style={
          isOpen
            ? { maxHeight: accordion.current?.scrollHeight, opacity: 1 }
            : { maxHeight: 0, opacity: 0 }
        }
      >
        <div className="pb-4 leading-relaxed">{description}</div>
      </div>
    </li>
  );
};

const Media = ({ feature }: { feature: Feature }) => {
  const { type, path, format, alt } = feature;
  const style = "rounded-2xl w-full sm:w-[26rem] aspect-square";
  const size = { width: 500, height: 500 };

  if (type === "video" && path) {
    return (
      <video
        className={`${style} object-cover`}
        autoPlay
        muted
        loop
        playsInline
        controls
        width={size.width}
        height={size.height}
      >
        <source src={path} type={format} />
      </video>
    );
  }
  if (type === "image" && path) {
    return (
      <Image
        src={path}
        alt={alt || "Feature image"}
        className={`${style} object-cover`}
        width={size.width}
        height={size.height}
      />
    );
  }
  return <div className={`${style} bg-neutral-700`} />;
};

export function FeaturesAccordion() {
  const [featureSelected, setFeatureSelected] = useState<number>(0);

  return (
    <section
      className="flex min-h-screen items-center justify-center py-8"
      id="features"
    >
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        <h2 className="font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight mb-8 text-white text-center">
          Tudo o que você precisa para estudar melhor
        </h2>
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          <div className="grid grid-cols-1 items-stretch gap-6 md:gap-8 lg:grid-cols-2">
            <ul className="w-full">
              {features.map((feature, i) => (
                <Item
                  key={feature.title}
                  index={i}
                  feature={feature}
                  isOpen={featureSelected === i}
                  setFeatureSelected={() => setFeatureSelected(i)}
                />
              ))}
            </ul>
            <Media
              feature={features[featureSelected]}
              key={featureSelected}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
