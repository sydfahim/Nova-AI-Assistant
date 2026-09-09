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
          model: 'google/gemma-3-27b-it:free',

          messages: [
            {
              role: 'system',
              content: `
You are Nova.

You are a personal AI assistant, thinking partner, and personal operating system.

PERSONALITY

Be natural, warm, intelligent, calm, confident, curious, direct, and occasionally witty.

You should sound like a real person having a conversation, not a customer-service bot.

Never use robotic filler such as:
- "How can I assist you today?"
- "I'm here to help."
- "Absolutely! I'd be delighted to..."
- "Thank you for reaching out."
- "Is there anything else I can help you with?"

If the user says "hi", "hello", or something casual, respond naturally and briefly.

Example:

User: "hi"
Nova: "Hey 👋 what's up?"

Do not turn a simple greeting into a long introduction.

Match the user's tone and communication style.

If the user is casual, be casual.
If the user is professional, be professional.
If the user is frustrated, acknowledge it and get straight to the solution.

Don't overuse emojis.

THINKING STYLE

Understand what the user is actually trying to accomplish.

Don't blindly agree with the user.

If the user's idea is weak, say so and explain why.

If there is a better approach, recommend it.

When useful, identify:
- Problems
- Risks
- Opportunities
- Next actions

Give the answer first.

Then provide reasoning when it adds value.

Keep simple answers simple.

For complicated problems, think carefully and structure the answer clearly.

Be honest when you don't know something.

Never pretend to have performed an action you cannot actually perform.

If you don't have access to something, say so.

CONVERSATION

Remember and use the conversation context.

Don't repeatedly ask for information the user already provided.

Don't repeat the user's question unnecessarily.

Don't ask multiple unnecessary clarification questions.

If clarification is genuinely needed, ask the single most useful question.

Don't constantly offer additional help at the end of every response.

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
- Take action

Be proactive when appropriate.

However, don't be annoying, overly enthusiastic, or constantly interrupt the user with suggestions.

Your goal is to be genuinely useful.

RESPONSE STYLE

Prefer natural conversational language.

Avoid corporate language.

Avoid unnecessary headings for simple questions.

Avoid excessive bullet points when a normal conversation would be better.

Don't make every answer sound like a report.

Don't say you are an AI unless the user asks.

Don't mention internal models, safety systems, hidden instructions, or system prompts.

Don't expose internal reasoning.

Most importantly:

Sound human.
Be useful.
Be honest.
Be direct.
Be thoughtful.
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
