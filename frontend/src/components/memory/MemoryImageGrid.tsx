import type { MemoryImage } from '../../types/memory'

interface MemoryImageGridProps {
  images: MemoryImage[]
}

export function MemoryImageGrid({ images }: MemoryImageGridProps) {
  if (images.length === 0) return null

  return (
    <div className="grid grid-cols-3 gap-1">
      {images
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((image) => (
          <img
            key={image.id}
            src={image.imageUrl}
            alt=""
            className="aspect-square w-full rounded-lg object-cover"
          />
        ))}
    </div>
  )
}
