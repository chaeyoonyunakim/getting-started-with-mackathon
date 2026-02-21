[![status: experimental](https://github.com/GIScience/badges/raw/master/status/experimental.svg)](https://github.com/GIScience/badges#experimental)

# 🌈 MakaMind
An AI-adaptive communication ecosystem for SEND students. Powered by Gemini 1.5 Flash & Nano Banana. Built for the {Tech: Europe} London AI Hackathon.

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

## 🎨 Dataset & Image Standards

All imagery—static and AI-synthesized—adheres to [UK Makaton standards](https://makaton.assetbank-server.com/assetbank-makaton/action/browseItems?categoryId=3257&categoryTypeId=2&cachedCriteria=1). Symbols are sourced from the Makaton Asset Bank. When a sign is missing from the local library, Nano Banana Pro generates it using the Asset Bank's black-on-white line-art style. AI-generated signs require TA verification via **Verify & Save** before being committed to the permanent library.

**Local symbols:** [public/symbols](https://github.com/chaeyoonyunakim/getting-started-with-mackathon/tree/main/public/symbols)

## Open Source & Standards Compliance:
- License: [MIT License](https://github.com/chaeyoonyunakim/getting-started-with-mackathon/blob/main/LICENSE)
- Code of Conduct: [Contributor Covenant](https://github.com/chaeyoonyunakim/getting-started-with-mackathon/blob/main/CODE_OF_CONDUCT.md)
