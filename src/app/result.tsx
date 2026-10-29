import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
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

import { Screen } from '@/components/Screen';
import { WordCard } from '@/components/WordCard';
import { Kamu } from '@/components/Kamu';
import { KamuBubble } from '@/components/KamuBubble';
import { ShareCardModal, type ShareWord } from '@/components/ShareCard';
import { Chip, GhostButton, IconButton, PrimaryButton } from '@/components/ui';
import { BADGE_BY_ID } from '@/lib/gamification';
import {
  KAMU_DUPLICATE_LINES,
  KAMU_SAVED_LINES,
  KAMU_SCAN_LINES,
  pickLine,
} from '@/lib/kamu';
import { speakWord } from '@/lib/tts';
import type { ScanResult } from '@/lib/types';
import { identifyObject } from '@/lib/vision';
import { useAppStore } from '@/store/useAppStore';
import { absoluteFill, colors, radius, spacing } from '@/theme';

type Summary = {
  xp: number;
  badges: string[];
  duplicate: boolean;
  published: boolean;
};

const STATUS_MESSAGES = [
  'Detectando el objeto…',
  'Consultando la IA gratuita…',
  'Traduciendo a cinco idiomas…',
  'Preparando la pronunciación…',
];

function playFeedback() {
  if (Platform.OS === 'web') return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
}

