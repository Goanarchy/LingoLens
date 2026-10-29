import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LANG_BY_CODE } from '@/lib/languages';
import type { Translation } from '@/lib/types';
import { colors, radius, spacing } from '@/theme';

export function WordCard({
  translation,
  onSpeak,
}: {
  translation: Translation;
  onSpeak: () => void;
}) {
  const meta = LANG_BY_CODE[translation.code];
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => setActive(false), 900);
    return () => clearTimeout(timer);
  }, [active]);

  function handleSpeak() {
    setActive(true);
    onSpeak();
  }

  return (
    <View style={[styles.card, active && { borderColor: meta.tint }]}>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.flag}>{meta.flag}</Text>
          <Text style={styles.language}>{meta.name.toUpperCase()}</Text>
          {translation.article ? (
            <Text style={[styles.article, { color: meta.tint }]}>{translation.article}</Text>
          ) : null}
        </View>

        <Text style={styles.word} numberOfLines={1} adjustsFontSizeToFit>
          {translation.word}
        </Text>

        <View style={styles.phoneticRow}>
          <Ionicons name="mic-outline" size={12} color={colors.textDim} />
          <Text style={styles.phonetic}>/{translation.phonetic}/</Text>
        </View>

        {translation.example ? (
          <Text style={styles.example} numberOfLines={2}>
            {translation.example}
          </Text>
        ) : null}
      </View>

      <Pressable
        onPress={handleSpeak}
        accessibilityLabel={`Escuchar ${translation.word}`}
        style={({ pressed }) => [
          styles.speaker,
          {
            backgroundColor: active ? meta.tint : `${meta.tint}22`,
            borderColor: `${meta.tint}55`,
            opacity: pressed ? 0.7 : 1,
          },
        ]}>
        <Ionicons
          name={active ? 'volume-high' : 'volume-medium'}
          size={22}
          color={active ? colors.accentInk : meta.tint}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  flag: {
    fontSize: 14,
  },
  language: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  article: {
    fontSize: 11,
    fontWeight: '600',
  },
  word: {
    color: colors.text,
    fontSize: 27,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  phoneticRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  phonetic: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  example: {
    color: colors.textDim,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8,
    fontStyle: 'italic',
  },
  speaker: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
