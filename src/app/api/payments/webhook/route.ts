import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { flowVerifyWebhook } from '@/lib/flow'

/**
 * Flow.cl webhook endpoint
 * Receives payment confirmation notifications
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const params: Record<string, string> = {}
    formData.forEach((value, key) => {
      params[key] = value as string
    })

    // Verify webhook signature
    if (!flowVerifyWebhook(params)) {
      console.error('Webhook signature verification failed')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const token = params.token
    const status = params.status
    const type = params.type // "confirmation", "subscription_confirmation"

    console.log('Flow webhook:', { token, status, type })

    if (type === 'subscription_confirmation') {
      // Handle subscription payment
      const subscription = await prisma.subscription.findFirst({
        where: { flowSubId: params.subscriptionId },
        include: { payments: true },
      })

      if (subscription) {
        // Update payment status
        const payment = subscription.payments[subscription.payments.length - 1]
        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: status === '1' ? 'paid' : 'failed',
              paidAt: status === '1' ? new Date() : undefined,
            },
          })
        }

        // Update subscription status
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: status === '1' ? 'active' : 'cancelled' },
        })

        // If payment succeeded, activate VIP features on escort
        if (status === '1') {
          await prisma.escort.update({
            where: { id: subscription.escortId },
            data: { featured: true },
          })
        }
      }
    } else if (type === 'confirmation') {
      // Handle one-time payment confirmation
      const payment = await prisma.payment.findFirst({
        where: { flowOrderId: token },
      })

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: status === '1' ? 'paid' : 'failed',
            paidAt: status === '1' ? new Date() : undefined,
          },
        })

        // If payment succeeded, activate the subscription
        if (status === '1') {
          await prisma.subscription.update({
            where: { id: payment.subscriptionId },
            data: { status: 'active' },
          })

          const sub = await prisma.subscription.findUnique({
            where: { id: payment.subscriptionId },
          })
          if (sub) {
            await prisma.escort.update({
              where: { id: sub.escortId },
              data: { featured: true },
            })
          }
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