export default function ResultScreen() {
  const pending = useAppStore((state) => state.pendingScan);
  const offlineMode = useAppStore((state) => state.offlineMode);
  const registerWord = useAppStore((state) => state.registerWord);
  const addPost = useAppStore((state) => state.addPost);
  const countAudio = useAppStore((state) => state.countAudio);

  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(Boolean(pending));
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [forceDemo, setForceDemo] = useState(false);
  const [saved, setSaved] = useState(false);
  const [published, setPublished] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [statusIndex, setStatusIndex] = useState(0);
  const [shareVisible, setShareVisible] = useState(false);

  const scanY = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    if (!pending) return;
    let cancelled = false;
    const controller = new AbortController();

    identifyObject(pending, {
      demo: forceDemo || offlineMode,
      signal: controller.signal,
    })
      .then((value) => {
        if (!cancelled) setResult(value);
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
  }, [pending, offlineMode, attempt, forceDemo]);

  useEffect(() => {
    if (!loading) return;
    const timer = setInterval(() => {
      setStatusIndex((index) => (index + 1) % STATUS_MESSAGES.length);
    }, 1300);
    return () => clearInterval(timer);
  }, [loading]);

  useEffect(() => {
    if (!loading) return;
    scanY.setValue(0);
    const loop = Animated.loop(
      Animated.timing(scanY, {
        toValue: 1,
        duration: 1700,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => {
      loop.stop();
      scanY.stopAnimation();
    };
  }, [loading, scanY]);

  function handleSpeak(text: string, code: ScanResult['translations'][number]['code']) {
    countAudio();
    speakWord(text, code).catch(() => undefined);
  }

  /**
   * Reinicia el análisis desde cero. El estado se limpia aquí (y no dentro del
   * efecto) para no disparar renders en cascada al montar la pantalla.
   */
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
      router.replace('/feed');
    }
  }

  function shareFromSummary() {
    setSummary(null);
    // El modal de resumen debe cerrarse antes de abrir la hoja de compartir.
    setTimeout(() => setShareVisible(true), 260);
  }

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
          <Text style={styles.headerTitle}>Descubrimiento</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📷</Text>
          <Text style={styles.emptyTitle}>No hay ninguna foto</Text>
          <Text style={styles.emptyText}>Vuelve a la cámara y captura un objeto para empezar.</Text>
          <PrimaryButton
            label="Ir a la cámara"
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
  const xpLabel = result ? 12 + result.translations.length * 2 : 22;

  return (
    <Screen>
      <View style={styles.header}>
        <IconButton icon="chevron-back" size={38} onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Descubrimiento</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.imageCard}>
          <Image source={{ uri: imageSource }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
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
                          outputRange: [12, 210],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <View style={styles.kamuScan}>
                <Kamu size={94} mood="confused" pointing="up" color={colors.pink} />
                <KamuBubble
                  text={pickLine(KAMU_SCAN_LINES, statusIndex)}
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
              <Text style={styles.errorTitle}>No pudimos identificar la foto</Text>
            </View>
          ) : null}

          <View style={styles.imageTop}>
            <Chip
              label={!result ? 'Analizando' : result.source === 'ai' ? 'IA gratis' : 'Catálogo local'}
              color={colors.accentInk}
              background={colors.accent}
            />
            {result ? (
              <Chip
                label={`${Math.round(result.confidence * 100)}% seguro`}
                color={colors.text}
                background="rgba(0,0,0,0.45)"
              />
            ) : null}
          </View>
        </View>

        {result?.notice ? (
          <View style={styles.noticeCard}>
            <Ionicons name="cloud-offline-outline" size={16} color={colors.amber} />
            <View style={styles.noticeBody}>
              <Text style={styles.noticeText}>{result.notice}</Text>
              <Pressable
                onPress={() => restartAnalysis(false)}
                style={({ pressed }) => [styles.noticeRetry, { opacity: pressed ? 0.6 : 1 }]}>
                <Ionicons name="refresh" size={12} color={colors.amber} />
                <Text style={styles.noticeRetryText}>Reintentar con IA</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorMessage}>{error}</Text>
            <View style={styles.errorActions}>
              <PrimaryButton
                label="Reintentar"
                icon="refresh"
                onPress={() => restartAnalysis(false)}
                style={styles.flexButton}
              />
              <GhostButton
                label="Usar demo"
                icon="sparkles"
                onPress={() => restartAnalysis(true)}
                style={styles.flexButton}
              />
            </View>
            <Text style={styles.errorHint}>
              La IA gratuita no respondió. Revisa tu conexión a internet o usa el catálogo local:
              funciona sin conexión y con audio real.
            </Text>
          </View>
        ) : null}

        {result ? (
          <>
            <View style={styles.titleRow}>
              <View style={styles.titleText}>
                <Text style={styles.object}>{result.object}</Text>
                <View style={styles.titleMeta}>
                  <Chip label={result.category} color={colors.violet} background={colors.violetSoft} />
                  <Text style={styles.learnHint}>Toca el altavoz para escuchar</Text>
                </View>
              </View>
              <Text style={styles.objectEmoji}>{result.emoji}</Text>
            </View>

            <View style={styles.words}>
              {result.translations.map((translation) => (
                <WordCard
                  key={translation.code}
                  translation={translation}
                  onSpeak={() => handleSpeak(translation.word, translation.code)}
                />
              ))}
            </View>

            <PrimaryButton
              label={saved ? 'Palabra guardada' : `Guardar palabra · +${xpLabel} XP`}
              icon={saved ? 'checkmark-circle' : 'bookmark'}
              onPress={handleSave}
              disabled={saved}
              style={styles.saveButton}
            />
            <GhostButton
              label={published ? 'Publicado en la comunidad' : 'Compartir en el feed'}
              icon={published ? 'checkmark' : 'share-outline'}
              onPress={handlePublish}
              disabled={published}
              style={styles.publishButton}
            />
            <GhostButton
              label="Compartir tarjeta"
              icon="image-outline"
              onPress={() => setShareVisible(true)}
              style={styles.shareCardButton}
            />
          </>
        ) : null}
      </ScrollView>

      <Modal visible={Boolean(summary)} transparent animationType="fade" onRequestClose={closeSummary}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Pressable style={styles.modalClose} onPress={closeSummary} hitSlop={10}>
              <Ionicons name="close" size={18} color={colors.textMuted} />
            </Pressable>

            <View style={styles.modalIcon}>
              <Kamu
                size={88}
                mood={summary?.duplicate ? 'smug' : summary?.published ? 'happy' : 'happy'}
                color={summary?.duplicate ? colors.amber : colors.accent}
              />
            </View>

            <Text style={styles.modalTitle}>
              {summary?.duplicate
                ? 'Ya tenías esta palabra'
                : summary?.published
                  ? '¡Publicado en la comunidad!'
                  : '¡Palabra guardada!'}
            </Text>
            <Text style={styles.modalQuote}>
              “{pickLine(summary?.duplicate ? KAMU_DUPLICATE_LINES : KAMU_SAVED_LINES, summary?.xp ?? 0)}”
            </Text>
            <Text style={styles.modalText}>
              {summary?.duplicate
                ? 'Puedes seguir escuchando las pronunciaciones y compartirla con la comunidad.'
                : summary?.published
                  ? 'Tu descubrimiento ya aparece en el feed. ¡Sigue así!'
                  : 'Sumaste experiencia y avanzaste en tu colección de idiomas.'}
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
                        <Text style={styles.badgeName}>Nuevo badge: {badge.name}</Text>
                        <Text style={styles.badgeDesc}>{badge.description}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : null}

            {summary && !summary.published ? (
              <GhostButton
                label="Compartir tarjeta"
                icon="image-outline"
                onPress={shareFromSummary}
                style={styles.modalShare}
              />
            ) : null}

            <PrimaryButton label="Continuar" onPress={closeSummary} style={styles.modalButton} />
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
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  headerSpacer: {
    width: 38,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  imageCard: {
    height: 230,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
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
    maxWidth: 170,
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
    backgroundColor: 'rgba(3,6,12,0.55)',
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  titleText: {
    flex: 1,
  },
  object: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.8,
    textTransform: 'capitalize',
  },
  titleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  learnHint: {
    color: colors.textDim,
    fontSize: 11,
  },
  objectEmoji: {
    fontSize: 44,
    marginLeft: spacing.md,
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
    marginBottom: spacing.lg,
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
