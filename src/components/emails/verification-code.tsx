import * as React from "react";
import { Html } from "@react-email/html";
import { Head } from "@react-email/head";
import { Preview } from "@react-email/preview";
import { Section } from "@react-email/section";
import { Column } from "@react-email/column";
import { Img } from "@react-email/components";
import { Text } from "@react-email/text";

interface VerificationCodeProps {
  otpCode: string;
  appName: string;
  logoImageUrl: string;
  requestedAt: string;
}

export default function VerificationCode({
  otpCode,
  appName,
  logoImageUrl,
  requestedAt,
}: VerificationCodeProps) {
  return (
    <Html>
      <Head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.1/css/all.min.css" />
        <title>{`${otpCode} é o seu código de verificação do ${appName}`}</title>
      </Head>
      <Preview>Código de verificação do {appName}</Preview>
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
          <Column
            style={{
              padding: "32px 32px 48px 32px",
              backgroundColor: "#ffffff",
              fontSize: "14px",
              margin: "0",
            }}
          >
            <Text
              style={{
                margin: "0",
                fontSize: "24px",
                fontWeight: "bold",
                color: "#000000",
              }}
            >
              Código de verificação
            </Text>
            <Text
              style={{
                margin: "32px 0 0",
                fontSize: "14px",
                color: "#000000",
                fontWeight: "normal",
              }}
            >
              Insira o seguinte código de verificação quando solicitado:
            </Text>
            <Text
              style={{
                fontSize: "40px",
                margin: "16px 0 0",
                color: "#000000",
                fontWeight: "bold",
              }}
            >
              {otpCode}
            </Text>
            <Text
              style={{
                margin: "16px 0 0",
                fontSize: "14px",
                color: "#000000",
                fontWeight: "normal",
              }}
            >
              Para proteger sua conta, não compartilhe este código.
            </Text>
            <Text
              style={{
                margin: "64px 0 0",
                color: "#000000",
                fontSize: "14px",
                fontWeight: "normal",
              }}
            >
              <strong>Não solicitou isso?</strong>
            </Text>
            <Text
              style={{
                margin: "16px 0 0",
                fontSize: "14px",
                color: "#000000",
                fontWeight: "normal",
              }}
            >
              Este código foi solicitado em <strong>{requestedAt}</strong>. Se
              você não fez essa solicitação, pode ignorar este e-mail com
              segurança.
            </Text>
          </Column>
        </Section>
      </Section>
    </Html>
  );
}