import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import * as React from "react"

interface WelcomeEmailProps {
  firstName?: string
  companyName?: string
}

export const WelcomeEmail = ({
  firstName = "Customer",
  companyName,
}: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Pure Linen!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome{firstName ? ` ${firstName}` : ""}!</Heading>
          <Section style={section}>
            <Text style={text}>
              Thank you for joining Pure Linen{companyName ? ` at ${companyName}` : ""}!
            </Text>
            <Text style={text}>
              We're excited to have you as part of our community. You'll receive updates about our latest products, special offers, and more.
            </Text>
            <Text style={text}>
              If you have any questions, feel free to reach out to us anytime.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default WelcomeEmail

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
}

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
}

const section = {
  padding: "0 48px",
}

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 20px",
}
