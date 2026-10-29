import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { PostCard } from '@/components/PostCard';
import { Screen } from '@/components/Screen';
import { Chip } from '@/components/ui';
import { useAppStore } from '@/store/useAppStore';
import { colors, radius, spacing } from '@/theme';

export default function FeedScreen() {
  const posts = useAppStore((state) => state.posts);
  const toggleLike = useAppStore((state) => state.toggleLike);
  const learned = useAppStore((state) => state.learned);

  return (
    <Screen>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.title}>Comunidad</Text>
                <Text style={styles.subtitle}>Descubrimientos del mundo en 5 idiomas</Text>
              </View>
              <Pressable
                onPress={() => router.push('/')}
                style={({ pressed }) => [styles.scanButton, { opacity: pressed ? 0.8 : 1 }]}>
                <Ionicons name="scan" size={16} color={colors.accentInk} />
                <Text style={styles.scanLabel}>Escanear</Text>
              </Pressable>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statPill}>
                <Ionicons name="people" size={14} color={colors.violet} />
                <Text style={styles.statText}>{posts.length} publicaciones</Text>
              </View>
              <View style={styles.statPill}>
                <Ionicons name="bookmark" size={14} color={colors.accent} />
                <Text style={styles.statText}>{learned.length} palabras tuyas</Text>
              </View>
            </View>

            <View style={styles.notice}>
              <Ionicons name="flask-outline" size={14} color={colors.amber} />
              <Text style={styles.noticeText}>
                Comunidad de demostración: los perfiles son de ejemplo y tus publicaciones se guardan
                en este dispositivo.
              </Text>
            </View>

            <View style={styles.sectionRow}>
              <Text style={styles.sectionLabel}>Lo último</Text>
              <Chip label="En vivo" color={colors.accent} background={colors.accentSoft} />
            </View>
          </View>
        }
        renderItem={({ item }) => <PostCard post={item} onLike={() => toggleLike(item.id)} />}
        ListFooterComponent={<Text style={styles.footer}>Has visto todo por hoy ✨</Text>}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.sm,
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 3,
    maxWidth: 240,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    marginTop: 4,
  },
  scanLabel: {
    color: colors.accentInk,
    fontSize: 12,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  statText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.amberSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  noticeText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 15,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  footer: {
    color: colors.textDim,
    fontSize: 11,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
