'use client'

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import {
  SessionWithArtifacts,
  PRDContent,
  CompetitiveContent,
  RoadmapContent,
  SummaryContent,
} from '@/types'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.4,
  },
  coverPage: {
    padding: 60,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  coverTitle: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: '#4F46E5',
    marginBottom: 20,
  },
  coverSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 40,
    textAlign: 'center',
  },
  coverChallenge: {
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
    maxWidth: 400,
    marginBottom: 40,
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  coverDate: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#4F46E5',
  },
  subsectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
    marginTop: 12,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 10,
    color: '#4B5563',
    marginBottom: 8,
  },
  italicParagraph: {
    fontSize: 10,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  highlightBox: {
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 4,
    marginBottom: 12,
  },
  highlightText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#92400E',
  },
  list: {
    marginLeft: 12,
    marginBottom: 8,
  },
  listItem: {
    fontSize: 10,
    color: '#4B5563',
    marginBottom: 4,
  },
  table: {
    marginTop: 8,
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableHeaderText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#6B7280',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tableCell: {
    fontSize: 9,
    color: '#374151',
  },
  competitorCard: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 4,
  },
  competitorName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  competitorDescription: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  strengthTag: {
    fontSize: 8,
    color: '#047857',
    backgroundColor: '#D1FAE5',
    padding: 4,
    borderRadius: 2,
    marginRight: 4,
    marginBottom: 4,
  },
  weaknessTag: {
    fontSize: 8,
    color: '#DC2626',
    backgroundColor: '#FEE2E2',
    padding: 4,
    borderRadius: 2,
    marginRight: 4,
    marginBottom: 4,
  },
  differentiatorBox: {
    backgroundColor: '#EEF2FF',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  differentiatorText: {
    fontSize: 9,
    color: '#4338CA',
  },
  phaseCard: {
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  phaseName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  phaseTimeline: {
    fontSize: 10,
    color: '#6B7280',
  },
  summaryHeadline: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBottom: 16,
  },
  twoColumn: {
    flexDirection: 'row',
    marginTop: 12,
  },
  column: {
    flex: 1,
    paddingRight: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#9CA3AF',
  },
})

interface ReportDocumentProps {
  session: SessionWithArtifacts
}

