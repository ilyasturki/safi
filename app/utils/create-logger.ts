import { createConsola, LogLevels } from 'consola'

export { LogLevels } from 'consola'

const devLogLevel = LogLevels.debug
const prodLogLevel = LogLevels.fatal

export interface LoggerOptions {
    level?: number
    tag?: string
}

export function createLogger(options?: LoggerOptions) {
    const { level = devLogLevel, tag } = options ?? {}

    const loggerInstance = createConsola({
        level: import.meta.dev ? level : prodLogLevel,
    })

    return tag === undefined ? loggerInstance : loggerInstance.withTag(tag)
}

// 0: Fatal and Error
// 1: Warnings
// 2: Normal logs
// 3: Informational logs, success, fail, ready, start, ...
// 4: Debug logs
// 5: Trace logs
// -999: Silent
// +999: Verbose logs

// type LogType = "silent" | "fatal" | "error" | "warn" | "log" | "info" | "success" | "fail" | "ready" | "start" | "box" | "debug" | "trace" | "verbose";
