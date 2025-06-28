'use client'

import { CartItem } from '@/types'
import api from '@/lib/api'
import { Dispatch, SetStateAction, useState } from 'react'

type Props = {
  cart: CartItem[]
  setCart: Dispatch<SetStateAction<CartItem[]>>
}

export default function PurchaseButton({ cart, setCart }: Props) {
  const [showPopup, setShowPopup] = useState(false)
  const [totalAmount, setTotalAmount] = useState(0)
  const [totalAmountExTax, setTotalAmountExTax] = useState(0)

  const handlePurchase = async () => {
    if (cart.length === 0) {
      alert('カートが空です')
      return
    }

    const payload = {
      emp_cd: '9999999999',
      store_cd: '00030',
      pos_no: '090',
      details: cart.map(item => ({
        prd_code: String(item.code),
        prd_name: item.name,
        prd_price: item.price,
        tax_cd: '01',
        quantity: item.quantity, // ★ 追加
      })),
    }



    type PurchaseResponse = {
      total_amount: number
      total_amount_ex_tax: number
    }

    try {
      const res = await api.post('/purchase', payload)
      const { total_amount, total_amount_ex_tax } = res.data as PurchaseResponse

      setTotalAmount(total_amount)
      setTotalAmountExTax(total_amount_ex_tax)
      setShowPopup(true)
      setCart([])
    } catch (error: any) {
      console.error('購入処理エラー:', error.response?.data || error)
      alert('購入処理に失敗しました')
    }
  }

  return (
    <>
      <button
        onClick={handlePurchase}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-lg text-white font-bold py-2 px-4 rounded"
      >
        購入
      </button>

      {showPopup && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.4)', // ← ここを変更
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <div className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-2xl shadow-lg p-6 w-11/12 max-w-sm text-center">
            <h2 className="text-lg font-semibold mb-4">購入が完了しました</h2>
            <p className="text-lg">合計（税込）：<span className="font-bold">{totalAmount.toLocaleString()}円</span></p>
            <p className="text-sm mb-6">税抜金額：<span className="font-bold">{totalAmountExTax.toLocaleString()}円</span></p>
            <button
              onClick={() => setShowPopup(false)}
              className="bg-blue-500 hover:bg-blue-600 text-white dark:text-white px-4 py-2 rounded transition focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  )
}
