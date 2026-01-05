"use client"

import { useParams, usePathname } from "next/navigation"
import { twMerge } from "tailwind-merge"
import { Layout, LayoutColumn } from "@/components/Layout"
import { NewsletterForm } from "@/components/NewsletterForm"
import { LocalizedLink } from "@/components/LocalizedLink"

export const Footer: React.FC = () => {
  const pathName = usePathname()
  const { countryCode } = useParams()
  const currentPath = pathName.split(`/${countryCode}`)[1]

  const isAuthPage = currentPath === "/register" || currentPath === "/login"

  return (
    <div
      className={twMerge(
        "bg-white border-t border-grayscale-200",
        isAuthPage && "hidden"
      )}
    >
      <Layout>
        <LayoutColumn className="col-span-13">
          {/* 6-column grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-0 max-md:px-4">
            {/* Newsletter Form - spans 2 columns */}
            <div className="md:col-span-2 px-4 md:px-6 py-4 md:py-1 md:border-r border-grayscale-200 md:min-h-[240px] md:max-h-[240px]">
              <NewsletterForm />
            </div>

            {/* Online support - 1 column */}
            <div className="md:col-span-1 px-4 md:px-6 py-4 md:py-1 md:border-r border-grayscale-200 md:min-h-[240px] md:max-h-[240px]">
              <h3 className="text-xs md:text-sm mb-4 md:mb-6 font-medium">Online support</h3>
              <ul className="flex flex-col gap-3 md:gap-2 text-xs">
                <li>
                  <LocalizedLink href="/contact">Contact Us Form</LocalizedLink>
                </li>
      
                <li>
                  <LocalizedLink href="/care-guide">Care guide</LocalizedLink>
                </li>
                <li>
                  <LocalizedLink href="/gift-card">Gift cards</LocalizedLink>
                </li>
              </ul>
            </div>

            {/* About us - 1 column */}
            <div className="md:col-span-1 px-4 md:px-6 py-4 md:py-1 md:border-r border-grayscale-200 md:min-h-[240px] md:max-h-[240px]">
              <h3 className="text-xs md:text-sm mb-4 md:mb-6 font-medium">About us</h3>
              <ul className="flex flex-col gap-3 md:gap-2 text-xs">
                <li>
                  <LocalizedLink href="/about">About PURE LINEN</LocalizedLink>
                </li>
                <li>
                <b>Office / Showroom</b>
                <br/>Coogee Commercial Centre
                <br/>16/83 Mell Road, Spearwood, WA, 6163, Australia
                <br/>ABN: 15 379 675 793
                <br/>You're welcome to visit our showroom - Please call us to make an appointment
                </li>
  
              </ul>
            </div>

            {/* Connect with PURE LINEN - 1 column */}
            <div className="md:col-span-1 px-4 md:px-6 py-4 md:py-1 md:border-r border-grayscale-200 md:min-h-[240px] md:max-h-[240px]">
              <h3 className="text-xs md:text-sm mb-4 md:mb-6 font-medium">Connect with us</h3>
              <ul className="flex flex-col gap-3 md:gap-2 text-xs">
                <li>
                  <a
                    href="https://www.instagram.com/agiloltd/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Instagram
                  </a>
                </li>
              
                <li>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Facebook
                  </a>
                </li>
                <li>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn
                  </a>
                </li>
               <li>
                <br/>
                <br/>Phone: +61 (0) 8-9418-7015
                <br/>Email: <a href="mailto:info@purelinen.com.au">info@purelinen.com.au</a>  
               </li>
              </ul>
            </div>

            {/* Legal terms - 1 column */}
            <div className="md:col-span-1 px-4 md:px-6 py-4 md:py-1 md:min-h-[240px] md:max-h-[240px]">
              <h3 className="text-xs md:text-sm mb-4 md:mb-6 font-medium">Legal terms</h3>
              <ul className="flex flex-col gap-3 md:gap-2 text-xs">
                <li>
                  <LocalizedLink href="/shipping-returns">Shipping and returns</LocalizedLink>
                </li>
                <li>
                  <LocalizedLink href="/privacy-policy">Privacy policy</LocalizedLink>
                </li>
                <li>
                  <LocalizedLink href="/terms-of-use">Terms and conditions</LocalizedLink>
                </li>
              </ul>
            </div>
          </div>
        </LayoutColumn>
      </Layout>
      
      {/* Copyright - Full width border */}
      <div className="border-t border-grayscale-200">
        <div className="mx-auto px-4 sm:container">
          <div className="py-3 md:py-2">
            <p className="text-xs">
              &copy; {new Date().getFullYear()}, PURE LINEN
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
