import { useState } from 'react'
import { useStore, useUIActions } from '@/store'
import { SidebarSection, ControlGroup } from '@/components/layout/AppLayout'
import { Button } from '@/components/controls/Button'

interface SavedSystem {
  savedAt: string
  [key: string]: unknown
}

export function ExportSidebar() {
  const [systemName, setSystemName] = useState('')
  const store = useStore()
  const { showToast } = useUIActions()

  const save = () => {
    const name = systemName.trim() || 'Untitled System'
    const raw = localStorage.getItem('typeset-systems') || '{}'
    const systems: Record<string, unknown> = JSON.parse(raw)
    systems[name] = { ...store, savedAt: new Date().toISOString() }
    localStorage.setItem('typeset-systems', JSON.stringify(systems))
    showToast(`Saved "${name}"`)
    renderSavedList()
  }

  const [savedKeys, setSavedKeys] = useState<string[]>(() => {
    try {
      return Object.keys(JSON.parse(localStorage.getItem('typeset-systems') || '{}'))
    } catch {
      return []
    }
  })

  const renderSavedList = () => {
    try {
      setSavedKeys(Object.keys(JSON.parse(localStorage.getItem('typeset-systems') || '{}')))
    } catch {
      setSavedKeys([])
    }
  }

  const deleteSystem = (name: string) => {
    const raw = localStorage.getItem('typeset-systems') || '{}'
    const systems: Record<string, unknown> = JSON.parse(raw)
    delete systems[name]
    localStorage.setItem('typeset-systems', JSON.stringify(systems))
    showToast(`Deleted "${name}"`)
    renderSavedList()
  }

  const getDate = (name: string): string => {
    try {
      const raw = localStorage.getItem('typeset-systems') || '{}'
      const systems = JSON.parse(raw) as Record<string, SavedSystem>
      return systems[name]?.savedAt
        ? new Date(systems[name].savedAt).toLocaleDateString()
        : ''
    } catch {
      return ''
    }
  }

  return (
    <>
      <SidebarSection title="Save System" />
      <ControlGroup>
        <input
          type="text"
          value={systemName}
          onChange={(e) => setSystemName(e.target.value)}
          placeholder="My Design System"
          style={{
            width: '100%',
            background: 'var(--bg-2)',
            border: '1px solid var(--line-2)',
            borderRadius: 'var(--radius)',
            color: 'var(--text-0)',
            fontFamily: 'var(--mono)',
            fontSize: 12,
            padding: '8px 12px',
            outline: 'none',
          }}
        />
        <Button variant="secondary" full onClick={save}>
          Save to Browser
        </Button>
      </ControlGroup>

      <SidebarSection title="Saved Systems" />
      <ControlGroup>
        {savedKeys.length === 0 ? (
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>No saved systems.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {savedKeys.map((name) => (
              <div
                key={name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 10px',
                  background: 'var(--bg-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius)',
                }}
              >
                <div style={{ flex: 1, fontSize: 12, color: 'var(--text-0)' }}>{name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{getDate(name)}</div>
                <Button variant="ghost" size="sm" onClick={() => deleteSystem(name)}>✕</Button>
              </div>
            ))}
          </div>
        )}
      </ControlGroup>
    </>
  )
}
