# The builder: a second Claude doing the rebuild through the API

Chris, November 13, 2026: "I would like you to use the API key to have a fable 5.2 ... do all of the rebuild of this model.
You give it everything it needs. We build it in stages. That way you're not having to waste tokens of my usage."

- `agent.py` runs one stage: it sends a brief to `claude-fable-5-2` at high effort and lets it work in this folder through six
  tools (shell, read, write, edit, look at a picture, finish). The session Claude writes the brief, then checks, publishes
  and pushes. Usage: `python3 agent.py <brief.md> <run_name> [max_turns] [--resume]`.
- The key is read from a file `.key` beside `agent.py`. **The key is never stored in this repo** (`.key` is ignored by git).
  Chris gives it in the chat; put it in the copy of this folder you run from.
- `stageN_brief.md` is what the builder was told; `stageN_report.md` is what it wrote back.

Things learned running it:

- A background run is stopped a few minutes after the session's reply ends. Stay in the turn and check every ten minutes.
- When old tool results are trimmed from a long run, every "thinking" block must be removed as well, or the API refuses the
  request. `agent.py` does this.
- Give it a turn limit with room: stage 1 took 176 turns. Tell it early to save its last 15 for the checks and the report.
- Stage 1 used about 282,000 output tokens, 24.0 million cached-read tokens and 1.0 million cache-write tokens.
