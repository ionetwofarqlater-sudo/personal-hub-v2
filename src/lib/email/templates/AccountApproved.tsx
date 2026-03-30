import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text
} from "@react-email/components";

interface Props {
  userName: string;
  loginUrl: string;
}

export function AccountApprovedEmail({ userName, loginUrl }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Твій акаунт підтверджено — ласкаво просимо!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>Personal Hub</Heading>
          </Section>

          <Section style={content}>
            <Heading as="h2" style={h2}>
              ✅ Акаунт підтверджено
            </Heading>
            <Text style={text}>
              Привіт, <strong>{userName || "друже"}</strong>! Твій акаунт підтверджено
              адміністратором. Тепер ти можеш увійти.
            </Text>

            <Button style={button} href={loginUrl}>
              Увійти в Personal Hub
            </Button>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>Personal Hub · Тільки для тебе і друзів</Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#0f0f0f",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
};
const container = { margin: "0 auto", padding: "0 0 48px", maxWidth: "560px" };
const header = { backgroundColor: "#7c3aed", padding: "24px 32px", borderRadius: "12px 12px 0 0" };
const logo = { color: "#ffffff", fontSize: "22px", fontWeight: "700", margin: "0" };
const content = { padding: "32px" };
const h2 = { color: "#ffffff", fontSize: "20px", margin: "0 0 16px" };
const text = { color: "#a1a1aa", fontSize: "15px", lineHeight: "1.6", margin: "0 0 24px" };
const button = {
  backgroundColor: "#16a34a",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "600",
  padding: "12px 24px",
  textDecoration: "none",
  display: "inline-block"
};
const hr = { borderColor: "#27272a", margin: "32px 0 20px" };
const footer = { color: "#3f3f46", fontSize: "12px", textAlign: "center" as const, margin: "0" };
