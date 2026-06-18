export interface SugSong {
  videoId: string;
  title: string;
  thumbnail: string;
  channel: string;
  duration: string;
  seconds: number;
}

export interface GenreCategory {
  id: string;
  name: string;
  songs: SugSong[]; // Kept for type compatibility on frontend state
}

export const GENRE_DATA: GenreCategory[] = [
  { id: "pop", name: "Pop Anthems", songs: [] },
  { id: "rock", name: "Rock Classics", songs: [] },
  { id: "rnb", name: "R&B & Soul", songs: [] },
  { id: "party", name: "Party Classics", songs: [] },
  { id: "disney", name: "Disney & Musicals", songs: [] },
  { id: "country", name: "Country Hits", songs: [] },
  { id: "hiphop", name: "Hip Hop & Rap", songs: [] },
  { id: "retro", name: "80s & 90s Gold", songs: [] },
  { id: "latin", name: "Latin Beats", songs: [] },
  { id: "love", name: "Love Ballads", songs: [] },
  { id: "kpop", name: "K-Pop Hits", songs: [] },
  { id: "anime", name: "Anime & J-Rock", songs: [] },
  { id: "broadway", name: "Broadway & Stage", songs: [] },
  { id: "indie", name: "Indie & Alternative", songs: [] },
  { id: "rap", name: "90s / 00s Old School", songs: [] },
  { id: "acoustic", name: "Acoustic Ballads", songs: [] }
];
