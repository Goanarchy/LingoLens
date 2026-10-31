import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Kamu } from '@/components/Kamu';
import { KamuBubble } from '@/components/KamuBubble';
import { Screen } from '@/components/Screen';
import { Chip, GhostButton, IconButton, PrimaryButton } from '@/components/ui';
import { KAMU_EMPTY_LINES, KAMU_REVIEW_LINES, pickLine } from '@/lib/kamu';
import { LANGUAGES, type LangCode } from '@/lib/languages';
import { buildSession, type DueWord } from '@/lib/srs';
import { speakWord } from '@/lib/tts';
import type { ReviewGrade } from '@/lib/types';
import { useAppStore } from '@/store/useAppStore';
import { colors, radius, spacing } from '@/theme';

const SESSION_SIZE = 10;

export default function ReviewScreen() {
  const gradeWord = useAppStore((state) => state.gradeWord);
  const countAudio = useAppStore((state) => state.countAudio);
  const learningLangs = useAppStore((state) => state.learningLangs);

  const [session, setSession] = useState<DueWord[]>(() => {
    const state = useAppStore.getState();
    return buildSession(state.learned, state.reviews, SESSION_SIZE);
  });
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [xp, setXp] = useState(0);
  const [graded, setGraded] = useState(0);
  const [againCount, setAgainCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = session[index];

  function restart() {
    const state = useAppStore.getState();
    const next = buildSession(state.learned, state.reviews, SESSION_SIZE);
    if (next.length === 0) {
      router.replace('/(tabs)/library');
      return;
    }
    setSession(next);
    setIndex(0);
    setRevealed(false);
    setXp(0);
    setGraded(0);
    setAgainCount(0);
    setFinished(false);
  }

  function handleSpeak(text: string, code: LangCode) {
    countAudio();
    speakWord(text, code).catch(() => undefined);
  }

  function handleGrade(grade: ReviewGrade) {
    if (!current) return;

    const outcome = gradeWord(current.word.id, grade);
    if (Platform.OS !== 'web') {
      if (grade === 'again') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
      }
    }

    setXp((value) => value + outcome.xpGained);
    setGraded((value) => value + 1);
    if (grade === 'again') setAgainCount((value) => value + 1);

    if (index + 1 >= session.length) {
      setFinished(true);
    } else {
      setIndex((value) => value + 1);
      setRevealed(false);
    }
  }

  function handleReveal() {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(() => undefined);
    }
    setRevealed(true);
  }

  if (session.length === 0) {
    return (
      <Screen>
        <View style={styles.header}>
          <IconButton
            icon="close"
            size={38}
            onPress={() => router.back()}
            accessibilityLabel="Close review"
          />
          <Text style={styles.headerTitle}>Spaced Repetition Review</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.empty}>
          <Kamu size={150} mood="sleepy" color={colors.violet} />
          <Text style={styles.emptyTitle}>Nothing due right now</Text>
          <Text style={styles.emptyText}>{pickLine(KAMU_EMPTY_LINES, 0)}</Text>
          <PrimaryButton
            label="Open Camera"
            icon="camera"
            onPress={() => router.replace('/(tabs)')}
            style={styles.emptyButton}
          />
          <GhostButton label="Back" onPress={() => router.back()} style={styles.emptyGhost} />
        </View>
      </Screen>
    );
  }

  if (finished) {
    const accuracy = graded === 0 ? 0 : Math.round(((graded - againCount) / graded) * 100);
    return (
      <Screen>
        <View style={styles.header}>
          <IconButton
            icon="close"
            size={38}
            onPress={() => router.back()}
            accessibilityLabel="Close review"
          />
          <Text style={styles.headerTitle}>Session Complete</Text>
          <View style={styles.headerSpacer} />
        </View>
        <ScrollView contentContainerStyle={styles.doneContent} showsVerticalScrollIndicator={false}>
          <Kamu size={168} mood="excited" crowned color={colors.accent} />
          <Text style={styles.doneTitle}>Review Session Complete!</Text>
          <Text style={styles.doneText}>
            You reviewed {graded} {graded === 1 ? 'card' : 'cards'}. Kamu’s prism lens is glowing
            with pride.
          </Text>

          <View style={styles.doneStats}>
            <View style={styles.doneStat}>
              <Ionicons name="layers" size={16} color={colors.violet} />
              <Text style={styles.doneValue}>{graded}</Text>
              <Text style={styles.doneLabel}>Cards</Text>
            </View>
            <View style={styles.doneStat}>
              <Ionicons name="flash" size={16} color={colors.accent} />
              <Text style={styles.doneValue}>+{xp}</Text>
              <Text style={styles.doneLabel}>XP</Text>
            </View>
            <View style={styles.doneStat}>
              <Ionicons name="checkmark-circle" size={16} color={colors.amber} />
              <Text style={styles.doneValue}>{accuracy}%</Text>
              <Text style={styles.doneLabel}>Accuracy</Text>
            </View>
          </View>

          <PrimaryButton
            label="Review Another Batch"
            icon="refresh"
            onPress={restart}
            style={styles.doneButton}
          />
          <GhostButton
            label="Return to Library"
            icon="albums-outline"
            onPress={() => router.replace('/(tabs)/library')}
            style={styles.doneGhost}
          />
        </ScrollView>
      </Screen>
    );
  }

  const progress = session.length === 0 ? 0 : (index / session.length) * 100;
  const activeFiltered = LANGUAGES.filter(
    (language) =>
      learningLangs.includes(language.code) && Boolean(current?.word.words[language.code]),
  );
  const available =
    activeFiltered.length > 0
      ? activeFiltered
      : LANGUAGES.filter((language) => Boolean(current?.word.words[language.code]));

  return (
    <Screen>
      <View style={styles.header}>
        <IconButton
          icon="close"
          size={38}
          onPress={() => router.back()}
          accessibilityLabel="Close review"
        />
        <Text style={styles.headerTitle}>Flashcard Review</Text>
        <Chip
          label={`${index + 1}/${session.length}`}
          color={colors.violet}
          background={colors.violetSoft}
        />
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.kamuRow}>
          <Kamu size={74} mood={revealed ? 'happy' : 'confused'} color={colors.violet} />
          <KamuBubble
            text={
              revealed
                ? 'Spot on! Tap any row to hear native articulation.'
                : pickLine(KAMU_REVIEW_LINES, index)
            }
            style={styles.bubble}
          />
        </View>

        <View style={styles.card}>
          <Chip label={current.word.category} color={colors.violet} background={colors.violetSoft} />
          <Text style={styles.emoji}>{current.word.emoji}</Text>
          <Text style={styles.object}>{current.word.object}</Text>
          <Text style={styles.prompt}>
            {revealed
              ? `Active translations (${available.length})`
              : `Recall this word in your ${available.length} active ${
                  available.length === 1 ? 'language' : 'languages'
                }`}
          </Text>

          {revealed ? (
            <View style={styles.translations}>
              {available.map((language) => {
                const value = current.word.words[language.code] ?? '';
                const roma = current.word.romanizations?.[language.code] ?? '';
                const showRoma = Boolean(roma) && roma.toLowerCase() !== value.toLowerCase();
                return (
                  <Pressable
                    key={language.code}
                    onPress={() => handleSpeak(value, language.code)}
                    accessibilityRole="button"
                    accessibilityLabel={`Listen to ${value} in ${language.name}`}
                    style={({ pressed }) => [styles.translation, { opacity: pressed ? 0.7 : 1 }]}>
                    <Text style={styles.flag}>{language.flag}</Text>
                    <Text style={styles.language}>{language.name}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.value, { color: language.tint }]} numberOfLines={1}>
                        {value}
                      </Text>
                      {showRoma ? <Text style={styles.romaText}>{roma}</Text> : null}
                    </View>
                    <Ionicons name="volume-medium" size={15} color={language.tint} />
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </View>

        {revealed ? (
          <View style={styles.grades}>
            <GradeButton
              label="Again"
              hint="+1 XP"
              icon="refresh"
              tint={colors.danger}
              onPress={() => handleGrade('again')}
            />
            <GradeButton
              label="Good"
              hint="+4 XP"
              icon="checkmark"
              tint={colors.accent}
              onPress={() => handleGrade('good')}
            />
            <GradeButton
              label="Easy"
              hint="+6 XP"
              icon="flash"
              tint={colors.violet}
              onPress={() => handleGrade('easy')}
            />
          </View>
        ) : (
          <PrimaryButton
            label="Reveal Translations"
            icon="eye-outline"
            onPress={handleReveal}
            style={styles.revealButton}
          />
        )}

        <Text style={styles.hint}>
          Spaced repetition schedules each word based on how effortlessly you recall its script and
          sound.
        </Text>
      </ScrollView>
    </Screen>
  );
}

function GradeButton({
  label,
  hint,
  icon,
  tint,
  onPress,
}: {
  label: string;
  hint: string;
  icon: 'refresh' | 'checkmark' | 'flash';
  tint: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label} ${hint}`}
      style={({ pressed }) => [
        styles.grade,
        { borderColor: `${tint}55`, backgroundColor: `${tint}1A`, opacity: pressed ? 0.7 : 1 },
      ]}>
      <Ionicons name={icon} size={18} color={tint} />
      <Text style={[styles.gradeLabel, { color: tint }]}>{label}</Text>
      <Text style={styles.gradeHint}>{hint}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  headerSpacer: {
    width: 38,
  },
  progressTrack: {
    height: 3,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.violet,
    borderRadius: 2,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  kamuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  bubble: {
    flexShrink: 1,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 58,
    marginTop: spacing.lg,
  },
  object: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.6,
    textTransform: 'capitalize',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  prompt: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  translations: {
    alignSelf: 'stretch',
    marginTop: spacing.lg,
  },
  translation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  flag: {
    fontSize: 15,
  },
  language: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    width: 72,
  },
  value: {
    fontSize: 17,
    fontWeight: '700',
  },
  romaText: {
    color: colors.textDim,
    fontSize: 11,
    marginTop: 1,
  },
  grades: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  grade: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  gradeLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
  gradeHint: {
    color: colors.textDim,
    fontSize: 9,
    fontWeight: '600',
  },
  revealButton: {
    marginTop: spacing.lg,
  },
  hint: {
    color: colors.textDim,
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  emptyButton: {
    alignSelf: 'stretch',
    marginTop: spacing.xl,
  },
  emptyGhost: {
    alignSelf: 'stretch',
    marginTop: spacing.sm,
  },
  doneContent: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  doneTitle: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: spacing.lg,
  },
  doneText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  doneStats: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignSelf: 'stretch',
    marginTop: spacing.xl,
  },
  doneStat: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  doneValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  doneLabel: {
    color: colors.textDim,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  doneButton: {
    alignSelf: 'stretch',
    marginTop: spacing.xl,
  },
  doneGhost: {
    alignSelf: 'stretch',
    marginTop: spacing.sm,
  },
});
