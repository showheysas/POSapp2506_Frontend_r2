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
      <table className="w-full border border-black text-black">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-1 px-2 border border-black">商品名</th>
            <th className="py-1 px-2 border border-black">単価</th>
            <th className="py-1 px-2 border border-black">数量</th>
            <th className="py-1 px-2 border border-black">小計</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item) => (
            <tr key={item.code}>
              <td className="py-1 px-2 border border-black">{item.name}</td>
              <td className="py-1 px-2 border border-black">{item.price}円</td>
              <td className="py-1 px-2 border border-black">{item.quantity}</td>
              <td className="py-1 px-2 border border-black">{item.price * item.quantity}円</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-bold bg-gray-100">
            <td colSpan={3} className="py-1 px-2 border border-black text-right">合計</td>
            <td className="py-1 px-2 border border-black">{total}円</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
