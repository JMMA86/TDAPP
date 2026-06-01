export default function SkeletonTaskCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 animate-pulse">
      <div className="flex items-start gap-3">
        {/* Círculo del checkbox */}
        <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 mt-0.5" />

        <div className="flex-1 min-w-0 space-y-2">
          {/* Línea de título */}
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          {/* Línea de título secundaria */}
          <div className="h-5 bg-gray-200 rounded w-1/2" />

          {/* Badges */}
          <div className="flex gap-2 pt-1">
            <div className="h-5 bg-gray-200 rounded-full w-16" />
            <div className="h-5 bg-gray-200 rounded-full w-20" />
          </div>
        </div>
      </div>

      {/* Botón placeholder */}
      <div className="mt-3">
        <div className="h-9 bg-gray-200 rounded-full w-44" />
      </div>
    </div>
  );
}
