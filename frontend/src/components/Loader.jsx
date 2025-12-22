export default function Loader({ text = "Loading..." }) {
  return (
    <div className="flex items-center justify-center py-6">
      <p className="text-gray-500 text-sm">
        {text}
      </p>
    </div>
  )
}
