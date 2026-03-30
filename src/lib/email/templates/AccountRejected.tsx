import {
  Body,
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
  reason?: string;
}

export function AccountRejectedEmail({ userName, reason }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Запит на реєстрацію відхилено</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>Personal Hub</Heading>
          </Section>

          <Section style={content}>
            <Heading as="h2" style={h2}>
              ❌ Запит відхилено
            </Heading>
            <Text style={text}>
              Привіт, <strong>{userName || "друже"}</strong>. На жаль, твій запит на реєстрацію було
              відхилено адміністратором.
            </Text>
            {reason && (
              <Section style={reasonBox}>
                <Text style={reasonText}>
                  <strong>Причина:</strong> {reason}
                </Text>
              </Section>
            )}
            <Text style={hint}>Якщо вважаєш що це помилка — зв&apos;яжись з адміністратором.</Text>
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
const text = { color: "#a1a1aa", fontSize: "15px", lineHeight: "1.6", margin: "0 0 20px" };
const reasonBox = {
  backgroundColor: "#18181b",
  border: "1px solid #27272a",
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "20px"
};
const reasonText = { color: "#d4d4d8", fontSize: "14px", margin: "0" };
const hint = { color: "#52525b", fontSize: "13px", margin: "0" };
const hr = { borderColor: "#27272a", margin: "32px 0 20px" };
const footer = { color: "#3f3f46", fontSize: "12px", textAlign: "center" as const, margin: "0" };
