import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

interface FilterPanelProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

export interface FilterOptions {
  yearRange: [number, number];
  genres: number[];
  minRating: number;
  sortBy: 'popularity.desc' | 'vote_average.desc' | 'release_date.desc' | 'title.asc';
}

const GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 18, name: 'Drama' },
  { id: 14, name: 'Fantasy' },
  { id: 27, name: 'Horror' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' },
];

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'release_date.desc', label: 'Newest First' },
  { value: 'title.asc', label: 'A-Z' },
];

export default function FilterPanel({ visible, onClose, onApply, currentFilters }: FilterPanelProps) {
  const [yearRange, setYearRange] = useState<[number, number]>(currentFilters.yearRange);
  const [selectedGenres, setSelectedGenres] = useState<number[]>(currentFilters.genres);
  const [minRating, setMinRating] = useState(currentFilters.minRating);
  const [sortBy, setSortBy] = useState(currentFilters.sortBy);

  const toggleGenre = (genreId: number) => {
    if (selectedGenres.includes(genreId)) {
      setSelectedGenres(selectedGenres.filter(id => id !== genreId));
    } else {
      setSelectedGenres([...selectedGenres, genreId]);
    }
  };

  const handleApply = () => {
    onApply({ yearRange, genres: selectedGenres, minRating, sortBy });
    onClose();
  };

  const handleReset = () => {
    setYearRange([1990, 2025]);
    setSelectedGenres([]);
    setMinRating(0);
    setSortBy('popularity.desc');
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Filters</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Year Range */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Year Range</Text>
            <Text style={styles.rangeText}>{yearRange[0]} - {yearRange[1]}</Text>
            <View style={styles.yearButtons}>
              <TouchableOpacity style={styles.yearButton} onPress={() => setYearRange([1990, 2000])}>
                <Text style={styles.yearButtonText}>90s</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.yearButton} onPress={() => setYearRange([2000, 2010])}>
                <Text style={styles.yearButtonText}>2000s</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.yearButton} onPress={() => setYearRange([2010, 2020])}>
                <Text style={styles.yearButtonText}>2010s</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.yearButton} onPress={() => setYearRange([2020, 2025])}>
                <Text style={styles.yearButtonText}>2020s</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.yearButton} onPress={() => setYearRange([1990, 2025])}>
                <Text style={styles.yearButtonText}>All</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Genres */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Genres</Text>
            <View style={styles.genresGrid}>
              {GENRES.map((genre) => (
                <TouchableOpacity
                  key={genre.id}
                  style={[styles.genreChip, selectedGenres.includes(genre.id) && styles.genreChipSelected]}
                  onPress={() => toggleGenre(genre.id)}
                >
                  <Text style={[styles.genreText, selectedGenres.includes(genre.id) && styles.genreTextSelected]}>
                    {genre.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Rating */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Minimum Rating</Text>
            <Text style={styles.ratingText}>{minRating.toFixed(1)}+ ⭐</Text>
            <View style={styles.ratingButtons}>
              {[0, 5, 6, 7, 8, 9].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[styles.ratingButton, minRating === rating && styles.ratingButtonSelected]}
                  onPress={() => setMinRating(rating)}
                >
                  <Text style={[styles.ratingButtonText, minRating === rating && styles.ratingButtonTextSelected]}>
                    {rating === 0 ? 'Any' : `${rating}+`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sort By */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sort By</Text>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.sortOption, sortBy === option.value && styles.sortOptionSelected]}
                onPress={() => setSortBy(option.value as any)}
              >
                <Text style={[styles.sortText, sortBy === option.value && styles.sortTextSelected]}>
                  {option.label}
                </Text>
                {sortBy === option.value && <Ionicons name="checkmark" size={20} color="#9333EA" />}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: '#2D2D2D' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  content: { flex: 1, padding: 20 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  rangeText: { fontSize: 16, color: '#9CA3AF', marginBottom: 12 },
  yearButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  yearButton: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#1E1E1E', borderRadius: 8, borderWidth: 1, borderColor: '#2D2D2D' },
  yearButtonText: { color: '#9CA3AF', fontSize: 14, fontWeight: '500' },
  ratingText: { fontSize: 20, fontWeight: 'bold', color: '#FCD34D', marginBottom: 12 },
  ratingButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ratingButton: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#1E1E1E', borderRadius: 8, borderWidth: 1, borderColor: '#2D2D2D' },
  ratingButtonSelected: { backgroundColor: '#9333EA', borderColor: '#9333EA' },
  ratingButtonText: { color: '#9CA3AF', fontSize: 14, fontWeight: '500' },
  ratingButtonTextSelected: { color: '#fff' },
  genresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  genreChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1E1E1E', borderWidth: 1, borderColor: '#2D2D2D' },
  genreChipSelected: { backgroundColor: '#9333EA', borderColor: '#9333EA' },
  genreText: { color: '#9CA3AF', fontSize: 14, fontWeight: '500' },
  genreTextSelected: { color: '#fff' },
  sortOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#1E1E1E', borderRadius: 8, marginBottom: 8 },
  sortOptionSelected: { backgroundColor: '#2D1B4E', borderWidth: 1, borderColor: '#9333EA' },
  sortText: { fontSize: 16, color: '#9CA3AF' },
  sortTextSelected: { color: '#fff', fontWeight: '600' },
  footer: { flexDirection: 'row', padding: 16, gap: 12, borderTopWidth: 1, borderTopColor: '#2D2D2D' },
  resetButton: { flex: 1, padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#2D2D2D', alignItems: 'center' },
  resetButtonText: { color: '#9CA3AF', fontWeight: '600', fontSize: 16 },
  applyButton: { flex: 2, padding: 16, borderRadius: 8, backgroundColor: '#9333EA', alignItems: 'center' },
  applyButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
