"use client";

import type { JSX } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

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
    title: "Dashboard para acompanhar seu progresso",
    description:
      "Acompanhe seu progresso em tempo real com nosso dashboard. Veja quais flashcards você já estudou e quais ainda faltam para você revisar.",
    type: "gif",
    path: "https://keezmo-public.s3.us-east-1.amazonaws.com/dashboard.gif",
    alt: "Dashboard de progresso",
  },
];

function FeatureSection({ feature }: { feature: Feature }) {
  const { title, description, path, alt } = feature;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const section = document.getElementById(feature.title);
      if (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.75) {
          setIsVisible(true);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [feature.title]);

  return (
    <motion.div
      id={feature.title}
      initial={{ opacity: 0, y: 50 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="flex flex-col items-center justify-center min-h-screen text-center"
    >
      <div className="max-w-3xl">
        <h3 className="text-4xl font-extrabold text-white mb-6">{title}</h3>
        <p className="text-neutral-400 text-lg leading-relaxed mb-8">{description}</p>
      </div>
      <div className="w-full flex justify-center">
        {path ? (
          <Image
            src={path}
            alt={alt || title}
            className="rounded-xl object-cover"
            width={800}
            height={450}
          />
        ) : (
          <div className="rounded-xl w-[800px] h-[450px] bg-gray-800" />
        )}
      </div>
    </motion.div>
  );
}

export function FeaturesGallery() {
  return (
    <section id="features">
      {features.map((feature) => (
        <FeatureSection key={feature.title} feature={feature} />
      ))}
    </section>
  );
}
