import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Kamu } from '@/components/Kamu';
import { KamuGuideBanner } from '@/components/KamuBubble';
import { Screen } from '@/components/Screen';
import { ShareCardModal, type ShareWord } from '@/components/ShareCard';
import { GhostButton, IconButton, PrimaryButton } from '@/components/ui';
import { KAMU_EMPTY_LINES, pickLine } from '@/lib/kamu';
import { LANGUAGES, type LangCode } from '@/lib/languages';
import { countDue } from '@/lib/srs';
import { speakWord } from '@/lib/tts';
import type { LearnedWord } from '@/lib/types';
import { useAppStore } from '@/store/useAppStore';
import { colors, radius, spacing } from '@/theme';

type CategoryFilter = string;

function hapticSelection() {
  if (Platform.OS === 'web') return;
  Haptics.selectionAsync().catch(() => undefined);
}

export default function LibraryScreen() {
  const learned = useAppStore((state) => state.learned);
  const reviews = useAppStore((state) => state.reviews);
  const learningLangs = useAppStore((state) => state.learningLangs);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const countAudio = useAppStore((state) => state.countAudio);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [shareWord, setShareWord] = useState<ShareWord | null>(null);

  const due = useMemo(() => countDue(learned, reviews), [learned, reviews]);
  const categories = useMemo(
    () => Array.from(new Set(learned.map((entry) => entry.category))).sort(),
    [learned],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return learned.filter((word) => {
      if (onlyFavorites && !word.favorite) return false;
      if (category !== 'all' && word.category !== category) return false;
      if (!term) return true;
      return (
        word.object.toLowerCase().includes(term) ||
        Object.values(word.words).some((value) => (value ?? '').toLowerCase().includes(term)) ||
        Object.values(word.romanizations ?? {}).some((value) =>
          (value ?? '').toLowerCase().includes(term),
        )
      );
    });
  }, [learned, query, onlyFavorites, category]);

  const hasFilters = Boolean(query.trim()) || onlyFavorites || category !== 'all';

  function handleFavorite(wordId: string) {
    hapticSelection();
    toggleFavorite(wordId);
  }

  function handleSpeak(word: string, code: LangCode) {
    hapticSelection();
    countAudio();
    speakWord(word, code).catch(() => undefined);
  }

  function handleShare(word: LearnedWord) {
    hapticSelection();
    setShareWord({
      object: word.object,
      emoji: word.emoji,
      category: word.category,
      words: word.words,
    });
  }

  function clearFilters() {
    setQuery('');
    setCategory('all');
    setOnlyFavorites(false);
  }

  const header = (
    <View>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Study Library</Text>
          <Text style={styles.subtitle}>
            {learned.length === 0
              ? 'Your multilingual collection starts with one photo'
              : `${learned.length} ${learned.length === 1 ? 'saved word' : 'saved words'} · ${learningLangs.length} active ${learningLangs.length === 1 ? 'language' : 'languages'}`}
          </Text>
        </View>
        <IconButton
          icon="layers-outline"
          size={40}
          background={colors.violetSoft}
          color={colors.violet}
          accessibilityLabel="Review flashcards"
          onPress={() => router.push('/review')}
        />
      </View>

      <View style={{ marginBottom: spacing.md }}>
        <KamuGuideBanner screen="library" />
      </View>

      {due > 0 ? (
        <Pressable
          onPress={() => router.push('/review')}
          accessibilityRole="button"
          accessibilityLabel={`Review ${due} due flashcards`}
          style={({ pressed }) => [styles.dueCard, { opacity: pressed ? 0.75 : 1 }]}>
          <View style={styles.dueIcon}>
            <Ionicons name="layers" size={18} color={colors.violet} />
          </View>
          <View style={styles.dueBody}>
            <Text style={styles.dueTitle}>
              {due} {due === 1 ? 'word ready for review' : 'words ready for review'}
            </Text>
            <Text style={styles.dueText}>Quick spaced-repetition flashcards (+XP).</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textDim} />
        </Pressable>
      ) : null}

      <View style={styles.search}>
        <Ionicons name="search" size={16} color={colors.textDim} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search in English, Español, 日本語, हिन्दी, 中文 or Pinyin…"
          placeholderTextColor={colors.textDim}
          style={styles.searchInput}
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Search saved vocabulary"
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={16} color={colors.textDim} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}>
        <FilterChip
          label="All"
          active={category === 'all' && !onlyFavorites}
          onPress={() => {
            setOnlyFavorites(false);
            setCategory('all');
          }}
        />
        <FilterChip
          label="★ Favorites"
          active={onlyFavorites}
          onPress={() => setOnlyFavorites((value) => !value)}
        />
        {categories.map((item) => (
          <FilterChip
            key={item}
            label={item}
            active={category === item}
            onPress={() => setCategory((value) => (value === item ? 'all' : item))}
          />
        ))}
      </ScrollView>

      {hasFilters && filtered.length > 0 ? (
        <View style={styles.resultRow}>
          <Text style={styles.resultText}>
            {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
          </Text>
          <Pressable onPress={clearFilters} hitSlop={8}>
            <Text style={styles.clearText}>Clear filters</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );

  const empty = (
    <View style={styles.empty}>
      <Kamu
        size={132}
        mood={hasFilters ? 'confused' : 'sleepy'}
        pointing={hasFilters ? 'right' : null}
        color={colors.violet}
      />
      <Text style={styles.emptyTitle}>
        {hasFilters ? 'No matching words' : 'Your library is empty'}
      </Text>
      <Text style={styles.emptyText}>
        {hasFilters
          ? 'Try another search term, script, or clear the active category filters.'
          : pickLine(KAMU_EMPTY_LINES, 1)}
      </Text>
      {hasFilters ? (
        <GhostButton
          label="Clear Filters"
          icon="close"
          onPress={clearFilters}
          style={styles.emptyButton}
        />
      ) : (
        <PrimaryButton
          label="Snap a Photo"
          icon="camera"
          onPress={() => router.push('/(tabs)')}
          style={styles.emptyButton}
        />
      )}
    </View>
  );

  return (
    <Screen>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        renderItem={({ item }) => (
          <WordRow
            word={item}
            activeLangs={learningLangs}
            onFavorite={() => handleFavorite(item.id)}
            onShare={() => handleShare(item)}
            onSpeak={handleSpeak}
          />
        )}
      />

      <ShareCardModal word={shareWord} onClose={() => setShareWord(null)} />
    </Screen>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.filterChip,
        active && styles.filterChipActive,
        { opacity: pressed ? 0.7 : 1 },
      ]}>
      <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>{label}</Text>
    </Pressable>
  );
}

