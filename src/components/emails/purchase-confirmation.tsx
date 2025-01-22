import * as React from "react";
import { Html } from "@react-email/html";
import { Head } from "@react-email/head";
import { Preview } from "@react-email/preview";
import { Section } from "@react-email/section";
import { Column } from "@react-email/column";
import { Img } from "@react-email/components";
import { Text } from "@react-email/text";
import { Link } from "@react-email/link";

interface PurchaseConfirmationProps {
  appName: string;
  logoImageUrl: string;
  purchasedAt: string;
  planName: string;
  signUpUrl: string;
}

export default function PurchaseConfirmation({
  appName,
  logoImageUrl,
  purchasedAt,
  planName,
  signUpUrl,
}: PurchaseConfirmationProps) {
  return (
    <Html>
      <Head>
        <title>Confirmação de Compra - {appName}</title>
      </Head>
      <Preview>Confirmação de Compra - {appName}</Preview>
      <Section style={{ backgroundColor: "#ffffff", padding: "48px 32px" }}>
        <Section style={{ padding: "16px 32px" }}>
          {logoImageUrl && (
            <Img
              src={logoImageUrl}
              alt={`Logo do ${appName}`}
              style={{ maxWidth: "200px", maxHeight: "50px" }}
            />
          )}
        </Section>
        <Section style={{ backgroundColor: "#ffffff", borderRadius: "0px" }}>
          <Column>
            <Text style={{ fontSize: "24px", fontWeight: "bold", margin: "0 0 16px" }}>
              Obrigado por sua compra!
            </Text>
            <Text style={{ fontSize: "16px", margin: "0 0 24px" }}>
              Sua compra do plano {planName} foi concluída com sucesso em <strong>{new Date(purchasedAt).toLocaleDateString('pt-BR')}</strong>.
            </Text>
            <Text style={{ fontSize: "16px", margin: "0 0 24px" }}>
              Para começar a usar o {appName}, clique no link abaixo para se cadastrar:
            </Text>
            <Link href={signUpUrl} style={{ fontSize: "16px", color: "#0070f3" }}>
              Cadastre-se agora
            </Link>
          </Column>
        </Section>
      </Section>
    </Html>
  );
}