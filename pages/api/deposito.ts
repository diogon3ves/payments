import type { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuidv4 } from 'uuid'

const DEPPIX_API_URL = 'https://depix.eulen.app/api/deposit'
const DEPPIX_TOKEN = process.env.DEPIX_TOKEN!

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { valor } = req.body
  const amountInCents = Number(valor) * 100

  const nonce = uuidv4()
  const headers = {
    Authorization: `Bearer ${DEPPIX_TOKEN}`,
    'X-Nonce': nonce,
    'Content-Type': 'application/json',
  }

  const bodyPayload = {
    amountInCents,
    customerMessage: 'anonimo',
  }

  try {
    const response = await fetch(DEPPIX_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(bodyPayload),
    })

    const data = await response.json()

    const qrCodeUrl = data.response?.qrImageUrl
    const copiaCola = data.response?.qrCopyPaste

    if (qrCodeUrl && copiaCola) {
      return res.status(200).json({ qrCodeUrl, copiaCola })
    }

    return res.status(500).json({ error: 'QR Code inválido', data })
  } catch (error) {
    console.error('❌ Erro ao gerar QR Pix:', error)
    return res.status(500).json({ error: 'Erro interno ao gerar QR Code' })
  }
}
