GRASSQUEST + LOCAL QWEN AI (WINDOWS)

REQUIREMENTS
- Ollama installed for Windows: https://ollama.com/download/windows
- Node.js LTS installed: https://nodejs.org/ (choose the LTS version)
- Qwen model downloaded: open Command Prompt and run: ollama run qwen2.5:3b
  Wait until the model starts, then type /bye to leave the model chat. Ollama normally remains running in the background.

START THE WEBSITE
1. Extract this entire ZIP folder somewhere convenient.
2. Double-click start-grassquest.bat. Keep its black terminal window open.
3. Open http://127.0.0.1:3000 in Chrome. Do NOT double-click public/index.html; the website needs the local server.
4. Choose activity, time (up to 6 hours), mood and setting, then click Generate my AI quest.

HOW IT WORKS
- Browser -> local Node.js backend at 127.0.0.1:3000 -> Ollama at 127.0.0.1:11434 -> Qwen2.5 3B.
- No cloud AI API key is used. Quest prompts stay on this computer. The first model download requires internet; after that, generation can work offline while Ollama is running.
- This prototype does not provide live local weather, verified species identification, GPS, or guaranteed route safety.

TROUBLESHOOTING
- 'node' is not recognized: install Node.js LTS, close and reopen Command Prompt, then double-click the BAT file again.
- 'ollama' is not recognized: install Ollama, then reopen the terminal.
- AI request fails: run `ollama list` and check that qwen2.5:3b appears. If not, run `ollama run qwen2.5:3b` once and wait for it to download.
- If port 3000 is busy, close other local development servers and try again.
