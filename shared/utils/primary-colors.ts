export interface PrimaryColor {
    id: string
    name: string
    light: string
    dark: string
}

export const PRIMARY_COLORS: PrimaryColor[] = [
    {
        id: 'pink',
        name: 'Pink',
        light: '#e60065',
        dark: '#ff5599',
    },
    {
        id: 'red',
        name: 'Red',
        light: '#dc2626',
        dark: '#f87171',
    },
    {
        id: 'orange',
        name: 'Orange',
        light: '#ea580c',
        dark: '#fb923c',
    },
    {
        id: 'amber',
        name: 'Amber',
        light: '#d97706',
        dark: '#fbbf24',
    },
    {
        id: 'green',
        name: 'Green',
        light: '#16a34a',
        dark: '#4ade80',
    },
    {
        id: 'teal',
        name: 'Teal',
        light: '#0d9488',
        dark: '#2dd4bf',
    },
    {
        id: 'blue',
        name: 'Blue',
        light: '#2563eb',
        dark: '#60a5fa',
    },
    {
        id: 'indigo',
        name: 'Indigo',
        light: '#4f46e5',
        dark: '#818cf8',
    },
    {
        id: 'violet',
        name: 'Violet',
        light: '#7c3aed',
        dark: '#a78bfa',
    },
    {
        id: 'zinc',
        name: 'Zinc',
        light: '#3f3f46',
        dark: '#d4d4d8',
    },
]

export const DEFAULT_PRIMARY_COLOR_ID = 'pink'

export function isPrimaryColorId(value: unknown): value is string {
    return (
        typeof value === 'string'
        && PRIMARY_COLORS.some((color) => color.id === value)
    )
}

export function getPrimaryColor(id: string): PrimaryColor {
    return (
        PRIMARY_COLORS.find((color) => color.id === id)
        ?? PRIMARY_COLORS.find((color) => color.id === DEFAULT_PRIMARY_COLOR_ID)!
    )
}
