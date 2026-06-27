import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { flowCreateSubscription, isFlowConfigured } from '@/lib/flow'
import { verifyToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    // Auth: require escort token
    const auth = req.headers.get('authorization')
    if (!auth?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const token = auth.replace('Bearer ', '')
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    if (!isFlowConfigured()) {
      return NextResponse.json({ error: 'Flow.cl no está configurado' }, { status: 500 })
    }

    const body = await req.json()
    const { planId } = body

    if (!planId) {
      return NextResponse.json({ error: 'Falta planId' }, { status: 400 })
    }

    // Get escort by userId, NOT by payload.id (which is User.id)
    const escort = await prisma.escort.findFirst({
      where: { userId: payload.id },
      include: { user: true },
    })

    if (!escort) {
      return NextResponse.json({ error: 'Diamante no encontrada' }, { status: 404 })
    }

    const escortId = escort.id

    const plan = await prisma.membershipPlan.findUnique({
      where: { id: planId },
    })

    if (!plan) {
      return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 })
    }

    // Check for existing active subscription
    const existingSub = await prisma.subscription.findFirst({
      where: { escortId, status: 'active' },
    })

    if (existingSub) {
      return NextResponse.json({ error: 'Ya tienes una suscripción activa' }, { status: 400 })
    }

    // Create subscription in Flow.cl
    const flowResult = await flowCreateSubscription({
      planId: plan.flowPlanId,
      email: escort.user.email,
      name: escort.alias || escort.name,
    })

    if (flowResult.error) {
      return NextResponse.json({ error: flowResult.error || 'Error en Flow.cl' }, { status: 400 })
    }

    // Create pending subscription in DB
    const subscription = await prisma.subscription.create({
      data: {
        escortId,
        planId,
        flowSubId: flowResult.subscriptionId || flowResult.id,
        status: 'pending',
      },
    })

    // Create initial payment record
    await prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        amount: plan.price,
        flowOrderId: flowResult.token || flowResult.commerceOrder,
        status: 'pending',
      },
    })

    return NextResponse.json({
      success: true,
      subscription,
      flowUrl: flowResult.url || flowResult.redirectUrl,
      flowToken: flowResult.token,
    })
  } catch (error: any) {
    console.error('Subscribe error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization')
    if (!auth?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const token = auth.replace('Bearer ', '')
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const escort = await prisma.escort.findFirst({
      where: { userId: payload.id },
      select: { id: true },
    })

    const subscription = escort
      ? await prisma.subscription.findFirst({
          where: { escortId: escort.id },
          include: { plan: true, payments: { orderBy: { createdAt: 'desc' }, take: 5 } },
          orderBy: { createdAt: 'desc' },
        })
      : null

    const plans = await prisma.membershipPlan.findMany({
      where: { active: true },
    })

    return NextResponse.json({ subscription, plans })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
