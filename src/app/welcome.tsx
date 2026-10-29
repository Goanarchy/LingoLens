import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Kamu, type KamuMood } from '@/components/Kamu';
import { KamuBubble } from '@/components/KamuBubble';
import { Screen } from '@/components/Screen';
import { Chip, PrimaryButton } from '@/components/ui';
import { KAMU_LANG_COLORS } from '@/lib/kamu';
import { LANGUAGES } from '@/lib/languages';
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
};

const STEPS: IntroStep[] = [
  {
    kicker: 'Bienvenido',
    title: 'Una foto, cinco idiomas',
    body: 'Apunta la cámara a cualquier objeto y descubre cómo se dice en español, inglés, francés, alemán e italiano. Sin cuentas, sin claves y sin pagos.',
    bubble: 'Hola, soy Kamu. Yo veo el mundo; tú te quedas con las palabras.',
    mood: 'idle',
    pointing: null,
    color: KAMU_LANG_COLORS.es,
  },
  {
    kicker: 'Cómo funciona',
    title: 'Kamu pregunta primero',
    body: 'Mientras analizamos tu foto, Kamu juzga el objeto con cariño. Después recibes el nombre, la pronunciación y el audio en los cinco idiomas.',
    bubble: '¿Pero qué demonios es esto?',
    mood: 'confused',
    pointing: 'up',
    color: KAMU_LANG_COLORS.fr,
  },
  {
    kicker: 'Aprende de verdad',
    title: 'Colecciona, repasa y comparte',
    body: 'Guarda cada hallazgo en tu biblioteca, repásalo con tarjetas y comparte una tarjeta con tus palabras. La cámara solo se activa cuando tú la usas.',
    bubble: 'Guardar sin repasar es coleccionar polvo. Yo te aviso.',
    mood: 'smug',
    pointing: 'right',
    color: KAMU_LANG_COLORS.it,
  },
];

export default function WelcomeScreen() {
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const [index, setIndex] = useState(0);
  const { height } = useWindowDimensions();

  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;
  const kamuSize = height < 700 ? Math.round(height * 0.2) : 188;

  function finish() {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    }
    completeOnboarding();
    router.replace('/');
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
            <Ionicons name="scan" size={16} color={colors.accentInk} />
          </View>
          <Text style={styles.brand}>LingoLens</Text>
        </View>
        <Pressable
          onPress={finish}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Omitir introducción"
          style={({ pressed }) => [styles.skip, { opacity: pressed ? 0.6 : 1 }]}>
          <Text style={styles.skipText}>Omitir</Text>
        </Pressable>
      </View>

      <View style={styles.stage}>
        <KamuBubble text={step.bubble} style={styles.bubble} />
        <Kamu size={kamuSize} mood={step.mood} pointing={step.pointing} color={step.color} />
      </View>

      <View style={styles.copy}>
        <Chip
          label={`Paso ${index + 1} de ${STEPS.length}`}
          color={step.color}
          background={`${step.color}1F`}
        />
        <Text style={styles.kicker}>{step.kicker.toUpperCase()}</Text>
        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.body}>{step.body}</Text>

        {isLast ? (
          <View style={styles.languages}>
            {LANGUAGES.map((language) => (
              <View key={language.code} style={styles.language}>
                <Text style={styles.flag}>{language.flag}</Text>
                <Text style={styles.languageName}>{language.native}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <View style={styles.dots} accessible accessibilityLabel={`Paso ${index + 1} de ${STEPS.length}`}>
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
          label={isLast ? 'Empezar a explorar' : 'Siguiente'}
          icon={isLast ? 'sparkles' : 'arrow-forward'}
          onPress={next}
          style={styles.nextButton}
        />

        <View style={styles.privacy}>
          <Ionicons name="lock-closed-outline" size={12} color={colors.textDim} />
          <Text style={styles.privacyText}>
            Gratis para siempre · sin cuenta · sin anuncios · tus datos se quedan en tu teléfono
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
    maxWidth: 280,
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
    fontSize: 29,
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
    paddingVertical: 5,
  },
  flag: {
    fontSize: 12,
  },
  languageName: {
    color: colors.textMuted,
    fontSize: 10,
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
