'use client'

import React from 'react'

type Props = {
  code: string
  setCode: React.Dispatch<React.SetStateAction<string>>
}

export default function CameraInput({ code, setCode }: Props) {
  return (
    <div className="w-full flex flex-col items-center">
      <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
        バーコード（JANコード）を入力
      </label>
      <input
        type="text"
        id="code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="例：4901777018686"
        className="w-full max-w-sm border rounded px-3 py-2"
      />

      {/* カメラ映像の表示領域 */}
      <div className="mt-4 w-full flex justify-center">
        {/* ここにカメラ映像コンポーネント（例：<Video />）を入れる */}
        <div className="w-64 h-40 bg-gray-200 rounded">
          {/* 仮のカメラ映像領域 */}
          カメラ映像
        </div>
      </div>
    </div>
  )
}
