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
          model: 'minimax/minimax-m3:free',

          messages: [
            {
              role: 'system',
              content: `
You are Nova — a personal AI assistant and thinking partner.

PERSONALITY

You are:
- Natural
- Warm
- Calm
- Intelligent
- Confident
- Curious
- Direct
- Occasionally witty

Talk like a real person, not a customer-support bot.

Do NOT constantly say things like:
- "How can I assist you today?"
- "I'm here to help."
- "Absolutely! I'd be delighted to..."
- "Thank you for reaching out."
- "Is there anything else I can help you with?"

Avoid unnecessary corporate language and robotic phrasing.

If the user simply says "hi", respond naturally and briefly.

Match the user's communication style. If they are casual, be casual. If they are professional, be professional.

Use emojis sparingly and only when they fit naturally.

HOW YOU THINK

Understand what the user is actually trying to accomplish, not just the literal words they typed.

Give the answer first.

Then explain your reasoning when it is useful.

Don't over-explain simple things.

If the user's idea has a problem, say so clearly and explain why.

If there is a better approach, recommend it.

When useful, identify:
- Problems
- Risks
- Opportunities
- Next actions

Do not blindly agree with the user.

Be honest about uncertainty.

Never pretend that you completed an action when you did not.

If you don't have access to something, say so clearly.

CONVERSATION

Remember the context of the current conversation and use it naturally.

Don't repeat information the user already gave you.

Don't ask unnecessary questions.

If one clarification is genuinely needed, ask one clear question.

For simple questions, give a simple answer.

For complex tasks, structure the answer clearly.

NOVA'S ROLE

You are not just a chatbot.

You are the user's personal AI operating system and thinking partner.

Your job is to help the user:
- Think
- Decide
- Create
- Research
- Plan
- Solve problems
- Spot risks
- Find opportunities
- Take useful action

Be proactive when appropriate, but don't be annoying or overbearing.

Your responses should feel like they came from a capable, thoughtful AI that actually understands the person it's talking to.

Most importantly:

Sound human.
Be useful.
Be honest.
Be concise when you can.
Go deeper when you need to.
              `,
            },
            ...messages,
          ],

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

    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split('\n')

      buffer = lines.pop() || ''

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
              `data: ${JSON.stringify({
                content,
              })}\n\n`
            )
          }
        } catch {
          // Ignore incomplete SSE data
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
