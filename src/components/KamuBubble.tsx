import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

/**
 * Burbuja de diálogo de Kamu. La cola apunta hacia la mascota.
 */
export function KamuBubble({
  text,
  tail = 'left',
  tone = 'dark',
  style,
}: {
  text: string;
  tail?: 'left' | 'right' | 'none';
  tone?: 'dark' | 'accent';
  style?: object;
}) {
  const isAccent = tone === 'accent';
  return (
    <View style={[styles.wrap, style]}>
      <View style={[styles.bubble, isAccent && styles.bubbleAccent]}>
        <Text style={[styles.text, isAccent && styles.textAccent]} numberOfLines={4}>
          {text}
        </Text>
      </View>
      {tail !== 'none' ? (
        <View
          style={[
            styles.tail,
            tail === 'right' ? styles.tailRight : styles.tailLeft,
            isAccent && styles.tailAccent,
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
    maxWidth: 260,
  },
  bubble: {
    backgroundColor: '#0C1524',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  bubbleAccent: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  text: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  textAccent: {
    color: colors.accentInk,
    fontWeight: '700',
  },
  tail: {
    position: 'absolute',
    bottom: -5,
    width: 12,
    height: 12,
    backgroundColor: '#0C1524',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.borderStrong,
    transform: [{ rotate: '45deg' }],
  },
  tailLeft: {
    left: 22,
  },
  tailRight: {
    right: 22,
  },
  tailAccent: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
});
