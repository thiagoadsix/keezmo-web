"use client";

import { useState, useRef } from "react";
import type { JSX } from "react";
import Image from "next/image";

interface Feature {
  title: string;
  description: string;
  /**
   * Se preferir, pode unificar "gif" e "image" em um tipo só (por exemplo: "image").
   * Aqui deixamos separado para ilustrar a mudança.
   */
  type?: "gif" | "image";
  path?: string;
  alt?: string;
  svg?: JSX.Element;
}

const features = [
  {
    title: "Sistema de Flashcards Inteligente",
    description:
      "Envie seus materiais em PDF, e nossa IA os converte em flashcards interativos. Foco no que realmente importa, economizando tempo.",
    // era "video", agora usamos "gif"
    type: "gif",
    // exemplo de caminho para gif (ajuste conforme seu repositório real)
    path: "https://keezmo-public.s3.us-east-1.amazonaws.com/ai-pdf.gif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIA2OAJTS4R3PQDI5QH%2F20250114%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250114T234050Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjECgaCXVzLWVhc3QtMSJHMEUCIQDc%2FA7ddIEzK4dBXXvRTt1eGs6zhV4AWLvs%2Ft2262lvkgIgQA97Y36%2BpKJymd9zUiVyj95ti%2FmoaB5U4FjuIursuEkq6AIIIRAAGgw3MTcyNzk2OTY2NzUiDAcjJD5gtUmkn5AaxSrFAiHXw%2Fgr2NIPPdO9f2SZLnPHtDlZnwlEl%2FM9KrcnND%2FTjKT11bZfcrpJX3Grs4gYrsP2q55f8iWAat%2FYaC2C5jpkGcZY3ILnjHujlc6vE%2BiUkNbgCbE1xAQS9UOj6PYKXsBAGT5fdVsNx2K2g3EyjMU5wZrxzx5e%2B10wOfkNebiJzDIBCOYoZx6akYB7SNXndS%2BogtJuTyvHYkRTYUSWJQERKHMMPcMDI1PfRhU6pIQQAep92xQ3H7H%2BbkMKMmbyM6bwG1XL2RFssAG7QZO3j05oNT0tyB3RsMSv2mXIgTlZ9D9uyWJqm2z7tCfGffcoIuPnjcBFeMaX5vyqZMoZdhHiKbofOD7z7k5gWyS%2FBUFc2vUFPYv7Zgb2OvLqcUPj%2Bg3uZfGsZ%2BCwAYs1kYo9TcOMTY4yX06jNYEAjeNFZU71qj5z6bww6%2BibvAY6swL4h6U1f8ceaDUR5T60NkfxhqRDcyfmvyFV2hG9TYOHWtJMIJQzlL%2BYB%2FYkZ5mVtDiaVmvyYAbnLrYneWIBjAmYbYMuP6QoVwMqBJjPpdXUg9PCiZlu7ykkmxEYOxKj7EkUx06m01WdWmLMwhIqUJPBkFClw3JaAl1BNFVr%2B2CgQbmL%2BtYADqnQedQjjVy%2BsCbyfslRktNlCOOz6%2FDBdgJNea1CqTivkNvqjiqA1ocx8tKQK3qVBnAojk7yZIKh9YJKGXJIvzyZoJpGU8%2B3bZx1VGMnvC0pUNLSQ65Lw5OlG1kDzV8vdmY1rKJRWlFlkRQ3wIMFH1qafSApUMuVGAnOem5xM8vyX7Q6VRxnDCSGMc8suRGns7l2oqjN3YfO3gXN%2B57fpGlV5Ju1s9IgAYQMH6mA&X-Amz-Signature=daf3de6e41d55d6d753a884e42aa3514d3d17a02dfc8e4a248c4a3978b28db24&X-Amz-SignedHeaders=host&response-content-disposition=inline",
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
    type: "gif",
    path: "https://keezmo-public.s3.us-east-1.amazonaws.com/spaced-repetition.gif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIA2OAJTS4R2ENEIBS7/20250114/us-east-1/s3/aws4_request&X-Amz-Date=20250114T234631Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjECgaCXVzLWVhc3QtMSJIMEYCIQDPk/BMZbKgXAVybq8Hv2fLpWz0V34+RVlLz665Wa937AIhAJShxd7/GgUZaE3ttEPrJ3iNN/tXSkFNrJIqZrc9hl2lKugCCCEQABoMNzE3Mjc5Njk2Njc1IgyVhbKVPwcEesWqDLQqxQIPKY+fQLEf63Ru3lzhC4UiqnhiCxKUPQn7KnRNJrS23jqV914qHpa3KN78IN/TbLi012tC9sPlk12zZeFcORGbRD3lV3NCTSg1kyl/sIXs3fwUdnzRncJKF28GCnsO88C2wRU1XphnPd0qd9YF7lEXFVh/bZw18FPAKkPIBPuPZxck7CN6PW1vDzkiW1czLDB8/wymSvUE3cT5kmWNOHvpcvCT/+DUd0VWc/vaXHaHxohSd1VofLPPEl0PBrMRSABlbQeLcySlwalZsGvwzRjmt2R4eOeAQQ5/42prVVxOmifXpabuRAxmOPO2sSzy5POhsvCitIrdaWV7hiiibiatgnfHfavc0r4fjvERayTRgavNTO6qeu5GXkz1IzwoEW8L+oZWaj73tRUdocrtuBP3swZae34dFVvf4qP3dBCgzf/JNWW8MOvom7wGOrICZwwz0Ihg6uvTjHDOhNxSZ1k69Q5qI69oaNpgPUNJe5Fyhz2B3vI70lYm2/oN3rbDM+Mr7ZGGa4WIT8UiG+sYarR5DxJVBMQwCAWlazD1sWZWzr5jf0uhGXKow4wA0BTGpmYINAqoyuFXqvpFp1yehRWSziOx10JgCrCc/0BDv+17E4T+kwaXVjgIeoEHHO0RrLUofsFvWDgCFn6d3bSrAPmHgFHhvXSb3mNnnVcfUFM2i9JvoQhDW6rd/aGKRdn+vNLVajyxPuwiEeFbNt/2Vt+DU2p8pWSip2R97EH+bPFpYJZ1htdOypX5ppdojyKAKUaI9fqH/mjPs93AFtVktN7mQpoFZEyj5GC3HfBoc7RH9kfcDqJMjThNax2pJ4g2BJsWkfNZWgmp6vKmOyNSzjVK&X-Amz-Signature=6108cdfc8502278a3524090fe75b96f33566127e5ab4b3f81ee8606847a3222d&X-Amz-SignedHeaders=host&response-content-disposition=inline",
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
  const { type, path, alt } = feature;
  const style = "rounded-2xl w-full sm:w-[26rem]";
  const size = { width: 640, height: 360 };

  /**
   * Removemos completamente a lógica de <video>.
   * Agora só tratamos imagem/gif de forma unificada.
   */
  if ((type === "image" || type === "gif") && path) {
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

  // Caso não tenha `path` ou `type`, retornamos um fallback
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
            <Media feature={features[featureSelected]} key={featureSelected} />
          </div>
        </div>
      </div>
    </section>
  );
}
