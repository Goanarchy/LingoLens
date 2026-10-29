import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LANG_BY_CODE } from '@/lib/languages';
import type { Post } from '@/lib/types';
import { colors, radius, spacing } from '@/theme';

export function timeAgo(iso: string): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'ahora';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} d`;
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

export function PostCard({
  post,
  onLike,
}: {
  post: Post;
  onLike: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: `${post.avatarColor}22`, borderColor: `${post.avatarColor}66` }]}>
          <Text style={[styles.initials, { color: post.avatarColor }]}>{post.initials}</Text>
        </View>
        <View style={styles.headerText}>
          <View style={styles.nameRow}>
            <Text style={styles.author}>{post.author}</Text>
            {post.mine ? <Text style={styles.youBadge}>TÚ</Text> : null}
          </View>
          <Text style={styles.meta}>
            {post.category} · {timeAgo(post.createdAt)}
          </Text>
        </View>
        <Ionicons name="ellipsis-horizontal" size={18} color={colors.textDim} />
      </View>

      {post.caption ? <Text style={styles.caption}>{post.caption}</Text> : null}

      <View style={styles.objectRow}>
        <Text style={styles.emoji}>{post.emoji}</Text>
        <Text style={styles.object}>{post.object}</Text>
      </View>

      <View style={styles.words}>
        {post.words.map((word) => (
          <View key={word.code} style={styles.wordChip}>
            <Text style={styles.wordFlag}>{LANG_BY_CODE[word.code]?.flag}</Text>
            <Text style={styles.wordText}>{word.word}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={onLike}
          hitSlop={8}
          style={({ pressed }) => [styles.like, { opacity: pressed ? 0.6 : 1 }]}>
          <Ionicons
            name={post.likedByMe ? 'heart' : 'heart-outline'}
            size={19}
            color={post.likedByMe ? colors.pink : colors.textMuted}
          />
          <Text style={[styles.likeCount, post.likedByMe && { color: colors.pink }]}>{post.likes}</Text>
        </Pressable>
        <View style={styles.footerRight}>
          <Ionicons name="globe-outline" size={14} color={colors.textDim} />
          <Text style={styles.footerText}>5 idiomas</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  meta: {
    color: colors.textDim,
    fontSize: 11,
    marginTop: 2,
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
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  like: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  likeCount: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: '600',
  },
});
