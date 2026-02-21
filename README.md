# 🌈 Makaton Choice Board (AI-Adaptive)

**Live Demo:** [makaton.lovable.app](https://makaton.lovable.app)

An intelligent, accessible communication board designed for Special Educational Needs (SEND) environments. This app bridges the gap between static physical playbooks and dynamic student needs using **Gemini 1.5 Flash** and **DeepMind Nano Banana**.

## 🚀 Key Features

- **3-Step Communication Flow:** Navigates from Category → Object → Intent to reduce cognitive load for the student.
- **Predictive Quick-Choices:** Uses Gemini 1.5 Flash to analyze student history and suggest the 3 most likely signs, reducing choice fatigue.
- **AI-Synthesized Library:** If a Makaton sign is missing from the local library, Nano Banana Pro generates a technically accurate line-art diagram on the fly.
- **Human-in-the-Loop (Save to Repo):** Teaching Assistants can verify AI-generated signs and "Commit" them to the GitHub repository with one click to permanently expand the library.
- **High-Contrast Mode:** One-touch toggle for a yellow/black high-visibility theme, adhering to UK SEND visual standards.
- **TA Insights via Slack:** Instant notifications to the teacher with "Reasoning" threads powered by Gemini to explain the child's communication patterns.

## 🛠️ The Tech Stack

| Component        | Technology                    |
|-----------------|-------------------------------|
| Frontend        | React / Vite (via Lovable)    |
| Backend / API   | CodeWords (Agemo)             |
| Predictive AI   | Gemini 1.5 Flash (Low Latency)|
| Image AI        | DeepMind Nano Banana Pro      |
| Real-time Alerts| Slack API (Block Kit)         |
| Storage         | GitHub (for official Makaton symbols) |

## 📐 How it Works (Architecture)

1. **Selection:** A child makes a choice on the tablet.
2. **Processing:** CodeWords checks if the image exists. If missing, Nano Banana generates it.
3. **Notification:** The TA receives a Slack message with a "Why?" button for pedagogical rationale.
4. **Reward:** Upon a 3-step sequence, the student receives a "Golden Sign" visual reward.

## 📥 Local Assets

Official Makaton UK Playbook symbols are stored and referenced from:

**[public/symbols](https://github.com/chaeyoonyunakim/getting-started-with-mackathon/tree/main/public/symbols)**

---

## Project info

**Lovable project:** https://lovable.dev/projects/8a191690-59f8-407c-bf17-b00e127aff3b

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/8a191690-59f8-407c-bf17-b00e127aff3b) and start prompting. Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

Clone this repo and push changes. Pushed changes will also be reflected in Lovable. The only requirement is having Node.js & npm installed — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone https://github.com/chaeyoonyunakim/getting-started-with-mackathon.git
cd getting-started-with-mackathon
npm i
npm run dev
```

**Edit a file directly in GitHub**

Navigate to the desired file(s), click the "Edit" button (pencil icon), make your changes and commit.

**Use GitHub Codespaces**

Navigate to the main page of the repository → Code → Codespaces → New codespace. Edit files and commit/push when done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

The app is live at [makaton.lovable.app](https://makaton.lovable.app). To redeploy or update, open your [Lovable project](https://lovable.dev/projects/8a191690-59f8-407c-bf17-b00e127aff3b) and click Share → Publish.

## Can I connect a custom domain to my Lovable project?

Yes. Go to **Project > Settings > Domains** and click **Connect Domain**. See [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain).
