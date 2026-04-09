"use client"

import * as React from "react"
import { useFormState } from "react-hook-form"

import { cn } from "@/lib/utils"

export interface FormFieldContextValue {
  id?: string
  name?: string
  formItemId?: string
  formDescriptionId?: string
  formMessageId?: string
  error?: unknown
}

interface FormFieldContextProviderProps {
  children: React.ReactNode
  value: FormFieldContextValue
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null)

export function FormFieldContextProvider({ children, value }: FormFieldContextProviderProps) {
  return (
    <FormFieldContext.Provider value={value}>
      {children}
    </FormFieldContext.Provider>
  )
}

export function useFormField() {
  const fieldContext = React.useContext(FormFieldContext)
  if (fieldContext === null) {
    throw new Error("useFormField should be used within a `FormField`")
  }
  return fieldContext
}

export interface FormItemProps extends React.LabelHTMLAttributes<HTMLDivElement> {
  className?: string
}

export function FormItem({ className, ...props }: FormItemProps) {
  const id = React.useId()
  const { error, formItemId = `form-item-${id}`, formDescriptionId = `form-item-description-${id}`, formMessageId = `form-item-message-${id}` } = useFormField()

  return (
    <FormFieldContextProvider
      value={{
        id,
        formItemId,
        formDescriptionId,
        formMessageId,
      }}
    >
      <div className={cn("space-y-2", className)} {...props} />
    </FormFieldContextProvider>
  )
}

export function FormLabel({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  const { error, formItemId } = useFormField()

  return (
    <label
      htmlFor={formItemId}
      className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
      {...props}
    />
  )
}

export function FormControl<TFieldValue>({ ...props }: React.ComponentPropsWithoutRef<"div">) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <div
      id={formItemId}
      aria-describedby={
        !error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
}

export function FormDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const { formDescriptionId } = useFormField()

  return (
    <p
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export function FormMessage({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message) : children

  if (!body) {
    return null
  }

  return (
    <div id={formMessageId} className={cn("text-sm font-medium text-destructive", className)} {...props}>
      {body}
    </div>
  )
}

