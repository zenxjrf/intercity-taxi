export default function Loader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-tg-button border-t-transparent rounded-full animate-spin" />
        <p className="text-tg-hint text-sm">Загрузка...</p>
      </div>
    </div>
  )
}
