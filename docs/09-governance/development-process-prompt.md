/* Ignore: "Use the attached/pasted GOV-DEV-001 as the authoritative GCT Core development process. Follow it exactly. Do not invent additional verification, audit, staging, or documentation workflows. We are currently at [iteration].   */

The Markdown specification in the chat does not have a separate ChatGPT file name. It is simply a Markdown document contained inside one fenced code block in the assistant message.

The screenshot you provided is showing exactly that: ChatGPT is displaying the Markdown source in a copyable code block.

So for our GCT Core process, the correct format is:

Document name: APP-008.3-R4 — Hotelbeds Availability Transport & Execution
Format: Markdown
Location: directly in the ChatGPT response
Container: one single fenced markdown code block
Purpose: you copy the entire block directly into your repository as the .md document.
No downloadable file
No separate sections
No second copy outside the block

The downloadable .md file I created was not what you asked for. I should have simply provided the complete specification directly in the chat.

Also, I will make sure the specification's internal examples do not accidentally terminate the outer Markdown fence. That is important for producing one genuinely copyable document.

I understand the correction. The specification should be presented as one complete Markdown document in one code block in the chat, exactly as GOV-DEV-001 requires.

The entire specification must be contained inside one outer Markdown code block, with no nested code blocks inside it. That is the format shown in your screenshot and the format we will use going forward.

Specification → Architect Review + recommendations → Copilot implementation/live verification → Copilot report → Architect Acceptance → commit