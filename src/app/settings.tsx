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
  fr: 'pomme',
  de: 'Apfel',
  it: 'mela',
};

export default function SettingsScreen() {
  const storedName = useAppStore((state) => state.displayName);
  const storedOffline = useAppStore((state) => state.offlineMode);
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
      'Borrar progreso',
      'Se eliminarán tus palabras, XP, badges y publicaciones. Tu nombre se conserva.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar todo',
          style: 'destructive',
          onPress: () => {
            resetProgress();
            router.replace('/');
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
        <Text style={styles.headerTitle}>Ajustes</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <SectionTitle>Perfil</SectionTitle>
          <Card style={styles.card}>
            <Text style={styles.label}>Tu nombre en la comunidad</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Explorador"
              placeholderTextColor={colors.textDim}
              maxLength={24}
              style={styles.input}
              selectionColor={colors.accent}
            />
            <Text style={styles.helper}>Sin cuentas ni contraseñas: todo queda en tu teléfono.</Text>
          </Card>

          <SectionTitle right={<Text style={styles.badge}>GRATIS · SIN CLAVE</Text>}>
            Motor de IA
          </SectionTitle>
          <Card style={styles.card}>
            <View style={styles.engineRow}>
              <View style={styles.engineDot} />
              <View style={styles.engineText}>
                <Text style={styles.engineTitle}>IA gratuita conectada</Text>
                <Text style={styles.engineSub}>
                  Qwen2.5-VL · OVHcloud AI Endpoints · sin registro
                </Text>
              </View>
              <Ionicons name="shield-checkmark" size={18} color={colors.accent} />
            </View>

            <Text style={styles.helper}>
              La app identifica objetos con modelos de visión abiertos y gratuitos. No necesitas API
              key, cuenta ni tarjeta. Si el servicio gratuito está saturado, se prueba otro modelo
              automáticamente y, como último recurso, se usa el catálogo local. La foto se envía al
              servicio solo para identificarla; no se guarda en ningún servidor propio.
            </Text>

            <View style={styles.switchRow}>
              <View style={styles.switchText}>
                <Text style={styles.switchTitle}>Usar solo el catálogo local</Text>
                <Text style={styles.switchSub}>
                  Sin internet. 18 objetos con audio y 5 idiomas.
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
                  {missingVoices > 0 ? `${missingVoices} POR INSTALAR` : 'COMPLETAS'}
                </Text>
              ) : undefined
            }>
            Voces del dispositivo
          </SectionTitle>
          <Card style={styles.card}>
            {LANGUAGES.map((language) => {
              const installed = voices?.[language.code];
              return (
                <View key={language.code} style={styles.languageRow}>
                  <Text style={styles.languageFlag}>{language.flag}</Text>
                  <View style={styles.languageText}>
                    <Text style={styles.languageName}>{language.name}</Text>
                    <Text style={styles.languageNative}>
                      {installed === false ? 'Voz no instalada' : language.native}
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
                      Probar
                    </Text>
                  </Pressable>
                </View>
              );
            })}

            <Text style={styles.helper}>
              El audio usa las voces de tu Pixel, sin costo. Si alguna falta, ábrela en los ajustes de
              texto a voz e instala su paquete de idioma.
            </Text>

            <Pressable onPress={openVoiceSettings} style={styles.linkRow}>
              <Ionicons name="settings-outline" size={14} color={colors.accent} />
              <Text style={styles.linkText}>Abrir ajustes de voz del sistema</Text>
            </Pressable>
          </Card>

          <SectionTitle>Datos</SectionTitle>
          <Card style={styles.card}>
            <GhostButton label="Borrar progreso" icon="trash-outline" onPress={confirmReset} />
            <Text style={styles.helper}>
              Tus palabras, XP, badges y publicaciones se guardan solo en este dispositivo.
            </Text>
          </Card>

          <View style={styles.about}>
            <Text style={styles.aboutTitle}>LingoLens · v1.0.0</Text>
            <Text style={styles.aboutText}>
              Una foto → el nombre del objeto en cinco idiomas, con pronunciación escrita y audio.
              Sube de rango, gana badges y comparte tus descubrimientos.
            </Text>
          </View>

          <PrimaryButton
            label={saved ? 'Ajustes guardados ✓' : 'Guardar ajustes'}
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
