import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BadgeTile } from '@/components/BadgeTile';
import { Screen } from '@/components/Screen';
import { XPBar } from '@/components/XPBar';
import { Chip, GhostButton, IconButton, SectionTitle } from '@/components/ui';
import {
  BADGES,
  RANKS,
  countByLanguage,
  countLanguages,
  langRankInfo,
  rankForXp,
} from '@/lib/gamification';
import { LANGUAGES } from '@/lib/languages';
import { useAppStore } from '@/store/useAppStore';
import { colors, radius, spacing } from '@/theme';

export default function ProfileScreen() {
  const displayName = useAppStore((state) => state.displayName);
  const xp = useAppStore((state) => state.xp);
  const learned = useAppStore((state) => state.learned);
  const badges = useAppStore((state) => state.badges);
  const stats = useAppStore((state) => state.stats);

  const rankInfo = rankForXp(xp);
  const words = learned.length;
  const langs = countLanguages(learned.map((entry) => entry.words));
  const perLanguage = countByLanguage(learned.map((entry) => entry.words));
  const unlockedCount = Object.keys(badges).length;
  const initials = displayName.slice(0, 2).toUpperCase();

  const statsTiles = [
    { label: 'Palabras', value: words, icon: 'bookmark' as const, tint: colors.accent },
    { label: 'Idiomas', value: langs, icon: 'globe' as const, tint: colors.violet },
    { label: 'Racha', value: stats.streak, icon: 'flame' as const, tint: colors.amber },
    { label: 'Audios', value: stats.audioPlays, icon: 'volume-high' as const, tint: colors.pink },
  ];

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.identity}>
            <LinearGradient colors={[colors.accent, '#5CE1C6']} style={styles.avatar}>
              <Text style={styles.avatarText}>{initials || 'EX'}</Text>
            </LinearGradient>
            <View>
              <Text style={styles.name}>{displayName}</Text>
              <Text style={styles.rankLine}>
                {rankInfo.rank.emoji} {rankInfo.rank.name} · Nivel {rankInfo.level}
              </Text>
            </View>
          </View>
          <IconButton
            icon="settings-outline"
            size={38}
            background="rgba(255,255,255,0.05)"
            accessibilityLabel="Ajustes"
            onPress={() => router.push('/settings')}
          />
        </View>

        <View style={styles.rankCard}>
          <View style={styles.rankTop}>
            <View style={styles.rankEmojiWrap}>
              <Text style={styles.rankEmoji}>{rankInfo.rank.emoji}</Text>
            </View>
            <View style={styles.rankTextWrap}>
              <Text style={[styles.rankName, { color: rankInfo.rank.color }]}>{rankInfo.rank.name}</Text>
              <Text style={styles.rankBlurb}>{rankInfo.rank.blurb}</Text>
            </View>
            <View style={styles.xpBox}>
              <Text style={styles.xpValue}>{xp}</Text>
              <Text style={styles.xpLabel}>XP</Text>
            </View>
          </View>

          <XPBar value={rankInfo.progress * 100} max={100} tint={rankInfo.rank.color} height={9} />

          <View style={styles.rankFooter}>
            <Text style={styles.rankFooterText}>
              {rankInfo.next
                ? `Faltan ${rankInfo.xpToNext} XP para ${rankInfo.next.name}`
                : 'Rango máximo alcanzado · Leyenda'}
            </Text>
            <Text style={styles.rankFooterHint}>
              {rankInfo.next ? `${rankInfo.next.xp} XP` : '3200 XP'}
            </Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          {statsTiles.map((tile) => (
            <View key={tile.label} style={styles.statCard}>
              <Ionicons name={tile.icon} size={16} color={tile.tint} />
              <Text style={styles.statValue}>{tile.value}</Text>
              <Text style={styles.statLabel}>{tile.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <SectionTitle
            right={
              <Chip
                label={learned.length > 0 ? `${learned.length} guardadas` : 'Vacío'}
                color={colors.textMuted}
              />
            }>
            Tu colección
          </SectionTitle>

          {learned.length === 0 ? (
            <View style={styles.emptyCollection}>
              <Text style={styles.emptyEmoji}>🧭</Text>
              <Text style={styles.emptyTitle}>Tu primera palabra te espera</Text>
              <Text style={styles.emptyText}>
                Escanea un objeto y guárdalo para empezar a subir de rango.
              </Text>
              <GhostButton
                label="Escanear ahora"
                icon="camera"
                onPress={() => router.push('/')}
                style={styles.emptyButton}
              />
            </View>
          ) : (
            <View style={styles.collection}>
              {learned.slice(0, 10).map((entry) => (
                <View key={entry.id} style={styles.wordChip}>
                  <Text style={styles.wordEmoji}>{entry.emoji}</Text>
                  <Text style={styles.wordText}>{entry.object}</Text>
                </View>
              ))}
              <GhostButton
                label="Abrir biblioteca"
                icon="albums-outline"
                onPress={() => router.push('/library')}
                style={styles.libraryButton}
              />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <SectionTitle>Progreso por idioma</SectionTitle>
          <View style={styles.languageCard}>
            {LANGUAGES.map((language, index) => {
              const count = perLanguage[language.code] ?? 0;
              const info = langRankInfo(count);
              return (
                <View
                  key={language.code}
                  style={[styles.languageRow, index > 0 && styles.languageRowBorder]}>
                  <Text style={styles.languageFlag}>{language.flag}</Text>
                  <View style={styles.languageBody}>
                    <View style={styles.languageTop}>
                      <Text style={styles.languageName}>{language.name}</Text>
                      <Text style={styles.languageRank}>
                        {info.rank.emoji} {info.rank.name} · {count}
                      </Text>
                    </View>
                    <XPBar
                      value={info.progress * 100}
                      max={100}
                      tint={language.tint}
                      height={5}
                      style={styles.languageBar}
                    />
                    <Text style={styles.languageHint}>
                      {info.next
                        ? `${info.remaining} palabras para ${info.next.name}`
                        : 'Rango máximo en este idioma'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle
            right={
              <Text style={styles.badgeCount}>
                {unlockedCount}/{BADGES.length}
              </Text>
            }>
            Badges
          </SectionTitle>
          <View style={styles.badges}>
            {BADGES.map((badge) => (
              <View key={badge.id} style={styles.badgeCell}>
                <BadgeTile badge={badge} unlocked={Boolean(badges[badge.id])} />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle>Camino de rangos</SectionTitle>
          <View style={styles.pathCard}>
            {RANKS.map((rank, index) => {
              const reached = xp >= rank.xp;
              return (
                <View key={rank.name} style={styles.pathRow}>
                  <View style={styles.pathLeft}>
                    <View
                      style={[
                        styles.pathDot,
                        {
                          backgroundColor: reached ? rank.color : 'transparent',
                          borderColor: reached ? rank.color : colors.borderStrong,
                        },
                      ]}
                    />
                    {index < RANKS.length - 1 ? (
                      <View style={[styles.pathLine, reached && { backgroundColor: `${rank.color}66` }]} />
                    ) : null}
                  </View>
                  <View style={styles.pathBody}>
                    <Text style={[styles.pathName, reached && { color: colors.text }]}>
                      {rank.emoji} {rank.name}
                    </Text>
                    <Text style={styles.pathXp}>{rank.xp} XP</Text>
                  </View>
                  {reached ? <Ionicons name="checkmark" size={16} color={rank.color} /> : null}
                </View>
              );
            })}
          </View>
        </View>

        <GhostButton
          label="Ajustes, IA y voces"
          icon="settings-outline"
          onPress={() => router.push('/settings')}
          style={styles.settingsButton}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.accentInk,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  name: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  rankLine: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  rankCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  rankTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  rankEmojiWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankEmoji: {
    fontSize: 26,
  },
  rankTextWrap: {
    flex: 1,
  },
  rankName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  rankBlurb: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  xpBox: {
    alignItems: 'flex-end',
  },
  xpValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  xpLabel: {
    color: colors.textDim,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  rankFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  rankFooterText: {
    color: colors.textMuted,
    fontSize: 10,
  },
  rankFooterHint: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 3,
  },
  statValue: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
    marginTop: 2,
  },
  statLabel: {
    color: colors.textDim,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  section: {
    marginTop: spacing.xl,
  },
  emptyCollection: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 30,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 4,
  },
  emptyButton: {
    marginTop: spacing.md,
    alignSelf: 'stretch',
  },
  collection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wordChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  wordEmoji: {
    fontSize: 14,
  },
  wordText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  libraryButton: {
    marginTop: spacing.md,
    alignSelf: 'stretch',
  },
  languageCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  languageRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  languageFlag: {
    fontSize: 20,
  },
  languageBody: {
    flex: 1,
  },
  languageTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  languageName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  languageRank: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  languageBar: {
    marginBottom: 5,
  },
  languageHint: {
    color: colors.textDim,
    fontSize: 9,
  },
  badgeCount: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badgeCell: {
    width: '48.5%',
    flexGrow: 1,
  },
  pathCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  pathRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    minHeight: 40,
  },
  pathLeft: {
    alignItems: 'center',
    width: 16,
  },
  pathDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    marginTop: 3,
  },
  pathLine: {
    width: 2,
    flex: 1,
    minHeight: 22,
    backgroundColor: colors.border,
    marginTop: 2,
  },
  pathBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
  },
  pathName: {
    color: colors.textDim,
    fontSize: 13,
    fontWeight: '700',
  },
  pathXp: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '600',
  },
  settingsButton: {
    marginTop: spacing.xl,
  },
});
