'use client'

import React from 'react'
import api from '@/lib/api'
import { Product, CartItem } from '@/types'

type Props = {
  code: string
  setCode: React.Dispatch<React.SetStateAction<string>>
  product: Product | null
  setProduct: React.Dispatch<React.SetStateAction<Product | null>>
  cart: CartItem[]
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>
}

export default function AddButton({
  code,
  setCode,
  product,
  setProduct,
  cart,
  setCart,
}: Props) {
  const handleScan = async () => {
    if (!code.trim()) {
      alert('商品コードを入力してください')
      return
    }

    try {
      const res = await api.get<{ CODE: number; NAME: string; PRICE: number }>(`/items/${Number(code)}`)
      const raw = res.data
      console.log('レスポンスデータ:', raw)

      // 大文字キーを小文字キーに変換
      const data: Product = {
        code: raw.CODE,
        name: raw.NAME,
        price: raw.PRICE,
      }

      if (data && data.name) {
        setProduct(data)

        // 既にカートにあるかどうか確認
        const existing = cart.find((item) => item.code === data.code)

        if (existing) {
          const updatedCart = cart.map((item) =>
            item.code === data.code
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
          setCart(updatedCart)
        } else {
          setCart([...cart, { ...data, quantity: 1 }])
        }
      } else {
        alert('商品が見つかりませんでした')
        setProduct(null)
      }
    } catch (err) {
      console.error(err)
      alert('商品取得時にエラーが発生しました')
    }

    setCode('')
  }

  return (
    <button
      onClick={handleScan}
      className="w-full bg-blue-200 border border-blue-500 text-blue-800 font-bold py-2 px-4 rounded"
    >
      スキャン（カートに追加）
    </button>
  )
}
