import { describe, it, expectTypeOf } from 'vitest'
import type { ComponentName, ComponentTokenSet, ComponentTokenMap, IconLibraryName } from '../types'

describe('component token types', () => {
  it('ComponentName covers known components', () => {
    const name: ComponentName = 'button'
    expectTypeOf(name).toMatchTypeOf<string>()
  })

  it('ComponentTokenSet has required token keys', () => {
    const set: ComponentTokenSet = {
      bg: '#fff',
      bgHover: '#eee',
      text: '#000',
      border: '#ccc',
      radius: '6px',
      shadow: 'none',
    }
    expectTypeOf(set).toMatchTypeOf<ComponentTokenSet>()
  })

  it('ComponentTokenMap maps all names to token sets', () => {
    const map: Partial<ComponentTokenMap> = {}
    expectTypeOf(map).toMatchTypeOf<Partial<ComponentTokenMap>>()
  })

  it('IconLibraryName covers all five libraries', () => {
    const libs: IconLibraryName[] = ['lucide', 'heroicons', 'phosphor', 'tabler', 'radix']
    expectTypeOf(libs[0]).toMatchTypeOf<string>()
  })
})
