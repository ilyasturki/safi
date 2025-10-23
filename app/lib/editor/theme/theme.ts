import { HighlightStyle } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { tags as t } from '@lezer/highlight'

const colors = {
    foreground: 'var(--color-foreground)',
    background: 'var(--color-background-0)',
    darkBackground: 'var(--color-background-2)',
    highlightBackground: 'var(--color-background-3)',
    tooltipBackground: 'var(--color-background-4)',

    cursor: 'var(--color-foreground)',
    selection: 'var(--color-background-5)',
    accent: 'var(--color-red)',

    red: 'var(--color-red)',
    orange: 'var(--color-orange)',
    yellow: 'var(--color-yellow)',
    green: 'var(--color-green)',
    aqua: 'var(--color-aqua)',
    blue: 'var(--color-blue)',
    purple: 'var(--color-purple)',

    base0: 'var(--color-gray-0)',
    base1: 'var(--color-gray-1)',
    base2: 'var(--color-gray-2)',
} as const

export const viewTheme = EditorView.theme(
    {
        '&': {
            color: colors.foreground,
            backgroundColor: colors.background,
        },
        '.cm-content': {
            caretColor: colors.cursor,
        },
        '.cm-cursor, .cm-dropCursor': {
            borderLeftColor: colors.cursor,
        },
        '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
            { backgroundColor: colors.selection },

        '.cm-panels': {
            backgroundColor: colors.darkBackground,
            color: colors.foreground,
        },
        '.cm-panels.cm-panels-top': { borderBottom: '2px solid black' },
        '.cm-panels.cm-panels-bottom': { borderTop: '2px solid black' },

        '.cm-searchMatch': {
            backgroundColor: 'var(--color-background-yellow)',
            outline: '1px solid var(--color-yellow)',
        },
        '.cm-searchMatch.cm-searchMatch-selected': {
            backgroundColor: 'var(--color-background-visual)',
        },

        '.cm-activeLine': { backgroundColor: 'var(--color-background-1)' },
        '.cm-selectionMatch': {
            backgroundColor: 'var(--color-background-green)',
        },

        '&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket':
            {
                backgroundColor: 'var(--color-background-blue)',
            },

        '.cm-gutters': {
            backgroundColor: colors.background,
            color: colors.accent,
            border: 'none',
        },

        '.cm-activeLineGutter': {
            backgroundColor: colors.highlightBackground,
        },

        '.cm-foldPlaceholder': {
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--color-gray-1)',
        },

        '.cm-tooltip': {
            border: 'none',
            backgroundColor: colors.tooltipBackground,
        },
        '.cm-tooltip .cm-tooltip-arrow:before': {
            borderTopColor: 'transparent',
            borderBottomColor: 'transparent',
        },
        '.cm-tooltip .cm-tooltip-arrow:after': {
            borderTopColor: colors.tooltipBackground,
            borderBottomColor: colors.tooltipBackground,
        },
        '.cm-tooltip-autocomplete': {
            '& > ul > li[aria-selected]': {
                backgroundColor: colors.highlightBackground,
                color: colors.foreground,
            },
        },
    },
    { dark: false },
)

export const highlightStyle = HighlightStyle.define([
    {
        tag: t.keyword,
        color: colors.green,
    },
    {
        tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName],
        color: colors.blue,
    },
    {
        tag: [t.function(t.variableName), t.labelName],
        color: colors.blue,
    },
    {
        tag: [t.color, t.constant(t.name), t.standard(t.name)],
        color: colors.aqua,
    },
    {
        tag: [t.definition(t.name), t.separator],
        color: colors.foreground,
    },
    {
        tag: [
            t.typeName,
            t.className,
            t.number,
            t.changed,
            t.annotation,
            t.modifier,
            t.self,
            t.namespace,
        ],
        color: colors.red,
    },
    {
        tag: [
            t.operator,
            t.operatorKeyword,
            t.url,
            t.escape,
            t.regexp,
            t.link,
            t.special(t.string),
        ],
        color: colors.aqua,
    },
    {
        tag: [t.meta, t.comment],
        color: colors.base1,
    },
    {
        tag: t.strong,
        fontWeight: 'bold',
    },
    {
        tag: t.emphasis,
        fontStyle: 'italic',
    },
    {
        tag: t.strikethrough,
        textDecoration: 'line-through',
    },
    {
        tag: t.link,
        color: colors.blue,
        textDecoration: 'underline',
    },
    {
        tag: t.heading1,
        fontWeight: 'bold',
        color: colors.red,
    },
    {
        tag: t.heading2,
        fontWeight: 'bold',
        color: colors.orange,
    },
    {
        tag: t.heading3,
        fontWeight: 'bold',
        color: colors.yellow,
    },
    {
        tag: t.heading4,
        fontWeight: 'bold',
        color: colors.green,
    },
    {
        tag: t.heading5,
        fontWeight: 'bold',
        color: colors.blue,
    },
    {
        tag: t.heading6,
        fontWeight: 'bold',
        color: colors.purple,
    },
    {
        tag: [t.atom, t.bool, t.special(t.variableName)],
        color: colors.aqua,
    },
    {
        tag: [t.processingInstruction, t.string, t.inserted],
        color: colors.aqua,
    },
    {
        tag: t.invalid,
        color: colors.red,
    },
])
