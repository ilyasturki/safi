import { vim, Vim } from '@replit/codemirror-vim'

// @replit/codemirror-vim's built-in `moveByScroll` (bound to <C-d>/<C-u>)
// has a bug: when the cursor reaches the trailing empty line of a file,
// `findPosV` returns hitSide and the fallback `coordsChar(top + 8)` resolves
// to the topmost character — wrapping the cursor to the top of the document.
// Replace it with a clamped half-page motion that never escapes [firstLine,
// lastLine].
Vim.defineMotion('safiMoveByHalfPage', (cm, head, motionArgs) => {
    const scroll = cm.getScrollInfo()
    const halfPageLines = Math.max(
        1,
        Math.floor(scroll.clientHeight / (2 * cm.defaultTextHeight())),
    )
    // motionArgs.repeat is 0 when no count prefix; falsy check matches the
    // upstream moveByScroll behavior.
    const lines = motionArgs.repeat || halfPageLines
    const targetLine = motionArgs.forward
        ? Math.min(cm.lastLine(), head.line + lines)
        : Math.max(cm.firstLine(), head.line - lines)
    const lineLen = cm.getLine(targetLine).length
    const targetCh = Math.min(head.ch, Math.max(0, lineLen))
    return { line: targetLine, ch: targetCh }
})

Vim.mapCommand(
    '<C-d>',
    'motion',
    'safiMoveByHalfPage',
    { forward: true, explicitRepeat: true },
    {},
)
Vim.mapCommand(
    '<C-u>',
    'motion',
    'safiMoveByHalfPage',
    { forward: false, explicitRepeat: true },
    {},
)

export const vimExtension = vim({ status: true })
