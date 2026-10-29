import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Screen } from '@/components/Screen';
import { Chip, IconButton, PrimaryButton } from '@/components/ui';
import { prepareImage } from '@/lib/image';
import { LANGUAGES } from '@/lib/languages';
import { useAppStore } from '@/store/useAppStore';
import { absoluteFill, colors, radius, spacing } from '@/theme';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [torch, setTorch] = useState(false);
  const [busy, setBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState('Capturando…');
  const [cameraError, setCameraError] = useState(false);

  const setPendingScan = useAppStore((state) => state.setPendingScan);
  const offlineMode = useAppStore((state) => state.offlineMode);
  const streak = useAppStore((state) => state.stats.streak);

  async function handleCapture() {
    if (busy) return;
    if (!cameraRef.current) {
      Alert.alert('Cámara no disponible', 'Espera un momento o elige una foto de la galería.');
      return;
    }

    setBusy(true);
    setBusyLabel('Capturando…');
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9, skipProcessing: false });
      if (!photo?.uri) throw new Error('Sin datos de imagen');
      setBusyLabel('Optimizando foto…');
      const prepared = await prepareImage(photo.uri);
      setPendingScan(prepared);
      router.push('/result');
    } catch {
      Alert.alert(
        'No se pudo capturar',
        'Inténtalo de nuevo o elige una foto de la galería.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function pickFromLibrary() {
    try {
      setBusy(true);
      setBusyLabel('Optimizando foto…');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 1,
        allowsEditing: false,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset?.uri) {
        Alert.alert('Imagen no compatible', 'Elige una foto en formato JPG o PNG.');
        return;
      }
      const prepared = await prepareImage(asset.uri);
      setPendingScan(prepared);
      router.push('/result');
    } catch {
      Alert.alert('Galería no disponible', 'No se pudo abrir o procesar tu foto.');
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
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logo}>
            <Ionicons name="scan" size={19} color={colors.accentInk} />
          </View>
          <View>
            <Text style={styles.brand}>LingoLens</Text>
            <Text style={styles.tagline}>Una foto, cinco idiomas</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Chip
            label={`🔥 ${streak}`}
            color={colors.amber}
            background={colors.amberSoft}
            textStyle={styles.streakText}
          />
          <IconButton
            icon="settings-outline"
            size={38}
            background="rgba(255,255,255,0.05)"
            accessibilityLabel="Ajustes"
            onPress={() => router.push('/settings')}
          />
        </View>
      </View>

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
              <Ionicons name="camera-outline" size={32} color={colors.textMuted} />
            </View>
            <Text style={styles.placeholderTitle}>
              {permission === null ? 'Preparando la cámara…' : 'Activa tu cámara'}
            </Text>
            <Text style={styles.placeholderText}>
              Fotografía cualquier objeto y descubre su nombre en español, inglés, francés, alemán e
              italiano.
            </Text>
            {permission && !permission.granted ? (
              <PrimaryButton
                label="Permitir cámara"
                icon="camera"
                onPress={() => {
                  requestPermission().catch(() => undefined);
                  if (!permission.canAskAgain) {
                    Linking.openSettings().catch(() => undefined);
                  }
                }}
                style={styles.permissionButton}
              />
            ) : null}
            {cameraError ? (
              <Text style={styles.placeholderHint}>
                La cámara no está disponible aquí. Usa la galería para probar la app.
              </Text>
            ) : null}
          </View>
        )}

        {cameraReady ? (
          <>
            <View style={styles.cameraTop} pointerEvents="box-none">
              <View style={styles.liveChip}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>EN VIVO</Text>
              </View>
              <IconButton
                icon={torch ? 'flash' : 'flash-off'}
                size={36}
                color={torch ? colors.accentInk : colors.text}
                background={torch ? colors.accent : 'rgba(0,0,0,0.4)'}
                accessibilityLabel="Linterna"
                onPress={() => setTorch((value) => !value)}
              />
            </View>

            <View pointerEvents="none" style={styles.corners}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
              <View style={styles.hint}>
                <Text style={styles.hintText}>Apunta a un objeto y dispara</Text>
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

      <View style={styles.flagsRow}>
        <Text style={styles.flagsLabel}>Idiomas</Text>
        <View style={styles.flags}>
          {LANGUAGES.map((language) => (
            <Text key={language.code} style={styles.flag}>
              {language.flag}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.controls}>
        <IconButton
          icon="images"
          size={52}
          iconSize={22}
          background="rgba(255,255,255,0.06)"
          accessibilityLabel="Elegir de la galería"
          onPress={pickFromLibrary}
        />
        <Pressable
          onPress={handleCapture}
          disabled={!cameraReady || busy}
          accessibilityLabel="Tomar foto"
          style={({ pressed }) => [
            styles.shutter,
            { opacity: !cameraReady || busy ? 0.4 : pressed ? 0.75 : 1 },
          ]}>
          <View style={styles.shutterInner} />
        </Pressable>
        <IconButton
          icon="camera-reverse"
          size={52}
          iconSize={22}
          background="rgba(255,255,255,0.06)"
          accessibilityLabel="Cambiar cámara"
          onPress={toggleFacing}
        />
      </View>

      <Pressable style={styles.demoRow} onPress={() => router.push('/settings')}>
        <Ionicons
          name={offlineMode ? 'cloud-offline-outline' : 'sparkles'}
          size={14}
          color={offlineMode ? colors.amber : colors.accent}
        />
        <Text style={styles.demoText}>
          {offlineMode
            ? 'Modo sin conexión · catálogo local'
            : 'IA gratis activa · sin clave ni cuenta'}
        </Text>
        <Ionicons name="chevron-forward" size={13} color={colors.textDim} />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  tagline: {
    color: colors.textDim,
    fontSize: 11,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  streakText: {
    fontSize: 12,
    letterSpacing: 0,
    textTransform: 'none',
  },
  cameraCard: {
    flex: 1,
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
    width: 66,
    height: 66,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  placeholderTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: 300,
  },
  placeholderHint: {
    color: colors.textDim,
    fontSize: 11,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  permissionButton: {
    marginTop: spacing.lg,
    alignSelf: 'stretch',
  },
  cameraTop: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
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
    letterSpacing: 1.2,
  },
  corners: {
    ...absoluteFill,
  },
  corner: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderColor: colors.accent,
  },
  cornerTL: {
    top: 60,
    left: 18,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopLeftRadius: 12,
  },
  cornerTR: {
    top: 60,
    right: 18,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderTopRightRadius: 12,
  },
  cornerBL: {
    bottom: 56,
    left: 18,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderBottomLeftRadius: 12,
  },
  cornerBR: {
    bottom: 56,
    right: 18,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomRightRadius: 12,
  },
  hint: {
    position: 'absolute',
    bottom: 18,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hintText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  busy: {
    ...absoluteFill,
    backgroundColor: 'rgba(3,6,12,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  busyText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  flagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  flagsLabel: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  flags: {
    flexDirection: 'row',
    gap: 6,
  },
  flag: {
    fontSize: 15,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingVertical: spacing.md,
  },
  shutter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.text,
  },
  demoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: spacing.md,
  },
  demoText: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: '500',
  },
});
