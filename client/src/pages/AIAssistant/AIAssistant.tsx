
import { useState } from 'react';
import type { FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import './AIAssistant.css';

type HistoryItem = {
  prompt: string;
  response: string;
};

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

function AIAssistant() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      setError('Please enter a prompt.');
      return;
    }

    setIsLoading(true);
    setResponse('');
    setError('');

    try {
      const res = await fetch(`${BACKEND_URL}/api/ai/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: trimmedPrompt }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`API error: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let completeResponse = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data:')) continue;

          const data = line.replace(/^data:\s?/, '').trim();

          if (!data || data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const text =
              parsed.candidates?.[0]?.content?.parts?.[0]?.text ??
              parsed.text ??
              parsed.token ??
              parsed.delta ??
              '';

            if (text) {
              completeResponse += text;
              setResponse((previous) => previous + text);
            }
          } catch {
            // Ignore incomplete streaming chunks.
          }
        }
      }

      if (completeResponse.trim()) {
        setHistory((previous) =>
          [
            {
              prompt: trimmedPrompt,
              response: completeResponse,
            },
            ...previous,
          ].slice(0, 3),
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="assistant-page">
      <div className="assistant-container">
        <h1 className="assistant-title">Content Generation AI Assistant</h1>
        <p className="assistant-subtitle">
          Ask for recipe ideas, ingredient substitutions, cooking tips, or help
          writing recipe content.
        </p>

        <form className="assistant-form" onSubmit={handleSubmit}>
          <label className="assistant-label" htmlFor="prompt">
            Your prompt
          </label>

          <textarea
            id="prompt"
            className="assistant-textarea"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Ask something..."
            rows={5}
            disabled={isLoading}
          />

          <button
            type="submit"
            className="assistant-btn-primary"
            disabled={isLoading || !prompt.trim()}
          >
            {isLoading ? 'Generating...' : 'Ask AI'}
          </button>
        </form>

        {isLoading && !response && (
          <p className="assistant-status">Generating response...</p>
        )}

        {error && (
          <p className="assistant-error" role="alert">
            {error}
          </p>
        )}

        {response && (
          <div className="assistant-response" aria-live="polite">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {response}
            </ReactMarkdown>
          </div>
        )}

        <section className="assistant-history">
          <h2 className="assistant-history-title">Recent session history</h2>

          {history.length === 0 ? (
            <p className="assistant-empty">No prompts yet.</p>
          ) : (
            history.map((item, index) => (
              <article
                className="assistant-history-item"
                key={`${item.prompt}-${index}`}
              >
                <h3 className="assistant-history-prompt">{item.prompt}</h3>

                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {item.response}
                </ReactMarkdown>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}

export default AIAssistant;
