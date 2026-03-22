import { useCompare, useCompareActions } from '@/store'
import { SidebarSection, ControlGroup } from '@/components/layout/AppLayout'
import { RadioGroup } from '@/components/controls/RadioGroup'
import { Button } from '@/components/controls/Button'

const PIN_COLORS = ['var(--accent)', 'var(--app-teal)', '#c080e0']

export function CompareSidebar() {
  const { pinned, layout } = useCompare()
  const { unpin, setLayout } = useCompareActions()

  return (
    <>
      <SidebarSection title="Pinned Systems" />
      <ControlGroup>
        {pinned.length === 0 ? (
          <div style={{ color: 'var(--text-3)', fontSize: 11, lineHeight: 1.6 }}>
            No systems pinned yet.
            <br />
            Use "Pin Current" in the header.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {pinned.map((p, i) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 0',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: PIN_COLORS[i],
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, fontSize: 11 }}>{p.label}</div>
                <Button variant="ghost" size="sm" onClick={() => unpin(p.id)}>
                  ✕
                </Button>
              </div>
            ))}
          </div>
        )}
      </ControlGroup>

      <SidebarSection title="Layout" />
      <ControlGroup>
        <RadioGroup
          options={[
            { label: 'Side by Side', value: 'side' },
            { label: 'Stacked', value: 'stacked' },
          ]}
          value={layout}
          onChange={setLayout}
        />
      </ControlGroup>
    </>
  )
}
