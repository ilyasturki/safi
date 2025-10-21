<template>
  <div :class="isDark ? 'dark' : ''">
    <div class="min-h-screen transition-colors duration-200 bg-[#fafafa] dark:bg-[#0a0a0a]">
      <!-- Theme Toggle -->
      <div class="fixed top-6 right-6">
        <button
          @click="toggleTheme"
          class="w-10 h-10 rounded-full bg-[#e5e5e5] dark:bg-[#1a1a1a] flex items-center justify-center transition-colors duration-200 hover:bg-[#d4d4d4] dark:hover:bg-[#2a2a2a]"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <span v-if="isDark" class="text-xl">☀️</span>
          <span v-else class="text-xl">🌙</span>
        </button>
      </div>

      <!-- Editor Container -->
      <div class="flex items-center justify-center min-h-screen px-6 py-12">
        <div class="w-full max-w-[70ch]">
          <textarea
            v-model="text"
            @input="handleInput"
            class="w-full min-h-[70vh] p-8 font-mono text-lg leading-relaxed resize-none bg-transparent border-0 outline-none text-[#0a0a0a] dark:text-[#fafafa] placeholder-[#a3a3a3] dark:placeholder-[#525252]"
            placeholder="Start typing..."
            spellcheck="false"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const STORAGE_KEY = 'pure-editor:text'
const DEBOUNCE_MS = 300

const text = ref('')
const isDark = ref(false)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

// Load saved text from localStorage
onMounted(() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved !== null) {
      text.value = saved
    }

    // Initialize theme based on OS preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDark.value = prefersDark

    // Listen for OS theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      isDark.value = e.matches
    })
  }
})

// Debounced autosave to localStorage
const handleInput = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = setTimeout(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, text.value)
    }
  }, DEBOUNCE_MS)
}

// Theme toggle
const toggleTheme = () => {
  isDark.value = !isDark.value
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
}
</style>
