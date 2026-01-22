import { Metadata } from "next"
import Image from "next/image"
import { redirect } from "next/navigation"

import { getCustomer } from "@lib/data/customer"
import { B2BRegistrationStep2 } from "@modules/auth/components/B2BRegistrationStep2"
import { IS_PURELINEN } from "@/lib/config/site-config"

export const metadata: Metadata = {
  title: "Complete Business Registration",
  description: "Complete your wholesale account registration",
}

export default async function B2BStep2Page({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  // Only available for Pure Linen
  if (!IS_PURELINEN) {
    redirect(`/${(await params).countryCode}/auth/register`)
  }

  const customer = await getCustomer().catch(() => null)

  // Must be logged in to complete step 2
  if (!customer) {
    redirect(`/${(await params).countryCode}/auth/login?message=complete-registration`)
  }

  // Check if step 2 already completed
  const registrationStep = customer.metadata?.registration_step
  if (registrationStep === 2 || registrationStep === "2") {
    // Check approval status
    const approved = customer.metadata?.approved
    if (approved === true || approved === "true") {
      redirect(`/${(await params).countryCode}/account`)
    } else {
      // Show pending approval message
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
              Registration Complete
            </h1>
            <div className="p-6 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800 mb-4">
                ✅ Your business information has been submitted successfully.
              </p>
              <p className="text-sm text-yellow-800">
                Your account is pending approval. You will be notified via email once your 
                wholesale account has been approved by our team.
              </p>
            </div>
          </div>
        </div>
      )
    }
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
          Complete Your Business Registration
        </h1>
        <B2BRegistrationStep2 />
      </div>
    </div>
  )
}
