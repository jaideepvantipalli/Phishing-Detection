/**
 * Groq API service for the security chatbot
 */
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `
You are PhishGuard AI, a specialized security expert chatbot. 
Your goal is to help users understand phishing, cybersecurity, and online safety.

STRICT RULES:
1. ONLY answer questions related to cybersecurity, phishing, data privacy, social engineering, and online safety.
2. If a user asks a question about unrelated topics (e.g., cooking, sports, general coding not related to security, history, etc.), politely decline and steer them back to security topics.
3. Provide concise, expert, and actionable advice.
4. If you aren't sure about a specific technical detail, advise the user to consult official documentation or a professional security audit.
5. Use a professional yet helpful tone.
`;

export const groq = {
  async chat(messages) {
    if (!GROQ_API_KEY) {
      throw new Error('Groq API Key is missing. Please add VITE_GROQ_API_KEY to your environment or settings.');
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `Groq API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message;
    } catch (error) {
      console.error('Groq Chat Error:', error);
      throw error;
    }
  },

  async analyzeContent(content, type) {
    if (!GROQ_API_KEY) {
      throw new Error('Groq API Key is missing.');
    }

    const ANALYSIS_PROMPT = `
      Analyze the following URL for phishing or security risks. 
      Consider:
      1. Deceptive domain names (look-alikes).
      2. Suspicious TLDs.
      3. Obfuscation techniques.
      4. Redirect Chain Context: If this URL was reached via multiple redirects, it is a high-risk indicator of obfuscation.

      STRICT EVALUATION RULES:
      1. If the input is a well-known legitimate URL (e.g., github.com, google.com, microsoft.com), do NOT flag it as high risk unless there is a very obvious, specific sub-path that looks like an attack.
      2. Be highly skeptical of minor issues on high-reputation domains.
      3. For URLs, check for domain spoofing (e.g., g1thub.com vs github.com).
      4. For emails/texts, look for urgent tone, suspicious requests for sensitive info, and mismatched links.

      RESPONSE FORMAT: You MUST return ONLY a valid JSON object with the following structure:
      {
        "riskScore": number (0-100),
        "classification": "Low Risk" | "Medium Risk" | "High Risk",
        "type": "${type}",
        "reasons": [
          { "text": "description", "severity": "low" | "medium" | "high" | "critical", "keyword": "optional" }
        ]
      }
    `;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'system', content: ANALYSIS_PROMPT }],
          temperature: 0.1, // Low temperature for consistent JSON
          response_format: { type: "json_object" }
        }),
      });

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);
      return {
        ...result,
        input: content,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Groq Analysis Error:', error);
      throw error;
    }
  }
};

export default groq;
