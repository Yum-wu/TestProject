---
title: "Eleven Projects, Two Months: A Developer's Reflection"
date: 2026-05-17
slug: eleven-projects-two-months
tags: [Reflection, Growth, Full Stack, Lessons]
category: Life
excerpt: Two months, from Pomodoro timer to AI chatbot, from weather app to online store — 11 projects completed. This isn't a technical tutorial, but a developer's honest reflection on the journey.
lang: en
---

# Eleven Projects, Two Months: A Developer's Reflection

Git logs only tell you timestamps and commit messages. They don't capture those late nights staring at a blank console, or the three days spent tossing and turning over a single bug. This post is less a technical share and more an account of the past two months.

## The Starting Point

It all began on April 28, 2026. That day I committed three projects: a Pomodoro timer, a Todo app, and a Markdown notes app. The motivation was simple — I wanted to see if I could go from just "building pages" to truly shipping products independently.

## Project List

In chronological order:

| Project | Time | Core Takeaway |
|---------|------|---------------|
| Pomodoro / Todo / Markdown Notes | Day 1 | Basic state management & local storage |
| Weather App | Day 2 | Third-party API integration & error handling |
| AI Writing Assistant | Day 3-4 | SSE streaming & Prompt engineering |
| AI Voice Recognition | Day 5 | Web Audio API & real-time streaming |
| Online Store | Day 6-9 | Full-stack CRUD, security, deployment |
| MyBlog + Hermes Agent | Day 10-14 | Frontend architecture, CI/CD, static site gen |
| AI Chatbot RAG | Day 15-18 | LangChain, document retrieval, knowledge base |
| WeChat Mini Program AI Agent | Day 19-20 | Mini program ecosystem, cross-platform |

## What Git Logs Won't Tell You

### 1. Subtraction is Ten Times Harder Than Addition

The Online Store was my most time-consuming project (nearly 4 days) and the one I ultimately decided not to deploy. The code was written, CRUD worked, security was implemented. But I asked myself: do I really want to maintain a store? The answer was no.

I only realized this by my 6th project. **The real cost of a project isn't the days spent coding — it's every future maintenance, every refactor, every time a reader comes with questions and you must have answers.**

### 2. Toolchains Can Help or Hurt You

Vite 8 + TypeScript 6 + React 19 is a great combo, but "too new" is itself a pitfall. When deploying the SPA to GitHub Pages, the `CustomEvent is not defined` error from an old Node version took half a day to diagnose. Not because the tech was hard, but because the problem was buried under layers of new framework abstractions.

One lesson: **When encountering strange errors, check version compatibility first before diving into source code.** This principle saved me countless hours later.

### 3. Streaming Output is the Threshold Experience for AI Apps

Both the AI Writing Assistant and Chatbot projects showed me how much SSE matters for UX. An AI dialog without streaming feels completely different from one with it. The former is frustrating; the latter makes it feel like "AI is thinking."

The implementation itself isn't complex — a `ReadableStream` + `TextDecoder` loop suffices. But edge cases abound: network interruption recovery, truncating long streams, preserving history on page refresh. **Building a demo is easy; building a product is hard.**

### 4. RAG is Not Just a Technique, It's an Architectural Mindset

The Chatbot project was my first real encounter with RAG. Initially I thought RAG was just chunking documents, vectorizing them, and searching when the user asks.

After implementation, I realized real RAG engineering isn't about vector search itself:

- How to chunk documents so each piece has independent semantics
- How to write prompts so the model understands "you have a knowledge base, but don't make things up"
- How to cite sources to build user trust

Git logs show only a few commits, but I iterated 6 prompt versions before reaching satisfactory quality.

### 5. Deployment is the Last Wall

From April 30 to May 16, deployment-related commits spanned the entire project cycle. GitHub Actions config, Vercel compatibility, dual-platform base paths, SPA route 404 handling — each is simple individually, but they fall like dominoes.

The "blog migration" incident on May 16 cost me 13 files and 7 published articles. Though everything was eventually restored, that incident taught me one habit: **before git clean, always `git stash` or create a branch.** This habit saved me twice since.

## If I Could Do It Over

1. **Build two fewer projects, do one deep refactor.** 11 projects means each is shallow — better to take one project to 90%.

2. **Write tests from day one.** Almost no unit tests across these projects. The motivation to add tests after features are done never arrives.

3. **Write more docs.** Some code I now look at and need a minute to understand my own decisions. READMEs exist, but zero Architecture Decision Records.

4. **Adopt monorepo tools earlier.** With many projects, dependency management got messy — each sub-project doing `npm install`, version inconsistencies everywhere.

## Unexpected Rewards

Git became my most important tool — not just for version control, but as a project management log. Seeing the evolution of 60+ commits through `git log --oneline --graph` is more intuitive than any Gantt chart.

Another surprise was the **positive feedback from publishing**. After deploying the blog publicly, each article gets real visitors (not many, but they exist). This external validation drives progress more than any internal "project complete" feeling.

## Next Steps

The blog will continue, and the Chatbot will keep iterating. But for the next two months, my goal isn't "do more" — it's "do better":

- Add full-text search to the blog
- Embed Chatbot RAG into the blog
- Pick one project for complete test coverage
- Organize a clear development guide for this monorepo

Two months ago, I thought "learning full-stack" was a path with an end. Now I know — **programming isn't climbing a mountain, it's walking into a forest. You never see the boundary, but with every step, new scenery appears.**

*May 17, 2026*
