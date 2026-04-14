# Nucleus Security - Engineering Internship Technical Assessment

## Project Structure

```
nucleus-internship/
├── task-1/          # Code Review
│   ├── pr-review.py
│   ├── ai-pr-feedback.md
│   └── task-1-followup.md
├── task-2/          # Calculator App
│   ├── src/
│   ├── ai-prompts.md
│   └── ...
└── README.md
```

---

## Task 1: Code Review

I reviewed the Python webhook endpoint that handles vendor user events, including signature verification, JSON parsing, and user upsert logic.

### Findings & Concerns

A brief recap of the findings with the use of AI.

- **SQL Injection (lines 41-48):** User input is interpolated directly into SQL via f-strings. Needs parameterized queries.
- **Timing attack on signature check (line 20):** Uses `==` for signature comparison, which leaks timing info. Should use `hmac.compare_digest()`.
- **Length-extension vulnerability (lines 17-19):** `SHA256(secret || message)` is susceptible to length-extension attacks. Should be using HMAC instead.
- **Hardcoded fallback secret (line 10):** Defaults to `"dev-secret"` if the env var is missing. A misconfigured deploy means production is running with a known secret. Should fail fast if unset.
- **Upsert isn't actually an upsert (lines 46-48):** It's a plain INSERT. Duplicate emails will either crash or create duplicate rows.
- **DB connections are never closed (lines 37, 50):** No `finally`, no context manager, no teardown hook. Connections leak on every request.
- **Unhandled JSON parsing failure (line 30):** Malformed JSON throws an unhandled exception and returns a 500 with a stack trace. Should catch and return 400.
- **No email validation (line 34):** Missing email defaults to `""` and gets silently inserted. Should reject with 400.
- **DB errors are unhandled (lines 41-50):** No transaction management, partial writes are possible and there's no rollback.
- **Audit and upsert are not atomic (lines 41-48):** If the user INSERT fails, the audit INSERT gets rolled back too, meaning we lose the audit record for the exact events that cause problems.
- **No logging at all:** No way to tell what's happening in production. Signature failures, successful upserts, and exceptions are all silent.
- **No idempotency handling:** Vendor retries will create duplicate audit rows with no way to distinguish real events from retries.

See [`task-1/ai-pr-feedback.md`](task-1/ai-pr-feedback.md) for the AI prompts I used and the responses I received during the review process.

See [`task-1/task-1-followup.md`](task-1/task-1-followup.md) for my answers to the follow-up questions.

---

## Task 2: Calculator App

A calculator web app built with React, TypeScript, Vite, and Tailwind CSS.

### Features

- Basic arithmetic operations (+, -, \*, /)
- Parentheses support
- Input sanitization and validation
- Calculation history (localStorage)

### Running Locally

```bash
cd task-2
npm install
npm run dev
```

### AI Prompts

See [`task-2/ai-prompts.md`](task-2/ai-prompts.md) for all the AI prompts I used while building the app, along with the AI responses.

---

## Follow-Up Questions

### How far were you able to get with the exercise?

I completed the exercise resulting in a relatively polished calculator web app with input sanitization and order of operations evaluation using the math.js library.

### What challenges did you encounter in the process?

Most of my challenges resulted around edge case handling and solid UX. I had to think about the little things people don't normally notice when using a calculator but are crucial, like erasing the result & expression when entering a new number but keeping them when entering an expression. Some other challenges included sanitizing the expression to ensure that parentheses closed properly and you couldn't enter two consecutive operations unless you we're typing a negative number. Ex: 4+/3++7 (invalid), 4+-3 (valid).

### If you were given unlimited time, what additional functionality would you include?

There were two features I wanted to add but ran out of time for. One was unit conversions and the other was keyboard shortcuts. Unit conversion would actually be pretty simple because it comes with the math.js library, but it was more the UI side of things that would've taken too long. Keyboard shortcuts was mostly intended for good user experience and accessibility reasons. I think this feature would be relatively straight forward to add as well.

### AI Usage

#### What did the AI do well?

The AI was very good at reminding me about things like regex formating, simple security reviews, and reviewing my code before submitting in case I missed any subtle bugs.

#### What did the AI do poorly?

I find that AI isn't very consistent or reliable for UI a lot of the time. I typically find that doing the component styling myself is usually less hassle than trying to tweak the prompt until it understands what I want, but I admit this could be an issue on my end!

#### For the places it did poorly, how did you change your approach to your prompts to improve its output?

For this project, I didn't have to change my prompts very much. I only asked it simple questions and handled most of the work on my own. For previous projects where I've used AI more heavily, I've found that making sure my context window isn't too full and clearly explaining my expected input & output generally help improve the quality of response.

Portions of this README were generated with the help of AI. All answers to follow-up questions we're not generated with AI.
