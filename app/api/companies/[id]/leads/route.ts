import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

const leadSchema = z.object({
  name: z.string().min(2, "Name is required").max(200),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().max(30).optional(),
  practiceName: z.string().max(255).optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
  serviceType: z.string().max(150).optional(),
})

interface RouteParams {
  params: { id: string }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: companyId } = params

    if (!companyId) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 })
    }

    // Verify company exists and is active
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, status: true, leadCount: true },
    })

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    if (company.status !== "ACTIVE") {
      return NextResponse.json({ error: "Company is not accepting leads at this time" }, { status: 403 })
    }

    // Parse body
    const body = await request.json()
    const parsed = leadSchema.safeParse(body)

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input"
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const { name, email, phone, practiceName, message, serviceType } = parsed.data

    // Get authenticated user if any
    const session = await auth()
    const userId = session?.user?.id ?? undefined

    // Get IP address
    const forwarded = request.headers.get("x-forwarded-for")
    const ipAddress = forwarded ? forwarded.split(",")[0].trim() : undefined

    // Create lead and increment count atomically
    const [lead] = await prisma.$transaction([
      prisma.lead.create({
        data: {
          companyId,
          userId: userId ?? null,
          name: name.trim(),
          email: email.toLowerCase().trim(),
          phone: phone?.trim() ?? null,
          practiceName: practiceName?.trim() ?? null,
          message: message.trim(),
          serviceType: serviceType?.trim() ?? null,
          ipAddress: ipAddress ?? null,
          status: "NEW",
        },
        select: { id: true, createdAt: true },
      }),
      prisma.company.update({
        where: { id: companyId },
        data: { leadCount: { increment: 1 } },
      }),
    ])

    return NextResponse.json(
      {
        success: true,
        message: "Your inquiry has been submitted successfully.",
        leadId: lead.id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[POST /api/companies/[id]/leads]", error)
    return NextResponse.json(
      { error: "Failed to submit inquiry. Please try again." },
      { status: 500 }
    )
  }
}
