import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"
import { EmailRenderer } from "./email-renderer"

export interface SendEmailOptions {
  to: string
  toName?: string
  subject: string
  html: string
  text?: string
  fromEmail?: string
  fromName?: string
  replyTo?: string
}

/**
 * EmailSender service for sending transactional emails via AWS SES
 * Use this for order confirmations, invoices, welcome emails, etc.
 */
export class EmailSender {
  private sesClient: SESClient
  private renderer: EmailRenderer
  private fromEmail: string
  private fromName: string

  constructor() {
    const region = process.env.AWS_SES_REGION || "ap-southeast-2"
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

    if (!accessKeyId || !secretAccessKey) {
      throw new Error("AWS credentials not configured")
    }

    this.sesClient = new SESClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })

    this.renderer = new EmailRenderer()
    this.fromEmail = process.env.AWS_SES_FROM_EMAIL || "noreply@purelinen.com.au"
    this.fromName = process.env.AWS_SES_FROM_NAME || "Pure Linen"
  }

  /**
   * Send a transactional email
   * @param options Email options
   */
  async sendEmail(options: SendEmailOptions): Promise<void> {
    const command = new SendEmailCommand({
      Source: `${options.fromName || this.fromName} <${options.fromEmail || this.fromEmail}>`,
      Destination: {
        ToAddresses: [options.to],
      },
      Message: {
        Subject: {
          Data: options.subject,
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: options.html,
            Charset: "UTF-8",
          },
          Text: {
            Data: options.text || this.htmlToText(options.html),
            Charset: "UTF-8",
          },
        },
      },
      ReplyToAddresses: options.replyTo ? [options.replyTo] : undefined,
    })

    await this.sesClient.send(command)
  }

  /**
   * Send email using a React Email template
   * @param templateName Template name (e.g., "welcome")
   * @param to Recipient email
   * @param toName Recipient name (optional)
   * @param subject Email subject
   * @param templateData Template data
   */
  async sendTemplateEmail(
    templateName: string,
    to: string,
    toName: string | undefined,
    subject: string,
    templateData: Record<string, any>
  ): Promise<void> {
    const { html, text } = await this.renderer.render(
      templateName as any,
      templateData
    )

    await this.sendEmail({
      to,
      toName,
      subject,
      html,
      text,
    })
  }

  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim()
  }
}
