import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as IntentLauncher from 'expo-intent-launcher';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Screen } from '@/components/Screen';
import { Card, GhostButton, IconButton, PrimaryButton, SectionTitle } from '@/components/ui';
import { LANGUAGES, type LangCode } from '@/lib/languages';
import { getVoiceStatus, speakWord } from '@/lib/tts';
import { useAppStore } from '@/store/useAppStore';
import { colors, radius, spacing } from '@/theme';

const VOICE_SAMPLE: Record<LangCode, string> = {
  es: 'manzana',
  en: 'apple',
  ja: 'りんご',
  hi: 'सेब',
  zh: '苹果',
};

export default function SettingsScreen() {
  const storedName = useAppStore((state) => state.displayName);
  const storedOffline = useAppStore((state) => state.offlineMode);
  const learningLangs = useAppStore((state) => state.learningLangs);
  const toggleLearningLang = useAppStore((state) => state.toggleLearningLang);
  const setLearningLangs = useAppStore((state) => state.setLearningLangs);
  const setDisplayName = useAppStore((state) => state.setDisplayName);
  const setOfflineMode = useAppStore((state) => state.setOfflineMode);
  const resetProgress = useAppStore((state) => state.resetProgress);

  const [name, setName] = useState(storedName);
  const [offline, setOffline] = useState(storedOffline);
  const [saved, setSaved] = useState(false);
  const [voices, setVoices] = useState<Record<LangCode, boolean> | null>(null);
  const [testing, setTesting] = useState<LangCode | null>(null);

  useEffect(() => {
    getVoiceStatus()
      .then(setVoices)
      .catch(() => undefined);
  }, []);

  function handleSave() {
    setDisplayName(name);
    setOfflineMode(offline);
    setSaved(true);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    }
    setTimeout(() => setSaved(false), 2200);
  }

  async function openVoiceSettings() {
    try {
      if (Platform.OS === 'android') {
        await IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.TTS_SETTINGS);
        return;
      }
      await Linking.openSettings();
    } catch {
      await Linking.openSettings().catch(() => undefined);
    }
  }

  function testVoice(code: LangCode) {
    setTesting(code);
    speakWord(VOICE_SAMPLE[code], code).catch(() => undefined);
    setTimeout(() => setTesting(null), 1200);
  }

  function confirmReset() {
    Alert.alert(
      'Reset all progress',
      'This will clear your saved words, XP, crowns, streak milestones, and community posts. Your display name will be kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: () => {
            resetProgress();
            router.replace('/(tabs)');
          },
        },
      ],
    );
  }

  const missingVoices = voices
    ? LANGUAGES.filter((language) => !voices[language.code]).length
    : 0;

  return (
    <Screen>
      <View style={styles.header}>
        <IconButton icon="chevron-back" size={38} onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Settings & Diagnostics</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <SectionTitle>Community Identity</SectionTitle>
          <Card style={styles.card}>
            <Text style={styles.label}>Display Name on Merit Hub</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Explorer"
              placeholderTextColor={colors.textDim}
              maxLength={24}
              style={styles.input}
              selectionColor={colors.accent}
            />
            <Text style={styles.helper}>
              No account or password required: all progress is stored locally on your Pixel 9 Pro
              XL.
            </Text>
          </Card>

          <SectionTitle
            right={
              <Text style={styles.badge}>
                {learningLangs.length} OF 5 SELECTED
              </Text>
            }>
            Dynamic Study Languages
          </SectionTitle>
          <Card style={styles.card}>
            <Text style={styles.label}>Choose 1 to 5 simultaneous languages</Text>
            <Text style={styles.helper}>
              Every photo scan displays native script, romanization (Rōmaji, Transliteration,
              Pinyin), phonetic guide, and Duolingo-style pronunciation test for your active
              languages.
            </Text>
            <View style={styles.langWrap}>
              {LANGUAGES.map((l) => {
                const active = learningLangs.includes(l.code);
                return (
                  <Pressable
                    key={l.code}
                    onPress={() => toggleLearningLang(l.code)}
                    style={[
                      styles.langPill,
                      active && {
                        backgroundColor: `${l.tint}22`,
                        borderColor: l.tint,
                      },
                    ]}>
                    <Text style={styles.langPillFlag}>{l.flag}</Text>
                    <Text
                      style={[
                        styles.langPillText,
                        active && { color: l.tint, fontWeight: '800' },
                      ]}>
                      {l.name} ({l.native})
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.quickLangActions}>
              <Pressable
                onPress={() => setLearningLangs(['es', 'en', 'ja', 'hi', 'zh'])}
                style={styles.quickLangBtn}>
                <Text style={styles.quickLangBtnText}>Select All 5 Languages</Text>
              </Pressable>
              <Pressable
                onPress={() => setLearningLangs(['es', 'en', 'ja'])}
                style={styles.quickLangBtn}>
                <Text style={styles.quickLangBtnText}>Select 3 (ES · EN · JA)</Text>
              </Pressable>
            </View>
          </Card>

          <SectionTitle right={<Text style={styles.badge}>PIXEL 9 PRO XL · KEYLESS</Text>}>
            Vision AI & Offline Engine
          </SectionTitle>
          <Card style={styles.card}>
            <View style={styles.engineRow}>
              <View style={styles.engineDot} />
              <View style={styles.engineText}>
                <Text style={styles.engineTitle}>Hybrid Vision AI Connected</Text>
                <Text style={styles.engineSub}>
                  Qwen2.5-VL · 50MP Sensor Downscaler (1024px) · Keyless
                </Text>
              </View>
              <Ionicons name="shield-checkmark" size={18} color={colors.accent} />
            </View>

            <Text style={styles.helper}>
              Photos from the Pixel 9 Pro XL 50MP camera are automatically resized to 1024px JPEG
              for sub-second inference. If the keyless cloud model is busy or offline, LingoLens
              seamlessly falls back to the built-in 24-object polyglot catalog.
            </Text>

            <View style={styles.switchRow}>
              <View style={styles.switchText}>
                <Text style={styles.switchTitle}>Offline Smart Catalog Mode</Text>
                <Text style={styles.switchSub}>
                  Zero network latency. 24 everyday objects with 5 scripts & native audio.
                </Text>
              </View>
              <Switch
                value={offline}
                onValueChange={setOffline}
                trackColor={{ false: 'rgba(255,255,255,0.12)', true: 'rgba(140,255,184,0.4)' }}
                thumbColor={offline ? colors.accent : '#8A97AB'}
              />
            </View>
          </Card>

          <SectionTitle
            right={
              voices ? (
                <Text style={[styles.badge, missingVoices > 0 && { color: colors.amber }]}>
                  {missingVoices > 0 ? `${missingVoices} TO INSTALL` : 'ALL INSTALLED'}
                </Text>
              ) : undefined
            }>
            Device TTS Voices (5 Languages)
          </SectionTitle>
          <Card style={styles.card}>
            {LANGUAGES.map((language) => {
              const installed = voices?.[language.code];
              return (
                <View key={language.code} style={styles.languageRow}>
                  <Text style={styles.languageFlag}>{language.flag}</Text>
                  <View style={styles.languageText}>
                    <Text style={styles.languageName}>
                      {language.name} · {language.romanizationName ?? 'Latin Script'}
                    </Text>
                    <Text style={styles.languageNative}>
                      {installed === false
                        ? 'System voice pack not detected (using fallback)'
                        : `${language.native} · ${language.speech}`}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => testVoice(language.code)}
                    style={({ pressed }) => [
                      styles.testButton,
                      {
                        backgroundColor:
                          testing === language.code ? language.tint : 'rgba(255,255,255,0.06)',
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}>
                    <Ionicons
                      name={testing === language.code ? 'volume-high' : 'play'}
                      size={13}
                      color={testing === language.code ? colors.accentInk : colors.text}
                    />
                    <Text
                      style={[
                        styles.testLabel,
                        testing === language.code && { color: colors.accentInk },
                      ]}>
                      Test
                    </Text>
                  </Pressable>
                </View>
              );
            })}

            <Text style={styles.helper}>
              Audio uses your Google Pixel’s native Speech Services for Spanish, English, Japanese,
              Hindi, and Mandarin.
            </Text>

            <Pressable onPress={openVoiceSettings} style={styles.linkRow}>
              <Ionicons name="settings-outline" size={14} color={colors.accent} />
              <Text style={styles.linkText}>Open Android Text-to-Speech Settings</Text>
            </Pressable>
          </Card>

          <SectionTitle>Guide & Data</SectionTitle>
          <Card style={styles.card}>
            <GhostButton
              label="Replay Kamu’s Interactive Welcome Tour"
              icon="sparkles-outline"
              onPress={() => router.push('/welcome')}
            />
            <View style={{ height: spacing.xs }} />
            <GhostButton
              label="Reset All Progress"
              icon="trash-outline"
              onPress={confirmReset}
            />
            <Text style={styles.helper}>
              All vocabulary, crowns, streaks, and merit posts are persisted on this device.
            </Text>
          </Card>

          <View style={styles.about}>
            <Text style={styles.aboutTitle}>
              LingoLens · v2.0.0 · Google Pixel 9 Pro XL Edition
            </Text>
            <Text style={styles.aboutText}>
              Instant camera launch, 5-language native script & phonetic engine (ES · EN · JA · HI ·
              ZH), Duolingo-style pronunciation coach, 1/2/3-week streak trophies, and Kamu the
              prism chameleon.
            </Text>
          </View>

          <PrimaryButton
            label={saved ? 'Settings Saved ✓' : 'Save Settings'}
            icon={saved ? undefined : 'checkmark'}
            onPress={handleSave}
            style={styles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
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
  card: {
    marginBottom: spacing.xl,
    gap: 6,
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  input: {
    backgroundColor: colors.cardSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 14,
  },
  helper: {
    color: colors.textDim,
    fontSize: 10,
    lineHeight: 15,
    marginTop: spacing.xs,
  },
  langWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.cardSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  langPillFlag: {
    fontSize: 14,
  },
  langPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  quickLangActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: spacing.sm,
  },
  quickLangBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickLangBtnText: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '700',
  },
  engineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  engineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  engineText: {
    flex: 1,
  },
  engineTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  engineSub: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  switchText: {
    flex: 1,
  },
  switchTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  switchSub: {
    color: colors.textDim,
    fontSize: 10,
    marginTop: 2,
  },
  badge: {
    color: colors.accent,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  languageFlag: {
    fontSize: 20,
  },
  languageText: {
    flex: 1,
  },
  languageName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  languageNative: {
    color: colors.textDim,
    fontSize: 10,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  testLabel: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '700',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  linkText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '600',
  },
  about: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  aboutTitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  aboutText: {
    color: colors.textDim,
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    marginTop: 6,
  },
  saveButton: {
    marginBottom: spacing.lg,
  },
});
