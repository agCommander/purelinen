"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { SubmitButton } from "@modules/common/components/submit-button"
import { Form, InputField, TextareaField } from "@/components/Forms"
import { z } from "zod"
import { signupFormSchema, useSignup, useCustomer } from "hooks/customer"
import { withReactQueryProvider } from "@lib/util/react-query"
import { IS_PURELINEN } from "@/lib/config/site-config"
import { useCountryCode } from "hooks/country-code"

export const SignUpForm = withReactQueryProvider(() => {
  const { mutateAsync, isPending, data } = useSignup()
  const { data: customer } = useCustomer()
  const router = useRouter()
  const countryCode = useCountryCode()
  const [showSuccess, setShowSuccess] = React.useState(false)

  const onSubmit = async (values: z.infer<typeof signupFormSchema>) => {
    const result = await mutateAsync(values)
    if (result?.success) {
      if (IS_PURELINEN) {
        // Show success message and redirect after 3 seconds
        setShowSuccess(true)
        setTimeout(() => {
          const homePath = countryCode ? `/${countryCode}` : "/"
          router.push(homePath)
        }, 3000)
      }
    }
  }

  // Show success message if registration was just completed
  if (showSuccess && IS_PURELINEN) {
    return (
      <div className="flex flex-col gap-6 md:gap-8 mb-8 md:mb-16">
        <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
          <h2 className="text-xl font-semibold text-green-800 mb-3">
            ✅ Thank You for Registering!
          </h2>
          <p className="text-sm text-green-700 mb-2">
            Your application for a wholesale account has been submitted successfully.
          </p>
          <p className="text-sm text-green-700">
            You will be notified via email when your account has been approved by our team.
          </p>
          <p className="text-xs text-green-600 mt-4 italic">
            Redirecting to home page...
          </p>
        </div>
      </div>
    )
  }

  // Check if customer has completed registration but is pending approval (for page refresh)
  if (customer && IS_PURELINEN) {
    const approved = customer.metadata?.approved
    const registrationStep = customer.metadata?.registration_step
    
    // If step 2 complete but not approved, show pending message
    if (registrationStep === 2 || registrationStep === "2") {
      if (approved !== true && approved !== "true") {
        return (
          <div className="flex flex-col gap-6 md:gap-8 mb-8 md:mb-16">
            <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h2 className="text-xl font-semibold text-yellow-800 mb-3">
                ✅ Registration Submitted
              </h2>
              <p className="text-sm text-yellow-700 mb-2">
                Your registration has been submitted successfully.
              </p>
              <p className="text-sm text-yellow-700">
                Your account is pending approval. You will be notified via email once your 
                wholesale account has been approved by our team.
              </p>
            </div>
          </div>
        )
      }
    }
  }

  return (
    <Form onSubmit={onSubmit} schema={signupFormSchema}>
      {({ watch }) => {
        const formData = watch()
        const isDisabled = !Object.values(formData).some((value) => value)

        return (
          <div className="flex flex-col gap-6 md:gap-8 mb-8 md:mb-16">
            {IS_PURELINEN && (
              <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded">
                <p className="text-sm text-gray-700">
                  <strong>Wholesale Account Registration:</strong> Please provide your business 
                  information below. Your account will require approval before you can log in.
                </p>
              </div>
            )}
            <div className="flex gap-4 md:gap-6">
              <InputField
                placeholder="First name"
                name="first_name"
                className=" flex-1"
                inputProps={{ autoComplete: "given-name" }}
              />
              <InputField
                placeholder="Last name"
                name="last_name"
                className=" flex-1"
                inputProps={{ autoComplete: "family-name" }}
              />
            </div>
            <InputField
              placeholder="Email Address"
              name="email"
              className=" flex-1"
              type="email"
              inputProps={{ autoComplete: "email" }}
            />
            <InputField
              placeholder="Phone"
              name="phone"
              className=" flex-1"
              type="tel"
              inputProps={{ autoComplete: "tel" }}
            />
            <InputField
              placeholder="Password"
              name="password"
              type="password"
              className=" flex-1"
              inputProps={{ autoComplete: "new-password" }}
            />
            <InputField
              placeholder="Confirm password"
              name="confirm_password"
              type="password"
              className=" flex-1"
              inputProps={{ autoComplete: "new-password" }}
            />
            
            {/* B2B Fields - Only show for Pure Linen */}
            {IS_PURELINEN && (
              <>
                <div className="border-t border-gray-200 pt-6 mt-4">
                  <h3 className="text-md font-semibold mb-4">Business Information</h3>
                </div>
                <InputField
                  placeholder="Company Name *"
                  name="company"
                  className="flex-1"
                  inputProps={{ 
                    autoComplete: "organization",
                  }}
                />
                <InputField
                  placeholder="Website (optional)"
                  name="website"
                  type="text"
                  className="flex-1"
                  inputProps={{ 
                    autoComplete: "url",
                    title: "Please enter a valid website URL (e.g., https://example.com)"
                  }}
                />
                <div>
                  <label className="block mb-2 font-semibold text-sm">
                    Australian Business Number (ABN) or Australian Company Number (ACN) *
                  </label>
                  <InputField
                    placeholder="ABN or ACN (9-11 digits)"
                    name="abn_acn"
                    inputProps={{ 
                      autoComplete: "off",
                      pattern: "[0-9]{9,11}",
                      title: "Please enter a valid 9-11 digit ABN or ACN"
                    }}
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-sm">
                    Business Description *
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
              </>
            )}
            
            {data?.error && (
              <p className="text-red-primary text-sm">{data.error}</p>
            )}
            <SubmitButton isDisabled={isDisabled} isPending={isPending}>
              Register
            </SubmitButton>
          </div>
        )
      }}
    </Form>
  )
})
