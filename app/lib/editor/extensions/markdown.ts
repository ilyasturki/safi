import { markdown } from '@codemirror/lang-markdown'
import { styleTags, Tag } from '@lezer/highlight'
import { Autolink, Strikethrough, Table, TaskList } from '@lezer/markdown'

export const markdownTags = {
    QuoteMark: Tag.define(),
}

const markdownTagsExtension = {
    props: [styleTags(markdownTags)],
}

export const markdownExtension = markdown({
    completeHTMLTags: false,
    extensions: [
        Strikethrough,
        Table,
        TaskList,
        Autolink,

        markdownTagsExtension,
    ],
})
