'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import apiClient from '@/lib/api-client'
import type { AIAnalysis } from '@/types'

// 定义表单验证模式
const formSchema = z.object({
  title: z.string().min(5, '标题至少5个字符').max(100, '标题最多100个字符'),
  description: z
    .string()
    .min(20, '描述至少20个字符')
    .max(5000, '描述最多5000个字符'),
  budget: z.string().optional(),
  deadline: z.string().optional(),
  tags: z.string(),
})

type FormData = z.infer<typeof formSchema>

export default function NewRequirementPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      budget: '',
      deadline: '',
      tags: '',
    },
  })

  const { isSubmitting } = form.formState

  const handleAnalyze = async () => {
    const title = form.getValues('title')
    const description = form.getValues('description')

    if (!title || !description) {
      setError('请先填写标题和描述')
      return
    }

    try {
      setAnalyzing(true)
      setError('')
      const response = await apiClient.post<AIAnalysis>(
        '/requirements/analyze',
        {
          title,
          description,
        },
      )
      console.log('response.data', response)
      setAnalysis(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI 分析失败，请稍后重试')
    } finally {
      setAnalyzing(false)
    }
  }

  async function onSubmit(values: FormData) {
    try {
      setError('')
      await apiClient.post('/requirements', {
        ...values,
        budget: values.budget ? parseFloat(values.budget) : null,
        deadline: values.deadline || null,
        tags: values.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      })
      router.push('/requirements')
    } catch (err) {
      setError(err instanceof Error ? err.message : '发布需求失败，请稍后重试')
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>发布需求</CardTitle>
              <CardDescription>
                请详细描述您的需求，这将帮助开发者更好地理解您的项目。
              </CardDescription>
            </CardHeader>
          </Card>

          {analysis && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>AI 分析结果</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">可行性分析</h4>
                  <p className="text-sm text-muted-foreground">
                    {analysis.feasibility}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">建议技术栈</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {analysis.techStack.map((tech, index) => (
                      <li key={index}>{tech}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">预计开发周期</h4>
                  <p className="text-sm text-muted-foreground">
                    {analysis.timeline}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">具体建议</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {analysis.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardContent className="pt-6">
              {error && (
                <div className="rounded-md bg-destructive/10 p-4 mb-6">
                  <div className="text-sm text-destructive">{error}</div>
                </div>
              )}

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>标题</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="请输入需求标题（5-100字）"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>需求描述</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="请详细描述您的需求（20-5000字）"
                            className="resize-none"
                            rows={5}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>预算（元）</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="请输入预算金额"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>截止日期</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>标签</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="请输入标签，用逗号分隔"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          多个标签请用逗号分隔，例如：前端, React, TypeScript
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAnalyze}
                      disabled={analyzing || isSubmitting}
                    >
                      {analyzing && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {analyzing ? 'AI 分析中...' : 'AI 分析'}
                    </Button>

                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {isSubmitting ? '发布中...' : '发布需求'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
