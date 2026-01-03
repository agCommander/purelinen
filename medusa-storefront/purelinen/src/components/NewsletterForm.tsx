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
          <Form
            onSubmit={() => {
              setIsSubmitted(true)
            }}
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
              <Button type="submit" size="sm" className="h-9 text-xs w-full md:w-auto">
                Subscribe
              </Button>
            </div>
          </Form>
        </>
      )}
    </div>
  )
}
