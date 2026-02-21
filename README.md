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

## 📐 How it Works (Architecture)

1. **Selection:** A child makes a choice on the tablet.
2. **Processing:** CodeWords checks if the image exists. If missing, Nano Banana generates it.
3. **Notification:** The TA receives a Slack message with a "Why?" button for pedagogical rationale.
4. **Reward:** Upon a 3-step sequence, the student receives a "Golden Sign" visual reward.

## Technical Documentation

### APIs & Frameworks Used

| Layer | Technology | Role |
|-------|------------|------|
| **Frontend** | React + Vite | Deployed on Lovable |
| **Logic Engine** | CodeWords (Agemo) | Orchestration layer |
| **LLM** | Gemini 1.5 Flash | Sub-second behavioral prediction |
| **Vision** | Nano Banana Pro | Zero-shot Makaton sign generation |
| **Integrations** | Slack Webhooks | TA Alerts |
| **Integrations** | GitHub REST API | Automated commits |

*Frontend also uses TypeScript, shadcn-ui, and Tailwind CSS.*

### Setup & Installation

```sh
# 1. Clone the repo
git clone https://github.com/chaeyoonyunakim/getting-started-with-mackathon.git
cd getting-started-with-mackathon

# 2. Install dependencies
npm install

# 3. Configure environment variables in the CodeWords backend
#    - SLACK_WEBHOOK  (for TA alerts)
#    - GITHUB_TOKEN   (for automated commits)

# 4. Run locally
npm run dev
```

---

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/8a191690-59f8-407c-bf17-b00e127aff3b) and start prompting. Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

See **Setup & Installation** above. Ensure Node.js & npm are installed — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating). Pushed changes will be reflected in Lovable.

**Edit a file directly in GitHub**

Navigate to the desired file(s), click the "Edit" button (pencil icon), make your changes and commit.

**Use GitHub Codespaces**

Navigate to the main page of the repository → Code → Codespaces → New codespace. Edit files and commit/push when done.

## How can I deploy this project?

The app is live at [makaton.lovable.app](https://makaton.lovable.app). To redeploy, open the [Lovable project](https://lovable.dev/projects/8a191690-59f8-407c-bf17-b00e127aff3b) and click Share → Publish.

## Can I connect a custom domain to my Lovable project?

Yes. Go to **Project > Settings > Domains** and click **Connect Domain**. See [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain).

---

## 🎨 Dataset & Image Standards

All imagery—static and AI-synthesized—adheres to [UK Makaton standards](https://makaton.assetbank-server.com/assetbank-makaton/action/browseItems?categoryId=3257&categoryTypeId=2&cachedCriteria=1). Symbols are sourced from the Makaton Asset Bank. When a sign is missing from the local library, Nano Banana Pro generates it using the Asset Bank's black-on-white line-art style. AI-generated signs require TA verification via **Verify & Save** before being committed to the permanent library.

**Local symbols:** [public/symbols](https://github.com/chaeyoonyunakim/getting-started-with-mackathon/tree/main/public/symbols)
