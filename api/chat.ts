export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    return res.status(500).json({
      error: 'OPENROUTER_API_KEY is not configured.',
    })
  }

  const messages = req.body?.messages

  if (!Array.isArray(messages)) {
    return res.status(400).json({
      error: 'messages must be an array',
    })
  }

  try {
    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://nova-ai-assistant-beta.vercel.app',
          'X-Title': 'Nova AI Assistant',
        },
        body: JSON.stringify({
          model: 'openrouter/free',
          messages,
          stream: true,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()

      return res.status(response.status).json({
        error: `OpenRouter error: ${error}`,
      })
    }

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    if (!response.body) {
      return res.status(500).json({
        error: 'No response body from OpenRouter',
      })
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      const chunk = decoder.decode(value, { stream: true })

      const lines = chunk.split('\n')

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue

        const data = line.slice(6).trim()

        if (data === '[DONE]') {
          res.write('data: [DONE]\n\n')
          continue
        }

        try {
          const parsed = JSON.parse(data)
          const content =
            parsed.choices?.[0]?.delta?.content || ''

          if (content) {
            res.write(
              `data: ${JSON.stringify({ content })}\n\n`
            )
          }
        } catch {
          // Ignore incomplete SSE chunks
        }
      }
    }

    res.write('data: [DONE]\n\n')
    res.end()
  } catch (error) {
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : 'Unexpected server error',
    })
  }
}