function WordRow({
  word,
  activeLangs,
  onFavorite,
  onShare,
  onSpeak,
}: {
  word: LearnedWord;
  activeLangs: LangCode[];
  onFavorite: () => void;
  onShare: () => void;
  onSpeak: (value: string, code: LangCode) => void;
}) {
  const available = LANGUAGES.filter(
    (language) => activeLangs.includes(language.code) && Boolean(word.words[language.code]),
  );
  const displayList =
    available.length > 0
      ? available
      : LANGUAGES.filter((language) => Boolean(word.words[language.code]));
  const created = new Date(word.createdAt);
  const dateLabel = Number.isNaN(created.getTime())
    ? ''
    : created.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.emoji}>{word.emoji}</Text>
        <View style={styles.cardTitle}>
          <Text style={styles.object} numberOfLines={1}>
            {word.object}
          </Text>
          <Text style={styles.meta}>
            {word.category} · {displayList.length} languages{dateLabel ? ` · ${dateLabel}` : ''}
          </Text>
        </View>
        <Pressable
          onPress={onFavorite}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityState={{ selected: Boolean(word.favorite) }}
          accessibilityLabel={word.favorite ? 'Remove from favorites' : 'Add to favorites'}
          style={({ pressed }) => [styles.smallButton, { opacity: pressed ? 0.6 : 1 }]}>
          <Ionicons
            name={word.favorite ? 'star' : 'star-outline'}
            size={19}
            color={word.favorite ? colors.amber : colors.textDim}
          />
        </Pressable>
        <Pressable
          onPress={onShare}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Share card for ${word.object}`}
          style={({ pressed }) => [styles.smallButton, { opacity: pressed ? 0.6 : 1 }]}>
          <Ionicons name="share-outline" size={19} color={colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.words}>
        {displayList.map((language) => {
          const nativeWord = word.words[language.code] ?? '';
          const roma = word.romanizations?.[language.code] ?? '';
          const showRoma =
            Boolean(roma) && roma.toLowerCase() !== nativeWord.toLowerCase();
          return (
            <Pressable
              key={language.code}
              onPress={() => onSpeak(nativeWord, language.code)}
              accessibilityRole="button"
              accessibilityLabel={`Listen to ${nativeWord} in ${language.name}`}
              style={({ pressed }) => [
                styles.wordChip,
                { borderColor: `${language.tint}33`, opacity: pressed ? 0.65 : 1 },
              ]}>
              <Text style={styles.wordFlag}>{language.flag}</Text>
              <Text style={[styles.wordValue, { color: language.tint }]} numberOfLines={1}>
                {nativeWord}
                {showRoma ? ` (${roma})` : ''}
              </Text>
              <Ionicons name="volume-medium" size={11} color={language.tint} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 3,
  },
  dueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.violetSoft,
    borderWidth: 1,
    borderColor: 'rgba(155,140,255,0.28)',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  dueIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: 'rgba(155,140,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dueBody: {
    flex: 1,
  },
  dueTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  dueText: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 46,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    paddingVertical: 0,
  },
  filters: {
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingRight: spacing.lg,
  },
  filterChip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  filterChipActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  filterLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  filterLabelActive: {
    color: colors.accent,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  resultText: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '600',
  },
  clearText: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '700',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emoji: {
    fontSize: 28,
  },
  cardTitle: {
    flex: 1,
  },
  object: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    textTransform: 'capitalize',
  },
  meta: {
    color: colors.textDim,
    fontSize: 10,
    marginTop: 2,
  },
  smallButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  words: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.md,
  },
  wordChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    maxWidth: '100%',
  },
  wordFlag: {
    fontSize: 11,
  },
  wordValue: {
    fontSize: 12,
    fontWeight: '700',
    flexShrink: 1,
  },
  empty: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
    marginTop: spacing.md,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  emptyButton: {
    alignSelf: 'stretch',
    marginTop: spacing.lg,
  },
});
