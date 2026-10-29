import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { BadgeDef } from '@/lib/gamification';
import { colors, radius, spacing } from '@/theme';

const TIER_COLORS: Record<BadgeDef['tier'], string> = {
  bronze: '#E0A66B',
  silver: '#C7D2E1',
  gold: '#FFC46B',
  legend: '#FFD700',
};

export function BadgeTile({ badge, unlocked }: { badge: BadgeDef; unlocked: boolean }) {
  const tint = TIER_COLORS[badge.tier];
  return (
    <View style={[styles.tile, unlocked ? { borderColor: `${tint}55` } : { opacity: 0.55 }]}>
      <View style={[styles.emojiWrap, { backgroundColor: unlocked ? `${tint}1F` : 'rgba(255,255,255,0.04)' }]}>
        <Text style={[styles.emoji, !unlocked && { opacity: 0.4 }]}>{badge.emoji}</Text>
        {!unlocked ? (
          <View style={styles.lock}>
            <Ionicons name="lock-closed" size={11} color={colors.textDim} />
          </View>
        ) : null}
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {badge.name}
      </Text>
      <Text style={styles.description} numberOfLines={2}>
        {badge.description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  emojiWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emoji: {
    fontSize: 21,
  },
  lock: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  description: {
    color: colors.textDim,
    fontSize: 10,
    lineHeight: 14,
  },
});
