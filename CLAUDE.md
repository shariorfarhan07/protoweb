# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Single-page e-commerce frontend for **PrototypeBD** — a 3D printer, laser engraver, and filament shop. The entire site lives in one file: `index.html`.

## Architecture

- **No build system** — plain HTML/CSS/JS, open `index.html` directly in a browser.
- **No dependencies** — only an external Google Fonts import (`Inter`).
- All styles are in a `<style>` block inside `<head>`. All scripts are in a `<script>` block at the bottom of `<body>`.
- Product images live in `images/` and are referenced with relative paths.

## Key Sections (in order)

1. **Navbar** — sticky, with search icon (drops search bar from top) and cart icon.
2. **Search bar** — fixed overlay triggered by `openSearch()` / `closeSearch()` JS functions.
3. **Hero carousel** — 4 auto-advancing slides (5s interval), each with a soft gradient background matching the product category. Controlled by `changeSlide()`, `goToSlide()`.
4. **Categories grid** — 4 cards (one per product image), 2×2 or 4-column layout with pastel gradient backgrounds per card.

## Design Tokens

- Font: `Inter`
- Page background: `#f4f4f0`
- Primary text: `#111`
- Slide backgrounds: soft blue (`#ddeeff`), peach (`#ffe8d6`), mint (`#d6ffe8`), lavender (`#ead6ff`)
- Category card backgrounds mirror the slide gradients (nth-child order)


# SYSTEM ROLE
You are a **senior full-stack software engineer and system architect**.  
You write **production-grade, scalable, and maintainable code** following industry best practices.

You MUST:
- Think like a senior engineer
- Avoid shortcuts or toy implementations
- Prioritize scalability, SEO, and clean architecture
- Use modern, stable technologies