# Ralchev Coach – ChatGPT App v1

A minimal, tool-only MCP app for **Ralchev Coach – Track & Field Online Coaching**.

## Positioning

Ralchev Coach is not an “AI coach.” AI assists with initial athlete intake and a high-level assessment. Individual training plans and coaching decisions are made by professional track & field coach **Ivan Ralchev**.

## Coach

Ivan Ralchev is a professional track & field coach from Sofia, Bulgaria, with more than 10 years of coaching experience. He holds a Master’s degree from the National Sports Academy “Vassil Levski” in Sports Coaching – Track & Field. His athletes have won multiple medals at Bulgarian National Championships and have represented Bulgaria at Balkan Championships and World Championships.

Disciplines:
- 100 m
- 200 m
- 400 m
- Hurdles
- Long Jump
- Triple Jump
- High Jump
- Combined Events

## Services

- **4-week Individual Training Plan — €30**
- **Online Coaching — €80/month**

Contact: **Instagram @ralchev_coach**

## Architecture

Primary archetype: **tool-only**, prepared toward public submission.

The MCP server exposes three read-only tools:
1. `get_coach_profile`
2. `get_coaching_options`
3. `prepare_athlete_assessment`

The app does not store athlete data, process payments, create accounts or make medical diagnoses.

## Local run

Requires Node.js 20+.

```bash
npm install
npm start
```

MCP endpoint:

```text
http://localhost:8000/mcp
```

Health endpoint:

```text
http://localhost:8000/
```

## Public launch still requires

1. Deploy the MCP server to a stable public HTTPS URL.
2. Host a final Privacy Policy at a stable public HTTPS URL.
3. Host final Terms of Service at a stable public HTTPS URL.
4. Supply final logo / app assets and support contact required by the submission form.
5. Test the public MCP endpoint in ChatGPT Developer Mode.
6. Review and complete the OpenAI app submission form.

The files in `policies/` are drafts and should not be treated as published legal documents.
