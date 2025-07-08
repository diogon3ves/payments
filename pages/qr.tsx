'use client'

import { useState } from 'react'

export default function QrPixPage() {
  const [valor, setValor] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [copiaCola, setCopiaCola] = useState('')
  const [carregando, setCarregando] = useState(false)

  const gerarQRCode = async () => {
    const valorFinal = Number(valor)
    if (!valorFinal || valorFinal < 15 || valorFinal > 10000) {
      alert('Digite um valor entre R$15 e R$10.000')
      return
    }

    setCarregando(true)
    setQrCodeUrl('')
    setCopiaCola('')

    try {
      const res = await fetch('/api/deposito', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valor: valorFinal, userId: 'anonimo' })
      })

      const data = await res.json()
      if (data.qrCodeUrl && data.copiaCola) {
        setQrCodeUrl(data.qrCodeUrl)
        setCopiaCola(data.copiaCola)
      } else {
        alert('Erro ao gerar QR Code.')
      }
    } catch (err) {
      alert('Erro de conexão.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md text-center space-y-6">
        <h1 className="text-2xl font-bold">Gerar QR Code Pix</h1>

        <input
          type="number"
          placeholder="Digite o valor"
          className="w-full p-3 border rounded-lg text-center"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
        />

        <button
          onClick={gerarQRCode}
          disabled={carregando}
          className="bg-green-600 text-white px-6 py-3 rounded-lg w-full hover:bg-green-700 transition"
        >
          {carregando ? 'Gerando...' : 'Gerar QR Code'}
        </button>

        {qrCodeUrl && (
          <div className="space-y-4">
            <img src={qrCodeUrl} alt="QR Code Pix" className="mx-auto w-48 h-48" />
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Copia e Cola:</p>
              <textarea
                className="w-full p-3 border rounded-lg text-sm"
                value={copiaCola}
                readOnly
                rows={3}
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
