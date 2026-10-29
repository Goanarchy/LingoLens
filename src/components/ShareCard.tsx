import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { useRef, useState, type ComponentRef } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';

import { LANGUAGES } from '@/lib/languages';
import { colors, radius, spacing } from '@/theme';

import { Kamu } from './Kamu';
import { GhostButton, PrimaryButton } from './ui';

/** Datos mínimos para dibujar una tarjeta compartible. */
export type ShareWord = {
  object: string;
  emoji: string;
  category: string;
  words: Record<string, string>;
};

/**
 * Tarjeta de palabra capturada como imagen y compartida con la hoja del sistema.
 * No usa cuentas ni servicios: todo ocurre en el dispositivo.
 */
export function ShareCardModal({
  word,
  onClose,
}: {
  word: ShareWord | null;
  onClose: () => void;
}) {
  const cardRef = useRef<ComponentRef<typeof View>>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleShare() {
    if (!cardRef.current || busy) return;
    setBusy(true);
    setError(null);
    try {
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        setError('Tu dispositivo no permite compartir archivos.');
        return;
      }
      const uri = await captureRef(cardRef, { format: 'png', quality: 1, result: 'tmpfile' });
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: word ? `Compartir ${word.object}` : 'Compartir tarjeta',
      });
    } catch {
      setError('No se pudo crear la tarjeta. Inténtalo otra vez.');
    } finally {
      setBusy(false);
    }
  }

  function handleClose() {
    if (busy) return;
    setError(null);
    onClose();
  }

  return (
    <Modal visible={Boolean(word)} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Tu tarjeta</Text>
            <Pressable onPress={handleClose} hitSlop={10} accessibilityLabel="Cerrar tarjeta">
              <Ionicons name="close" size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          {word ? (
            <View ref={cardRef} collapsable={false} style={styles.card}>
              <View style={styles.brandRow}>
                <View style={styles.logo}>
                  <Ionicons name="scan" size={15} color={colors.accentInk} />
                </View>
                <Text style={styles.brand}>LingoLens</Text>
                <Text style={styles.brandTag}>ONE PHOTO · FIVE LANGUAGES</Text>
              </View>

              <View style={styles.hero}>
                <Text style={styles.emoji}>{word.emoji}</Text>
                <Text style={styles.object} numberOfLines={1} adjustsFontSizeToFit>
                  {word.object}
                </Text>
                <Text style={styles.category}>{word.category.toUpperCase()}</Text>
              </View>

              <View style={styles.rows}>
                {LANGUAGES.map((language) => {
                  const value = word.words[language.code];
                  if (!value) return null;
                  return (
                    <View key={language.code} style={styles.row}>
                      <Text style={styles.flag}>{language.flag}</Text>
                      <Text style={styles.language}>{language.native}</Text>
                      <Text style={[styles.value, { color: language.tint }]} numberOfLines={1}>
                        {value}
                      </Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.footer}>
                <Kamu size={46} color={colors.accent} animated={false} />
                <Text style={styles.footerText}>Aprendido con Kamu</Text>
                <Text style={styles.footerMark}>lingolens</Text>
              </View>
            </View>
          ) : null}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PrimaryButton
            label={busy ? 'Creando tarjeta…' : 'Compartir imagen'}
            icon={busy ? undefined : 'share-outline'}
            onPress={handleShare}
            loading={busy}
            disabled={!word}
            style={styles.shareButton}
          />
          <GhostButton label="Cerrar" onPress={handleClose} disabled={busy} style={styles.closeButton} />

          {busy ? (
            <View style={styles.busy}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(3,6,12,0.86)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  sheet: {
    backgroundColor: colors.bgSoft,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sheetTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: '#0B1322',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.lg,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  logo: {
    width: 26,
    height: 26,
    borderRadius: 9,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  brandTag: {
    color: colors.textDim,
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 1,
    marginLeft: 'auto',
  },
  hero: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
  emoji: {
    fontSize: 46,
    marginBottom: 4,
  },
  object: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.6,
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  category: {
    color: colors.textDim,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.6,
    marginTop: 6,
  },
  rows: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  flag: {
    fontSize: 14,
  },
  language: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    width: 62,
  },
  value: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  footerMark: {
    color: colors.textDim,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginLeft: 'auto',
  },
  error: {
    color: colors.danger,
    fontSize: 11,
    lineHeight: 16,
    marginTop: spacing.md,
  },
  shareButton: {
    marginTop: spacing.lg,
  },
  closeButton: {
    marginTop: spacing.sm,
  },
  busy: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
