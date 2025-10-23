import { markdown } from '@codemirror/lang-markdown'
import { styleTags, Tag } from '@lezer/highlight'
import { Autolink, Strikethrough, Table, TaskList } from '@lezer/markdown'

import { codeLanguages } from './code-languages'

export const markdownTags = {
    QuoteMark: Tag.define(),
}

const markdownTagsExtension = {
    props: [styleTags(markdownTags)],
}

export const markdownExtension = markdown({
    completeHTMLTags: false,
    codeLanguages,
    extensions: [
        Strikethrough,
        Table,
        TaskList,
        Autolink,

        markdownTagsExtension,
    ],
})
