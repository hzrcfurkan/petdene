import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe disabled" },
        { status: 503 }
      )
    }

    const { default: Stripe } = await import("stripe")

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia",
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    return NextResponse.json(
      { error: "Stripe confirm failed" },
      { status: 500 }
    )
  }
}
