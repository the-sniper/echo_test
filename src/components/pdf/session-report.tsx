import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { SessionWithDetails, NoteWithDetails, NoteCategory } from "@/types";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 11, color: "#1a1a1a" },
  header: { marginBottom: 30, borderBottomWidth: 2, borderBottomColor: "#22c55e", paddingBottom: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 12, color: "#666", marginBottom: 4 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: "bold", marginBottom: 12, backgroundColor: "#f5f5f5", padding: 8, borderRadius: 4 },
  statsGrid: { flexDirection: "row", marginBottom: 20, gap: 12 },
  statBox: { flex: 1, padding: 12, backgroundColor: "#f9fafb", borderRadius: 6, borderWidth: 1, borderColor: "#e5e5e5" },
  statValue: { fontSize: 20, fontWeight: "bold", color: "#22c55e" },
  statLabel: { fontSize: 9, color: "#666", marginTop: 4 },
  categoryRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  categoryBadge: { width: 80, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4, marginRight: 12 },
  categoryText: { fontSize: 9, fontWeight: "bold", color: "white", textAlign: "center" },
  categoryBar: { flex: 1, height: 8, backgroundColor: "#f0f0f0", borderRadius: 4, marginRight: 8 },
  categoryBarFill: { height: 8, backgroundColor: "#22c55e", borderRadius: 4 },
  categoryCount: { width: 30, textAlign: "right", fontSize: 10, fontWeight: "bold" },
  sceneSection: { marginBottom: 16, borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 6, overflow: "hidden" },
  sceneHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 10, backgroundColor: "#f9fafb", borderBottomWidth: 1, borderBottomColor: "#e5e5e5" },
  sceneName: { fontSize: 12, fontWeight: "bold" },
  noteCount: { fontSize: 9, color: "#666", backgroundColor: "#e5e5e5", paddingVertical: 2, paddingHorizontal: 8, borderRadius: 10 },
  note: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  noteHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  noteBadge: { paddingVertical: 2, paddingHorizontal: 6, borderRadius: 4, fontSize: 8, fontWeight: "bold", color: "white" },
  noteMeta: { fontSize: 8, color: "#888" },
  noteText: { fontSize: 10, lineHeight: 1.5, color: "#333" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", fontSize: 9, color: "#999", borderTopWidth: 1, borderTopColor: "#e5e5e5", paddingTop: 10 },
});

const categoryColors: Record<NoteCategory, string> = { bug: "#ef4444", feature: "#3b82f6", ux: "#a855f7", performance: "#f97316", other: "#6b7280" };
const categoryLabels: Record<NoteCategory, string> = { bug: "Bug", feature: "Feature", ux: "UX", performance: "Performance", other: "Other" };

function formatDate(date: string): string { return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(date)); }

export function SessionReportPDF({ session }: { session: SessionWithDetails }) {
  const categoryBreakdown: Record<NoteCategory, number> = { bug: 0, feature: 0, ux: 0, performance: 0, other: 0 };
  session.notes?.forEach((note) => { categoryBreakdown[note.category]++; });
  const totalNotes = session.notes?.length || 0;

  const notesByScene: Record<string, NoteWithDetails[]> = {};
  session.notes?.forEach((note) => { const sceneName = note.scene?.name || "Unknown"; if (!notesByScene[sceneName]) notesByScene[sceneName] = []; notesByScene[sceneName].push(note); });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{session.name}</Text>
          {session.build_version && <Text style={styles.subtitle}>Build: {session.build_version}</Text>}
          <Text style={styles.subtitle}>Completed: {session.ended_at ? formatDate(session.ended_at) : "N/A"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}><Text style={styles.statValue}>{totalNotes}</Text><Text style={styles.statLabel}>Total Notes</Text></View>
            <View style={styles.statBox}><Text style={styles.statValue}>{session.testers?.length || 0}</Text><Text style={styles.statLabel}>Testers</Text></View>
            <View style={styles.statBox}><Text style={styles.statValue}>{session.scenes?.length || 0}</Text><Text style={styles.statLabel}>Scenes</Text></View>
            <View style={styles.statBox}><Text style={[styles.statValue, { color: "#ef4444" }]}>{categoryBreakdown.bug}</Text><Text style={styles.statLabel}>Bugs Found</Text></View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          {(Object.entries(categoryBreakdown) as [NoteCategory, number][]).map(([category, count]) => (
            <View key={category} style={styles.categoryRow}>
              <View style={[styles.categoryBadge, { backgroundColor: categoryColors[category] }]}><Text style={styles.categoryText}>{categoryLabels[category]}</Text></View>
              <View style={styles.categoryBar}><View style={[styles.categoryBarFill, { width: `${totalNotes > 0 ? (count / totalNotes) * 100 : 0}%`, backgroundColor: categoryColors[category] }]} /></View>
              <Text style={styles.categoryCount}>{count}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}><Text>Echo Test - Session Report</Text><Text>Generated: {formatDate(new Date().toISOString())}</Text></View>
      </Page>

      {Object.entries(notesByScene).map(([sceneName, notes]) => (
        <Page key={sceneName} size="A4" style={styles.page}>
          <View style={styles.sceneSection}>
            <View style={styles.sceneHeader}><Text style={styles.sceneName}>{sceneName}</Text><Text style={styles.noteCount}>{notes.length} notes</Text></View>
            {notes.map((note, index) => (
              <View key={note.id} style={[styles.note, index === notes.length - 1 ? { borderBottomWidth: 0 } : {}]}>
                <View style={styles.noteHeader}>
                  <Text style={[styles.noteBadge, { backgroundColor: categoryColors[note.category] }]}>{categoryLabels[note.category]}{note.auto_classified ? " (auto)" : ""}</Text>
                  <Text style={styles.noteMeta}>{note.tester?.first_name} {note.tester?.last_name} • {formatDate(note.created_at)}</Text>
                </View>
                <Text style={styles.noteText}>{note.edited_transcript || note.raw_transcript || "No transcript"}</Text>
              </View>
            ))}
          </View>
          <View style={styles.footer}><Text>Echo Test - {session.name}</Text><Text>{sceneName}</Text></View>
        </Page>
      ))}
    </Document>
  );
}

