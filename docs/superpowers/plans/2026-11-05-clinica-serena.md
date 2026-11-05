# Clínica Serena Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebrand Voz do Paciente using direction A while preserving all communication behavior.
**Architecture:** Canonical static frontend at the repository root. Legacy entry redirects to it. Separate private demonstration, branch and pull request; no production update.
**Tech Stack:** HTML, CSS, vanilla JavaScript, local SVG/fonts/MP3, Node built-in test runner.
**Spec:** docs/superpowers/specs/2026-11-05-clinica-serena-design.md

## Global Constraints
Preserve exact messages and existing MP3. Preserve fallback voice, test, volume, rhythm, persistence, fullscreen, relative paths and JS hooks. No framework/backend, no main changes, no merge, no existing-site deployment.

## Review Focus
- Rapid changes during MP3 playback and fallback must not let stale callbacks overwrite the latest choice.
- Failed fullscreen must not erase the selected patient message.
- At 320px width or enlarged text, all actions remain readable with no horizontal overflow.
- The legacy entry must resolve the canonical frontend and its relative assets.
- Unsupported or blocked audio/storage APIs must leave meaningful visible feedback and usable controls.

### Task 1: Canonical accessible interface
Files: index.html, style.css, icon.svg, app.js, fonts/source-sans-3-*.ttf, fonts/SourceSans3-OFL.txt, Voz_do_Paciente_GitHub/index.html, tests/app.test.cjs.
Interface: existing DOM IDs/data-message stay stable; status(state) updates visual and accessible state.
- [ ] Write behavioral regression tests for audio interruption, fallback, settings, fullscreen and failure messages; baseline existing behavior.
- [ ] Add failing tests for aria-pressed and explicit status labels; fullscreen failure preserves chosen message; legacy redirect.
- [ ] Implement the chosen identity with one organized stylesheet and native SVG controls. Add only small necessary JS state changes.
- [ ] Run node --test tests/app.test.cjs and node --check app.js. Inspect actual font weights and MP3 hashes.

### Task 2: Responsive verification and handoff
Files: README.md, docs/rebranding-verification.md, tests/app.test.cjs for any defect found.
Interface: same tested root frontend is copied to the isolated demo checkout.
- [ ] Inspect browser renders at 320x568, 390x844, 768x1024, 1366x900, and 844x390, plus 200% text. Compare to direction A.
- [ ] Exercise audio, switching, replay, test voice, settings, persisted preferences, fallback/error, keyboard focus and fullscreen. Record real-device limits.
- [ ] Perform a whole-branch review, address important findings, rerun affected checks and verify workflow unchanged.
- [ ] Commit branch using GitHub integration; create review PR, publish only isolated private demo, and report links and validation.
