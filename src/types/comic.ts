export interface ComicPanel {
  panel: number;
  title: string;
  scene_description: string;
  caption?: string;
  narration?: string;
  dialogue?: string;
  image_prompt: string;
  image_url: string;
}

export interface ComicData {
  id: string;
  title: string;
  prompt: string;
  character_name: string;
  setting: string;
  tone: string;
  style: string;
  createdAt: string;
  layout: ComicPanel[];
}

export interface PresetStory {
  title: string;
  prompt: string;
  character_name: string;
  setting: string;
  tone: string;
  style: string;
  icon: string;
}

export const SETTING_OPTIONS = [
  'Forest',
  'School',
  'Space',
  'City',
  'Haunted Castle',
  'Underwater Kingdom',
  'Cyberpunk Metropolis',
  'Ancient Ruins',
  'Volcano Lair',
];

export const TONE_OPTIONS = [
  'dramatic',
  'light-hearted',
  'funny',
  'poetic',
  'suspenseful',
  'heroic',
];

export const ART_STYLE_OPTIONS = [
  'comic book',
  'anime',
  'pixel art',
  'realistic',
  'watercolor',
  'graphic novel',
  'noir',
];

export const STORY_PRESETS: PresetStory[] = [
  {
    title: 'The Brave Fox of Silverstream',
    prompt: 'A brave fox exploring an enchanted forest finds a radiant crystal that awakens the slumbering ancient spirits.',
    character_name: 'Free',
    setting: 'Forest',
    tone: 'dramatic',
    style: 'realistic',
    icon: '🦊',
  },
  {
    title: 'Neon Shadows of Neo-Tokyo',
    prompt: 'A robotic rogue investigator uncovers a glitch in the city central AI that threatens all cybernetics.',
    character_name: 'Vector',
    setting: 'Cyberpunk Metropolis',
    tone: 'suspenseful',
    style: 'comic book',
    icon: '🤖',
  },
  {
    title: 'The Lost Astronaut',
    prompt: 'An astronaut crash-lands on a crystalline exoplanet and communicates with singing crystalline flora.',
    character_name: 'Captain Stella',
    setting: 'Space',
    tone: 'poetic',
    style: 'anime',
    icon: '🚀',
  },
  {
    title: 'Cafeteria Sorcery',
    prompt: 'A quirky teenage wizard accidentally casts a levitation spell during the high school chili bake-off.',
    character_name: 'Pip',
    setting: 'School',
    tone: 'funny',
    style: 'comic book',
    icon: '✨',
  },
];
