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

    // Disable automatic imports
    imports: {
        scan: false,
    },
    components: false,
    // vueuse: {
    //     autoImports: false,
    // },

    typescript: {
        typeCheck: true,
    },
    css: ['./app/assets/css/main.css'],
    vite: {
        plugins: [tailwindcss()],
    },
})
