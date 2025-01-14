"use client";

import * as React from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/src/components/ui/carousel";

const screenshots = [
  "https://keezmo-public.s3.us-east-1.amazonaws.com/dashboard.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIA2OAJTS4RSKEV5LPM/20250114/us-east-1/s3/aws4_request&X-Amz-Date=20250114T234405Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjECgaCXVzLWVhc3QtMSJGMEQCIE+8Kgr0rGWlGVEUVCs286g3ryKMDrOF1DhiGyYKkFn6AiBZaJPiU2ntXhUqEVvqqeSR0VStwp9fYpmHoaNIgm7n+CroAgghEAAaDDcxNzI3OTY5NjY3NSIMqtMBllrXJDJZRcLsKsUCutlNqQmhon6fN2MnSVT0uV9rppw+kKKWhbVZUkY9QGBMufv1KyZgykL55z414hS4XHKMGilQVq+n1JHUsVQi79ZmpUdAIqJJ24ii4w1Ut9pjHtsupbQ2goY+qidUdHJ5di7/+F49crn5EIGQ1NcnVdUMx0I4wvQy6DMuDtIvIcX/X+Z2gu+f5ue8QTGiHYGBRkgkU9YVVqUqyTiNQsdyMyhINUHMxJtlQCS7Cj2GNT5t16Y5zp+/bfKrcKrnSDG76LQHs2ixbqgBXI90nDtzQmkdGUvSwk8dlANvV7Tlzgp9NefXJIOYhWCbl6MLYIXly70Hx3p5LQOCd/bf34AV1EvEURJIBhOxkfHpHDHbwrxptBe03eGAAv1oh3dQXpXhGsQ5sN61Vuz4/KsCMfQnYGH6ZtK3VQqKYTAOzA/dHzIGG4yGpzDr6Ju8Bjq0AthS3UqVO4/cMVdfYM73Eu6qm8aai0aDSnlIAd1emwvgHpNZK07DO3HDo7FRn3wzXJID/boY19B+RL/noJ1OkMxGHvwBsD+x+4Uvaquuxt8gFAy65GsMaiHaYsM0Q6sH618kBPF6BEw3YXa6dq297pb5bIpjQ0GN/UFGO5HWRc5q6rpUiDELXWglH1TcEJcSnKzQBmEaedCLjf6CzaQLChbLWJTIvpPayXfg6cKM9ZKF/nnsxo1jlZj/ssArxCMOZa8wk6dhL+CGnZSq9PDrBVWYw7upiRsozS3RTXrt7ReM3aExquLwIMWzAtDn+qer7jrQnnz3TT3mugICHKneFYtRMDGIAOrPh+XgIRbqv0eyFizUd2QaJMjtL0deBzewkAEzocE8Ee6VoJfKfjP61ziIUpAm&X-Amz-Signature=088d10c62b629f8cdc7d895549af0ac4829e7dd5749e6f4cce5cab8262d9364a&X-Amz-SignedHeaders=host&response-content-disposition=inline",
  "https://keezmo-public.s3.us-east-1.amazonaws.com/decks-creation.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIA2OAJTS4RYVPA5V7C/20250114/us-east-1/s3/aws4_request&X-Amz-Date=20250114T234441Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjECgaCXVzLWVhc3QtMSJIMEYCIQDIJKEiar5R/tD/G4UrvB07KqRrWAbF3eYtZZtH6yIiawIhAJkEU8UBrCJbARTjCFZcWsY+BZ3wxY3NSiRh/0/ku+nQKugCCCEQABoMNzE3Mjc5Njk2Njc1IgxHTmZlJePy11ye5Y8qxQIQi7OVZZAONaES9h7nYAYham0SJmZmUcqZcjUhMOvGQ2dEnPnhCh0ii/hI4mZBLwgbW5UfWv+ptuW66Yiwkjrfz2Y+jVF7OuF6rReAEzRcz5FnB2Za5aW7JzTYhXNP2HMYcw2YWToRqIr7tIrCuAn6FQSReLKpEhHMQ3JQ5pkDh+OV6azFKjqT3F5TGhGglfHp8jlrJ3holN/eAzfKdyNFaDC07WQiezRJY23xqQRV2Os6a96szqjeOw4xS/8FKlPS+pQEjX5sz3ILIQplSE4la2ClC6fO8D1fYGxxoN37Dzkv/cDbjI4/PjuLoC+i7WhTN1YvZ9ktr1eWSFryfWvzdCRff2TnYBt9hjomtyvYNm+N1J2Blx/ssTYLiwmrodUbtHdNUKNOZfWYsg1sKGDRjFTeRroQ+XYCNYw4PvVuFRv9W1mpMOvom7wGOrICaO8/Je7InDMPOzgbRK6u7s0jjE/2OeLaSnropgShG9MNwy+SltJWYFebqnFD42H6JUOIvVhf/CZ8Bns/OeP8sfGVxB2GkM0n3/RFairY5iIk0nptjW6SYo0hS2Rpc8pfyldZx9Bd2wkYUAl7bXJ7vm1TFOjYU2Cha0eaYWJMaqutYV9vllj4Fl5qiy61AV1/l23WoFJ0/eM7NXx/VbApvMX4r77GaD8wpYDfVDSsIalnYn2zMc2quvXvOp4u/tAlczCpZrYSsbSGc48wimip+4xTXyFUCxp3oploDLZQIrWIO4i1ZffPkhdAFftmDREezzDxHal+C0hLHHidxgSSuB5xdO67HyHQ51GXfE3u4Q6wex8T8PVsV9gTuPXAsT+8LyGoLnR+/dJKWbMP0Lq//OQ3&X-Amz-Signature=5cbf07c039e964907c82291e202f0d04def56dca07af7fde347e8eea192d6eea&X-Amz-SignedHeaders=host&response-content-disposition=inline",
  "https://keezmo-public.s3.us-east-1.amazonaws.com/study-mode.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIA2OAJTS4R2XTEB62E/20250114/us-east-1/s3/aws4_request&X-Amz-Date=20250114T234701Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjECgaCXVzLWVhc3QtMSJHMEUCIFQLNSeT7unevzpBJXW9PjfN2CQbgwrLZo32vxnBbomUAiEA5T/hD6umUz99kDCTkV+j5mRFGIolQlW996VvD+MdPaoq6AIIIRAAGgw3MTcyNzk2OTY2NzUiDO4Ll2vlSIxZzCPBfirFAjcAsODqD43U8ohAQrPwCiD+V5fafqffGv+j60MdDJ25GtkD2AYo5mWj6jdZwS0TOC2tRvzbW34FDG2HCY3ASH7fmN/wRV0XEbB1J0o+WE5GJL9AAYH0T5vY1Or3OQsRDPvc++WSq6Spem/AAqnhLue0b8wPJfIgtGDM1VG5X599LdbCPM52KfUahRKVN5A0WXEPq8AE5ltBnSj8ZemxD4HyyqX441DkkfiIiSaZDFjr3F7Fw5VF/EbCjw6HOC/HbDT9f5mHmcTcakqT6FqJub/qYiZi4q1cL+T1cIsQjyF8cbmbm5t5iFU6uRiBR7hv/duHMfOHZFQxXa4Cskthvx8DAyRV2LXfX6IjZHaf9wW1Yr5NuQRImTofZX/PSY/+CWSV+o9lkg0+tI/8OceHMEMYgbNJzHbrz++I3ic0OOuYWsfc6Pww6+ibvAY6swLYKaICndzg0zi+Nzwt5++wrtq3apPPR9WGbMwpCmfMyaz/+TmWc37eJCT9xHsAPUeyTb3MP18F6dUhg1/7skvkYAhXEnazQ6iZvV8/a4pyz3uhE8xjxmgt1MxXMRlmzxVids8hBo+PrPYAXuEsPxlN58nVHbaBmuZTOKBzVtiH75a7+vDyApHwUX3t7VpRh1UoGR50hzTN6HAkj/l1dqa6ow4k1hqUrJleIxjTLQX5lU8qtdzktWpmDF6ujA1dZyvHYdq+9Ndhq+m8kFDkfQ+kif5jrhw6CpFIUuFVIXTm2O+H7f2lZCMqACxICHi1nUqvYW29zg2reBqU0j7nn8gea1nxdSqtRbhJrVSZHC8qcBrpKzuf8DIKO62PkpNKtTWfRVh8GvXXpxzA+UjXLV5XwmAO&X-Amz-Signature=9f3744d4308af85353948e4fd0bf4bfec0c230e44afe6d093b198bcf94576d94&X-Amz-SignedHeaders=host&response-content-disposition=inline",
];

export function JourneySection() {
  return (
    <section
      id="journey"
      className="flex min-h-screen flex-col items-center justify-center bg-background px-4 md:px-8 py-8"
    >
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white text-center">
        Comece sua jornada de estudos agora
      </h2>
      <p className="mt-4 max-w-2xl text-center text-sm sm:text-base md:text-lg text-neutral-400 leading-relaxed">
        Organize seus materiais, crie flashcards em segundos e estude de forma
        estratégica com a ajuda da IA.
      </p>

      {/* Carousel */}
      <div className="mt-8 w-full max-w-3xl">
        <Carousel
          className="w-full"
          opts={{ loop: true }}
          plugins={[
            Autoplay({
              delay: 4000,
            }),
          ]}
        >
          <CarouselContent>
            {screenshots.map((src, index) => (
              <CarouselItem key={index}>
                <Image
                  src={src}
                  alt={`Screenshot ${index + 1}`}
                  width={1000}
                  height={600}
                  className="w-full h-auto object-cover rounded-lg shadow-lg"
                  priority={index === 0}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
}
