import { Metadata } from "next"
import Image from "next/image"
import { redirect } from "next/navigation"

import { getCustomer } from "@lib/data/customer"
import { SignUpForm } from "@modules/auth/components/SignUpForm"
import { LocalizedLink } from "@/components/LocalizedLink"
import { IS_PURELINEN } from "@/lib/config/site-config"

export const metadata: Metadata = {
  title: "Register",
  description: "Create an account",
}

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const customer = await getCustomer().catch(() => null)
  const { countryCode } = await params

  // For Pure Linen B2B, allow logged-in users if they haven't completed step 2
  if (customer && IS_PURELINEN) {
    const registrationStep = customer.metadata?.registration_step
    const approved = customer.metadata?.approved
    
    // If step 2 incomplete, let them stay on registration page
    if (registrationStep === 1 || registrationStep === "1") {
      // Show step 2 form
    } 
    // If approved and step 2 complete, redirect to account
    else if ((approved === true || approved === "true") && (registrationStep === 2 || registrationStep === "2")) {
      redirect(`/${countryCode}/account`)
    }
    // If not approved but step 2 complete, show pending message
    else if (registrationStep === 2 || registrationStep === "2") {
      // Show pending approval message (handled by SignUpForm)
    }
    // Otherwise redirect
    else {
      redirect(`/${countryCode}/account`)
    }
  } 
  // For retail or if no customer, normal flow
  else if (customer) {
    redirect(`/${countryCode}/account`)
  }

  return (
    <div className="flex min-h-screen">
      <Image
        src="/images/content/living-room-dark-gray-corner-sofa-coffee-table.png"
        width={1440}
        height={1632}
        alt="Living room with dark gray corner sofa and coffee table"
        className="max-lg:hidden lg:w-1/2 shrink-0 object-cover"
      />
      <div className="shrink-0 max-w-100 lg:max-w-96 w-full mx-auto pt-30 lg:pt-37 pb-16 max-sm:px-4">
        <h1 className="text-xl md:text-2xl mb-10 md:mb-16">
          Welcome to PURE LINEN!
        </h1>
        <SignUpForm />
        <p className="text-grayscale-500">
          Already have an account? No worries, just{" "}
          <LocalizedLink
            href="/auth/login"
            variant="underline"
            className="text-black md:pb-0.5"
          >
            log in
          </LocalizedLink>
          .
        </p>
      </div>
    </div>
  )
}
