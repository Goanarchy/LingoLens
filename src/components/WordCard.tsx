import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LANG_BY_CODE, usesNonLatinScript } from '@/lib/languages';
import {
  MAX_PRONUNCIATION_ATTEMPTS,
  buildPhoneticChoices,
  evaluateSingleAttempt,
  startPronunciationSession,
} from '@/lib/pronunciation-engine';
import type { SyllableStatus } from '@/lib/speech-recognition';
import type { Translation } from '@/lib/types';
import { colors, radius, spacing } from '@/theme';

export function WordCard({
  translation,
  onSpeak,
  onSpeakSlow,
  onAttemptPronunciation,
  alreadyPassed = false,
}: {
  translation: Translation;
  onSpeak: () => void;
  onSpeakSlow?: () => void;
  onAttemptPronunciation?: (result: {
    passed: boolean;
    score: number;
    points: number;
    attemptsLeft: number;
  }) => void;
  alreadyPassed?: boolean;
}) {
  const meta = LANG_BY_CODE[translation.code];
  const nonLatin = usesNonLatinScript(translation.code);

  const [activeAudio, setActiveAudio] = useState<'normal' | 'slow' | null>(null);
  const [coachOpen, setCoachOpen] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_PRONUNCIATION_ATTEMPTS);
  const [localPassed, setPassed] = useState(alreadyPassed);
  const passed = localPassed || alreadyPassed;
  const [skipped, setSkipped] = useState(false);
  const [holdingMic, setHoldingMic] = useState(false);
  const [micReadyForCheck, setMicReadyForCheck] = useState(false);
  const [lastHoldMs, setLastHoldMs] = useState(0);
  const [feedback, setFeedback] = useState<string>(
    'Step 1: Listen to the native voice, then hold the mic and speak clearly.',
  );
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [syllables, setSyllables] = useState<SyllableStatus[]>(() =>
    (translation.phonetic || translation.romanization || translation.word)
      .split(/[-\s]+/)
      .filter(Boolean)
      .map((syllable) => ({ syllable, matched: alreadyPassed })),
  );

  const holdStartRef = useRef<number>(0);
  const phoneticChoices = useMemo(() => buildPhoneticChoices(translation), [translation]);

  useEffect(() => {
    if (!activeAudio) return;
    const timer = setTimeout(() => setActiveAudio(null), 950);
    return () => clearTimeout(timer);
  }, [activeAudio]);

  function handleNormalSpeak() {
    setActiveAudio('normal');
    onSpeak();
  }

  function handleSlowSpeak() {
    setActiveAudio('slow');
    if (onSpeakSlow) {
      onSpeakSlow();
    } else {
      onSpeak();
    }
  }

  function onMicPressIn() {
    if (passed || attemptsLeft <= 0 || skipped) return;
    holdStartRef.current = Date.now();
    setHoldingMic(true);
    setFeedback('Listening… pronounce every syllable clearly!');
  }

  async function onMicPressOut() {
    if (!holdingMic) return;
    const elapsed = Math.max(150, Date.now() - holdStartRef.current);
    setHoldingMic(false);
    setLastHoldMs(elapsed);

    if (elapsed < 550) {
      setFeedback('Too brief! Hold the microphone button while speaking the full word.');
      return;
    }

    // Try hardware/web ASR first; if in Expo Go guided mode, unlock syllable confirmation
    const outcome = await startPronunciationSession(translation, translation.code);
    if (outcome.outcome !== 'guided-needed' && outcome.session.attempts.length > 0) {
      const attempt = outcome.session.attempts[0];
      const nextLeft = Math.max(0, attemptsLeft - 1);
      setAttemptsLeft(nextLeft);
      setSyllables(attempt.syllables);
      setLastScore(Math.round(attempt.score * 100));
      setFeedback(attempt.feedback);
      if (attempt.passed) {
        setPassed(true);
        onAttemptPronunciation?.({
          passed: true,
          score: attempt.score,
          points: outcome.session.pointsAwarded,
          attemptsLeft: nextLeft,
        });
      } else {
        onAttemptPronunciation?.({
          passed: false,
          score: attempt.score,
          points: 0,
          attemptsLeft: nextLeft,
        });
      }
      return;
    }

    setMicReadyForCheck(true);
    setFeedback(
      'Voice cadence captured! Now tap the exact phonetic pattern you just spoke to validate:',
    );
  }

  function handleSelectPhoneticChoice(choice: string) {
    if (passed || attemptsLeft <= 0 || skipped) return;
    const evalResult = evaluateSingleAttempt(translation, choice, Math.max(lastHoldMs, 1000));
    const nextLeft = Math.max(0, attemptsLeft - 1);
    setAttemptsLeft(nextLeft);
    setMicReadyForCheck(false);
    setSyllables(evalResult.syllables);
    setLastScore(Math.round(evalResult.score * 100));
    setFeedback(evalResult.feedback);

    if (evalResult.passed) {
      setPassed(true);
      onAttemptPronunciation?.({
        passed: true,
        score: evalResult.score,
        points: evalResult.points,
        attemptsLeft: nextLeft,
      });
    } else {
      onAttemptPronunciation?.({
        passed: false,
        score: evalResult.score,
        points: 0,
        attemptsLeft: nextLeft,
      });
    }
  }

  return (
    <View
      style={[
        styles.card,
        activeAudio && { borderColor: meta.tint },
        passed && { borderColor: colors.accent },
      ]}>
      <View style={styles.mainRow}>
        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.flag}>{meta.flag}</Text>
            <Text style={styles.language}>{meta.name.toUpperCase()}</Text>
            <Text style={styles.nativeBadge}>{meta.native}</Text>
            {translation.article ? (
              <View style={[styles.articlePill, { backgroundColor: `${meta.tint}22` }]}>
                <Text style={[styles.article, { color: meta.tint }]}>{translation.article}</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.word} numberOfLines={1} adjustsFontSizeToFit>
            {translation.word}
          </Text>

          {nonLatin && translation.romanization ? (
            <View style={styles.romanRow}>
              <Text style={[styles.romanLabel, { color: meta.tint }]}>
                {meta.romanizationName ?? 'Romanized'}:
              </Text>
              <Text style={styles.romanValue}>{translation.romanization}</Text>
            </View>
          ) : null}

          <View style={styles.phoneticRow}>
            <Ionicons name="musical-notes-outline" size={12} color={colors.textDim} />
            <Text style={styles.phonetic}>/{translation.phonetic}/</Text>
            {passed ? (
              <View style={styles.passedPill}>
                <Ionicons name="checkmark-circle" size={11} color={colors.accentInk} />
                <Text style={styles.passedPillText}>+15 XP PASSED</Text>
              </View>
            ) : null}
          </View>

          {translation.example ? (
            <View style={styles.exampleBox}>
              <Text style={styles.example} numberOfLines={2}>
                “{translation.example}”
              </Text>
              {translation.exampleMeaning && translation.code !== 'en' ? (
                <Text style={styles.exampleMeaning} numberOfLines={1}>
                  {translation.exampleMeaning}
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>

        <View style={styles.actionsCol}>
          <Pressable
            onPress={handleNormalSpeak}
            accessibilityRole="button"
            accessibilityLabel={`Listen to ${translation.word} in ${meta.name}`}
            style={({ pressed }) => [
              styles.speaker,
              {
                backgroundColor: activeAudio === 'normal' ? meta.tint : `${meta.tint}22`,
                borderColor: `${meta.tint}55`,
                opacity: pressed ? 0.7 : 1,
              },
            ]}>
            <Ionicons
              name={activeAudio === 'normal' ? 'volume-high' : 'volume-medium'}
              size={21}
              color={activeAudio === 'normal' ? colors.accentInk : meta.tint}
            />
          </Pressable>

          <Pressable
            onPress={handleSlowSpeak}
            accessibilityRole="button"
            accessibilityLabel={`Slow pronunciation for ${translation.word}`}
            style={({ pressed }) => [
              styles.smallAction,
              {
                backgroundColor: activeAudio === 'slow' ? colors.amber : 'rgba(255,255,255,0.05)',
                borderColor: activeAudio === 'slow' ? colors.amber : colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}>
            <Text style={styles.turtleEmoji}>🐢</Text>
          </Pressable>

          <Pressable
            onPress={() => setCoachOpen((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={`Pronunciation test for ${translation.word}`}
            style={({ pressed }) => [
              styles.smallAction,
              {
                backgroundColor: passed
                  ? colors.accent
                  : coachOpen
                    ? `${meta.tint}33`
                    : 'rgba(255,255,255,0.05)',
                borderColor: passed ? colors.accent : `${meta.tint}66`,
                opacity: pressed ? 0.7 : 1,
              },
            ]}>
            <Ionicons
              name={passed ? 'checkmark-circle' : 'mic'}
              size={17}
              color={passed ? colors.accentInk : meta.tint}
            />
          </Pressable>
        </View>
      </View>

      {coachOpen ? (
        <View style={styles.coachDrawer}>
          <View style={styles.coachTopRow}>
            <View style={styles.coachTitleRow}>
              <Ionicons name="mic-circle" size={16} color={meta.tint} />
              <Text style={styles.coachTitle}>DUOLINGO-STYLE VOICE CHECK</Text>
            </View>
            <Text style={styles.attemptsLabel}>
              {passed
                ? '✓ Completed'
                : skipped
                  ? 'Skipped (0 XP)'
                  : `${attemptsLeft}/${MAX_PRONUNCIATION_ATTEMPTS} tries left`}
            </Text>
          </View>

          <View style={styles.syllableStrip}>
            {syllables.map((item, idx) => (
              <View
                key={`${item.syllable}-${idx}`}
                style={[
                  styles.syllableChip,
                  item.matched && {
                    backgroundColor: colors.accentSoft,
                    borderColor: colors.accent,
                  },
                ]}>
                <Text
                  style={[
                    styles.syllableText,
                    item.matched && { color: colors.accent, fontWeight: '800' },
                  ]}>
                  {item.syllable}
                </Text>
              </View>
            ))}
            {lastScore !== null ? (
              <View style={styles.scoreBadge}>
                <Text
                  style={[
                    styles.scoreBadgeText,
                    { color: passed ? colors.accent : colors.amber },
                  ]}>
                  {lastScore}% match
                </Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.coachFeedback}>{feedback}</Text>

          {!passed && !skipped && attemptsLeft > 0 ? (
            <>
              <View style={styles.coachButtonRow}>
                <Pressable
                  onPressIn={onMicPressIn}
                  onPressOut={onMicPressOut}
                  accessibilityRole="button"
                  accessibilityLabel={`Hold to speak ${translation.word}`}
                  style={({ pressed }) => [
                    styles.holdMicButton,
                    {
                      backgroundColor: holdingMic ? colors.pink : meta.tint,
                      opacity: pressed ? 0.9 : 1,
                    },
                  ]}>
                  <Ionicons
                    name={holdingMic ? 'radio-button-on' : 'mic'}
                    size={18}
                    color={colors.accentInk}
                  />
                  <Text style={styles.holdMicLabel}>
                    {holdingMic ? 'Speaking… Release when done' : 'Hold to Speak Aloud'}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setSkipped(true);
                    setFeedback("No problem! Skipped for now—pronunciation points weren't awarded.");
                  }}
                  style={styles.skipButton}>
                  <Text style={styles.skipButtonText}>Can’t speak now</Text>
                </Pressable>
              </View>

              {micReadyForCheck ? (
                <View style={styles.choiceSection}>
                  <Text style={styles.choicePrompt}>
                    Confirm the syllable stress you just pronounced:
                  </Text>
                  <View style={styles.choicesRow}>
                    {phoneticChoices.map((choice) => (
                      <Pressable
                        key={choice}
                        onPress={() => handleSelectPhoneticChoice(choice)}
                        style={({ pressed }) => [
                          styles.choicePill,
                          { opacity: pressed ? 0.75 : 1 },
                        ]}>
                        <Text style={styles.choicePillText}>/{choice}/</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}
            </>
          ) : null}

          {!passed && attemptsLeft <= 0 && !skipped ? (
            <Pressable
              onPress={() => {
                setAttemptsLeft(MAX_PRONUNCIATION_ATTEMPTS);
                setLastScore(null);
                setFeedback('Fresh 3 attempts ready! Tap the turtle 🐢 first, then hold to speak.');
              }}
              style={styles.retryResetButton}>
              <Ionicons name="refresh" size={14} color={colors.amber} />
              <Text style={styles.retryResetText}>Reset 3 Attempts & Try Again</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
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
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  flag: {
    fontSize: 15,
  },
  language: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.3,
  },
  nativeBadge: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '600',
  },
  articlePill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  article: {
    fontSize: 10,
    fontWeight: '800',
  },
  word: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  romanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  romanLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  romanValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  phoneticRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 4,
  },
  phonetic: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  passedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.accent,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  passedPillText: {
    color: colors.accentInk,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  exampleBox: {
    marginTop: 8,
    gap: 2,
  },
  example: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
  },
  exampleMeaning: {
    color: colors.textDim,
    fontSize: 11,
    lineHeight: 15,
  },
  actionsCol: {
    alignItems: 'center',
    gap: 7,
  },
  speaker: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallAction: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  turtleEmoji: {
    fontSize: 15,
  },
  coachDrawer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  coachTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  coachTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  coachTitle: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  attemptsLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  syllableStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  syllableChip: {
    backgroundColor: colors.cardSoft,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.sm,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  syllableText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  scoreBadge: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  scoreBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  coachFeedback: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  coachButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 2,
  },
  holdMicButton: {
    flex: 1,
    height: 42,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
  },
  holdMicLabel: {
    color: colors.accentInk,
    fontSize: 12,
    fontWeight: '800',
  },
  skipButton: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  skipButtonText: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '700',
  },
  choiceSection: {
    marginTop: 4,
    gap: 6,
    backgroundColor: colors.cardSoft,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  choicePrompt: {
    color: colors.amber,
    fontSize: 10,
    fontWeight: '700',
  },
  choicesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  choicePill: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.pill,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  choicePillText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  retryResetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: colors.amberSoft,
  },
  retryResetText: {
    color: colors.amber,
    fontSize: 11,
    fontWeight: '800',
  },
});
