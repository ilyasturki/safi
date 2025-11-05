import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    ssr: false,
    devtools: {
        enabled: false,
        telemetry: false,
        timeline: {
            enabled: true,
        },
    },

    // runtimeConfig: {
    //     workspacePath: process.env.NUXT_WORKSPACE_PATH,
    // },
    runtimeConfig: {
        workspacePath: '',
    },

    // Disable automatic imports
    imports: {
        scan: false,
    },
    components: false,
    // vueuse: {
    //     autoImports: false,
    // },

    // typescript: {
    // have problems with bun in docker
    // typeCheck: true,
    // tsConfig: {
    //     compilerOptions: {
    //         types: ['bun'],
    //     },
    // },
    // },
    css: ['./app/assets/css/main.css'],
    vite: {
        plugins: [tailwindcss()],
    },

    modules: ['@nuxt/icon'],
})
