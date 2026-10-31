import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LANG_BY_CODE } from '@/lib/languages';
import type { Post, ReactionKind } from '@/lib/types';
import { colors, radius, spacing } from '@/theme';

export function timeAgo(iso: string): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

const REACTION_META: { kind: ReactionKind; emoji: string; label: string }[] = [
  { kind: 'fire', emoji: '🔥', label: 'Streak' },
  { kind: 'idea', emoji: '💡', label: 'Sharp' },
  { kind: 'crown', emoji: '👑', label: 'Royal' },
];

export function PostCard({
  post,
  onLike,
  onReact,
}: {
  post: Post;
  onLike: () => void;
  onReact?: (kind: ReactionKind) => void;
}) {
  const streakWeeks = Math.floor((post.authorStreak ?? 0) / 7);

  return (
    <View style={[styles.card, post.dailyCatch && styles.cardCrown]}>
      {post.dailyCatch ? (
        <View style={styles.dailyBanner}>
          <Text style={styles.dailyBannerText}>👑 WORD OF THE DAY CATCH</Text>
        </View>
      ) : null}

      <View style={styles.header}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: `${post.avatarColor}22`, borderColor: `${post.avatarColor}66` },
          ]}>
          <Text style={[styles.initials, { color: post.avatarColor }]}>{post.initials}</Text>
        </View>
        <View style={styles.headerText}>
          <View style={styles.nameRow}>
            <Text style={styles.author}>{post.author}</Text>
            {post.mine ? <Text style={styles.youBadge}>YOU</Text> : null}
            {post.authorRank ? <Text style={styles.rankBadge}>{post.authorRank}</Text> : null}
          </View>
          <View style={styles.meritRow}>
            <Text style={styles.meta}>
              {post.category} · {timeAgo(post.createdAt)}
            </Text>
            {post.authorStreak > 0 ? (
              <View style={styles.meritPill}>
                <Text style={styles.meritPillText}>
                  🔥 {post.authorStreak}d{streakWeeks >= 1 ? ` (${streakWeeks}W)` : ''}
                </Text>
              </View>
            ) : null}
            {post.authorCrowns > 0 ? (
              <View style={[styles.meritPill, { backgroundColor: colors.amberSoft }]}>
                <Text style={[styles.meritPillText, { color: colors.amber }]}>
                  👑 {post.authorCrowns}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {post.caption ? <Text style={styles.caption}>{post.caption}</Text> : null}

      <View style={styles.objectRow}>
        <Text style={styles.emoji}>{post.emoji}</Text>
        <Text style={styles.object}>{post.object}</Text>
      </View>

      <View style={styles.words}>
        {post.words.map((word) => {
          const meta = LANG_BY_CODE[word.code];
          if (!meta) return null;
          return (
            <View key={word.code} style={styles.wordChip}>
              <Text style={styles.wordFlag}>{meta.flag}</Text>
              <Text style={styles.wordText}>{word.word}</Text>
              {word.romanization && word.romanization !== word.word ? (
                <Text style={styles.wordRoman}>({word.romanization})</Text>
              ) : null}
            </View>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={onLike}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Like ${post.object} post`}
          style={({ pressed }) => [styles.like, { opacity: pressed ? 0.6 : 1 }]}>
          <Ionicons
            name={post.likedByMe ? 'heart' : 'heart-outline'}
            size={19}
            color={post.likedByMe ? colors.pink : colors.textMuted}
          />
          <Text style={[styles.likeCount, post.likedByMe && { color: colors.pink }]}>
            {post.likes}
          </Text>
        </Pressable>

        <View style={styles.reactions}>
          {REACTION_META.map((item) => {
            const count = post.reactions?.[item.kind] ?? 0;
            const active = (post.myReactions ?? []).includes(item.kind);
            return (
              <Pressable
                key={item.kind}
                hitSlop={6}
                onPress={() => onReact?.(item.kind)}
                style={[styles.reaction, active && styles.reactionActive]}>
                <Text style={styles.reactionEmoji}>{item.emoji}</Text>
                {count > 0 ? (
                  <Text style={[styles.reactionCount, active && { color: colors.accent }]}>
                    {count}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footerRight}>
          <Ionicons name="globe-outline" size={13} color={colors.textDim} />
          <Text style={styles.footerText}>{post.words.length} langs</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardCrown: {
    borderColor: 'rgba(255,196,107,0.4)',
  },
  dailyBanner: {
    alignSelf: 'flex-start',
    backgroundColor: colors.amberSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: spacing.sm,
  },
  dailyBannerText: {
    color: colors.amber,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.9,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  headerText: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  author: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  youBadge: {
    color: colors.accentInk,
    backgroundColor: colors.accent,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  rankBadge: {
    color: colors.violet,
    backgroundColor: colors.violetSoft,
    fontSize: 9,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  meritRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 3,
  },
  meta: {
    color: colors.textDim,
    fontSize: 11,
  },
  meritPill: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.pill,
  },
  meritPillText: {
    color: colors.text,
    fontSize: 9,
    fontWeight: '800',
  },
  caption: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.md,
  },
  objectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  emoji: {
    fontSize: 30,
  },
  object: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
    textTransform: 'capitalize',
  },
  words: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.md,
  },
  wordChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.cardSoft,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  wordFlag: {
    fontSize: 11,
  },
  wordText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  wordRoman: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  like: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  likeCount: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  reactions: {
    flexDirection: 'row',
    gap: 6,
  },
  reaction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  reactionActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  reactionEmoji: {
    fontSize: 12,
  },
  reactionCount: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '600',
  },
});
