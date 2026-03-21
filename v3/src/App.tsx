import { useEffect } from 'react'
import { useColorActions, useTypographyActions } from './store'

export default function App() {
  const colorActions = useColorActions()
  const typographyActions = useTypographyActions()

  useEffect(() => {
    // Initial cold random generation on mount
    colorActions.generate()
    typographyActions.generate()
  }, [])

  return <div>palette. — initializing</div>
}
