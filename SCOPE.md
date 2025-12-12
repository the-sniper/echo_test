# Echo Test - Implementation Scope

## MVP Features (Included)

- **Session Management**: Create sessions with scenes, start/end controls
- **Voice Recording**: Browser-based MediaRecorder API with controls
- **Transcription**: Self-hosted Whisper integration
- **Editable Transcripts**: Raw + edited versions
- **Classification**: Auto-classification (Bug, Feature, UX, Performance, Other)
- **Bias Prevention**: Testers only see own notes during active sessions
- **Report Generation**: Summary stats, category breakdown, PDF export
- **Simple Auth**: Invite-link based session access

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| STT | Self-hosted Whisper |
| PDF | @react-pdf/renderer |

## Future Scope (Deferred)

- Full OAuth authentication
- Jira/Confluence integrations
- Cross-session trend analysis
- Mobile app (React Native)
- Anonymization features
