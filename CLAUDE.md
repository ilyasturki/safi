This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# About Safi

Safi is a minimalist text-editing web application built with Nuxt 4 and Vue 3. The interface provides a distraction-free, monospace editing surface. It is designed primarily as a self-hosted application, giving users full control over their data and environment.

# Design Philosophy

- **Minimalist aesthetic**: Clean, purposeful design with ample whitespace, subtle interactions, and focus on content over chrome. The screen should only display what truly matters, eliminating unnecessary UI elements and distractions
- **Mobile-first**: All interactions must work seamlessly on mobile devices with touch-friendly interfaces
- **Spatial consistency**: New features should feel like natural extensions of existing workflows
- **File-based storage**: All content is stored as markdown (.md) files in a configured workspace directory on the server, providing direct file system access and portability

# Quick Reference

## Tech Stack

- **Meta-Framework**: Nuxt 4 (SSR disabled, SPA mode, Nitro for backend)
- **Framework**: Vue 3 with Composition API and TypeScript
- **Styling**: TailwindCSS v4
- **Editor**: CodeMirror 6
- **Containerization**: Docker (for self-hosted deployment)

## Commands

- `bun run typecheck` - Type checking with vue-tsc
- `bun run format` - Prettier formatting
- Never use `bun run dev`

## Key Links

- **Vue.js**: `https://vuejs.org/`
- **Nuxt 4**: `https://nuxt.com/docs/4.x`
- **Tailwind CSS**: `https://tailwindcss.com/`
- **Nitro**: `https://nitro.build/guide/`

# Project Structure

- **`/app`** - Main application directory (Nuxt 4 convention)
    - **`/pages`** - File-based routing
    - **`/components`** - Vue components
    - **`/composables`** - Vue composables
    - **`/utils`** - Utility functions and helpers
    - **`/middleware`** - Route middleware for authorization
    - **`/types`** - TypeScript type definitions
    - **`/assets/css`** - TailwindCSS styles, global styles, and animations
    - **`/plugins`** - Nuxt plugins for global functionality
    - **`/lib/editor`** - CodeMirror 6 editor integration
        - **`/extensions`** - CodeMirror extensions (markdown, keymaps, spellcheck, placeholder, live-markers)
        - **`/theme`** - Custom editor theme with syntax highlighting
- **`/server`** - Nitro server directory (backend API)
    - **`/api`** - API endpoints for file operations
    - **`/utils`** - Server-side utilities (workspace management, path validation)
- **`/shared`** - Shared code between client and server
    - **`/types`** - TypeScript type definitions used by both frontend and backend

# Code Style Requirements

- All file names should be kebab-case
- Use `~/` for absolute imports from app root or `~~/` for project root
- Use `undefined` over `null` for optional values
- Follow Vue 3 Composition API patterns consistently
- Never use the `any` type in TypeScript - use proper typing instead
- Keep comments minimal and purposeful - only add comments when they clarify complex business logic, explain non-obvious decisions, or provide essential context that cannot be expressed through clear code
