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
    path: "https://keezmo-public.s3.us-east-1.amazonaws.com/ai-pdf.gif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIA2OAJTS4R3PQDI5QH%2F20250114%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250114T234050Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjECgaCXVzLWVhc3QtMSJHMEUCIQDc%2FA7ddIEzK4dBXXvRTt1eGs6zhV4AWLvs%2Ft2262lvkgIgQA97Y36%2BpKJymd9zUiVyj95ti%2FmoaB5U4FjuIursuEkq6AIIIRAAGgw3MTcyNzk2OTY2NzUiDAcjJD5gtUmkn5AaxSrFAiHXw%2Fgr2NIPPdO9f2SZLnPHtDlZnwlEl%2FM9KrcnND%2FTjKT11bZfcrpJX3Grs4gYrsP2q55f8iWAat%2FYaC2C5jpkGcZY3ILnjHujlc6vE%2BiUkNbgCbE1xAQS9UOj6PYKXsBAGT5fdVsNx2K2g3EyjMU5wZrxzx5e%2B10wOfkNebiJzDIBCOYoZx6akYB7SNXndS%2BogtJuTyvHYkRTYUSWJQERKHMMPcMDI1PfRhU6pIQQAep92xQ3H7H%2BbkMKMmbyM6bwG1XL2RFssAG7QZO3j05oNT0tyB3RsMSv2mXIgTlZ9D9uyWJqm2z7tCfGffcoIuPnjcBFeMaX5vyqZMoZdhHiKbofOD7z7k5gWyS%2FBUFc2vUFPYv7Zgb2OvLqcUPj%2Bg3uZfGsZ%2BCwAYs1kYo9TcOMTY4yX06jNYEAjeNFZU71qj5z6bww6%2BibvAY6swL4h6U1f8ceaDUR5T60NkfxhqRDcyfmvyFV2hG9TYOHWtJMIJQzlL%2BYB%2FYkZ5mVtDiaVmvyYAbnLrYneWIBjAmYbYMuP6QoVwMqBJjPpdXUg9PCiZlu7ykkmxEYOxKj7EkUx06m01WdWmLMwhIqUJPBkFClw3JaAl1BNFVr%2B2CgQbmL%2BtYADqnQedQjjVy%2BsCbyfslRktNlCOOz6%2FDBdgJNea1CqTivkNvqjiqA1ocx8tKQK3qVBnAojk7yZIKh9YJKGXJIvzyZoJpGU8%2B3bZx1VGMnvC0pUNLSQ65Lw5OlG1kDzV8vdmY1rKJRWlFlkRQ3wIMFH1qafSApUMuVGAnOem5xM8vyX7Q6VRxnDCSGMc8suRGns7l2oqjN3YfO3gXN%2B57fpGlV5Ju1s9IgAYQMH6mA&X-Amz-Signature=daf3de6e41d55d6d753a884e42aa3514d3d17a02dfc8e4a248c4a3978b28db24&X-Amz-SignedHeaders=host&response-content-disposition=inline",
  },
  {
    title: "Aprendizado por Repetição Espaçada",
    description:
      "Use intervalos de revisão para reforçar o que precisa de mais atenção. Retenha conhecimento por mais tempo com menos esforço.",
    type: "gif",
    path: "https://keezmo-public.s3.us-east-1.amazonaws.com/spaced-repetition.gif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIA2OAJTS4R2ENEIBS7/20250114/us-east-1/s3/aws4_request&X-Amz-Date=20250114T234631Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjECgaCXVzLWVhc3QtMSJIMEYCIQDPk/BMZbKgXAVybq8Hv2fLpWz0V34+RVlLz665Wa937AIhAJShxd7/GgUZaE3ttEPrJ3iNN/tXSkFNrJIqZrc9hl2lKugCCCEQABoMNzE3Mjc5Njk2Njc1IgyVhbKVPwcEesWqDLQqxQIPKY+fQLEf63Ru3lzhC4UiqnhiCxKUPQn7KnRNJrS23jqV914qHpa3KN78IN/TbLi012tC9sPlk12zZeFcORGbRD3lV3NCTSg1kyl/sIXs3fwUdnzRncJKF28GCnsO88C2wRU1XphnPd0qd9YF7lEXFVh/bZw18FPAKkPIBPuPZxck7CN6PW1vDzkiW1czLDB8/wymSvUE3cT5kmWNOHvpcvCT/+DUd0VWc/vaXHaHxohSd1VofLPPEl0PBrMRSABlbQeLcySlwalZsGvwzRjmt2R4eOeAQQ5/42prVVxOmifXpabuRAxmOPO2sSzy5POhsvCitIrdaWV7hiiibiatgnfHfavc0r4fjvERayTRgavNTO6qeu5GXkz1IzwoEW8L+oZWaj73tRUdocrtuBP3swZae34dFVvf4qP3dBCgzf/JNWW8MOvom7wGOrICZwwz0Ihg6uvTjHDOhNxSZ1k69Q5qI69oaNpgPUNJe5Fyhz2B3vI70lYm2/oN3rbDM+Mr7ZGGa4WIT8UiG+sYarR5DxJVBMQwCAWlazD1sWZWzr5jf0uhGXKow4wA0BTGpmYINAqoyuFXqvpFp1yehRWSziOx10JgCrCc/0BDv+17E4T+kwaXVjgIeoEHHO0RrLUofsFvWDgCFn6d3bSrAPmHgFHhvXSb3mNnnVcfUFM2i9JvoQhDW6rd/aGKRdn+vNLVajyxPuwiEeFbNt/2Vt+DU2p8pWSip2R97EH+bPFpYJZ1htdOypX5ppdojyKAKUaI9fqH/mjPs93AFtVktN7mQpoFZEyj5GC3HfBoc7RH9kfcDqJMjThNax2pJ4g2BJsWkfNZWgmp6vKmOyNSzjVK&X-Amz-Signature=6108cdfc8502278a3524090fe75b96f33566127e5ab4b3f81ee8606847a3222d&X-Amz-SignedHeaders=host&response-content-disposition=inline",
  },
  {
    title: "Visualize seus flashcards",
    description:
      "Veja seus flashcards em vários formatos, como lista, tabela ou gráfico. Escolha o formato que melhor se adapta à sua preferência de aprendizado.",
    type: "gif",
    path: "https://keezmo-public.s3.us-east-1.amazonaws.com/decks.gif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIA2OAJTS4R2YDMBCFB/20250114/us-east-1/s3/aws4_request&X-Amz-Date=20250114T234523Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjECgaCXVzLWVhc3QtMSJGMEQCIEhJPPAmjRkUFV32Yb1CWMK5J4tZaC7RLMGaOgaNs9soAiAzGYLxOplPHrwgpuRERmtqyvkTdp4jBVZidyrbb+eqkCroAgghEAAaDDcxNzI3OTY5NjY3NSIM5amZ3ALcJYZJ0yd+KsUCCFA1z2fd3OaSoczAvhIrI8+GrcAG9qH7bwlS2GdvWbhqmmbhinL0Iap9xdNu8CGJLjdG4aE0guITwPtkrfUGA101TiMGg0FWH8JhDf7xTElBHZvRDE/ZR2aQRy7wOuYT5HJExhyzUKwNGXILHipRW9EhsU1PPVMJEdOg4b/yx/Pnwk5TZw9ueeV22fNgcEFagk17hVY3JEHH2aExMUbAMV2jeTP3GqCe17CIBN91VEFGHgLhVcqMlZNEdIzB+mhobZaFRao9lFVcObft34S78qFeVHDCb0wuyOHBTBiBsVhA0ozIHEPvaIZ4FG0Fl4AFpBOeArXNMgNmkrBslU21TvhdmoRQ1iw4bTo2XNBtl6nuheGQqCeM/OUj8CvMSymtefZYfx55fR/PuWYNrAxt0CrA2KmPkMdymeAjPEuJiRVT1LDVRDDr6Ju8Bjq0AqWYdHgJkMs/NoPj1ATUpmrIvuMyedpNCw2EYtj7BR4KahpxSca6pjdwm3iQWPjgIuRGh9TlQaLEtfg/9zoHDDMsgdbNgzJC7XwPxvFsmXwMyI6doannJEzUMtcJYD+lX0Nftcjs3cjJHjc79gz8AThT/3qAxkvDq6vywwVTngorxv1+bIycrFX5afEDbpnL7LCtXovwDLFLFaKGJ11w44wVmhVTSAid4O85ygIRJ2JvbxAGY64JVY5aE/o65qH65F8Ot5SETJ41LHEOL8iyBnGxgounl+UHq1zhcdwNoGNSTALtMhmSVEbyJuqoSDW+JJQs6QOKTjCcXBdyy+uuypb7bknsXq2DgvZKNQmNqkLKeH4XU6DChgSKL1NOUEz0N7nalqQqGnkCEAr7El0/i3NKmbvH&X-Amz-Signature=a5765cbeb2c546c951cca0230890bb208c205eb212d0f5cb467d7c7bb267f824&X-Amz-SignedHeaders=host&response-content-disposition=inline",
    alt: "Visualização de flashcards",
  },
  {
    title: "Dashboard para acompanhar seu progresso",
    description:
      "Acompanhe seu progresso em tempo real com nosso dashboard. Veja quais flashcards você já estudou e quais ainda faltam para você revisar.",
    type: "gif",
    path: "https://keezmo-public.s3.us-east-1.amazonaws.com/dashboard.gif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIA2OAJTS4RZ7BA3JVN/20250114/us-east-1/s3/aws4_request&X-Amz-Date=20250114T234334Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjECgaCXVzLWVhc3QtMSJIMEYCIQC1u+D9UDkDDYFYqyhjQshud1thxOK1IA9UqXXegTaBfAIhAMpVAgBJxjBzgYXD6wVExtZGDiI8cKFIf0FNhRsY1RwxKugCCCEQABoMNzE3Mjc5Njk2Njc1Igxo46kJs94d7obtFSEqxQJF2ET1Kg11bJ1uK3foB7ejiu53n1/Ruq1NbrTbnOyAsc4+MHESpaC5oUjDbfS/9db7zlKDZI5SE6awMMg7PJHTnz7PwG88fGxSc0wUy5+Wub6FhadeX3gm1O5j0Q6QYBHUyzJUtSfXrlRTSbGp2Uekdnyr/jTlGUBpK6NIKJhbyg/MGqLryWgrZTUR13fIMHdOtlF2MZV4OgYPeMlqZKTubZc/yZN5bqkEhNYuu6cAmURR9YcnfnsOSpA1F45JF0HFmembGddqhSY7A+2dmZLBQrDBSGMdqNeukNmQn+uZAr9sEa1QyafNrkZoNNJqfDjZzZY4j2pdGfKUhKDwRmA1UsG4a6SVcZOgKeIteszbxyl4s43dFT8EAmph/b/E3Exoku7+cLb3y0XlKu2rN6EUZUofuvQf2dzmlFJ/3vd1r/vRxCakMOvom7wGOrICUvNjRM90Qwwp/p/FPSPHgqoPZb/ICAsMaAw8VTMrjokHeTpO+R53jcjgy0mRsPTZhK2do2pdns7XPsupbED9KG47OVEaSLk2nZfV0zlkC0lRCLrwfCgj2URm2X8UeTJGknmAsaC3Kln3Ci/o7xBqRr61pwYwco7At8AaOgJPsiRysPhKf2srU8BgPxHu/+hWQF5bqUwZf9BnZg+xkZLYTBeIor8iBZ63p3IJTFh/AHY1p4cv0s0Csy71oxnDy9Fdghc+xkuE9E/5rwhYVUMMqhx+HxqYVdqYqTPLNBFEjHthBQJzXV5+BL6eMT87aiNZHolsf3YJ5SesmVt+VgfB36Me74q2McklZeHIjRAbv3BKco9+YHTI0sYuWsD0A79YLoonRqJg+JnpiHDOEqE8FTTR&X-Amz-Signature=5c6278b30444fa66ae9d36f6d01db1b262309f8b4fdf0251d9420c4a125d0f72&X-Amz-SignedHeaders=host&response-content-disposition=inline",
    alt: "Dashboard de progresso",
  },
  {
    title: "Visualize suas seções de estudos",
    description:
      "Veja suas seções de estudos e acompanhe seu progresso em cada uma delas.",
    type: "gif",
    path: "https://keezmo-public.s3.us-east-1.amazonaws.com/sections.gif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIA2OAJTS4RVPFGSMVT/20250114/us-east-1/s3/aws4_request&X-Amz-Date=20250114T234601Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjECgaCXVzLWVhc3QtMSJHMEUCIGL6XT9CCYa5cHI8+uB//x5M66xQmu/g5ic+SuoAjPhRAiEAojvxiMkIE2ttXg3GuLmZPhJ5EBIu6pVNS5gIo2IVuzkq6AIIIRAAGgw3MTcyNzk2OTY2NzUiDFm5E/h5IdFI0OCCbSrFAk7pkq5Z0Syu9YsuZcVqmzXpVaMyu1LS6wm7z2OSzcIaksWLhRdOEYBIrvcU/14iDNdJXKBJ8tiiECyx39Bn6q0TeihpnN3Lxn2htZI2ZQLEd06GPh+c9nBPaKLi3EYudVMB1vg0iuCFbzQHyecwok9CWzUyltcuiZcE2xnkPnD7DEoWxWOhvOLGkYerDoKycXLtog5RYlGtGb6ZfHZr1YFQSgHkrUqBbHSgL7rWYbaodsLfsiLgHjIgOrM3qCturODqiMNFE85fbgHYVxyQ8boj+HqYJB2F2eYWK0Y1CVb9iDnL+0zKgDwRVcroB55sCP4fNR9WSU5wLABkq23OFABNhKrxoVpUImRWn19ffwTSfXC6uLT8De2XfgcX/iUygNt+C6/SlHZUze6Psh8nFE0tu5J+9E0rVEX0l3nLB+nkImMN8/ow6+ibvAY6swJsbDVKkNoVlPBNOSzRGURV6fC5DKCcskg+DkSwMXL6TTWmEw8tBZbqxkVC1L6aIdh+dmbyuX9EXgAltvQtgbkUuRPlanMr7yypwrWpZR3+tLiUp5lVIlR5DKSMGTPryMT9cE/MOJShJ8He8ZRL6NnuZiTtVsZ5xWxIApKk55krhOUPDrIoLGCaMWVPpJQNO/JsTSNAWlwG4puJML0MvVymgu7Lm20N6TATej0bTiC85YJQLlKnUPTpsrVLi66FIZz96wh75RsmHiofMuoPDxtQsizdJ/w6FGlpXbqFj7iMNMHuLR4FjJ/eBmPtOew1BVvNyhtrB05PN6Q/jIDcaH/aBupkDMWFNIrKmco2ir2ZilL1drUAGBGiV9Ckwh6w5T2ptCupFeOzlhcMIqiUDu+bmoYl&X-Amz-Signature=b662955d63bc94e234c62eb744e9563ce1d72396be27b03f05fa41bcd4d6c212&X-Amz-SignedHeaders=host&response-content-disposition=inline",
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
