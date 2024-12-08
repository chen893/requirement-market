import OpenAI from 'openai'
import type { AIAnalysis } from '@/types'

const openai = new OpenAI({
  baseURL: process.env.OPENAI_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
})

export async function analyzeRequirement(
  title: string,
  description: string
): Promise<AIAnalysis> {
  try {
    const prompt = `
分析以下项目需求，并提供详细的建议：

项目标题：${title}
项目描述：${description}

请提供以下信息：
1. 项目可行性分析
2. 建议使用的技术栈
3. 预计开发周期
4. 具体建议和注意事项

请以 JSON 格式返回结果，包含以下字段：
- feasibility: 可行性分析（字符串）
- techStack: 建议的技术栈（字符串数组）
- timeline: 预计开发周期（字符串）
- suggestions: 具体建议（字符串数组）

示例：
{
  "feasibility": "可行",
  "techStack": ["React", "Next.js", "Tailwind CSS"],
  "timeline": "2周",
  "suggestions": ["使用Next.js框架", "采用Tailwind CSS进行样式设计"]
}
`

    console.log('openai.chat.completions.create', openai.chat.completions.create)
    const response = await openai.chat.completions.create({
      // process.env.OPENAI_MODEL || 
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            '你是一个专业的技术顾问，擅长分析项目需求并提供专业的建议。请始终以JSON格式返回分析结果。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const result = response.choices[0]?.message?.content
    if (!result) {
      throw new Error('No response from OpenAI')
    }

    // 解析 JSON 响应
    const analysis = JSON.parse(result)

    return {
      id: '', // 这个字段会由数据库生成
      requirementId: '', // 这个字段会在保存时设置
      feasibility: analysis.feasibility,
      techStack: analysis.techStack,
      timeline: analysis.timeline,
      suggestions: analysis.suggestions,
      createdAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('Failed to analyze requirement')
  }
}

export default openai 