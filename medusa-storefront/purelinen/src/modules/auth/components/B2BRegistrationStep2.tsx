"use client"

import * as React from "react"
import { SubmitButton } from "@modules/common/components/submit-button"
import { Form, InputField, TextareaField } from "@/components/Forms"
import { z } from "zod"
import { b2bRegistrationStep2Schema, useB2BRegistrationStep2 } from "hooks/customer"
import { withReactQueryProvider } from "@lib/util/react-query"
import { useRouter } from "next/navigation"

export const B2BRegistrationStep2 = withReactQueryProvider(() => {
  const { mutateAsync, isPending, data } = useB2BRegistrationStep2()
  const router = useRouter()

  const onSubmit = async (values: z.infer<typeof b2bRegistrationStep2Schema>) => {
    const result = await mutateAsync(values)
    if (result?.success) {
      // Redirect to show pending approval message
      setTimeout(() => {
        router.refresh() // Refresh to show updated status
      }, 1500)
    }
  }

  return (
    <Form onSubmit={onSubmit} schema={b2bRegistrationStep2Schema}>
      {({ watch }) => {
        const formData = watch()
        const isDisabled = !formData.abn_acn || !formData.business_description

        return (
          <div className="flex flex-col gap-6 md:gap-8 mb-8 md:mb-16">
            <div className="mb-4">
              <h2 className="text-lg md:text-xl font-semibold mb-2">
                Business Information
              </h2>
              <p className="text-sm text-grayscale-600">
                Please provide your business details to complete your wholesale account registration.
              </p>
            </div>
            
            <div className="flex-1">
              <label className="block mb-2 font-semibold">
                Australian Business Number (ABN) or Australian Company Number (ACN)
              </label>
              <InputField
                placeholder="ABN or ACN"
                name="abn_acn"
                inputProps={{ 
                  autoComplete: "off",
                  pattern: "[0-9]{9,11}",
                  title: "Please enter a valid 9-11 digit ABN or ACN"
                }}
              />
            </div>
            
            <div className="flex-1">
              <label className="block mb-2 font-semibold">
                Business Description
              </label>
              <TextareaField
                placeholder="Describe your business and why you need a wholesale account..."
                name="business_description"
                rows={5}
                inputProps={{
                  maxLength: 1000
                }}
              />
            </div>
            
            {data?.error && (
              <p className="text-red-primary text-sm">{data.error}</p>
            )}
            
            {data?.success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-sm text-green-800">
                  ✅ Registration complete! Your account is pending approval. 
                  You will be notified once your account has been approved.
                </p>
              </div>
            )}
            
            <SubmitButton isDisabled={isDisabled || data?.success} isPending={isPending}>
              {data?.success ? "Registration Complete" : "Complete Registration"}
            </SubmitButton>
          </div>
        )
      }}
    </Form>
  )
})
