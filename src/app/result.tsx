import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Kamu } from '@/components/Kamu';
import { KamuBubble } from '@/components/KamuBubble';
import { Screen } from '@/components/Screen';
import { ShareCardModal, type ShareWord } from '@/components/ShareCard';
import { Chip, GhostButton, IconButton, PrimaryButton } from '@/components/ui';
import { WordCard } from '@/components/WordCard';
import { getDailyWord } from '@/lib/demoCatalog';
import { BADGE_BY_ID, STREAK_MILESTONES } from '@/lib/gamification';
import {
  KAMU_DUPLICATE_LINES,
  KAMU_SAVED_LINES,
  KAMU_THINKING_LINES,
  pickLine,
} from '@/lib/kamu';
import { LANGUAGES, type LangCode } from '@/lib/languages';
import { speakWord } from '@/lib/tts';
import type { PhotoOutcome, ScanResult } from '@/lib/types';
import { filterScanTranslations, identifyObject } from '@/lib/vision';
import { useAppStore } from '@/store/useAppStore';
import { absoluteFill, colors, radius, spacing } from '@/theme';

type Summary = {
  xp: number;
  badges: string[];
  duplicate: boolean;
  published: boolean;
};

const DAILY = getDailyWord();

const STATUS_MESSAGES = [
  'Focusing Kamu’s prism lens…',
  'Analyzing scene with Vision AI…',
  'Generating native scripts & phonetics…',
  'Checking Word of the Day match…',
];

function playFeedback() {
  if (Platform.OS === 'web') return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
}

