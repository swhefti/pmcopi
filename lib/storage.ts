import { Session, Artifact, SessionWithArtifacts, ArtifactType } from '@/types'

const SESSION_INDEX_KEY = 'pm_copilot:sessions'
const sessionKey = (id: string) => `pm_copilot:session:${id}`
const artifactKey = (sessionId: string, type: ArtifactType) =>
  `pm_copilot:artifact:${sessionId}:${type}`

// Guard: localStorage is unavailable during SSR
const isClient = typeof window !== 'undefined'

export function createSession(challenge: string): Session {
  const session: Session = {
    id: crypto.randomUUID(),
    challenge,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  if (!isClient) return session
  localStorage.setItem(sessionKey(session.id), JSON.stringify(session))
  // Maintain an index of all session IDs for the history page
  const index = getSessionIndex()
  localStorage.setItem(SESSION_INDEX_KEY, JSON.stringify([session.id, ...index]))
  return session
}

export function getSession(id: string): Session | null {
  if (!isClient) return null
  const raw = localStorage.getItem(sessionKey(id))
  return raw ? JSON.parse(raw) : null
}

export function updateSessionStatus(id: string, status: Session['status']): void {
  if (!isClient) return
  const session = getSession(id)
  if (!session) return
  localStorage.setItem(sessionKey(id), JSON.stringify({
    ...session,
    status,
    updated_at: new Date().toISOString(),
  }))
}

export function saveArtifact(sessionId: string, type: ArtifactType, content: unknown): Artifact {
  const artifact: Artifact = {
    id: crypto.randomUUID(),
    session_id: sessionId,
    type,
    content: content as Artifact['content'],
    raw_text: null,
    created_at: new Date().toISOString(),
  }
  if (!isClient) return artifact
  localStorage.setItem(artifactKey(sessionId, type), JSON.stringify(artifact))
  return artifact
}

export function getArtifact(sessionId: string, type: ArtifactType): Artifact | null {
  if (!isClient) return null
  const raw = localStorage.getItem(artifactKey(sessionId, type))
  return raw ? JSON.parse(raw) : null
}

export function getSessionWithArtifacts(id: string): SessionWithArtifacts | null {
  const session = getSession(id)
  if (!session) return null
  const types: ArtifactType[] = ['prd', 'competitive', 'roadmap', 'summary']
  const artifacts = types
    .map(type => getArtifact(id, type))
    .filter((a): a is Artifact => a !== null)
  return { ...session, artifacts }
}

export function getSessionIndex(): string[] {
  if (!isClient) return []
  const raw = localStorage.getItem(SESSION_INDEX_KEY)
  return raw ? JSON.parse(raw) : []
}

export function getAllSessions(): Session[] {
  return getSessionIndex()
    .map(id => getSession(id))
    .filter((s): s is Session => s !== null)
}
