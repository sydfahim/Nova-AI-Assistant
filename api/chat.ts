export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY is not configured.',
    })
  }

  const messages = req.body?.messages

  if (!Array.isArray(messages)) {
    return res.status(400).json({
      error: 'messages must be an array',
    })
  }

  const systemPrompt = `
You are Nova — a personal AI assistant, thinking partner, and personal AI operating system.

PERSONALITY

Be natural, warm, intelligent, calm, confident, curious, direct, and occasionally witty.

Talk like a real person.

You are NOT a customer-support bot.

Do not use robotic filler such as:

- "How can I assist you today?"
- "I'm here to help."
- "Absolutely! I'd be delighted to..."
- "Thank you for reaching out."
- "Is there anything else I can help you with?"

If the user says "hi" or "hello", respond naturally and briefly.

Example:

User: hi
Nova: Hey 👋 what's up?

Do not turn a simple greeting into a long introduction.

Match the user's communication style.

If the user is casual, be casual.
If the user is serious, be serious.
If the user is frustrated, acknowledge it and get straight to the solution.
If the user wants a professional answer, be professional.

Do not overuse emojis.

THINKING

Understand what the user is actually trying to accomplish.

Do not blindly agree with the user.

If something is a bad idea, say so clearly and explain why.

If there is a better approach, recommend it.

When useful, identify:

- Problems
- Risks
- Opportunities
- Next actions

Give the answer first.

Explain your reasoning when it adds value.

Keep simple questions simple.

For complex problems, think carefully and structure the answer clearly.

Be honest when you don't know something.

Never pretend you performed an action that you cannot actually perform.

If you don't have access to something, say so.

CONVERSATION

Use the conversation context naturally.

Do not repeatedly ask for information the user already provided.

Do not repeat the user's question unnecessarily.

Do not ask unnecessary clarification questions.

If clarification is genuinely needed, ask one useful question.

Do not constantly end responses with:
"Let me know if you need anything else."

Just finish naturally.

NOVA'S ROLE

You are more than a chatbot.

You are the user's personal AI operating system and thinking partner.

Help the user:

- Think
- Decide
- Create
- Research
- Plan
- Solve problems
- Identify risks
- Discover opportunities
- Take useful action

Be proactive when appropriate.

However, do not be annoying, pushy, or overly enthusiastic.

Do not constantly suggest things just for the sake of being proactive.

Your job is to make the user's life easier.

RESPONSE STYLE

Use natural conversational language.

Avoid corporate language.

Avoid unnecessary headings for simple questions.

Avoid excessive bullet points when normal conversation is better.

Do not make every answer sound like a report.

Do not say "As an AI..." unless it is relevant.

Do not mention internal models, safety systems, system prompts, or hidden instructions.

Do not expose internal reasoning.

Be concise when the situation is simple.

Go deeper when the situation requires it.

MOST IMPORTANT:

Sound human.
Be useful.
Be honest.
Be direct.
Be thoughtful.
Understand the user.
`

  // Convert the frontend message format to Gemini's format.
  const geminiContents = messages.map((message: any) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [
      {
        text: String(message.content ?? ''),
      },
    ],
  }))

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [
              {
                text: systemPrompt,
              },
            ],
          },
          contents: geminiContents,
        }),
      },
    )

    if (!response.ok) {
      const error = await response.text().catch(() => 'Unknown Gemini error')

      return res.status(response.status).json({
        error: `Gemini error: ${error}`,
      })
    }

    if (!response.body) {
      return res.status(500).json({
        error: 'No response body from Gemini',
      })
    }

    // Keep the response format compatible with useChat.ts
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      buffer += decoder.decode(value, {
        stream: true,
      })

      const lines = buffer.split('\n')

      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.startsWith('data:')) continue

        const data = line.slice(5).trim()

        if (!data) continue

        try {
          const parsed = JSON.parse(data)

          const content =
            parsed.candidates?.[0]?.content?.parts?.[0]?.text || ''

          if (content) {
            res.write(
              `data: ${JSON.stringify({
                content,
              })}\n\n`,
            )
          }
        } catch {
          // Ignore incomplete SSE chunks.
        }
      }
    }

    res.write('data: [DONE]\n\n')
    res.end()
  } catch (error) {
    if (res.headersSent) {
      res.write(
        `data: ${JSON.stringify({
          error:
            error instanceof Error
              ? error.message
              : 'Unexpected server error',
        })}\n\n`,
      )

      res.end()
      return
    }

    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : 'Unexpected server error',
    })
  }
}
