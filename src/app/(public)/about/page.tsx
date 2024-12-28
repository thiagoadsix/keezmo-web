"use client";

import { Button } from "@/src/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-800 bg-background/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-2xl font-bold text-transparent">
              Keezmo
            </span>
          </Link>
        </div>
      </header>

      <section className="pt-20 py-16 md:py-32 bg-background text-neutral-200">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          {/* Heading Section */}
          <header className="mb-16 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
              Sobre o Keezmo
            </h1>
            <p className="mt-4 text-lg md:text-xl text-neutral-400">
              A jornada, as motivações e os valores por trás de uma plataforma que está
              transformando o aprendizado.
            </p>
          </header>

          {/* Story Section */}
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <Image
                src="/images/idea.jpg"
                alt="Idea"
                width={500}
                height={500}
                className="rounded-lg object-cover shadow-lg"
              />
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white">A Ideia</h2>
                <p className="mt-4 leading-relaxed text-neutral-400">
                  O Keezmo nasceu da frustração de tentar reter informações importantes em um
                  mundo inundado por conteúdo. Percebemos que estudantes e profissionais de
                  diversas áreas enfrentavam o mesmo desafio: organizar, priorizar e aprender
                  de maneira eficiente.
                </p>
                <p className="mt-4 leading-relaxed text-neutral-400">
                  Inspirados pelas ferramentas tradicionais de flashcards, decidimos criar algo
                  inovador, utilizando inteligência artificial para eliminar o trabalho manual e
                  tornar o aprendizado mais inteligente e acessível.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse md:flex-row gap-12 items-center">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white">Nossas Motivações</h2>
                <p className="mt-4 leading-relaxed text-neutral-400">
                  Acreditamos que o aprendizado é um direito universal e que todos merecem
                  ferramentas poderosas para alcançar seus objetivos. Nossa equipe é movida pelo
                  desejo de empoderar estudantes, profissionais e qualquer pessoa que busque
                  expandir seus conhecimentos.
                </p>
                <p className="mt-4 leading-relaxed text-neutral-400">
                  Cada funcionalidade do Keezmo é projetada com o usuário em mente. Queremos que
                  você alcance mais, com menos esforço e de forma mais eficiente.
                </p>
              </div>
              <Image
                src="/images/motivation.jpg"
                alt="Motivations"
                width={500}
                height={500}
                className="rounded-lg object-cover shadow-lg"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-12 items-center">
              <Image
                src="/images/values.jpg"
                alt="Values"
                width={500}
                height={500}
                className="rounded-lg object-cover shadow-lg"
              />
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white">Nossos Valores</h2>
                <ul className="mt-4 space-y-4 text-neutral-400">
                  <li>
                    <strong className="text-white">Inovação:</strong> Sempre buscamos novas
                    maneiras de melhorar o aprendizado, utilizando as tecnologias mais avançadas.
                  </li>
                  <li>
                    <strong className="text-white">Acessibilidade:</strong> Tornar nossas
                    ferramentas úteis e acessíveis para pessoas de todos os níveis de conhecimento.
                  </li>
                  <li>
                    <strong className="text-white">Excelência:</strong> Cada detalhe importa.
                    Nos dedicamos a criar uma experiência impecável e impactante.
                  </li>
                  <li>
                    <strong className="text-white">Colaboração:</strong> Valorizamos o feedback
                    de nossos usuários e buscamos construir soluções juntos.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <h2 className="text-4xl font-bold text-white">Pronto para Transformar seu Aprendizado?</h2>
            <p className="mt-4 text-lg text-neutral-400">
              Junte-se a milhares de pessoas que estão aprendendo mais e alcançando seus objetivos
              com o Keezmo.
            </p>
            <div className="mt-8">
              <Button asChild>
                <Link href="/#plans" className="inline-block px-8 py-4 bg-primary text-lg font-bold rounded-lg shadow-lg hover:bg-primary-dark">
                  Começar Agora
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
