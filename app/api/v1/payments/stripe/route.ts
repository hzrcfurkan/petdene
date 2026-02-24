import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    // Stripe kapalıysa sistem etkilenmesin
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe disabled" },
        { status: 503 }
      )
    }

    // Stripe dynamic import (build sırasında yüklenmez)
    const { default: Stripe } = await import("stripe")

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia",
    })

    // Buraya mevcut Stripe kodun gelecek
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Stripe route error:", error)
    return NextResponse.json(
      { error: "Stripe failed" },
      { status: 500 }
    )
  }
}
