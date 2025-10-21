<template>
  <div class="relative w-full">
    <div
      ref="editorRef"
      contenteditable="true"
      @input="handleInput"
      @click="updateFocusedParagraph"
      @keyup="updateFocusedParagraph"
      class="w-full min-h-[70vh] p-8 font-mono text-lg leading-relaxed bg-transparent border-0 outline-none focus:outline-none text-[#0a0a0a] dark:text-[#fafafa]"
      spellcheck="false"
    >
      <div
        v-for="(line, index) in lines"
        :key="index"
        :data-paragraph-index="index"
        :class="[
          'transition-opacity duration-200 min-h-[1.75rem]',
          focusedParagraphIndex === index ? 'opacity-100' : 'opacity-30',
        ]"
      >
        {{ line || '\u200B' }}
      </div>
    </div>
    <div
      v-if="isEmpty"
      class="pointer-events-none absolute left-8 top-8 font-mono text-lg text-[#a3a3a3] dark:text-[#525252]"
    >
      {{ placeholder }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useFocusedParagraph } from '~/composables/use-focused-paragraph'

const props = withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
  }>(),
  {
    placeholder: 'Start typing...',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editorRef = ref<HTMLElement>()
const { focusedParagraphIndex, updateFocusedParagraph } = useFocusedParagraph(editorRef)

const lines = computed(() => {
  const text = props.modelValue
  if (!text) return ['']
  const split = text.split('\n')
  return split.length > 0 ? split : ['']
})

const isEmpty = computed(() => !props.modelValue)

let isInternalUpdate = false

const handleInput = () => {
  if (!editorRef.value || isInternalUpdate) return

  isInternalUpdate = true
  const text = extractText(editorRef.value)
  emit('update:modelValue', text)

  nextTick(() => {
    isInternalUpdate = false
    updateFocusedParagraph()
  })
}

const extractText = (element: HTMLElement): string => {
  const paragraphs = Array.from(element.querySelectorAll('[data-paragraph-index]'))
  return paragraphs.map((p) => p.textContent?.replace(/\u200B/g, '') || '').join('\n')
}

onMounted(() => {
  if (editorRef.value && props.modelValue) {
    nextTick(() => {
      updateFocusedParagraph()
    })
  }
})
</script>
