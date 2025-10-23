import { css } from '@codemirror/lang-css'
import { html } from '@codemirror/lang-html'
import { javascript } from '@codemirror/lang-javascript'
import { json } from '@codemirror/lang-json'
import { python } from '@codemirror/lang-python'
import { LanguageDescription } from '@codemirror/language'

export const codeLanguages = [
    LanguageDescription.of({
        name: 'javascript',
        alias: ['js'],
        load: () => Promise.resolve(javascript()),
    }),
    LanguageDescription.of({
        name: 'typescript',
        alias: ['ts'],
        load: () => Promise.resolve(javascript({ typescript: true })),
    }),
    LanguageDescription.of({
        name: 'jsx',
        load: () => Promise.resolve(javascript({ jsx: true })),
    }),
    LanguageDescription.of({
        name: 'tsx',
        load: () => Promise.resolve(javascript({ jsx: true, typescript: true })),
    }),
    LanguageDescription.of({
        name: 'css',
        load: () => Promise.resolve(css()),
    }),
    LanguageDescription.of({
        name: 'html',
        load: () => Promise.resolve(html()),
    }),
    LanguageDescription.of({
        name: 'json',
        load: () => Promise.resolve(json()),
    }),
    LanguageDescription.of({
        name: 'python',
        alias: ['py'],
        load: () => Promise.resolve(python()),
    }),
]
