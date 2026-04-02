'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSession } from '@/lib/storage'

const EXAMPLE_CHALLENGES = [
  'Improve retention in a B2B SaaS product with complex onboarding',
  'Launch an AI-powered feature for a mobile consumer app',
  'Build a marketplace for freelance designers targeting SMBs',
]

export function InputForm() {
  const router = useRouter()
  const [challenge, setChallenge] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const charCount = challenge.length
  const isValid = charCount >= 50 && charCount <= 2000

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || isSubmitting) return

    setIsSubmitting(true)
    const session = createSession(challenge)
    router.push(`/session/${session.id}`)
  }

  const handleExampleClick = (example: string) => {
    setChallenge(example)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6">
      <div>
        <label htmlFor="challenge" className="sr-only">
          Product challenge
        </label>
        <textarea
          id="challenge"
          value={challenge}
          onChange={(e) => setChallenge(e.target.value)}
          placeholder="Describe your product challenge. E.g. 'We need to improve retention for our B2B SaaS tool — users churn after 30 days because onboarding is too complex...'"
          rows={6}
          className="w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Describe your product challenge"
        />
        <div className="mt-2 flex justify-between text-xs">
          <span
            className={
              charCount < 50
                ? 'text-amber-500'
                : charCount > 2000
                  ? 'text-red-500'
                  : 'text-gray-500'
            }
          >
            {charCount} / 2000 characters {charCount < 50 && '(min 50)'}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Examples:
        </span>
        {EXAMPLE_CHALLENGES.map((example, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleExampleClick(example)}
            className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label={`Use example: ${example}`}
          >
            {example}
          </button>
        ))}
      </div>

      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        className="w-full rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300"
        aria-label="Generate PM artifacts"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="h-5 w-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Starting...
          </span>
        ) : (
          'Generate PM Artifacts →'
        )}
      </button>
    </form>
  )
}
