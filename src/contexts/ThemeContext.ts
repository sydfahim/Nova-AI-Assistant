import { createContext, useContext } from 'react'
import type { Theme } from '@/types'

export const ThemeContext = createContext<Theme>('dark')
export const useThemeMode = () => useContext(ThemeContext)
