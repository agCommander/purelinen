import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import {
  addCustomerAddress,
  deleteCustomerAddress,
  getCustomer,
  login,
  signout,
  signup,
  updateCustomer,
  updateCustomerAddress,
  completeB2BRegistration,
} from "@lib/data/customer"
import { z } from "zod"
import { StoreCustomer } from "@medusajs/types"

export const useCustomer = () => {
  return useQuery({
    queryKey: ["customer"],
    queryFn: async () => {
      const customer = await getCustomer()
      return customer
    },
    staleTime: 5 * 60 * 1000,
  })
}

export const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  redirect_url: z.string().optional().nullable(),
})

export const useLogin = (
  options?: UseMutationOptions<
    { success: boolean; redirectUrl?: string; message?: string },
    Error,
    z.infer<typeof loginFormSchema>
  >
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ["login"],
    mutationFn: async (values: z.infer<typeof loginFormSchema>) => {
      return login({ ...values })
    },
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ["customer"] })
      await options?.onSuccess?.(...args)
    },
    ...options,
  })
}

export const useSignout = (
  options?: UseMutationOptions<string, Error, string>
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ["signout"],
    mutationFn: async (countryCode: string) => {
      return signout(countryCode)
    },
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ["customer"] })
      await options?.onSuccess?.(...args)
    },
    ...options,
  })
}

export const updateCustomerFormSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone: z.string().optional().nullable(),
})

export const useUpdateCustomer = (
  options?: UseMutationOptions<
    { state: "error" | "success" | "initial"; error?: string },
    Error,
    z.infer<typeof updateCustomerFormSchema>
  >
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ["update-customer"],
    mutationFn: async (values: z.infer<typeof updateCustomerFormSchema>) => {
      return updateCustomer(values)
    },
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ["customer"] })
      await options?.onSuccess?.(...args)
    },
    ...options,
  })
}

export const customerAddressSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  company: z.string().optional().nullable(),
  address_1: z.string().min(1),
  address_2: z.string().optional().nullable(),
  city: z.string().min(1),
  postal_code: z.string().min(1),
  province: z.string().optional().nullable(),
  country_code: z.string().min(2),
  phone: z.string().optional().nullable(),
})

export const useAddressMutation = (
  addressId?: string,
  options?: UseMutationOptions<
    { addressId: string; success: boolean; error: string | null },
    Error,
    z.infer<typeof customerAddressSchema>
  >
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ["add-address", "update-address"],
    mutationFn: async (values: z.infer<typeof customerAddressSchema>) => {
      return addressId
        ? updateCustomerAddress(addressId, values)
        : addCustomerAddress(values)
    },
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ["customer"] })
      await options?.onSuccess?.(...args)
    },
    ...options,
  })
}

export const useDeleteCustomerAddress = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ["delete-address"],
    mutationFn: async (addressId: string) => {
      return deleteCustomerAddress(addressId)
    },
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ["customer"] })
      await options?.onSuccess?.(...args)
    },
    ...options,
  })
}

// Base schema for all signups
const baseSignupSchema = z.object({
  email: z.string().email(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone: z.string().optional().nullable(),
  password: z.string().min(6),
  confirm_password: z.string().min(6),
})

// B2B fields (only required for Pure Linen)
const b2bFieldsSchema = z.object({
  abn_acn: z.string().min(9).max(11).regex(/^[0-9]+$/, "ABN/ACN must contain only numbers"),
  business_description: z.string().min(10).max(1000),
})

// Combined schema - B2B fields are optional at schema level, validated in signup function
export const signupFormSchema = baseSignupSchema
  .merge(b2bFieldsSchema.partial())
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  })

export const b2bRegistrationStep2Schema = z.object({
  abn_acn: z.string().min(9).max(11).regex(/^[0-9]+$/, "ABN/ACN must contain only numbers"),
  business_description: z.string().min(10).max(1000),
})

export const useSignup = (
  options?: UseMutationOptions<
    { success: boolean; error?: string | null; customer?: StoreCustomer; requiresB2BStep2?: boolean },
    Error,
    z.infer<typeof signupFormSchema>
  >
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ["signup"],
    mutationFn: async (values: z.infer<typeof signupFormSchema>) => {
      return signup(values)
    },
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ["customer"] })
      await options?.onSuccess?.(...args)
    },
    ...options,
  })
}

export const useB2BRegistrationStep2 = (
  options?: UseMutationOptions<
    { success: boolean; error?: string | null },
    Error,
    z.infer<typeof b2bRegistrationStep2Schema>
  >
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ["b2b-registration-step2"],
    mutationFn: async (values: z.infer<typeof b2bRegistrationStep2Schema>) => {
      return completeB2BRegistration(values)
    },
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ["customer"] })
      await options?.onSuccess?.(...args)
    },
    ...options,
  })
}
