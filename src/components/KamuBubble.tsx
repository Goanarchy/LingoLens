import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { KAMU_LANG_COLORS, KAMU_LORE, KAMU_SCREEN_TIPS } from '@/lib/kamu';
import { ALL_LANGS } from '@/lib/languages';
import { colors, radius, spacing } from '@/theme';

import { Kamu, type KamuMood } from './Kamu';
import { Chip, PrimaryButton } from './ui';

/**
 * Speech bubble for Kamu. The tail points toward the mascot.
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
  style?: StyleProp<ViewStyle>;
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

const GUIDE_MOODS: KamuMood[] = ['idle', 'happy', 'smug', 'excited', 'thinking'];

/**
 * Contextual interactive guide bar that places Kamu on any screen.
 * Tapping cycles tips and chromatic scale colors; tapping the info badge opens Kamu's lore dossier.
 */
export function KamuGuideBanner({
  screen,
  customText,
  crowned = false,
  style,
}: {
  screen: keyof typeof KAMU_SCREEN_TIPS;
  customText?: string;
  crowned?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const tips = KAMU_SCREEN_TIPS[screen];
  const [tipIndex, setTipIndex] = useState(0);
  const [loreOpen, setLoreOpen] = useState(false);

  const langCode = ALL_LANGS[tipIndex % ALL_LANGS.length];
  const scaleColor = KAMU_LANG_COLORS[langCode];
  const mood = crowned ? 'crowned' : GUIDE_MOODS[tipIndex % GUIDE_MOODS.length];
  const activeText = customText || tips[tipIndex % tips.length];

  function cycleTip() {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(() => undefined);
    }
    setTipIndex((v) => v + 1);
  }

  return (
    <>
      <Pressable
        onPress={cycleTip}
        accessibilityRole="button"
        accessibilityLabel={`Kamu guide: ${activeText}. Tap for another tip.`}
        style={({ pressed }) => [
          styles.guideCard,
          { borderColor: `${scaleColor}44`, opacity: pressed ? 0.85 : 1 },
          style,
        ]}>
        <Kamu size={58} mood={mood} crowned={crowned} color={scaleColor} />
        <View style={styles.guideBody}>
          <View style={styles.guideHeaderRow}>
            <Text style={[styles.guideTitle, { color: scaleColor }]}>
              KAMU · {crowned ? 'CROWNED GUIDE' : 'OPTICAL COACH'}
            </Text>
            <Pressable
              onPress={() => setLoreOpen(true)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Read Kamu backstory"
              style={styles.lorePill}>
              <Ionicons name="sparkles" size={10} color={colors.amber} />
              <Text style={styles.lorePillText}>Lore</Text>
            </Pressable>
          </View>
          <Text style={styles.guideText} numberOfLines={3}>
            “{activeText}”
          </Text>
        </View>
      </Pressable>

      <Modal
        visible={loreOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setLoreOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Pressable
              style={styles.modalClose}
              onPress={() => setLoreOpen(false)}
              hitSlop={10}
              accessibilityLabel="Close Kamu backstory">
              <Ionicons name="close" size={20} color={colors.textMuted} />
            </Pressable>

            <Kamu size={120} mood="crowned" crowned color={colors.accent} />
            <Chip
              label={KAMU_LORE.species}
              color={colors.amber}
              background={colors.amberSoft}
              style={styles.modalChip}
            />
            <Text style={styles.modalName}>Meet {KAMU_LORE.name}</Text>
            <Text style={styles.modalOrigin}>{KAMU_LORE.origin}</Text>
            <Text style={styles.modalBio}>{KAMU_LORE.bio}</Text>

            <View style={styles.traitList}>
              {KAMU_LORE.traits.map((trait) => (
                <View key={trait} style={styles.traitRow}>
                  <Ionicons name="checkmark-circle" size={15} color={colors.accent} />
                  <Text style={styles.traitText}>{trait}</Text>
                </View>
              ))}
            </View>

            <PrimaryButton
              label="Back to Exploring"
              icon="sparkles"
              onPress={() => setLoreOpen(false)}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
    </>
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
  guideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  guideBody: {
    flex: 1,
    gap: 3,
  },
  guideHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  guideTitle: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  lorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.amberSoft,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  lorePillText: {
    color: colors.amber,
    fontSize: 9,
    fontWeight: '800',
  },
  guideText: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(3,6,12,0.84)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.xl,
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  modalChip: {
    marginTop: spacing.sm,
  },
  modalName: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
  modalOrigin: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  modalBio: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  traitList: {
    alignSelf: 'stretch',
    gap: 8,
    marginTop: spacing.lg,
    backgroundColor: colors.cardSoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  traitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  traitText: {
    flex: 1,
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  modalButton: {
    alignSelf: 'stretch',
    marginTop: spacing.lg,
  },
});