export function ReportDocument({ session }: ReportDocumentProps) {
  const prd = session.artifacts.find((a) => a.type === 'prd')?.content as PRDContent | null
  const competitive = session.artifacts.find((a) => a.type === 'competitive')?.content as CompetitiveContent | null
  const roadmap = session.artifacts.find((a) => a.type === 'roadmap')?.content as RoadmapContent | null
  const summary = session.artifacts.find((a) => a.type === 'summary')?.content as SummaryContent | null

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.coverPage}>
        <Text style={styles.coverTitle}>AI PM Copilot</Text>
        <Text style={styles.coverSubtitle}>Product Artifact Report</Text>
        <View style={styles.coverChallenge}>
          <Text>{session.challenge}</Text>
        </View>
        <Text style={styles.coverDate}>
          Generated on {new Date(session.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </Page>

      {/* PRD Page */}
      {prd && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Product Requirements Document</Text>

          <Text style={styles.italicParagraph}>{prd.background}</Text>

          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>Problem: {prd.problem_statement}</Text>
          </View>

          <Text style={styles.subsectionTitle}>Goals</Text>
          <View style={styles.list}>
            {prd.goals.map((goal, i) => (
              <Text key={i} style={styles.listItem}>• {goal}</Text>
            ))}
          </View>

          <Text style={styles.subsectionTitle}>User Stories</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Persona</Text>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Want</Text>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>So That</Text>
            </View>
            {prd.user_stories.map((story, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 1 }]}>{story.persona}</Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>{story.want}</Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>{story.so_that}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.subsectionTitle}>Success Metrics</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Metric</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Target</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Timeframe</Text>
            </View>
            {prd.success_metrics.map((metric, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>{metric.metric}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{metric.target}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{metric.timeframe}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.footer}>AI PM Copilot • {session.id.slice(0, 8)}</Text>
        </Page>
      )}

      {/* Competitive Analysis Page */}
      {competitive && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Competitive Analysis</Text>

          <Text style={styles.paragraph}>{competitive.market_context}</Text>

          {competitive.competitors.map((comp, i) => (
            <View key={i} style={styles.competitorCard}>
              <Text style={styles.competitorName}>{comp.name}</Text>
              <Text style={styles.competitorDescription}>{comp.description}</Text>

              <Text style={[styles.tableHeaderText, { marginBottom: 4 }]}>Strengths</Text>
              <View style={styles.tagContainer}>
                {comp.strengths.map((s, j) => (
                  <Text key={j} style={styles.strengthTag}>{s}</Text>
                ))}
              </View>

              <Text style={[styles.tableHeaderText, { marginBottom: 4 }]}>Weaknesses</Text>
              <View style={styles.tagContainer}>
                {comp.weaknesses.map((w, j) => (
                  <Text key={j} style={styles.weaknessTag}>{w}</Text>
                ))}
              </View>

              <View style={styles.differentiatorBox}>
                <Text style={styles.differentiatorText}>Our Edge: {comp.our_differentiator}</Text>
              </View>
            </View>
          ))}

          <Text style={styles.subsectionTitle}>Strategic Gap</Text>
          <Text style={styles.paragraph}>{competitive.strategic_gap}</Text>

          <Text style={styles.footer}>AI PM Copilot • {session.id.slice(0, 8)}</Text>
        </Page>
      )}

      {/* Roadmap Page */}
      {roadmap && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Product Roadmap</Text>

          <Text style={styles.paragraph}>{roadmap.strategic_rationale}</Text>

          {roadmap.phases.map((phase, i) => (
            <View key={i} style={styles.phaseCard}>
              <View style={styles.phaseHeader}>
                <Text style={styles.phaseName}>{phase.name}</Text>
                <Text style={styles.phaseTimeline}>{phase.timeline}</Text>
              </View>

              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, { flex: 2 }]}>Feature</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1 }]}>Priority</Text>
                  <Text style={[styles.tableHeaderText, { width: 30 }]}>Effort</Text>
                  <Text style={[styles.tableHeaderText, { flex: 2 }]}>Rationale</Text>
                </View>
                {phase.items.map((item, j) => (
                  <View key={j} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 2 }]}>{item.feature}</Text>
                    <Text style={[styles.tableCell, { flex: 1 }]}>{item.priority}</Text>
                    <Text style={[styles.tableCell, { width: 30 }]}>{item.effort}</Text>
                    <Text style={[styles.tableCell, { flex: 2 }]}>{item.rationale}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}

          <Text style={styles.footer}>AI PM Copilot • {session.id.slice(0, 8)}</Text>
        </Page>
      )}

      {/* Executive Summary Page */}
      {summary && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>

          <Text style={styles.summaryHeadline}>{summary.headline}</Text>

          <View style={styles.twoColumn}>
            <View style={styles.column}>
              <Text style={styles.subsectionTitle}>Problem</Text>
              <Text style={styles.paragraph}>{summary.problem}</Text>

              <Text style={styles.subsectionTitle}>Solution</Text>
              <Text style={styles.paragraph}>{summary.solution}</Text>

              <Text style={styles.subsectionTitle}>Market Opportunity</Text>
              <Text style={styles.paragraph}>{summary.market_opportunity}</Text>

              <Text style={styles.subsectionTitle}>Competitive Edge</Text>
              <Text style={styles.paragraph}>{summary.competitive_edge}</Text>
            </View>

            <View style={styles.column}>
              <Text style={styles.subsectionTitle}>Next Steps</Text>
              <View style={styles.list}>
                {summary.next_steps.map((step, i) => (
                  <Text key={i} style={styles.listItem}>• {step}</Text>
                ))}
              </View>

              <Text style={styles.subsectionTitle}>Key Metrics</Text>
              <View style={styles.list}>
                {summary.key_metrics.map((metric, i) => (
                  <Text key={i} style={styles.listItem}>• {metric}</Text>
                ))}
              </View>
            </View>
          </View>

          <Text style={styles.footer}>AI PM Copilot • {session.id.slice(0, 8)}</Text>
        </Page>
      )}
    </Document>
  )
}
