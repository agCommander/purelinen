"use client"

import * as React from "react"
import { Button } from "@/components/Button"
import { Form, InputField } from "@/components/Forms"
import { LocalizedLink } from "@/components/LocalizedLink"
import { z } from "zod"

const newsletterFormSchema = z.object({
  email: z.string().min(3).email(),
})

export const NewsletterForm: React.FC<{ className?: string }> = ({
  className,
}) => {
  const [isSubmitted, setIsSubmitted] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (values: z.infer<typeof newsletterFormSchema>) => {
    setIsLoading(true)
    setError(null)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
      const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

      const response = await fetch(`${backendUrl}/store/custom/newsletter/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(publishableKey && { "x-publishable-api-key": publishableKey }),
        },
        body: JSON.stringify({ email: values.email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to subscribe")
      }

      setIsSubmitted(true)
    } catch (err) {
      console.error("Newsletter subscription error:", err)
      setError(err instanceof Error ? err.message : "Failed to subscribe. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={className}>
      <h3 className="text-xs md:text-sm mb-2 md:mb-4 font-medium">Keep in touch</h3>
      {isSubmitted ? (
        <p className="text-xs">
          Thank you for subscribing to our newsletter!
        </p>
      ) : (
        <>
          <p className="text-xs mb-4 md:mb-6">
            Sign up to our newsletter and receive notifications of our discounted products.
          </p>
          {error && (
            <p className="text-xs text-red-600 mb-2">
              {error}
            </p>
          )}
          <Form
            onSubmit={handleSubmit}
            schema={newsletterFormSchema}
          >
            <div className="flex flex-col gap-2">
              <InputField
                inputProps={{
                  uiSize: "sm",
                  className: "rounded-xs",
                  autoComplete: "email",
                }}
                name="email"
                type="email"
                placeholder="Enter your email"
                className="mb-2"
              />
              <Button 
                type="submit" 
                size="sm" 
                className="h-9 text-xs w-full md:w-auto"
                disabled={isLoading}
              >
                {isLoading ? "Subscribing..." : "Subscribe"}
              </Button>
            </div>
          </Form>
        </>
      )}
    </div>
  )
}
