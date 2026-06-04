"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  practiceName: z.string().optional(),
  serviceType: z.string().optional(),
  message: z.string().min(10, "Please write at least 10 characters"),
});

type FormValues = z.infer<typeof schema>;

const SERVICE_OPTIONS = [
  "Insurance Billing & Claims",
  "Accounts Receivable Management",
  "Credentialing & Enrollment",
  "Revenue Cycle Management",
  "Billing Audits & Consulting",
  "Coding & Documentation",
  "Patient Billing Support",
  "Practice Management",
  "Other",
];

interface ContactFormProps {
  companyId: string;
  companyName: string;
}

export function ContactForm({ companyId, companyName }: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormValues) {
    setServerError(null);
    try {
      const res = await fetch(`/api/companies/${companyId}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Failed to send message. Please try again.");
      }

      setSubmitted(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-7 h-7 text-teal-500" />
        </div>
        <h3 className="font-display font-bold text-lg text-primary mb-2">
          Message Sent!
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Thank you for reaching out to{" "}
          <span className="font-semibold text-foreground">{companyName}</span>.
          They'll get back to you within 1 business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Your Name <span className="text-red-500">*</span>
        </label>
        <Input
          {...register("name")}
          placeholder="Jane Smith"
          className={cn("h-9 text-sm", errors.name && "border-red-400 focus-visible:ring-red-400")}
        />
        {errors.name && (
          <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Email Address <span className="text-red-500">*</span>
        </label>
        <Input
          {...register("email")}
          type="email"
          placeholder="jane@dentalpractice.com"
          className={cn("h-9 text-sm", errors.email && "border-red-400 focus-visible:ring-red-400")}
        />
        {errors.email && (
          <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Phone Number
        </label>
        <Input
          {...register("phone")}
          type="tel"
          placeholder="(555) 000-0000"
          className="h-9 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Practice Name
        </label>
        <Input
          {...register("practiceName")}
          placeholder="Smile Dental Group"
          className="h-9 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Service Needed
        </label>
        <select
          {...register("serviceType")}
          className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
        >
          <option value="">Select a service…</option>
          {SERVICE_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register("message")}
          rows={4}
          placeholder="Tell them about your practice and what you need help with…"
          className={cn(
            "flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none",
            errors.message && "border-red-400 focus-visible:ring-red-400"
          )}
        />
        {errors.message && (
          <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>
        )}
      </div>

      {serverError && (
        <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {serverError}
        </p>
      )}

      <Button
        type="submit"
        variant="teal"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Sending…
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Send Message
          </>
        )}
      </Button>

      <p className="text-[11px] text-muted-foreground text-center leading-tight">
        By submitting, you agree to be contacted by this company.
        Your info is never sold to third parties.
      </p>
    </form>
  );
}
