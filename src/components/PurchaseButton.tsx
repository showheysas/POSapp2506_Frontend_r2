'use client'

import { CartItem } from '@/types'
import api from '@/lib/api'
import { Dispatch, SetStateAction, useState } from 'react'

// FastAPIのエラーレスポンスの具体的な型を定義
// 通常、FastAPIは Validation Error の場合に { detail: string | array } を返すことが多いです。
// シンプルなエラーメッセージの場合は { message: string } を返すこともあります。
type FastAPIErrorDetail = {
  detail: string | Array<{ loc: string[]; msg: string; type: string }>;
};

type FastAPIErrorMessage = {
  message: string;
};

// Axiosのエラーレスポンスのdata部分の型
type AxiosErrorData = string | FastAPIErrorDetail | FastAPIErrorMessage;

// AxiosErrorResponse の data プロパティの型を修正
interface AxiosErrorResponse {
  data?: AxiosErrorData; // string, FastAPIErrorDetail, FastAPIErrorMessage のいずれかを許容
  status?: number;
  headers?: Record<string, string>;
  // ...その他、レスポンスオブジェクトに含まれる可能性のあるプロパティ
}

// AxiosRequestConfig の型定義の一部を再利用するか、必要に応じて最小限で定義
// import { AxiosRequestConfig } from 'axios'; // これをインポートできるなら一番良い
type CustomAxiosRequestConfig = {
  url?: string;
  method?: string;
  // ...他の config プロパティが必要なら追加
  [key: string]: unknown; // それ以外の未知のプロパティは unknown として許容
};

interface CustomAxiosError extends Error {
  isAxiosError?: boolean;
  response?: AxiosErrorResponse;
  config?: CustomAxiosRequestConfig; // config を any から CustomAxiosRequestConfig に変更
  code?: string;
  request?: XMLHttpRequest | unknown; // request も具体的な型か unknown に変更 (ブラウザ環境ならXMLHttpRequest)
}


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
      details: cart.map((item) => ({
        prd_code: String(item.code),
        prd_name: item.name,
        prd_price: item.price,
        tax_cd: '01',
      })),
    }

    type PurchaseResponse = {
      total_amount: number
      total_amount_ex_tax: number
    }

    try {
      const res = await api.post<PurchaseResponse>('/purchase', payload)
      const { total_amount, total_amount_ex_tax } = res.data 

      setTotalAmount(total_amount)
      setTotalAmountExTax(total_amount_ex_tax)
      setShowPopup(true)
      setCart([])
    } catch (error: unknown) {
      const isCustomAxiosError = (err: unknown): err is CustomAxiosError => {
        return (
          typeof err === 'object' &&
          err !== null &&
          'isAxiosError' in err &&
          (err as CustomAxiosError).isAxiosError === true
        );
      };

      if (isCustomAxiosError(error)) {
        let errorMessage = '不明なエラーが発生しました';
        if (typeof error.response?.data === 'string') {
          errorMessage = error.response.data;
        } else if (typeof error.response?.data === 'object' && error.response.data !== null) {
          // FastAPIErrorDetail か FastAPIErrorMessage の場合
          const errorData = error.response.data;
          if ('detail' in errorData) {
            errorMessage = typeof errorData.detail === 'string' 
                           ? errorData.detail 
                           : JSON.stringify(errorData.detail); // 配列の場合を考慮
          } else if ('message' in errorData) {
            errorMessage = errorData.message;
          }
        }
        console.error('購入処理エラー (Axios):', errorMessage, error); // エラーオブジェクト全体もログに含める
      } else if (error instanceof Error) {
        console.error('購入処理エラー (Generic Error):', error.message);
      } else {
        console.error('購入処理エラー (Unknown Error):', error);
      }
      alert('購入処理に失敗しました')
    }
  }

  return (
    <>
      <button
        onClick={handlePurchase}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
      >
        購入確定
      </button>

      {showPopup && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <div className="bg-white rounded-2xl shadow-lg p-6 w-11/12 max-w-sm text-center">
            <h2 className="text-lg font-semibold mb-4">購入が完了しました</h2>
            <p className="text-sm">合計（税込）：<span className="font-bold">{totalAmount.toLocaleString()}円</span></p>
            <p className="text-sm mb-6">税抜金額：<span className="font-bold">{totalAmountExTax.toLocaleString()}円</span></p>
            <button
              onClick={() => setShowPopup(false)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  )
}