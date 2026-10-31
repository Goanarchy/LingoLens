import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { KamuGuideBanner } from '@/components/KamuBubble';
import { PostCard } from '@/components/PostCard';
import { Screen } from '@/components/Screen';
import { Chip } from '@/components/ui';
import { MERIT_RIVALS, type MeritRival } from '@/data/seed';
import { rankForXp } from '@/lib/gamification';
import { useAppStore } from '@/store/useAppStore';
import { colors, radius, spacing } from '@/theme';

type FeedFilter = 'all' | 'crowns' | 'streaks';

type LeaderboardEntry = MeritRival & { isUser: boolean };

export default function FeedScreen() {
  const posts = useAppStore((state) => state.posts);
  const toggleLike = useAppStore((state) => state.toggleLike);
  const toggleReaction = useAppStore((state) => state.toggleReaction);
  const displayName = useAppStore((state) => state.displayName);
  const xp = useAppStore((state) => state.xp);
  const stats = useAppStore((state) => state.stats);
  const crowns = useAppStore((state) => state.crowns);

  const [filter, setFilter] = useState<FeedFilter>('all');

  const leaderboard = useMemo<LeaderboardEntry[]>(() => {
    const userRank = rankForXp(xp).rank;
    const you: LeaderboardEntry = {
      id: 'you',
      name: `${displayName} (You)`,
      initials: displayName.slice(0, 2).toUpperCase() || 'EX',
      color: colors.accent,
      photoStreak: stats.photoStreak,
      crowns: crowns.length,
      xp,
      rankName: userRank.name,
      rankEmoji: userRank.emoji,
      specialty:
        stats.photoStreak >= 21
          ? '👑 3-Week Dynasty'
          : stats.photoStreak >= 14
            ? '🥈 2-Week Prism'
            : stats.photoStreak >= 7
              ? '🥉 1-Week Lens'
              : 'Rising Photographer',
      isUser: true,
    };

    const combined: LeaderboardEntry[] = [
      ...MERIT_RIVALS.map((rival) => ({ ...rival, isUser: false })),
      you,
    ];

    return combined.sort((a, b) => {
      if (b.photoStreak !== a.photoStreak) return b.photoStreak - a.photoStreak;
      if (b.crowns !== a.crowns) return b.crowns - a.crowns;
      return b.xp - a.xp;
    });
  }, [displayName, xp, stats.photoStreak, crowns.length]);

  const filteredPosts = useMemo(() => {
    if (filter === 'crowns') {
      return posts.filter((post) => Boolean(post.dailyCatch));
    }
    if (filter === 'streaks') {
      return posts.filter((post) => (post.authorStreak ?? 0) >= 7);
    }
    return posts;
  }, [posts, filter]);

  return (
    <Screen>
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Merit Hub</Text>
                <Text style={styles.subtitle}>
                  Celebrate daily photo streaks, Word of the Day crowns & polyglot ranks
                </Text>
              </View>
              <Pressable
                onPress={() => router.push('/(tabs)')}
                style={({ pressed }) => [styles.scanButton, { opacity: pressed ? 0.8 : 1 }]}>
                <Ionicons name="camera" size={16} color={colors.accentInk} />
                <Text style={styles.scanLabel}>Snap Quest</Text>
              </Pressable>
            </View>

            <View style={styles.guideWrap}>
              <KamuGuideBanner screen="feed" />
            </View>

            {/* Merit Leaderboard Card */}
            <View style={styles.podiumCard}>
              <View style={styles.podiumHeader}>
                <View>
                  <Text style={styles.podiumTitle}>🏆 MERIT & STREAK HALL OF FAME</Text>
                  <Text style={styles.podiumSub}>
                    Ranked by consecutive daily photo streaks & Word of the Day crowns
                  </Text>
                </View>
                <Chip label="Season Live" color={colors.amber} background={colors.amberSoft} />
              </View>

              {leaderboard.map((entry, idx) => (
                <View
                  key={entry.id}
                  style={[
                    styles.leaderRow,
                    entry.isUser && styles.leaderRowUser,
                    idx > 0 && styles.leaderRowBorder,
                  ]}>
                  <Text
                    style={[
                      styles.leaderRankNum,
                      idx === 0 && { color: colors.amber },
                      idx === 1 && { color: colors.accent },
                      idx === 2 && { color: colors.pink },
                    ]}>
                    #{idx + 1}
                  </Text>
                  <View style={[styles.leaderAvatar, { backgroundColor: entry.color }]}>
                    <Text style={styles.leaderAvatarText}>{entry.initials}</Text>
                  </View>
                  <View style={styles.leaderBody}>
                    <View style={styles.leaderNameRow}>
                      <Text
                        style={[
                          styles.leaderName,
                          entry.isUser && { color: colors.accent },
                        ]}
                        numberOfLines={1}>
                        {entry.name}
                      </Text>
                      <Text style={styles.leaderRankPill}>
                        {entry.rankEmoji} {entry.rankName}
                      </Text>
                    </View>
                    <Text style={styles.leaderHighlight}>{entry.specialty}</Text>
                  </View>
                  <View style={styles.leaderMetrics}>
                    <Text style={styles.leaderStreak}>🔥 {entry.photoStreak}d</Text>
                    <Text style={styles.leaderCrowns}>
                      👑 {entry.crowns} · {entry.xp} XP
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Feed Filter Pills */}
            <View style={styles.filterRow}>
              <Pressable
                onPress={() => setFilter('all')}
                style={[styles.filterPill, filter === 'all' && styles.filterPillActive]}>
                <Text
                  style={[
                    styles.filterPillText,
                    filter === 'all' && styles.filterPillTextActive,
                  ]}>
                  All Discoveries ({posts.length})
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setFilter('crowns')}
                style={[styles.filterPill, filter === 'crowns' && styles.filterPillActive]}>
                <Text
                  style={[
                    styles.filterPillText,
                    filter === 'crowns' && styles.filterPillTextActive,
                  ]}>
                  👑 Crown Catches
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setFilter('streaks')}
                style={[styles.filterPill, filter === 'streaks' && styles.filterPillActive]}>
                <Text
                  style={[
                    styles.filterPillText,
                    filter === 'streaks' && styles.filterPillTextActive,
                  ]}>
                  🔥 7d+ Streaks
                </Text>
              </Pressable>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={() => toggleLike(item.id)}
            onReact={(reaction) => toggleReaction(item.id, reaction)}
          />
        )}
        ListFooterComponent={
          <Text style={styles.footer}>
            Snap today’s Word of the Day to climb the Merit Podium ✨
          </Text>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.sm,
  },
  header: {
    marginBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    marginTop: 4,
  },
  scanLabel: {
    color: colors.accentInk,
    fontSize: 12,
    fontWeight: '800',
  },
  guideWrap: {
    marginTop: spacing.md,
  },
  podiumCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,196,107,0.35)',
    padding: spacing.md,
    marginTop: spacing.md,
  },
  podiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  podiumTitle: {
    color: colors.amber,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.9,
  },
  podiumSub: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: radius.md,
  },
  leaderRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  leaderRowUser: {
    backgroundColor: 'rgba(94,234,212,0.08)',
  },
  leaderRankNum: {
    width: 24,
    color: colors.textDim,
    fontSize: 12,
    fontWeight: '900',
  },
  leaderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderAvatarText: {
    color: colors.accentInk,
    fontSize: 11,
    fontWeight: '900',
  },
  leaderBody: {
    flex: 1,
  },
  leaderNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  leaderName: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
    flexShrink: 1,
  },
  leaderRankPill: {
    color: colors.violet,
    fontSize: 10,
    fontWeight: '700',
  },
  leaderHighlight: {
    color: colors.textDim,
    fontSize: 10,
    marginTop: 1,
  },
  leaderMetrics: {
    alignItems: 'flex-end',
  },
  leaderStreak: {
    color: colors.amber,
    fontSize: 12,
    fontWeight: '900',
  },
  leaderCrowns: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    marginTop: 1,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: spacing.lg,
  },
  filterPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  filterPillActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  filterPillText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  filterPillTextActive: {
    color: colors.accent,
    fontWeight: '800',
  },
  footer: {
    color: colors.textDim,
    fontSize: 11,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