export default function ResultScreen() {
  const pending = useAppStore((state) => state.pendingScan);
  const offlineMode = useAppStore((state) => state.offlineMode);
  const learningLangs = useAppStore((state) => state.learningLangs);
  const toggleLearningLang = useAppStore((state) => state.toggleLearningLang);
  const demoTargetObject = useAppStore((state) => state.demoTargetObject);
  const registerWord = useAppStore((state) => state.registerWord);
  const recordPhotoCapture = useAppStore((state) => state.recordPhotoCapture);
  const recordPronunciationAttempt = useAppStore((state) => state.recordPronunciationAttempt);
  const pronunciationPassedKeys = useAppStore((state) => state.pronunciationPassedKeys);
  const addPost = useAppStore((state) => state.addPost);
  const countAudio = useAppStore((state) => state.countAudio);
  const stats = useAppStore((state) => state.stats);

  const [result, setResult] = useState<ScanResult | null>(null);
  const [captureOutcome, setCaptureOutcome] = useState<PhotoOutcome | null>(null);
  const [loading, setLoading] = useState(Boolean(pending));
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [forceDemo, setForceDemo] = useState(false);
  const [saved, setSaved] = useState(false);
  const [published, setPublished] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [statusIndex, setStatusIndex] = useState(0);
  const [shareVisible, setShareVisible] = useState(false);
  const [passedLangs, setPassedLangs] = useState<LangCode[]>([]);

  const scanY = useMemo(() => new Animated.Value(0), []);
  const recordedScanRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pending) return;
    let cancelled = false;
    const controller = new AbortController();

    identifyObject(pending, {
      langs: ['es', 'en', 'ja', 'hi', 'zh'],
      demo: forceDemo || offlineMode,
      preferredObject: demoTargetObject ?? undefined,
      signal: controller.signal,
    })
      .then((value) => {
        if (cancelled) return;
        setResult(value);
        const signature = `${pending.capturedAt ?? pending.uri}:${value.object}:${attempt}`;
        if (recordedScanRef.current !== signature) {
          recordedScanRef.current = signature;
          const outcome = recordPhotoCapture(value);
          setCaptureOutcome(outcome);
          if (value.dailyMatch.matched) {
            playFeedback();
          }
        }
      })
      .catch((reason: Error) => {
        if (!cancelled && reason.name !== 'AbortError') setError(reason.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [pending, offlineMode, attempt, forceDemo, demoTargetObject, recordPhotoCapture]);

  useEffect(() => {
    if (!loading) return;
    const timer = setInterval(() => {
      setStatusIndex((index) => (index + 1) % STATUS_MESSAGES.length);
    }, 1250);
    return () => clearInterval(timer);
  }, [loading]);

  useEffect(() => {
    if (!loading) return;
    scanY.setValue(0);
    const loop = Animated.loop(
      Animated.timing(scanY, {
        toValue: 1,
        duration: 1650,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => {
      loop.stop();
      scanY.stopAnimation();
    };
  }, [loading, scanY]);

  function handleSpeak(text: string, code: LangCode) {
    countAudio();
    speakWord(text, code, { slow: false }).catch(() => undefined);
  }

  function handleSpeakSlow(text: string, code: LangCode) {
    countAudio();
    speakWord(text, code, { slow: true }).catch(() => undefined);
  }

  function handleAttemptPronunciation(
    code: LangCode,
    attemptResult: {
      passed: boolean;
      score: number;
      points: number;
      attemptsLeft: number;
    },
  ) {
    recordPronunciationAttempt(
      result?.object ?? 'object',
      code,
      attemptResult.passed,
      attemptResult.points,
      Boolean(result?.dailyMatch.matched),
    );
    if (attemptResult.passed && !passedLangs.includes(code)) {
      setPassedLangs((prev) => [...prev, code]);
    }
  }

  function restartAnalysis(useDemo: boolean) {
    setLoading(true);
    setError(null);
    setResult(null);
    setSaved(false);
    setPublished(false);
    setSummary(null);
    setStatusIndex(0);
    setForceDemo(useDemo);
    setAttempt((value) => value + 1);
  }

  function handleSave() {
    if (!result || saved) return;
    playFeedback();
    const outcome = registerWord(result);
    setSaved(true);
    setSummary({
      xp: outcome.xpGained,
      badges: outcome.newBadges,
      duplicate: outcome.duplicate,
      published: false,
    });
  }

  function handlePublish() {
    if (!result || published) return;
    playFeedback();
    const outcome = addPost(result);
    setPublished(true);
    setSummary({
      xp: outcome.xpGained,
      badges: outcome.newBadges,
      duplicate: false,
      published: true,
    });
  }

  function closeSummary() {
    const wasPublished = summary?.published ?? false;
    setSummary(null);
    if (wasPublished) {
      router.replace('/(tabs)/feed');
    }
  }

  function shareFromSummary() {
    setSummary(null);
    setTimeout(() => setShareVisible(true), 260);
  }

  const displayedTranslations = useMemo(
    () => (result ? filterScanTranslations(result, learningLangs) : []),
    [result, learningLangs],
  );

  const shareWord: ShareWord | null = result
    ? {
        object: result.object,
        emoji: result.emoji,
        category: result.category,
        words: Object.fromEntries(result.translations.map((item) => [item.code, item.word])),
      }
    : null;

  if (!pending) {
    return (
      <Screen>
        <View style={styles.header}>
          <IconButton icon="chevron-back" size={38} onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Photo Analysis</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📷</Text>
          <Text style={styles.emptyTitle}>No photo captured yet</Text>
          <Text style={styles.emptyText}>
            Return to the camera and snap any object to translate it into your selected languages.
          </Text>
          <PrimaryButton
            label="Back to Camera"
            icon="camera"
            onPress={() => router.back()}
            style={styles.emptyButton}
          />
        </View>
      </Screen>
    );
  }

  const imageSource =
    pending.uri.startsWith('file:') ||
    pending.uri.startsWith('data:') ||
    pending.uri.startsWith('blob:') ||
    pending.uri.startsWith('http')
      ? pending.uri
      : `data:${pending.mimeType ?? 'image/jpeg'};base64,${pending.base64}`;
  const xpLabel = 12 + displayedTranslations.length * 2;

  return (
    <Screen>
      <View style={styles.header}>
        <IconButton icon="chevron-back" size={38} onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Discovery & Pronunciation</Text>
        <View style={styles.headerRight}>
          <Chip
            label={`🔥 ${stats.photoStreak}d`}
            color={colors.amber}
            background={colors.amberSoft}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Captured Photo Card */}
        <View style={styles.imageCard}>
          <Image
            source={{ uri: imageSource }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
          />
          <View style={styles.imageShade} />

          {loading ? (
            <View style={styles.scanLayer}>
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [
                      {
                        translateY: scanY.interpolate({
                          inputRange: [0, 1],
                          outputRange: [12, 195],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <View style={styles.kamuScan}>
                <Kamu size={90} mood="confused" pointing="up" color={colors.pink} />
                <KamuBubble
                  text={pickLine(KAMU_THINKING_LINES, statusIndex)}
                  style={styles.kamuBubble}
                />
              </View>
              <View style={styles.scanStatus}>
                <ActivityIndicator size="small" color={colors.accent} />
                <Text style={styles.scanText}>{STATUS_MESSAGES[statusIndex]}</Text>
              </View>
            </View>
          ) : null}

          {error ? (
            <View style={styles.scanLayer}>
              <Kamu size={84} mood="confused" pointing="right" color={colors.amber} />
              <Text style={styles.errorTitle}>Could not analyze the photo</Text>
            </View>
          ) : null}

          <View style={styles.imageTop}>
            <Chip
              label={
                !result
                  ? 'Analyzing'
                  : result.source === 'ai'
                    ? 'Vision AI'
                    : 'Smart Catalog'
              }
              color={colors.accentInk}
              background={colors.accent}
            />
            {result ? (
              <Chip
                label={`${Math.round(result.confidence * 100)}% confidence`}
                color={colors.text}
                background="rgba(0,0,0,0.52)"
              />
            ) : null}
          </View>
        </View>

        {result?.notice ? (
          <View style={styles.noticeCard}>
            <Ionicons name="sparkles-outline" size={16} color={colors.amber} />
            <View style={styles.noticeBody}>
              <Text style={styles.noticeText}>{result.notice}</Text>
              <Pressable
                onPress={() => restartAnalysis(false)}
                style={({ pressed }) => [styles.noticeRetry, { opacity: pressed ? 0.6 : 1 }]}>
                <Ionicons name="refresh" size={12} color={colors.amber} />
                <Text style={styles.noticeRetryText}>Retry Cloud Vision AI</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorMessage}>{error}</Text>
            <View style={styles.errorActions}>
              <PrimaryButton
                label="Retry AI"
                icon="refresh"
                onPress={() => restartAnalysis(false)}
                style={styles.flexButton}
              />
              <GhostButton
                label="Use Smart Catalog"
                icon="sparkles"
                onPress={() => restartAnalysis(true)}
                style={styles.flexButton}
              />
            </View>
            <Text style={styles.errorHint}>
              Cloud Vision AI did not respond. You can switch to the built-in 5-language catalog for
              instant offline results and native pronunciation.
            </Text>
          </View>
        ) : null}

        {result ? (
          <>
            {/* Word of the Day Match & Crown Banner */}
            <View
              style={[
                styles.crownBanner,
                result.dailyMatch.matched ? styles.crownBannerMatched : styles.crownBannerMiss,
              ]}>
              <View style={styles.crownBannerHeader}>
                <Text style={styles.crownBannerIcon}>
                  {result.dailyMatch.matched ? '👑' : '🎯'}
                </Text>
                <View style={styles.crownBannerTextWrap}>
                  <Text
                    style={[
                      styles.crownBannerTitle,
                      result.dailyMatch.matched && { color: colors.amber },
                    ]}>
                    {result.dailyMatch.matched
                      ? 'WORD OF THE DAY MATCH! (+25 BONUS XP · CROWN UNLOCKED)'
                      : `DAILY QUEST TARGET: ${DAILY.emoji} ${DAILY.object.toUpperCase()}`}
                  </Text>
                  <Text style={styles.crownBannerSub}>{result.dailyMatch.reason}</Text>
                </View>
              </View>
              {captureOutcome?.newTrophies && captureOutcome.newTrophies.length > 0 ? (
                <View style={styles.milestoneUnlockBox}>
                  {captureOutcome.newTrophies.map((mId) => {
                    const m = STREAK_MILESTONES.find((item) => item.id === mId);
                    if (!m) return null;
                    return (
                      <Text key={mId} style={styles.milestoneUnlockText}>
                        {m.emoji} Unlocked {m.name} (+{m.xpBonus} XP)!
                      </Text>
                    );
                  })}
                </View>
              ) : null}
            </View>

            {/* Kamu's Contextual Photo-Specific Witty Quip */}
            <View style={styles.kamuQuipCard}>
              <Kamu
                size={68}
                mood={result.dailyMatch.matched ? 'crowned' : 'excited'}
                crowned={result.dailyMatch.matched}
                color={result.dailyMatch.matched ? colors.amber : colors.accent}
              />
              <View style={styles.kamuQuipBody}>
                <View style={styles.kamuQuipHeader}>
                  <Text style={styles.kamuQuipTag}>KAMU’S PHOTO CRITIQUE</Text>
                  {captureOutcome && captureOutcome.xpGained > 0 ? (
                    <Text style={styles.kamuQuipXp}>+{captureOutcome.xpGained} Photo XP</Text>
                  ) : null}
                </View>
                <Text style={styles.kamuQuipText}>“{result.kamuQuip}”</Text>
              </View>
            </View>

            {/* Object Header */}
            <View style={styles.titleRow}>
              <View style={styles.titleText}>
                <Text style={styles.object}>{result.object}</Text>
                <View style={styles.titleMeta}>
                  <Chip label={result.category} color={colors.violet} background={colors.violetSoft} />
                  <Text style={styles.learnHint}>
                    Tap 🔊 for normal speed or 🐢 for slow articulation
                  </Text>
                </View>
              </View>
              <Text style={styles.objectEmoji}>{result.emoji}</Text>
            </View>

            {/* Dynamic Language Filter (1 to 5 simultaneous cards) */}
            <View style={styles.langSelectorCard}>
              <View style={styles.langSelectorTop}>
                <Text style={styles.langSelectorTitle}>
                  DISPLAYED LANGUAGES ({displayedTranslations.length} OF 5)
                </Text>
                <Text style={styles.langSelectorSub}>
                  {passedLangs.length > 0
                    ? `🎤 ${passedLangs.length}/${displayedTranslations.length} pronounced`
                    : 'Tap flags to add/remove cards'}
                </Text>
              </View>
              <View style={styles.langPillsRow}>
                {LANGUAGES.map((lang) => {
                  const active = learningLangs.includes(lang.code);
                  const passed = passedLangs.includes(lang.code);
                  return (
                    <Pressable
                      key={lang.code}
                      onPress={() => toggleLearningLang(lang.code)}
                      style={[
                        styles.langTogglePill,
                        active && {
                          borderColor: lang.tint,
                          backgroundColor: `${lang.tint}22`,
                        },
                      ]}>
                      <Text style={styles.langToggleFlag}>{lang.flag}</Text>
                      <Text
                        style={[
                          styles.langToggleText,
                          active && { color: lang.tint, fontWeight: '800' },
                        ]}>
                        {lang.name}
                      </Text>
                      {passed ? <Ionicons name="checkmark-circle" size={12} color={colors.accent} /> : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Multilingual Word Cards + Duolingo Pronunciation Coach */}
            <View style={styles.words}>
              {displayedTranslations.map((translation) => {
                const key = `${result.object.trim().toLowerCase()}:${translation.code}`;
                const alreadyPassed =
                  Boolean(pronunciationPassedKeys[key]) ||
                  passedLangs.includes(translation.code);
                return (
                  <WordCard
                    key={translation.code}
                    translation={translation}
                    alreadyPassed={alreadyPassed}
                    onSpeak={() => handleSpeak(translation.word, translation.code)}
                    onSpeakSlow={() => handleSpeakSlow(translation.word, translation.code)}
                    onAttemptPronunciation={(attemptOutcome) =>
                      handleAttemptPronunciation(translation.code, attemptOutcome)
                    }
                  />
                );
              })}
            </View>

            <PrimaryButton
              label={
                saved
                  ? 'Saved to Study Library'
                  : `Save Word (${displayedTranslations.length} ${
                      displayedTranslations.length === 1 ? 'lang' : 'langs'
                    }) · +${xpLabel} XP`
              }
              icon={saved ? 'checkmark-circle' : 'bookmark'}
              onPress={handleSave}
              disabled={saved}
              style={styles.saveButton}
            />
            <GhostButton
              label={published ? 'Published to Merit Hub' : 'Share Discovery to Merit Hub · +10 XP'}
              icon={published ? 'checkmark' : 'trophy-outline'}
              onPress={handlePublish}
              disabled={published}
              style={styles.publishButton}
            />
            <GhostButton
              label="Export Collectible Card"
              icon="image-outline"
              onPress={() => setShareVisible(true)}
              style={styles.shareCardButton}
            />
          </>
        ) : null}
      </ScrollView>

      {/* Reward Summary Modal */}
      <Modal visible={Boolean(summary)} transparent animationType="fade" onRequestClose={closeSummary}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Pressable style={styles.modalClose} onPress={closeSummary} hitSlop={10}>
              <Ionicons name="close" size={18} color={colors.textMuted} />
            </Pressable>

            <View style={styles.modalIcon}>
              <Kamu
                size={88}
                mood={
                  summary?.duplicate
                    ? 'smug'
                    : result?.dailyMatch.matched
                      ? 'crowned'
                      : 'excited'
                }
                crowned={Boolean(result?.dailyMatch.matched)}
                color={summary?.duplicate ? colors.amber : colors.accent}
              />
            </View>

            <Text style={styles.modalTitle}>
              {summary?.duplicate
                ? 'Already in your Library'
                : summary?.published
                  ? 'Posted to Merit Hub!'
                  : 'Added to your Vocabulary!'}
            </Text>
            <Text style={styles.modalQuote}>
              “{pickLine(summary?.duplicate ? KAMU_DUPLICATE_LINES : KAMU_SAVED_LINES, summary?.xp ?? 0)}”
            </Text>
            <Text style={styles.modalText}>
              {summary?.duplicate
                ? 'Keep practicing pronunciation below each card to earn extra XP and upgrade your Daily Crown.'
                : summary?.published
                  ? 'Your photo streak, active languages, and crown badge are now live on the community leaderboard!'
                  : `Saved across ${displayedTranslations.length} active ${
                      displayedTranslations.length === 1 ? 'language' : 'languages'
                    } for spaced-repetition review.`}
            </Text>

            {summary && summary.xp > 0 ? (
              <View style={styles.xpPill}>
                <Ionicons name="flash" size={14} color={colors.accentInk} />
                <Text style={styles.xpPillText}>+{summary.xp} XP</Text>
              </View>
            ) : null}

            {summary && summary.badges.length > 0 ? (
              <View style={styles.badgeList}>
                {summary.badges.map((id) => {
                  const badge = BADGE_BY_ID[id];
                  if (!badge) return null;
                  return (
                    <View key={id} style={styles.badgeRow}>
                      <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
                      <View style={styles.badgeTextWrap}>
                        <Text style={styles.badgeName}>Badge Unlocked: {badge.name}</Text>
                        <Text style={styles.badgeDesc}>{badge.description}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : null}

            {summary && !summary.published ? (
              <GhostButton
                label="Export Collectible Card"
                icon="image-outline"
                onPress={shareFromSummary}
                style={styles.modalShare}
              />
            ) : null}

            <PrimaryButton label="Continue" onPress={closeSummary} style={styles.modalButton} />
          </View>
        </View>
      </Modal>

      <ShareCardModal word={shareVisible ? shareWord : null} onClose={() => setShareVisible(false)} />
    </Screen>
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
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSpacer: {
    width: 38,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxl,
  },
  imageCard: {
    height: 210,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  imageShade: {
    ...absoluteFill,
    backgroundColor: 'rgba(3,6,12,0.35)',
  },
  scanLayer: {
    ...absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  kamuScan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  kamuBubble: {
    maxWidth: 185,
    flexShrink: 1,
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: colors.accent,
    opacity: 0.9,
  },
  scanStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(3,6,12,0.62)',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  scanText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '600',
  },
  errorTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  imageTop: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  crownBanner: {
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  crownBannerMatched: {
    backgroundColor: 'rgba(255,196,107,0.12)',
    borderColor: 'rgba(255,196,107,0.45)',
  },
  crownBannerMiss: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: colors.border,
  },
  crownBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  crownBannerIcon: {
    fontSize: 24,
  },
  crownBannerTextWrap: {
    flex: 1,
  },
  crownBannerTitle: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  crownBannerSub: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  milestoneUnlockBox: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,196,107,0.25)',
  },
  milestoneUnlockText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
  },
  kamuQuipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(94,234,212,0.32)',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  kamuQuipBody: {
    flex: 1,
  },
  kamuQuipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  kamuQuipTag: {
    color: colors.accent,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.9,
  },
  kamuQuipXp: {
    color: colors.amber,
    fontSize: 10,
    fontWeight: '800',
  },
  kamuQuipText: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
    fontWeight: '600',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  titleText: {
    flex: 1,
  },
  object: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.8,
    textTransform: 'capitalize',
  },
  titleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  learnHint: {
    color: colors.textDim,
    fontSize: 11,
  },
  objectEmoji: {
    fontSize: 44,
    marginLeft: spacing.md,
  },
  langSelectorCard: {
    backgroundColor: colors.cardSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  langSelectorTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  langSelectorTitle: {
    color: colors.textDim,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.9,
  },
  langSelectorSub: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '700',
  },
  langPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  langTogglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  langToggleFlag: {
    fontSize: 13,
  },
  langToggleText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  words: {
    marginTop: spacing.xs,
  },
  saveButton: {
    marginTop: spacing.sm,
  },
  publishButton: {
    marginTop: spacing.md,
  },
  shareCardButton: {
    marginTop: spacing.sm,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 52,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: spacing.sm,
  },
  emptyButton: {
    marginTop: spacing.xl,
    alignSelf: 'stretch',
  },
  errorCard: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,122,122,0.3)',
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  errorMessage: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
  },
  errorActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flexButton: {
    flex: 1,
  },
  errorHint: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.amberSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,196,107,0.3)',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  noticeBody: {
    flex: 1,
    gap: 6,
  },
  noticeText: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  noticeRetry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  noticeRetryText: {
    color: colors.amber,
    fontSize: 11,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(3,6,12,0.8)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  modalIcon: {
    width: 92,
    height: 92,
    borderRadius: 30,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  modalTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  modalQuote: {
    color: colors.amber,
    fontSize: 12,
    fontWeight: '600',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 17,
  },
  modalText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  xpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    marginTop: spacing.lg,
  },
  xpPillText: {
    color: colors.accentInk,
    fontSize: 13,
    fontWeight: '900',
  },
  badgeList: {
    alignSelf: 'stretch',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.cardSoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  badgeEmoji: {
    fontSize: 22,
  },
  badgeTextWrap: {
    flex: 1,
  },
  badgeName: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  badgeDesc: {
    color: colors.textDim,
    fontSize: 10,
    marginTop: 2,
  },
  modalButton: {
    alignSelf: 'stretch',
    marginTop: spacing.lg,
  },
  modalShare: {
    alignSelf: 'stretch',
    marginTop: spacing.lg,
  },
});
