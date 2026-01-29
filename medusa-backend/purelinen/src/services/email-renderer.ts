import * as React from "react"
import { render } from "@react-email/components"
import { WelcomeEmail } from "../templates/emails/welcome"

export type EmailTemplate = "welcome"

export interface EmailTemplateData {
  [key: string]: any
}

export class EmailRenderer {
  async render(templateName: EmailTemplate, data: EmailTemplateData): Promise<{ html: string; text: string }> {
    let component: React.ReactElement

    switch (templateName) {
      case "welcome":
        component = React.createElement(WelcomeEmail, {
          firstName: data.firstName,
          companyName: data.companyName,
        })
        break
      default:
        throw new Error(`Unknown template: ${templateName}`)
    }

    const html = await render(component)
    // Simple text extraction
    const text = this.htmlToText(html)

    return { html, text }
  }

  private htmlToText(html: string): string {
    // Simple HTML to text conversion
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
