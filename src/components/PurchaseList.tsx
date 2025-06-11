'use client'

import { CartItem } from '@/types'

type Props = {
  cart: CartItem[]
}

export default function PurchaseList({ cart }: Props) {
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  return (
    <div className="mt-4">
      <h2 className="text-lg font-bold mb-2">購入リスト</h2>
      <table className="w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-1 px-2 border">商品名</th>
            <th className="py-1 px-2 border">単価</th>
            <th className="py-1 px-2 border">数量</th>
            <th className="py-1 px-2 border">小計</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item) => (
            <tr key={item.code}>
              <td className="py-1 px-2 border">{item.name}</td>
              <td className="py-1 px-2 border">{item.price}円</td>
              <td className="py-1 px-2 border">{item.quantity}</td>
              <td className="py-1 px-2 border">
                {item.price * item.quantity}円
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-bold bg-gray-100">
            <td colSpan={3} className="py-1 px-2 border text-right">
              合計
            </td>
            <td className="py-1 px-2 border">{total}円</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
