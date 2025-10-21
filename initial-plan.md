# Overview

Pure Editor is a minimalist text-editing web application built with Nuxt 3 and Vue 3. The interface provides a distraction-free, monospace editing surface.

# Functional Requirements

- Provide a single, monospace text area without rich-text formatting options.
- Autosave editor content to `localStorage` key `pure-editor:text` on each input event using a ~300 ms debounce.

# Theme

- Default theme reflects the OS `prefers-color-scheme` setting when available.
- Center the editor within a column capped at roughly 70 characters width for readability. The background color should be almost white (or black depending on the OS theme). There should not be any borders or shadows or any other visual distractions.
- Use a monospace font at approximately 18–20 px with a 1.6 line height.
- Surround the editor with generous padding (24–32 px). No focus or hover effects.
- Eliminate decorative UI elements; no toolbars or text styling controls beyond the theme toggle.

# Tech Stack

- **Nuxt 3** for server-rendered Vue application structure and routing.
- **Vue 3** as the reactive UI framework powering the editor experience.
- **Tailwind CSS** for utility-first styling and rapid theme customization.