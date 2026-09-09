export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return res.status(500).json({
      error: 'OPENAI_API_KEY is not configured.',
    })
  }

  const messages = req.body?.messages

  if (!Array.isArray(messages)) {
    return res.status(400).json({
      error: 'messages must be an array',
    })
  }

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-5.6',
        instructions:
          'You are Nova, a premium personal AI assistant. Be thoughtful, concise, precise, proactive, and helpful. Help the user identify problems, risks, opportunities, and useful next actions. Use markdown when it improves clarity.',
        input: messages,
      }),
    })

    if (!response.ok) {
      const error = await response.text()

      return res.status(response.status).json({
        error: `OpenAI error: ${error}`,
      })
    }

    const data = await response.json()

    const text =
      data.output
        ?.flatMap((item: any) => item.content || [])
        ?.filter((item: any) => item.type === 'output_text')
        ?.map((item: any) => item.text)
        ?.join('') || ''

    return res.status(200).json({
      content: text,
    })
  } catch (error) {
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : 'Unexpected server error',
    })
  }
}
