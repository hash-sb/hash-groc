// Vercel Serverless Function: /api/scan-receipt
// Protects GEMINI_API_KEY on the server so it is never exposed in the client browser bundle.

const RECEIPT_PROMPT = `You are a high-accuracy grocery receipt parser. Analyze this receipt photo and extract all purchased items, prices, store details, and total.

Format your response as a valid JSON object matching this schema:
{
  "storeName": "Store Brand Name (e.g. Costco, Trader Joe's, ALDI, Walmart, Target, Kroger, HEB, Whole Foods, Safeway) or null if unreadable",
  "date": "YYYY-MM-DD or null if not found",
  "total": 0.00,
  "items": [
    {
      "rawName": "Exact text line from receipt (e.g. KS ORG WHOLE MILK 1GAL)",
      "cleanedName": "Clean human-readable grocery item name (e.g. Organic Whole Milk)",
      "price": 4.29,
      "quantity": 1,
      "packageSize": "1 gal or 16 oz or null",
      "category": "Produce | Dairy & Eggs | Meat & Poultry | Bakery | Pantry | Snacks | Frozen | Beverages | Household | Other"
    }
  ]
}

Guidelines:
- Include ONLY actual grocery/household items purchased. Exclude sales tax lines, subtotal, coupons, discount summaries, savings summaries, change due, or payment method lines (like VISA/CASH).
- Ensure price is the final item price after line-item discounts.
- Clean names should be friendly and match common grocery list entries (e.g. "Avocados", "Eggs", "Sourdough Bread").
- Return strictly raw JSON with no markdown wrapping or code blocks.`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const serverApiKey = (process.env.GEMINI_API_KEY || '').trim()
  if (!serverApiKey) {
    return res.status(501).json({
      error: 'SERVER_KEY_NOT_CONFIGURED',
      message: 'Server GEMINI_API_KEY is not configured in Vercel environment variables.',
    })
  }

  try {
    const { base64Data, mimeType = 'image/jpeg' } = req.body || {}
    if (!base64Data || typeof base64Data !== 'string') {
      return res.status(400).json({ error: 'Missing receipt image base64Data' })
    }

    // Basic size safeguard (~6MB base64 max)
    if (base64Data.length > 6_000_000) {
      return res.status(413).json({ error: 'Receipt image payload is too large' })
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${serverApiKey}`

    const geminiRes = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: RECEIPT_PROMPT },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.1,
        },
      }),
    })

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      return res.status(geminiRes.status).json({
        error: `Gemini API error (${geminiRes.status})`,
        details: errText,
      })
    }

    const jsonResponse = await geminiRes.json()
    const textOutput = jsonResponse?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!textOutput) {
      return res.status(502).json({ error: 'Gemini did not return any text for this receipt image.' })
    }

    const sanitized = textOutput.replace(/```json/gi, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(sanitized)

    return res.status(200).json(parsed)
  } catch (err) {
    console.error('Receipt scan serverless error:', err)
    return res.status(500).json({
      error: 'Failed to process receipt image on server.',
    })
  }
}
