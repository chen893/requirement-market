'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import apiClient from '@/lib/api-client'
import { formatRelativeTime } from '@/lib/utils'

interface User {
  id: string
  username: string
  avatar?: string
}

interface Tag {
  id: string
  name: string
}

interface Requirement {
  id: string
  title: string
  description: string
  budget: number | null
  deadline: string | null
  status: string
  createdAt: string
  user: User
  tags: Tag[]
  _count: {
    comments: number
    likes: number
  }
}

interface RequirementListResponse {
  items: Requirement[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// 状态选项
const statusOptions = [
  { value: '', label: '全部状态' },
  { value: 'open', label: '招募中' },
  { value: 'in_progress', label: '进行中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
]

// 排序选项
const sortOptions = [
  { value: 'latest', label: '最新发布' },
  { value: 'oldest', label: '最早发布' },
  { value: 'most_comments', label: '评论最多' },
  { value: 'most_likes', label: '点赞最多' },
  { value: 'highest_budget', label: '预算最高' },
]

// 热门标签
const popularTags = [
  '全部',
  '前端开发',
  '后端开发',
  '移动应用',
  'UI设计',
  '小程序',
  '人工智能',
  '数据分析',
  '区块链',
]

export default function RequirementsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')
  const [filters, setFilters] = useState({
    status: searchParams?.get('status') || '',
    tag: searchParams?.get('tag') || '',
    search: searchParams?.get('search') || '',
    sort: searchParams?.get('sort') || 'latest',
  })

  const fetchRequirements = async (pageNum: number, isNewSearch = false) => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: '9',
        ...(filters.status && { status: filters.status }),
        ...(filters.tag && { tag: filters.tag }),
        ...(filters.search && { search: filters.search }),
        ...(filters.sort && { sort: filters.sort }),
      })

      const data = await apiClient.get<RequirementListResponse>(
        `/requirements?${queryParams}`
      )

      if (isNewSearch) {
        setRequirements(data.items)
      } else {
        setRequirements(prev => [...prev, ...data.items])
      }
      setHasMore(pageNum < data.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取需求列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
    fetchRequirements(1, true)
  }, [filters])

  const handleFilterChange = (
    key: keyof typeof filters,
    value: string
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    // 更新 URL 参数
    const newParams = new URLSearchParams(searchParams?.toString() || '')
    if (value) {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
    router.push(`/requirements?${newParams.toString()}`)
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1)
      fetchRequirements(page + 1)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return '招募中'
      case 'in_progress':
        return '进行中'
      case 'completed':
        return '已完成'
      case 'cancelled':
        return '已取消'
      default:
        return status
    }
  }

  return (
    <div className="bg-gray-50 py-8 min-h-[calc(100vh-10)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              需求列表
            </h2>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <Link
              href="/requirements/new"
              className="ml-3 inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              发布需求
            </Link>
          </div>
        </div>

        {/* 筛选栏 */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center space-x-4">
            <div className="max-w-sm flex-1">
              <label htmlFor="search" className="sr-only">
                搜索需求
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="search"
                  id="search"
                  className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  placeholder="搜索需求..."
                  value={filters.search}
                  onChange={e => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>
            <select
              value={filters.status}
              onChange={e => handleFilterChange('status', e.target.value)}
              className="rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={filters.sort}
              onChange={e => handleFilterChange('sort', e.target.value)}
              className="rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-2 ${
                viewMode === 'grid'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-400 hover:text-gray-500'
              } rounded-md`}
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.25 2A2.25 2.25 0 002 4.25v2.5A2.25 2.25 0 004.25 9h2.5A2.25 2.25 0 009 6.75v-2.5A2.25 2.25 0 006.75 2h-2.5zm0 9A2.25 2.25 0 002 13.25v2.5A2.25 2.25 0 004.25 18h2.5A2.25 2.25 0 009 15.75v-2.5A2.25 2.25 0 006.75 11h-2.5zm9-9A2.25 2.25 0 0011 4.25v2.5A2.25 2.25 0 0013.25 9h2.5A2.25 2.25 0 0018 6.75v-2.5A2.25 2.25 0 0015.75 2h-2.5zm0 9A2.25 2.25 0 0011 13.25v2.5A2.25 2.25 0 0013.25 18h2.5A2.25 2.25 0 0018 15.75v-2.5A2.25 2.25 0 0015.75 11h-2.5z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-2 ${
                viewMode === 'list'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-400 hover:text-gray-500'
              } rounded-md`}
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 热门标签 */}
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {popularTags.map(tag => (
              <button
                key={tag}
                onClick={() => handleFilterChange('tag', tag === '全部' ? '' : tag)}
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                  (tag === '全部' && !filters.tag) || filters.tag === tag
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* 需求列表 */}
        {loading ? (
          <div className="mt-10 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : requirements.length === 0 ? (
          <div className="mt-10 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              暂无需求
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              开始发布您的第一个需求吧
            </p>
            <div className="mt-6">
              <Link
                href="/requirements/new"
                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <svg
                  className="-ml-0.5 mr-1.5 h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                发布需求
              </Link>
            </div>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
                : 'mt-6 space-y-4'
            }
          >
            {requirements.map((requirement) => (
              <div
                key={requirement.id}
                onClick={() => router.push(`/requirements/${requirement.id}`)}
                className={`${
                  viewMode === 'grid'
                    ? 'group relative bg-white rounded-lg shadow-sm ring-1 ring-gray-200 hover:shadow-lg hover:ring-gray-300 transition-all duration-200 cursor-pointer'
                    : 'bg-white shadow sm:rounded-lg hover:shadow-lg transition-shadow duration-200 cursor-pointer'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {requirement.user.avatar ? (
                        <img
                          src={requirement.user.avatar}
                          alt={requirement.user.username}
                          className="h-10 w-10 rounded-full cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/users/${requirement.user.id}`)
                          }}
                        />
                      ) : (
                        <div
                          className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/users/${requirement.user.id}`)
                          }}
                        >
                          {requirement.user.username[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p
                          className="text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/users/${requirement.user.id}`)
                          }}
                        >
                          {requirement.user.username}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatRelativeTime(requirement.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                          requirement.status
                        )}`}
                      >
                        {getStatusText(requirement.status)}
                      </span>
                      {requirement.budget && (
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                          ¥{requirement.budget}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                      {requirement.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 line-clamp-3">
                      {requirement.description}
                    </p>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg
                          className="mr-1.5 h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        {requirement._count.comments}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <svg
                          className="mr-1.5 h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                        {requirement._count.likes}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {requirement.tags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleFilterChange('tag', tag.name)
                        }}
                        className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 hover:bg-gray-200"
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 加载更多按钮 */}
        {!loading && hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={loadMore}
              className="inline-flex items-center rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              加载更多
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 