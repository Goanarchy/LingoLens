import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { KamuGuideBanner } from '@/components/KamuBubble';
import { Screen } from '@/components/Screen';
import { Chip, IconButton, PrimaryButton } from '@/components/ui';
import { CATALOG, getDailyWord } from '@/lib/demoCatalog';
import { prepareImage } from '@/lib/image';
import { LANGUAGES, type LangCode } from '@/lib/languages';
import { speakWord } from '@/lib/tts';
import { dayKey, useAppStore } from '@/store/useAppStore';
import { absoluteFill, colors, radius, spacing } from '@/theme';

const DAILY = getDailyWord();

const TINY_PIXEL_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [torch, setTorch] = useState(false);
  const [busy, setBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState('Capturing photo…');
  const [cameraError, setCameraError] = useState(false);

  const setPendingScan = useAppStore((state) => state.setPendingScan);
  const offlineMode = useAppStore((state) => state.offlineMode);
  const stats = useAppStore((state) => state.stats);
  const learningLangs = useAppStore((state) => state.learningLangs);
  const toggleLearningLang = useAppStore((state) => state.toggleLearningLang);
  const demoTargetObject = useAppStore((state) => state.demoTargetObject);
  const setDemoTargetObject = useAppStore((state) => state.setDemoTargetObject);
  const crowns = useAppStore((state) => state.crowns);
  const countAudio = useAppStore((state) => state.countAudio);

  // Automatically request camera permission on first mount so the Pixel 9 Pro XL
  // camera activates immediately when opening the app.
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission().catch(() => undefined);
    }
  }, [permission, requestPermission]);

  const todayKey = dayKey();
  const todayCrown = crowns.find((entry) => entry.day === todayKey);

  const dailyActivePreview = DAILY.translations
    .filter((entry) => learningLangs.includes(entry.code))
    .map((entry) => entry.word)
    .join(' · ');

  function handleDailyWordAudio() {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(() => undefined);
    }
    countAudio();
    const targetCode = learningLangs[0] ?? 'en';
    const targetEntry =
      DAILY.translations.find((entry) => entry.code === targetCode) ?? DAILY.translations[0];
    if (targetEntry) {
      speakWord(targetEntry.word, targetEntry.code).catch(() => undefined);
    }
  }

  function handleToggleLang(code: LangCode) {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(() => undefined);
    }
    toggleLearningLang(code);
  }

  async function handleCapture() {
    if (busy) return;

    if (!cameraRef.current || !permission?.granted || cameraError) {
      await handleQuickDemoCapture(demoTargetObject ?? DAILY.object);
      return;
    }

    setBusy(true);
    setBusyLabel('Capturing photo…');
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.88,
        skipProcessing: false,
      });
      if (!photo?.uri) throw new Error('No image data returned by sensor');
      setBusyLabel('Downscaling 50MP sensor frame…');
      const prepared = await prepareImage(photo.uri);
      setPendingScan(prepared);
      router.push('/result');
    } catch {
      Alert.alert(
        'Camera capture fallback',
        'Using instant smart frame so you can test object recognition right away.',
        [
          {
            text: 'Analyze Now',
            onPress: () => {
              handleQuickDemoCapture(demoTargetObject ?? DAILY.object).catch(() => undefined);
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ],
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleQuickDemoCapture(targetObj?: string) {
    if (busy) return;
    setBusy(true);
    setBusyLabel('Preparing smart photo…');
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    }
    if (targetObj) {
      setDemoTargetObject(targetObj);
    }
    setPendingScan({
      uri: `data:image/png;base64,${TINY_PIXEL_BASE64}`,
      base64: TINY_PIXEL_BASE64,
      mimeType: 'image/png',
      capturedAt: new Date().toISOString(),
    });
    setBusy(false);
    router.push('/result');
  }

  async function pickFromLibrary() {
    try {
      setBusy(true);
      setBusyLabel('Optimizing gallery photo…');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 1,
        allowsEditing: false,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset?.uri) {
        Alert.alert('Unsupported image', 'Please pick a JPG or PNG photo.');
        return;
      }
      const prepared = await prepareImage(asset.uri);
      setPendingScan(prepared);
      router.push('/result');
    } catch {
      Alert.alert('Gallery unavailable', 'Could not open or process the selected photo.');
    } finally {
      setBusy(false);
    }
  }

  function toggleFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  const cameraReady = Boolean(permission?.granted) && !cameraError;

  return (
    <Screen>
      {/* Top HUD */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logo}>
            <Ionicons name="aperture" size={20} color={colors.accentInk} />
          </View>
          <View>
            <Text style={styles.brand}>LingoLens</Text>
            <Text style={styles.tagline}>Snap photos · Master 5 languages</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Pressable
            onPress={() => router.push('/(tabs)/profile')}
            style={styles.hudPill}
            accessibilityLabel={`Photo streak: ${stats.photoStreak} days`}>
            <Text style={styles.hudPillText}>🔥 {stats.photoStreak}d</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/(tabs)/feed')}
            style={[styles.hudPill, styles.hudCrownPill]}
            accessibilityLabel={`Daily crowns earned: ${crowns.length}`}>
            <Text style={styles.hudCrownText}>👑 {crowns.length}</Text>
          </Pressable>
          <IconButton
            icon="settings-outline"
            size={36}
            background="rgba(255,255,255,0.06)"
            accessibilityLabel="Settings"
            onPress={() => router.push('/settings')}
          />
        </View>
      </View>

      {/* Word of the Day Quest Banner */}
      <View style={[styles.dailyCard, todayCrown && styles.dailyCardCompleted]}>
        <Pressable
          onPress={handleDailyWordAudio}
          style={styles.dailyMain}
          accessibilityRole="button"
          accessibilityLabel={`Word of the Day: ${DAILY.object}`}>
          <View style={styles.dailyIconWrap}>
            <Text style={styles.dailyEmoji}>{DAILY.emoji}</Text>
          </View>
          <View style={styles.dailyBody}>
            <View style={styles.dailyHeaderRow}>
              <Text style={styles.dailyLabel}>
                {todayCrown
                  ? `👑 TODAY'S CROWN CLAIMED (${todayCrown.tier.toUpperCase()})`
                  : '👑 WORD OF THE DAY QUEST · +25 XP'}
              </Text>
              <Ionicons name="volume-medium" size={14} color={colors.amber} />
            </View>
            <Text style={styles.dailyTitle} numberOfLines={1}>
              Photograph: <Text style={styles.dailyTarget}>{DAILY.object}</Text> ({DAILY.category})
            </Text>
            <Text style={styles.dailyTranslations} numberOfLines={1}>
              {dailyActivePreview}
            </Text>
          </View>
        </Pressable>
        <Pressable
          onPress={() => handleQuickDemoCapture(DAILY.object)}
          style={({ pressed }) => [styles.dailySnapBtn, { opacity: pressed ? 0.75 : 1 }]}
          accessibilityLabel={`Test Word of the Day: ${DAILY.object}`}>
          <Ionicons name="sparkles" size={12} color={colors.accentInk} />
          <Text style={styles.dailySnapText}>Try Quest</Text>
        </Pressable>
      </View>

      {/* Active Viewfinder */}
      <View style={styles.cameraCard}>
        {cameraReady ? (
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing={facing}
            flash={torch ? 'on' : 'off'}
            onMountError={() => setCameraError(true)}
          />
        ) : (
          <View style={styles.placeholder}>
            <View style={styles.placeholderIcon}>
              <Ionicons name="camera-outline" size={32} color={colors.accent} />
            </View>
            <Text style={styles.placeholderTitle}>
              {permission === null ? 'Initializing Pixel Camera…' : 'Enable Instant Camera'}
            </Text>
            <Text style={styles.placeholderText}>
              Point your camera at any object or today’s Word of the Day ({DAILY.emoji}{' '}
              {DAILY.object}) to unlock translations in your active languages.
            </Text>
            <View style={styles.placeholderActions}>
              {permission && !permission.granted ? (
                <PrimaryButton
                  label="Grant Camera Access"
                  icon="camera"
                  onPress={() => {
                    requestPermission().catch(() => undefined);
                    if (!permission.canAskAgain) {
                      Linking.openSettings().catch(() => undefined);
                    }
                  }}
                />
              ) : null}
              <PrimaryButton
                label={`Instant Smart Snap (${(demoTargetObject ?? DAILY.object).toUpperCase()})`}
                icon="sparkles"
                onPress={() => handleQuickDemoCapture(demoTargetObject ?? DAILY.object)}
              />
            </View>
          </View>
        )}

        {cameraReady ? (
          <>
            <View style={styles.cameraTop} pointerEvents="box-none">
              <View style={styles.liveChip}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>
                  {offlineMode ? 'OFFLINE SMART LENS' : 'PIXEL AI READY'}
                </Text>
              </View>
              <View style={styles.cameraTopRight}>
                <Chip
                  label={`${learningLangs.length} ${learningLangs.length === 1 ? 'LANG' : 'LANGS'}`}
                  color={colors.accentInk}
                  background={colors.accent}
                />
                <IconButton
                  icon={torch ? 'flash' : 'flash-off'}
                  size={34}
                  color={torch ? colors.accentInk : colors.text}
                  background={torch ? colors.accent : 'rgba(0,0,0,0.45)'}
                  accessibilityLabel="Toggle torch"
                  onPress={() => setTorch((value) => !value)}
                />
              </View>
            </View>

            <View pointerEvents="none" style={styles.corners}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
              <View style={styles.hint}>
                <Text style={styles.hintText}>
                  {demoTargetObject
                    ? `Target locked: ${demoTargetObject.toUpperCase()} · Tap shutter`
                    : `Snap "${DAILY.object}" for today's Crown or any object around you`}
                </Text>
              </View>
            </View>
          </>
        ) : null}

        {busy ? (
          <View style={styles.busy}>
            <ActivityIndicator color={colors.accent} size="large" />
            <Text style={styles.busyText}>{busyLabel}</Text>
          </View>
        ) : null}
      </View>

      {/* Dynamic 1-to-5 Language Selector Bar */}
      <View style={styles.langBar}>
        <View style={styles.langBarHeader}>
          <Text style={styles.langBarTitle}>
            ACTIVE LANGUAGES ({learningLangs.length}/5)
          </Text>
          <Text style={styles.langBarHint}>Tap to show 1 to 5 simultaneously</Text>
        </View>
        <View style={styles.langPillsRow}>
          {LANGUAGES.map((language) => {
            const active = learningLangs.includes(language.code);
            return (
              <Pressable
                key={language.code}
                onPress={() => handleToggleLang(language.code)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`${language.name} (${active ? 'active' : 'inactive'})`}
                style={[
                  styles.langPill,
                  active && {
                    borderColor: language.tint,
                    backgroundColor: `${language.tint}22`,
                  },
                ]}>
                <Text style={styles.langPillFlag}>{language.flag}</Text>
                <Text
                  style={[
                    styles.langPillCode,
                    active && { color: language.tint, fontWeight: '800' },
                  ]}>
                  {language.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Quick Target Preset Strip for Pixel 9 Pro XL / Expo Go Testing */}
      <View style={styles.presetStrip}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.presetScroll}>
          <Pressable
            onPress={() => setDemoTargetObject(null)}
            style={[
              styles.presetChip,
              demoTargetObject === null && styles.presetChipActive,
            ]}>
            <Text
              style={[
                styles.presetChipText,
                demoTargetObject === null && styles.presetChipTextActive,
              ]}>
              ✨ Auto Vision AI
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setDemoTargetObject(DAILY.object)}
            style={[
              styles.presetChip,
              demoTargetObject === DAILY.object && styles.presetChipCrown,
            ]}>
            <Text
              style={[
                styles.presetChipText,
                demoTargetObject === DAILY.object && styles.presetChipTextCrown,
              ]}>
              👑 Quest: {DAILY.emoji} {DAILY.object}
            </Text>
          </Pressable>
          {CATALOG.slice(0, 8).map((item) => {
            if (item.object === DAILY.object) return null;
            const selected = demoTargetObject === item.object;
            return (
              <Pressable
                key={item.object}
                onPress={() => setDemoTargetObject(selected ? null : item.object)}
                style={[styles.presetChip, selected && styles.presetChipActive]}>
                <Text
                  style={[
                    styles.presetChipText,
                    selected && styles.presetChipTextActive,
                  ]}>
                  {item.emoji} {item.object}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Shutter & Camera Controls */}
      <View style={styles.controls}>
        <IconButton
          icon="images-outline"
          size={48}
          iconSize={21}
          background="rgba(255,255,255,0.06)"
          accessibilityLabel="Pick photo from gallery"
          onPress={pickFromLibrary}
        />
        <Pressable
          onPress={handleCapture}
          disabled={busy}
          accessibilityLabel="Take photo"
          style={({ pressed }) => [
            styles.shutter,
            { opacity: busy ? 0.45 : pressed ? 0.78 : 1 },
          ]}>
          <View style={styles.shutterInner}>
            <Ionicons name="camera" size={24} color={colors.accentInk} />
          </View>
        </Pressable>
        <IconButton
          icon="camera-reverse-outline"
          size={48}
          iconSize={21}
          background="rgba(255,255,255,0.06)"
          accessibilityLabel="Flip camera"
          onPress={toggleFacing}
        />
      </View>

      <View style={styles.kamuFooter}>
        <KamuGuideBanner screen="scan" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  tagline: {
    color: colors.textDim,
    fontSize: 10,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hudPill: {
    backgroundColor: colors.amberSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,196,107,0.35)',
  },
  hudPillText: {
    color: colors.amber,
    fontSize: 11,
    fontWeight: '800',
  },
  hudCrownPill: {
    backgroundColor: colors.accentSoft,
    borderColor: 'rgba(94,234,212,0.35)',
  },
  hudCrownText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
  },
  dailyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: 4,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,196,107,0.4)',
    backgroundColor: 'rgba(255,196,107,0.09)',
  },
  dailyCardCompleted: {
    borderColor: 'rgba(94,234,212,0.45)',
    backgroundColor: 'rgba(94,234,212,0.09)',
  },
  dailyMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dailyIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dailyEmoji: {
    fontSize: 20,
  },
  dailyBody: {
    flex: 1,
  },
  dailyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dailyLabel: {
    color: colors.amber,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  dailyTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  dailyTarget: {
    color: colors.accent,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  dailyTranslations: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 1,
  },
  dailySnapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  dailySnapText: {
    color: colors.accentInk,
    fontSize: 10,
    fontWeight: '800',
  },
  cameraCard: {
    flex: 1,
    minHeight: 190,
    marginHorizontal: spacing.lg,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  placeholderIcon: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  placeholderTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 300,
  },
  placeholderActions: {
    marginTop: spacing.md,
    alignSelf: 'stretch',
    gap: spacing.xs,
  },
  cameraTop: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cameraTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.52)',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  liveText: {
    color: colors.text,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  corners: {
    ...absoluteFill,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: colors.accent,
  },
  cornerTL: {
    top: 48,
    left: 16,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopLeftRadius: 10,
  },
  cornerTR: {
    top: 48,
    right: 16,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderTopRightRadius: 10,
  },
  cornerBL: {
    bottom: 44,
    left: 16,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderBottomLeftRadius: 10,
  },
  cornerBR: {
    bottom: 44,
    right: 16,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomRightRadius: 10,
  },
  hint: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    alignItems: 'center',
  },
  hintText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: 'rgba(0,0,0,0.48)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  busy: {
    ...absoluteFill,
    backgroundColor: 'rgba(3,6,12,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  busyText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  langBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  langBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  langBarTitle: {
    color: colors.textDim,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  langBarHint: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
  },
  langPillsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  langPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  langPillFlag: {
    fontSize: 13,
  },
  langPillCode: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  presetStrip: {
    marginTop: 6,
  },
  presetScroll: {
    paddingHorizontal: spacing.lg,
    gap: 6,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  presetChipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  presetChipCrown: {
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
  },
  presetChipText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  presetChipTextActive: {
    color: colors.accent,
    fontWeight: '800',
  },
  presetChipTextCrown: {
    color: colors.amber,
    fontWeight: '800',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingVertical: 8,
  },
  shutter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kamuFooter: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 6,
  },
});
