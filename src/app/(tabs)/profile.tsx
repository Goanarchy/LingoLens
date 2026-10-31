import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BadgeTile } from '@/components/BadgeTile';
import { KamuGuideBanner } from '@/components/KamuBubble';
import { Screen } from '@/components/Screen';
import { Chip, GhostButton, IconButton, SectionTitle } from '@/components/ui';
import { XPBar } from '@/components/XPBar';
import {
  BADGES,
  RANKS,
  STREAK_MILESTONES,
  countByLanguage,
  langRankInfo,
  rankForXp,
  type BadgeTier,
} from '@/lib/gamification';
import { LANGUAGES, type LangCode } from '@/lib/languages';
import { useAppStore } from '@/store/useAppStore';
import { colors, radius, spacing } from '@/theme';

const TIER_TINT: Record<BadgeTier, string> = {
  bronze: '#E0A66B',
  silver: '#C7D2E1',
  gold: '#FFC46B',
  legend: '#FFD700',
};

export default function ProfileScreen() {
  const displayName = useAppStore((state) => state.displayName);
  const xp = useAppStore((state) => state.xp);
  const learned = useAppStore((state) => state.learned);
  const badges = useAppStore((state) => state.badges);
  const stats = useAppStore((state) => state.stats);
  const learningLangs = useAppStore((state) => state.learningLangs);
  const toggleLearningLang = useAppStore((state) => state.toggleLearningLang);
  const scoreboard = useAppStore((state) => state.scoreboard);
  const crowns = useAppStore((state) => state.crowns);
  const unlockedMilestones = useAppStore((state) => state.unlockedMilestones);
  const simulateStreakMilestone = useAppStore((state) => state.simulateStreakMilestone);

  const rankInfo = rankForXp(xp);
  const words = learned.length;
  const perLanguage = countByLanguage(learned.map((entry) => entry.words));
  const unlockedCount = Object.keys(badges).length;
  const initials = displayName.slice(0, 2).toUpperCase();

  function handleToggleLang(code: LangCode) {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(() => undefined);
    }
    toggleLearningLang(code);
  }

  function handleSimulateMilestone(days: 7 | 14 | 21) {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    }
    simulateStreakMilestone(days);
  }

  const statsTiles = [
    { label: 'Photo Streak', value: `${stats.photoStreak}d`, icon: 'flame' as const, tint: colors.amber },
    { label: 'Daily Crowns', value: crowns.length, icon: 'trophy' as const, tint: colors.accent },
    { label: 'Voice Passes', value: stats.pronunciationPasses, icon: 'mic' as const, tint: colors.pink },
    { label: 'Saved Words', value: words, icon: 'bookmark' as const, tint: colors.violet },
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
                {rankInfo.rank.emoji} {rankInfo.rank.name} · Level {rankInfo.level}
              </Text>
            </View>
          </View>
          <IconButton
            icon="settings-outline"
            size={38}
            background="rgba(255,255,255,0.05)"
            accessibilityLabel="Settings"
            onPress={() => router.push('/settings')}
          />
        </View>

        <View style={{ marginBottom: spacing.md }}>
          <KamuGuideBanner screen="profile" />
        </View>

        {/* Rank & XP Card */}
        <View style={styles.rankCard}>
          <View style={styles.rankTop}>
            <View style={styles.rankEmojiWrap}>
              <Text style={styles.rankEmoji}>{rankInfo.rank.emoji}</Text>
            </View>
            <View style={styles.rankTextWrap}>
              <Text style={[styles.rankName, { color: rankInfo.rank.color }]}>
                {rankInfo.rank.name}
              </Text>
              <Text style={styles.rankBlurb}>{rankInfo.rank.blurb}</Text>
            </View>
            <View style={styles.xpBox}>
              <Text style={styles.xpValue}>{xp}</Text>
              <Text style={styles.xpLabel}>TOTAL XP</Text>
            </View>
          </View>

          <XPBar value={rankInfo.progress * 100} max={100} tint={rankInfo.rank.color} height={9} />

          <View style={styles.rankFooter}>
            <Text style={styles.rankFooterText}>
              {rankInfo.next
                ? `${rankInfo.xpToNext} XP until ${rankInfo.next.name}`
                : 'Maximum rank reached · Polyglot Legend'}
            </Text>
            <Text style={styles.rankFooterHint}>
              {rankInfo.next ? `${rankInfo.next.xp} XP` : '3200 XP'}
            </Text>
          </View>
        </View>

        {/* Core Gamification Metrics */}
        <View style={styles.statsGrid}>
          {statsTiles.map((tile) => (
            <View key={tile.label} style={styles.statCard}>
              <Ionicons name={tile.icon} size={16} color={tile.tint} />
              <Text style={styles.statValue}>{tile.value}</Text>
              <Text style={styles.statLabel}>{tile.label}</Text>
            </View>
          ))}
        </View>

        {/* 1-Week, 2-Week & 3-Week Photo Consistency Milestones */}
        <View style={styles.section}>
          <SectionTitle
            right={
              <Chip
                label={`Best: ${stats.bestPhotoStreak}d`}
                color={colors.amber}
                background={colors.amberSoft}
              />
            }>
            Photo Streak Trophies (1, 2 & 3 Weeks)
          </SectionTitle>

          <View style={styles.milestoneList}>
            {STREAK_MILESTONES.map((milestone) => {
              const tint = TIER_TINT[milestone.tier];
              const unlocked =
                Boolean(unlockedMilestones[milestone.id]) ||
                stats.bestPhotoStreak >= milestone.daysRequired;
              const progress = Math.min(1, stats.photoStreak / milestone.daysRequired);
              return (
                <View
                  key={milestone.id}
                  style={[
                    styles.milestoneCard,
                    unlocked && {
                      borderColor: tint,
                      backgroundColor: 'rgba(255,255,255,0.04)',
                    },
                  ]}>
                  <View style={styles.milestoneTop}>
                    <Text style={styles.milestoneEmoji}>{milestone.emoji}</Text>
                    <View style={styles.milestoneTextWrap}>
                      <View style={styles.milestoneTitleRow}>
                        <Text
                          style={[
                            styles.milestoneTitle,
                            unlocked && { color: tint },
                          ]}>
                          {milestone.name}
                        </Text>
                        <Text style={styles.milestoneXp}>+{milestone.xpBonus} XP</Text>
                      </View>
                      <Text style={styles.milestoneSub}>{milestone.description}</Text>
                    </View>
                  </View>
                  <XPBar
                    value={progress * 100}
                    max={100}
                    tint={tint}
                    height={6}
                    style={{ marginTop: spacing.sm }}
                  />
                  <View style={styles.milestoneFooter}>
                    <Text style={styles.milestoneProgressText}>
                      {unlocked
                        ? `✓ Unlocked · Title: ${milestone.titleUnlocked}`
                        : `${stats.photoStreak}/${milestone.daysRequired} consecutive photo days`}
                    </Text>
                    <Text style={styles.milestoneTierTag}>{milestone.tier.toUpperCase()}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Instant Demo Triggers for 1W / 2W / 3W Streak Testing */}
          <View style={styles.simRow}>
            <Text style={styles.simLabel}>Test Streak Rewards:</Text>
            {([7, 14, 21] as const).map((days) => (
              <Pressable
                key={days}
                onPress={() => handleSimulateMilestone(days)}
                style={({ pressed }) => [
                  styles.simBtn,
                  stats.photoStreak >= days && styles.simBtnActive,
                  { opacity: pressed ? 0.7 : 1 },
                ]}>
                <Text
                  style={[
                    styles.simBtnText,
                    stats.photoStreak >= days && styles.simBtnTextActive,
                  ]}>
                  🔥 {days / 7}W ({days}d)
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Interactive Dynamic Language Selector (1 to 5 Languages) */}
        <View style={styles.section}>
          <SectionTitle
            right={
              <Chip
                label={`${learningLangs.length}/5 Active`}
                color={colors.accent}
                background={colors.accentSoft}
              />
            }>
            Active Study Languages (Tap to Toggle)
          </SectionTitle>
          <View style={styles.languageCard}>
            {LANGUAGES.map((language, index) => {
              const selected = learningLangs.includes(language.code);
              const count = perLanguage[language.code] ?? 0;
              const langXp = scoreboard[language.code] ?? 0;
              const info = langRankInfo(count);
              return (
                <Pressable
                  key={language.code}
                  onPress={() => handleToggleLang(language.code)}
                  style={[styles.languageRow, index > 0 && styles.languageRowBorder]}>
                  <Text style={styles.languageFlag}>{language.flag}</Text>
                  <View style={styles.languageBody}>
                    <View style={styles.languageTop}>
                      <Text style={styles.languageName}>
                        {language.name} ({language.native})
                      </Text>
                      <View
                        style={[
                          styles.activeBadge,
                          selected && {
                            backgroundColor: `${language.tint}22`,
                            borderColor: language.tint,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.activeBadgeText,
                            selected && { color: language.tint },
                          ]}>
                          {selected ? 'ACTIVE' : 'OFF'}
                        </Text>
                      </View>
                    </View>
                    <XPBar
                      value={info.progress * 100}
                      max={100}
                      tint={language.tint}
                      height={5}
                      style={styles.languageBar}
                    />
                    <Text style={styles.languageHint}>
                      {info.rank.emoji} {info.rank.name} · {count} words · {langXp} Pronunciation XP
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.languageHelperNote}>
            Select between 1 and 5 languages. Every photo scan and pronunciation test dynamically
            adapts to your active selection.
          </Text>
        </View>

        {/* Daily Photo Crowns Vault */}
        <View style={styles.section}>
          <SectionTitle
            right={
              <Chip
                label={`${crowns.length} earned`}
                color={colors.amber}
                background={colors.amberSoft}
              />
            }>
            Word of the Day Crowns
          </SectionTitle>

          {crowns.length === 0 ? (
            <View style={styles.emptyCollection}>
              <Text style={styles.emptyEmoji}>👑</Text>
              <Text style={styles.emptyTitle}>Earn Your First Daily Crown</Text>
              <Text style={styles.emptyText}>
                Photograph today’s Word of the Day on the Camera screen to unlock a Bronze Crown,
                save it for Silver, and pass the voice test for Gold!
              </Text>
              <GhostButton
                label="Open Camera Quest"
                icon="camera"
                onPress={() => router.push('/(tabs)')}
                style={styles.emptyButton}
              />
            </View>
          ) : (
            <View style={styles.collection}>
              {crowns.slice(0, 8).map((crown) => (
                <View key={`${crown.day}-${crown.object}`} style={styles.crownChip}>
                  <Text style={styles.wordEmoji}>👑</Text>
                  <View>
                    <Text style={styles.wordText}>
                      {crown.object} ({crown.tier.toUpperCase()})
                    </Text>
                    <Text style={styles.crownDate}>{crown.day}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Badges Grid */}
        <View style={styles.section}>
          <SectionTitle
            right={
              <Text style={styles.badgeCount}>
                {unlockedCount}/{BADGES.length}
              </Text>
            }>
            Achievement Badges
          </SectionTitle>
          <View style={styles.badges}>
            {BADGES.map((badge) => (
              <View key={badge.id} style={styles.badgeCell}>
                <BadgeTile badge={badge} unlocked={Boolean(badges[badge.id])} />
              </View>
            ))}
          </View>
        </View>

        {/* Rank Progression Path */}
        <View style={styles.section}>
          <SectionTitle>Polyglot Rank Path</SectionTitle>
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
                      <View
                        style={[
                          styles.pathLine,
                          reached && { backgroundColor: `${rank.color}66` },
                        ]}
                      />
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
          label="Settings, Vision AI & Voice Diagnostics"
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
    marginBottom: spacing.md,
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
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  statLabel: {
    color: colors.textDim,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  section: {
    marginTop: spacing.xl,
  },
  milestoneList: {
    gap: spacing.sm,
  },
  milestoneCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  milestoneTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  milestoneEmoji: {
    fontSize: 28,
  },
  milestoneTextWrap: {
    flex: 1,
  },
  milestoneTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  milestoneTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  milestoneXp: {
    color: colors.amber,
    fontSize: 11,
    fontWeight: '900',
  },
  milestoneSub: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  milestoneFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  milestoneProgressText: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '700',
  },
  milestoneTierTag: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  simRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  simLabel: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '700',
  },
  simBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  simBtnActive: {
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
  },
  simBtnText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  simBtnTextActive: {
    color: colors.amber,
    fontWeight: '800',
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
  crownChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: 'rgba(255,196,107,0.35)',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  wordEmoji: {
    fontSize: 18,
  },
  wordText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  crownDate: {
    color: colors.textDim,
    fontSize: 9,
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
    fontSize: 22,
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
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeBadgeText: {
    color: colors.textDim,
    fontSize: 9,
    fontWeight: '800',
  },
  languageBar: {
    marginBottom: 5,
  },
  languageHint: {
    color: colors.textDim,
    fontSize: 10,
  },
  languageHelperNote: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: spacing.sm,
    lineHeight: 16,
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
