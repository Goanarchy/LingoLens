import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Kamu, type KamuMood } from '@/components/Kamu';
import { KamuBubble } from '@/components/KamuBubble';
import { Screen } from '@/components/Screen';
import { Chip, PrimaryButton } from '@/components/ui';
import { KAMU_LANG_COLORS, KAMU_LORE } from '@/lib/kamu';
import { LANGUAGES, type LangCode } from '@/lib/languages';
import { useAppStore } from '@/store/useAppStore';
import { colors, radius, spacing } from '@/theme';

type IntroStep = {
  kicker: string;
  title: string;
  body: string;
  bubble: string;
  mood: KamuMood;
  pointing: 'left' | 'right' | 'up' | null;
  color: string;
  crowned?: boolean;
};

const STEPS: IntroStep[] = [
  {
    kicker: 'Meet Your Guide',
    title: `${KAMU_LORE.name} · ${KAMU_LORE.species}`,
    body: `${KAMU_LORE.origin} Point your Pixel 9 Pro XL camera at any object to refract it into 5 world languages.`,
    bubble: 'Hey! I am Kamu. You snap the photo; my prism lens unlocks the words.',
    mood: 'excited',
    pointing: null,
    color: KAMU_LANG_COLORS.es,
  },
  {
    kicker: 'Streaks & Daily Crowns',
    title: 'Catch the Word of the Day',
    body: 'Photograph the Daily Quest object to claim a Photo Crown (+25 XP). Keep your daily photo streak alive for 1, 2, and 3 weeks to unlock Bronze, Silver, and Golden Aperture Trophies!',
    bubble: 'Hold the mic button and pass my 75% Duolingo pronunciation check to earn +15 XP!',
    mood: 'crowned',
    pointing: 'up',
    color: KAMU_LANG_COLORS.ja,
    crowned: true,
  },
  {
    kicker: 'Dynamic Polyglot Lens',
    title: 'Pick 1 to 5 Languages',
    body: 'Choose which languages appear simultaneously when you take a photo: Spanish, English, Japanese, Hindi, and Mandarin—each with native script, romanization, and phonetic guide.',
    bubble: 'Tap 1, 3, or all 5 flags below—you can change them anytime from the camera!',
    mood: 'smug',
    pointing: 'right',
    color: KAMU_LANG_COLORS.zh,
  },
];

export default function WelcomeScreen() {
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const completeProfile = useAppStore((state) => state.completeProfile);
  const learningLangs = useAppStore((state) => state.learningLangs);
  const toggleLearningLang = useAppStore((state) => state.toggleLearningLang);
  const { height } = useWindowDimensions();
  const [index, setIndex] = useState(0);

  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;
  const kamuSize = height < 700 ? Math.round(height * 0.19) : 178;

  function finish() {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    }
    completeOnboarding();
    completeProfile();
    router.replace('/(tabs)');
  }

  function handleToggleLanguage(code: LangCode) {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(() => undefined);
    }
    toggleLearningLang(code);
  }

  function next() {
    if (isLast) {
      finish();
      return;
    }
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(() => undefined);
    }
    setIndex((value) => value + 1);
  }

  return (
    <Screen>
      <View style={styles.top}>
        <View style={styles.brandRow}>
          <View style={styles.logo}>
            <Ionicons name="aperture" size={16} color={colors.accentInk} />
          </View>
          <Text style={styles.brand}>LingoLens</Text>
        </View>
        <Pressable
          onPress={finish}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Skip welcome tour"
          style={({ pressed }) => [styles.skip, { opacity: pressed ? 0.6 : 1 }]}>
          <Text style={styles.skipText}>Open Camera</Text>
        </Pressable>
      </View>

      <View style={styles.stage}>
        <KamuBubble text={step.bubble} style={styles.bubble} />
        <Kamu
          size={kamuSize}
          mood={step.mood}
          pointing={step.pointing}
          color={step.color}
          crowned={step.crowned}
        />
      </View>

      <View style={styles.copy}>
        <Chip
          label={`Step ${index + 1} of ${STEPS.length}`}
          color={step.color}
          background={`${step.color}1F`}
        />
        <Text style={styles.kicker}>{step.kicker.toUpperCase()}</Text>
        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.body}>{step.body}</Text>

        {isLast ? (
          <View style={styles.languages}>
            {LANGUAGES.map((language) => {
              const active = learningLangs.includes(language.code);
              return (
                <Pressable
                  key={language.code}
                  onPress={() => handleToggleLanguage(language.code)}
                  style={({ pressed }) => [
                    styles.language,
                    { opacity: pressed ? 0.7 : 1 },
                    active && {
                      borderColor: language.tint,
                      backgroundColor: `${language.tint}22`,
                    },
                  ]}>
                  <Text style={styles.flag}>{language.flag}</Text>
                  <Text
                    style={[
                      styles.languageName,
                      active && { color: language.tint, fontWeight: '800' },
                    ]}>
                    {language.name} ({language.native})
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <View
          style={styles.dots}
          accessible
          accessibilityLabel={`Step ${index + 1} of ${STEPS.length}`}>
          {STEPS.map((item, dotIndex) => (
            <View
              key={item.title}
              style={[
                styles.dot,
                dotIndex === index && { backgroundColor: step.color, width: 20 },
              ]}
            />
          ))}
        </View>

        <PrimaryButton
          label={isLast ? `Launch Camera (${learningLangs.length} Active)` : 'Next'}
          icon={isLast ? 'camera' : 'arrow-forward'}
          onPress={next}
          style={styles.nextButton}
        />

        <View style={styles.privacy}>
          <Ionicons name="lock-closed-outline" size={12} color={colors.textDim} />
          <Text style={styles.privacyText}>
            Optimized for Google Pixel 9 Pro XL · Expo Go ready · 100% keyless & private
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  skip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  skipText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  bubble: {
    maxWidth: 290,
    alignSelf: 'center',
  },
  copy: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  kicker: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.8,
    marginTop: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginTop: spacing.xs,
  },
  body: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  languages: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  language: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  flag: {
    fontSize: 13,
  },
  languageName: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.borderStrong,
  },
  nextButton: {
    alignSelf: 'stretch',
  },
  privacy: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: spacing.md,
  },
  privacyText: {
    color: colors.textDim,
    fontSize: 9,
    lineHeight: 13,
    textAlign: 'center',
    flexShrink: 1,
  },
});
