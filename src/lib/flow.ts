/**
 * Flow.cl Payment Gateway Integration
 * Flow API docs: https://www.flow.cl/docs/api.html
 */

import { timingSafeEqual } from 'node:crypto'

const FLOW_API_URL = 'https://www.flow.cl/api'
const FLOW_API_KEY = process.env.FLOW_API_KEY || ''
const FLOW_SECRET_KEY = process.env.FLOW_SECRET_KEY || ''
const WEBHOOK_URL = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`
  : ''

interface FlowPaymentParams {
  amount: number // CLP
  email: string
  name: string
  subscriptionId?: string
  planId?: string
}

interface FlowSubscriptionParams {
  planId: string
  email: string
  name: string
  trialDays?: number
}

/**
 * Sign Flow.cl parameters with HMAC-SHA256
 */
export function flowSign(params: Record<string, string>): string {
  const crypto = require('crypto')
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&')
  return crypto
    .createHmac('sha256', FLOW_SECRET_KEY)
    .update(sorted)
    .digest('hex')
}

/**
 * Create a one-time payment
 */
export async function flowCreatePayment(params: FlowPaymentParams) {
  const payload: Record<string, string> = {
    apiKey: FLOW_API_KEY,
    commerceOrder: `order_${Date.now()}`,
    subject: `Membresía Diamantes VIP`,
    currency: 'CLP',
    amount: String(params.amount),
    email: params.email,
    urlConfirmation: `${WEBHOOK_URL}?type=confirmation`,
    urlReturn: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003'}/admin`,
    ...(params.name ? { name: params.name } : {}),
  }

  payload.s = flowSign(payload)

  const res = await fetch(`${FLOW_API_URL}/payment/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(payload).toString(),
  })

  const data = await res.json()
  return data
}

/**
 * Create a subscription (recurring payment)
 */
export async function flowCreateSubscription(params: FlowSubscriptionParams) {
  const payload: Record<string, string> = {
    apiKey: FLOW_API_KEY,
    planId: params.planId,
    name: params.name || 'Suscripción',
    email: params.email,
    urlConfirmation: `${WEBHOOK_URL}?type=subscription_confirmation`,
    urlReturn: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003'}/admin`,
    ...(params.trialDays ? { trial_days: String(params.trialDays) } : {}),
  }

  payload.s = flowSign(payload)

  const res = await fetch(`${FLOW_API_URL}/subscription/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(payload).toString(),
  })

  const data = await res.json()
  return data
}

/**
 * Get subscription status
 */
export async function flowGetSubscription(subscriptionId: string) {
  const payload: Record<string, string> = {
    apiKey: FLOW_API_KEY,
    subscriptionId,
  }

  payload.s = flowSign(payload)

  const res = await fetch(`${FLOW_API_URL}/subscription/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(payload).toString(),
  })

  const data = await res.json()
  return data
}

/**
 * Cancel subscription
 */
export async function flowCancelSubscription(subscriptionId: string) {
  const payload: Record<string, string> = {
    apiKey: FLOW_API_KEY,
    subscriptionId,
  }

  payload.s = flowSign(payload)

  const res = await fetch(`${FLOW_API_URL}/subscription/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(payload).toString(),
  })

  const data = await res.json()
  return data
}

/**
 * Get payment status by token
 */
export async function flowGetPaymentStatus(token: string) {
  const payload: Record<string, string> = {
    apiKey: FLOW_API_KEY,
    token,
  }

  payload.s = flowSign(payload)

  const res = await fetch(`${FLOW_API_URL}/payment/getStatus`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(payload).toString(),
  })

  const data = await res.json()
  return data
}

/**
 * Verify webhook signature
 */
export function flowVerifyWebhook(params: Record<string, string>): boolean {
  const receivedSign = params.s
  const paramsToSign: Record<string, string> = {}
  for (const key of Object.keys(params)) {
    if (key !== 's') {
      paramsToSign[key] = params[key]
    }
  }
  const computedSign = flowSign(paramsToSign)
  try {
    const a = Buffer.from(receivedSign, 'hex')
    const b = Buffer.from(computedSign, 'hex')
    return a.length === b.length && timingSafeEqual(a, b)
  } catch {
    return false
  }
}

/**
 * Check if Flow API is configured
 */
export function isFlowConfigured(): boolean {
  return !!FLOW_API_KEY && !!FLOW_SECRET_KEY
}
