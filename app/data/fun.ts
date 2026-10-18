/* The fun mode's shelf of things I like. Fill these in yourself: nothing
   here is guessed. While a list is empty its shelf stays hidden. */

export interface Favourite {
  title: string;
  /** Optional: a year, a platform, or one line on why. */
  note?: string;
}

export const favoriteGames: Favourite[] = [];

export const favoriteMovies: Favourite[] = [];
