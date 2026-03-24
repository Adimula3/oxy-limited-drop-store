export default function StockIndicator({ stock }) {
  if (stock === 0) {
    return <span className="text-xs font-medium text-red-500">Sold Out</span>
  }
  if (stock <= 5) {
    return <span className="text-xs font-medium text-amber-400">Only {stock} left</span>
  }
  return <span className="text-xs font-medium text-green-400">In Stock</span>
}
