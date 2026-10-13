import { useApp } from '../context/AppContext'

const THEMES = {
  light: {
    income: '#0f9d6b',
    expense: '#e0484f',
    trend: '#2255d9',
    grid: '#e1e7f0',
    axis: '#5a6a85',
    cursor: 'rgba(34, 85, 217, 0.06)',
    tooltipBg: '#ffffff',
    tooltipBorder: '#dde5f0',
    tooltipText: '#0b1b3a',
  },
  dark: {
    income: '#2dd4a0',
    expense: '#ff7b82',
    trend: '#6ea2ff',
    grid: '#22345a',
    axis: '#93a4c4',
    cursor: 'rgba(110, 162, 255, 0.08)',
    tooltipBg: '#14233f',
    tooltipBorder: '#2c4272',
    tooltipText: '#e8eefb',
  },
}

export default function useChartTheme() {
  const { settings } = useApp()
  return THEMES[settings.theme] || THEMES.light
}
