import { NextResponse } from 'next/server'
import { analyzeRequirement } from '@/lib/openai'

export async function POST(request: Request) {
  try {
    const { title, description } = await request.json()

    if (!title || !description) {
      return NextResponse.json({ error: '标题和描述是必需的' }, { status: 400 })
    }

    const analysis = await analyzeRequirement(title, description)

    return NextResponse.json({
      success: true,
      data: analysis,
    })
  } catch (error) {
    console.error('AI analysis error:', error)
    return NextResponse.json({ error: '分析失败，请稍后重试' }, { status: 500 })
  }
}
