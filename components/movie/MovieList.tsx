import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { Movie } from '../../types';

const MovieCard = ({ movie, darkMode }: { movie: Movie; darkMode?: boolean }) => {
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const isFav = isFavorite(movie.id);

  return (
    <TouchableOpacity
      style={styles.movieCard}
      onPress={() => router.push({ pathname: '/movie/[id]', params: { id: movie.id } })}
    >
      <Image
        source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
        style={styles.moviePoster}
      />
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={() => toggleFavorite(movie.id)}
      >
        <Ionicons
          name={isFav ? 'heart' : 'heart-outline'}
          size={20}
          color={isFav ? '#EF4444' : '#fff'}
        />
      </TouchableOpacity>
      <Text
        style={[styles.movieTitle, { color: darkMode ? '#fff' : '#000' }]}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {movie.title}
      </Text>
    </TouchableOpacity>
  );
};

export const MovieList = ({ title, movies, darkMode }: { title: string; movies: Movie[]; darkMode?: boolean }) => {
  if (!movies || movies.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: darkMode ? '#fff' : '#000' }]}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {movies.map((movie, index) => (
          <MovieCard key={`${movie.id}-${movie.title}-${index}`} movie={movie} darkMode={darkMode} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
    paddingLeft: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  movieCard: {
    width: 150,
    marginRight: 12,
  },
  moviePoster: {
    width: 150,
    height: 200,
    borderRadius: 10,
  },
  favoriteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
  },
  movieTitle: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: '500',
  },
});
