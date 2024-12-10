'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { formatRelativeTime } from '@/lib/utils'
import apiClient from '@/lib/api-client'
import toast, { Toaster } from 'react-hot-toast'
import type { Requirement, Comment } from '@/types'

interface RelatedRequirement {
  id: string
  title: string
  status: string
  budget: number | null
}

export default function RequirementDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const [requirement, setRequirement] = useState<Requirement | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [relatedRequirements, setRelatedRequirements] = useState<
    RelatedRequirement[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [commentContent, setCommentContent] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [liked, setLiked] = useState(false)

  // 获取需求详情
  useEffect(() => {
    const fetchRequirementDetail = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await apiClient.get<Requirement>(`/requirements/${id}`)
        setRequirement(data)

        // // 获取相关需求
        const relatedData = await apiClient.get<RelatedRequirement[]>(
          `/requirements/${id}/related`,
        )
        setRelatedRequirements(relatedData)

        // 获取评论列表
        const commentsData = await apiClient.get<Comment[]>(
          `/requirements/${id}/comments`,
        )
        setComments(commentsData)

        // 获取点赞状态
        const likeStatus = await apiClient.get<{ liked: boolean }>(
          `/requirements/${id}/like-status`,
        )
        setLiked(likeStatus.liked)
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取需求详情失败')
        toast.error('获取需求详情失败')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchRequirementDetail()
    }
  }, [id])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentContent.trim()) return

    try {
      setSubmittingComment(true)
      const newComment = await apiClient.post<Comment>(
        `/requirements/${id}/comments`,
        {
          content: commentContent,
        },
      )
      setComments((prev) => [newComment, ...prev])
      setCommentContent('')
      toast.success('评论发布成功')
    } catch (err) {
      toast.error('评论发布失败')
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleToggleLike = async () => {
    try {
      const response = await apiClient.post<{ liked: boolean }>(
        `/requirements/${id}/like-status`,
      )
      setLiked(response.liked)
      if (requirement) {
        setRequirement((prev) =>
          prev
            ? {
                ...prev,
                _count: {
                  likes: (prev._count?.likes || 0) + (response.liked ? 1 : -1),
                  comments: prev._count?.comments || 0,
                },
              }
            : null,
        )
      }
      toast.success(response.liked ? '已添加到收藏' : '已取消收藏')
    } catch (err) {
      toast.error('操作失败')
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-2/3 bg-gray-200 rounded"></div>
            <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !requirement) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              {error || '需求不存在'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              请检查链接是否正确，或返回需求列表
            </p>
            <div className="mt-6">
              <Link
                href="/requirements"
                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                返回需求列表
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 py-8 min-h-[calc(100vh-10)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:flex lg:items-start lg:space-x-8">
          {/* 主要内容 */}
          <div className="flex-1">
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                {/* 标题和状态 */}
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {requirement.title}
                    </h1>
                    <div className="mt-2 flex items-center space-x-4">
                      <span className="text-sm text-gray-500">
                        发布于 {formatRelativeTime(requirement.createdAt)}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                          requirement.status,
                        )}`}
                      >
                        {getStatusText(requirement.status)}
                      </span>
                      {requirement.budget && (
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                          预算 ¥{requirement.budget}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleToggleLike}
                      className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold ${
                        liked
                          ? 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                          : 'bg-white text-gray-700 hover:bg-gray-50 ring-1 ring-inset ring-gray-300'
                      }`}
                    >
                      <svg
                        className={`-ml-0.5 mr-1.5 h-5 w-5 ${
                          liked ? 'text-pink-700' : 'text-gray-400'
                        }`}
                        fill={liked ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      {liked ? '已收藏' : '收藏'}
                    </button>
                    <button
                      onClick={() => {
                        const url = window.location.href
                        navigator.clipboard.writeText(url)
                        toast.success('链接已复制')
                      }}
                      className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      <svg
                        className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                      </svg>
                      分享
                    </button>
                  </div>
                </div>

                {/* 标签 */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {requirement.tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/requirements?tag=${encodeURIComponent(tag.name)}`}
                      className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 hover:bg-gray-200"
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>

                {/* 详细描述 */}
                <div className="prose prose-blue mt-8 max-w-none">
                  <div className="whitespace-pre-wrap">
                    {requirement.description}
                  </div>
                </div>

                {/* 附件 */}
                {requirement.attachments &&
                  requirement.attachments.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-medium text-gray-900">
                        附件
                      </h3>
                      <ul className="mt-4 divide-y divide-gray-200 rounded-md border border-gray-200">
                        {requirement.attachments.map((attachment) => (
                          <li
                            key={attachment.id}
                            className="flex items-center justify-between py-3 pl-3 pr-4 text-sm"
                          >
                            <div className="flex w-0 flex-1 items-center">
                              <svg
                                className="h-5 w-5 flex-shrink-0 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                />
                              </svg>
                              <span className="ml-2 w-0 flex-1 truncate">
                                {attachment.filename}
                              </span>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              <a
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-blue-600 hover:text-blue-500"
                              >
                                下载
                              </a>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            </div>

            {/* 评论区 */}
            <div className="mt-8">
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg font-medium text-gray-900">
                    评论 ({requirement._count?.comments || 0})
                  </h2>

                  {/* 评论输入框 */}
                  <form onSubmit={handleSubmitComment} className="mt-4">
                    <div>
                      <label htmlFor="comment" className="sr-only">
                        添加评论
                      </label>
                      <textarea
                        rows={3}
                        name="comment"
                        id="comment"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        placeholder="写下你的评论..."
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-end">
                      <button
                        type="submit"
                        disabled={submittingComment || !commentContent.trim()}
                        className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submittingComment ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            发布中...
                          </>
                        ) : (
                          '发布评论'
                        )}
                      </button>
                    </div>
                  </form>

                  {/* 评论列表 */}
                  <div className="mt-6 flow-root">
                    <ul className="-mb-8">
                      {comments.map((comment, commentIdx) => (
                        <li key={comment.id}>
                          <div className="relative pb-8">
                            {commentIdx !== comments.length - 1 ? (
                              <span
                                className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200"
                                aria-hidden="true"
                              />
                            ) : null}
                            <div className="relative flex items-start space-x-3">
                              <Image
                                src={
                                  comment.user.avatar || '/default-avatar.png'
                                }
                                alt={comment.user.username}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                              <div className="min-w-0 flex-1">
                                <div>
                                  <div className="text-sm">
                                    <a
                                      href={`/users/${comment.user.id}`}
                                      className="font-medium text-gray-900"
                                    >
                                      {comment.user.username}
                                    </a>
                                  </div>
                                  <p className="mt-0.5 text-sm text-gray-500">
                                    {formatRelativeTime(comment.createdAt)}
                                  </p>
                                </div>
                                <div className="mt-2 text-sm text-gray-700">
                                  <p>{comment.content}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 侧边栏 */}
          <div className="mt-8 lg:mt-0 lg:w-96">
            {/* 发布者信息 */}
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center space-x-4">
                  <Image
                    src={requirement.user.avatar || '/default-avatar.png'}
                    alt={requirement.user.username}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {requirement.user.username}
                    </h3>
                    <p className="text-sm text-gray-500">
                      加入于 {formatRelativeTime(requirement.user.createdAt)}
                    </p>
                  </div>
                </div>
                {/* {requirement.user.bio && (
                  <p className="mt-4 text-sm text-gray-500">
                    {requirement.user.bio}
                  </p>
                )} */}
                <div className="mt-6">
                  <Link
                    href={`/users/${requirement.user.id}`}
                    className="block w-full rounded-md bg-white px-3 py-2 text-center text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    查看主页
                  </Link>
                </div>
              </div>
            </div>

            {/* 相关需求 */}
            {relatedRequirements.length > 0 && (
              <div className="mt-8 bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    相关需求
                  </h3>
                  <div className="mt-6 flow-root">
                    <ul className="-my-5 divide-y divide-gray-200">
                      {relatedRequirements.map((related) => (
                        <li key={related.id} className="py-5">
                          <div className="relative focus-within:ring-2 focus-within:ring-blue-500">
                            <h3 className="text-sm font-semibold text-gray-800">
                              <Link
                                href={`/requirements/${related.id}`}
                                className="hover:underline focus:outline-none"
                              >
                                <span
                                  className="absolute inset-0"
                                  aria-hidden="true"
                                />
                                {related.title}
                              </Link>
                            </h3>
                            <div className="mt-1 flex items-center space-x-2">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                                  related.status,
                                )}`}
                              >
                                {getStatusText(related.status)}
                              </span>
                              {related.budget && (
                                <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                                  预算 ¥{related.budget}
                                </span>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  )
}
