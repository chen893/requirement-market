import Link from 'next/link'
import { FC } from 'react'

interface RequirementCardProps {
  id: string
  title: string
  description: string
  createdAt: string
  tags?: string[]
}

const RequirementCard: FC<RequirementCardProps> = ({
  id,
  title,
  description,
  createdAt,
  tags = [],
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 text-gray-900">
          <Link href={`/requirements/${id}`} className="hover:text-blue-600">
            {title}
          </Link>
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>
        
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>{createdAt}</span>
          <Link
            href={`/requirements/${id}`}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            查看详情
          </Link>
        </div>
      </div>
    </div>
  )
}

export default RequirementCard 