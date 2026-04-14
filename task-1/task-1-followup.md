1. Share your prompts and the AI outputs.
   - My prompt and AI output are located in "ai-pr-feedback.md"
2. For each prompt:
   - Tell us what you were hoping for the AI to accomplish.
   - Tell us what it actually did.
   - Did you have to re-prompt it based on its output?
   - If you had to change your approach, why?

---

1.  I was hoping for the AI to understand the goal of the PR, and thoroughly review the code to spot any issues or security vulnerabilites. I had given it a list of 5 prioritized categories to specifically search for (Security, Correctness, Error Handling, Data Integrity, and Production Readiness) as well as examples for each category. The purpose of this was to prevent the model from spending tokens on formatting opinions and force it to focus on security/correctness first. I also added an output format constraint (line, problem, impact, fix) to keep each comment tight and focused. This way you could almost lift the comments directly into PR comments after reviewing for validity. I added the last line instructing it to focus on things that "looks right but is subtly wrong" in hopes that it would push past the surface level observations towards the more difficult to spot findings.

2.  The AI model responded with very valuable feedback and findings. It returned a total of 13 concerns broken into my 5 categories and then summarized in a table by order of importance (critical, high, medium, low). Each response contained enough specific details to be actionable and useful but not too much to lose focus and be bloated. It stuck to my line, problem, impact, fix output format, which made it readable and easy to verify each concern for legitimacy. Ordering the concerns from critical -> low allows us to easily differentiate between what could be an opinion or style complaint and what is a full blocker in need of correction.

3.  After reviewing, I was very satisfied with the results so I did not need to re-prompt it. It listened to my instructions, followed my formatting requests and found valuable issues as requested.

4.  I did not have to change my approach. I think I was thorough enough with my prompt on the first try and this lead to a result I was satisfied with.
