export interface GenreTag {
  id: string;
  name: string;
  color: string;
  bg: string;
  border: string;
}

export const GENRE_TAGS: Record<string, GenreTag> = {
  pop: { id: 'pop', name: 'Pop Anthem', color: 'text-pink-700', bg: 'bg-pink-50', border: 'border-pink-200' },
  rock: { id: 'rock', name: 'Rock Classic', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
  rnb: { id: 'rnb', name: 'R&B & Soul', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
  party: { id: 'party', name: 'Party Classic', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  disney: { id: 'disney', name: 'Disney & Classic Movie', color: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200' },
  country: { id: 'country', name: 'Country Hit', color: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-200' },
  hiphop: { id: 'hiphop', name: 'Hip Hop & Rap', color: 'text-cyan-700', bg: 'bg-cyan-50', border: 'border-cyan-200' },
  retro: { id: 'retro', name: 'Gold Retro', color: 'text-yellow-800', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  latin: { id: 'latin', name: 'Latin Beat', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
  love: { id: 'love', name: 'Love Ballad', color: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-200' },
  kpop: { id: 'kpop', name: 'K-Pop', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  anime: { id: 'anime', name: 'Anime / J-Rock', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  broadway: { id: 'broadway', name: 'Broadway / Stage', color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200' },
  indie: { id: 'indie', name: 'Indie & Alternative', color: 'text-fuchsia-700', bg: 'bg-fuchsia-50', border: 'border-fuchsia-200' },
  acoustic: { id: 'acoustic', name: 'Acoustic / Piano', color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-300' }
};

// Genre Matchers dictionary
const GENRE_RULES: Array<{ id: string; keywords: string[]; subKeywords?: string[] }> = [
  // K-POP Rules
  {
    id: 'kpop',
    keywords: [
      'kpop', 'k-pop', 'bts', 'blackpink', 'twice', 'aespa', 'newjeans', 'stray kids', 
      'exo', 'red velvet', 'txt', 'itzy', 'seventeen', 'girls\' generation', 'super junior', 
      'bigbang', 'g-dragon', 'kdrama', 'hallyu', 'mamamoo', 'ive', 'le sserafim', 'shinee'
    ]
  },
  // Anime & J-Rock Rules
  {
    id: 'anime',
    keywords: [
      'anime', 'jrock', 'j-rock', 'jpop', 'j-pop', 'opening theme', 'ending theme', 'yoasobi', 
      'lisa', 'radwimps', 'naruto', 'one piece', 'attack on titan', 'shingeki', 'evangelion', 
      'ghibli', 'vocaloid', 'hatsune miku', 'kenshi yonezu', 'flow', 'kana-boon', 'asian kung-fu'
    ]
  },
  // Broadway & Stage Rules
  {
    id: 'broadway',
    keywords: [
      'broadway', 'musical', 'soundtrack version', 'showtunes', 'hamilton', 'wicked', 
      'phantom of the opera', 'chicago', 'les miserables', 'hadestown', 'dear evan hansen', 
      'rent', 'west side story', 'cats musical', 'cabaret', 'hairspray', 'mamma mia'
    ]
  },
  // Disney Movie Rules
  {
    id: 'disney',
    keywords: [
      'disney', 'frozen', 'moana', 'encanto', 'tangled', 'mulan', 'lion king', 'aladdin', 
      'beauty and the beast', 'little mermaid', 'hercules', 'pocahontas', 'pixar', 'toy story', 
      'lin-manuel miranda', 'idina menzel', 'how far i\'ll go', 'let it go', 'we don\'t talk about'
    ]
  },
  // R&B & Soul Rules
  {
    id: 'rnb',
    keywords: [
      'rnb', 'r&b', 'soul', 'motown', 'alicia keys', 'usher', 'sza', 'the weeknd', 'marvin gaye', 
      'stevie wonder', 'erykah badu', 'frank ocean', 'kehlani', 'destiny\'s child', 'beyonce', 
      'john legend', 'sade', 'neosoul', 'neo-soul', 'aretha franklin', 'amy winehouse', 'chaka khan'
    ]
  },
  // Hip Hop & Rap Rules
  {
    id: 'hiphop',
    keywords: [
      'hiphop', 'hip hop', 'rap', 'eminem', 'drake', 'tupac', '2pac', 'notorious big', 'biggie', 
      'snoop dogg', 'jay-z', 'kanye', 'kendrick lamar', 'j. cole', 'travis scott', 'cardi b', 
      'nicki minaj', 'outkast', 'dr drain', 'dr. dre', 'coolio', 'dr dre', 'missy elliott', 'ice cube'
    ]
  },
  // Country Hits Rules
  {
    id: 'country',
    keywords: [
      'country', 'dolly parton', 'carrie underwood', 'morgan wallen', 'luke combs', 'shania twain', 
      'johnny cash', 'willie nelson', 'garth brooks', 'tim mcgraw', 'taylor swift country', 
      'rascal flatts', 'luke bryan', 'blake shelton', 'whiskey', 'bluegrass', 'nashville', 
      'zack bryan', 'kacey musgraves', 'chris stapleton'
    ]
  },
  // Latin Beats Rules
  {
    id: 'latin',
    keywords: [
      'latin', 'reggaeton', 'bad bunny', 'shakira', 'j balvin', 'maluma', 'daddy yankee', 
      'luis fonsi', 'enrique iglesias', 'rosalia', 'karol g', 'salsa', 'bachata', 'cumbia', 
      'mariachi', 'camila cabello', 'selena quintanilla', 'ricky martin', 'marc anthony'
    ]
  },
  // Acoustic / Piano cover Rules
  {
    id: 'acoustic',
    keywords: [
      'acoustic', 'piano version', 'unplugged', 'guitar cover', 'piano cover', 'stripped version', 
      'live acoustic', 'cello cover', 'violin cover', 'ukulele'
    ]
  },
  // Indie & Alternative Rules
  {
    id: 'indie',
    keywords: [
      'indie', 'alternative', 'arctic monkeys', 'tame impala', 'lana del rey', 'the xx', 
      'foals', 'boygenius', 'phoebe bridgers', 'clairo', 'wallows', 'florence', 'mac demarco', 
      'death cab', 'the smiths', 'pixies', 'radiohead', 'oasis', 'blur', 'pavement'
    ]
  },
  // Love Ballads Rules
  {
    id: 'love',
    keywords: [
      'love song', 'love ballad', 'romance', 'wedding', 'celine dion', 'whitney houston', 
      'always be my', 'can\'t help falling', 'my heart will go on', 'make you feel my love', 
      'at last', 'unchained melody', 'perfect ed sheeran', 'all of me john legend'
    ]
  },
  // Gold Retro (80s & 90s) Rules
  {
    id: 'retro',
    keywords: [
      '80s', '90s', '70s', 'classic hit', 'disco', 'abba', 'michael jackson', 'madonna', 'queen', 
      'prince', 'bee gees', 'elton john', 'david bowie', 'wham', 'george michael', 'phil collins', 
      'fleetwood mac', 'cyndi lauper', 'earth wind & fire', 'stevie nicks', 'journey', 'bon jovi'
    ]
  },
  // Rock Classics Rules
  {
    id: 'rock',
    keywords: [
      'rock', 'metal', 'grunge', 'hard rock', 'punk', 'guns n\' roses', 'led zeppelin', 'ac/dc', 
      'metallica', 'nirvana', 'green day', 'linkin park', 'u2', 'rolling stones', 'eagles', 
      'foo fighters', 'pink floyd', 'red hot chili peppers', 'aerosmith', 'nickelback', 'creed'
    ]
  },
  // Party Classics Rules
  {
    id: 'party',
    keywords: [
      'party', 'dance anthem', 'club classic', 'lmfao', 'pitbull', 'david guetta', 'calvin harris', 
      'daft punk', 'avicii', 'dance hits', 'uptown funk', 'celebration', 'dancing queen'
    ]
  },
  // Pop Anthems Rules (if contains major pop singers)
  {
    id: 'pop',
    keywords: [
      'pop', 'taylor swift', 'ariana grande', 'dua lipa', 'billie eilish', 'justin bieber', 
      'katy perry', 'rihanna', 'bruno mars', 'ed sheeran', 'shawn mendes', 'halsey', 
      'miley cyrus', 'olivia rodrigo', 'sabrina carpenter', 'shawn mendes', 'maroon 5', 
      'selena gomez', 'britney spears', 'lady gaga', 'one direction', 'coldplay'
    ]
  }
];

/**
 * Heuristically identifies appropriate genres for a song based on title and channel
 */
export function identifySongTags(title: string, channel: string): GenreTag[] {
  const normTitle = title.toLowerCase();
  const normChannel = channel.toLowerCase();
  const matchingIds = new Set<string>();

  // Run through rule categories to find matching genre IDs
  for (const rule of GENRE_RULES) {
    const isMatched = rule.keywords.some((keyword) => {
      // Check if keyword is standalone whole phrase or matches directly
      if (normTitle.includes(keyword) || normChannel.includes(keyword)) {
        return true;
      }
      return false;
    });

    if (isMatched) {
      matchingIds.add(rule.id);
    }
  }

  // Always return at least some tags
  if (matchingIds.size === 0) {
    // If has classic artist keywords but no genre, default retro
    if (
      normTitle.includes('karaoke version') || 
      normTitle.includes('sing along') || 
      normTitle.includes('karaoke')
    ) {
      // Try to give a tag based on title indicators
      if (normTitle.includes('slow') || normTitle.includes('ballad')) {
        matchingIds.add('love');
      } else if (normTitle.includes('heavy') || normTitle.includes('guitar')) {
        matchingIds.add('rock');
      } else {
        matchingIds.add('pop'); // Default base category
      }
    } else {
      matchingIds.add('pop'); // Fallback
    }
  }

  // Resolve ID list to Full GenreTag structures (Limit to max 2 tags for clean visual space)
  const resolvedTags: GenreTag[] = [];
  Array.from(matchingIds).slice(0, 2).forEach((id) => {
    if (GENRE_TAGS[id]) {
      resolvedTags.push(GENRE_TAGS[id]);
    }
  });

  return resolvedTags;
}
