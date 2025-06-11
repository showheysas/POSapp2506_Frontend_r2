export type Product = {
  code: number
  name: string
  price: number
}

export type CartItem = Product & {
  quantity: number
}
