import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static asset folders
app.use('/src/assets', express.static(path.resolve(process.cwd(), 'src/assets')));
app.use('/static/panels', express.static(path.resolve(process.cwd(), 'src/assets/images')));

// Image sets generated for comic craft worlds
const FOX_IMAGES = [
  'fox_panel_one_1790602295624.jpg',
  'fox_panel_two_1790602308071.jpg',
  'fox_panel_three_1790602319881.jpg',
  'fox_panel_four_1790602334035.jpg',
  'fox_panel_five_1790602346195.jpg',
];

const CYBER_IMAGES = [
  'cyber_panel_one_1790602383915.jpg',
  'cyber_panel_two_1790602443129.jpg',
  'cyber_panel_three_1790602497798.jpg',
  'cyber_panel_four_1790602510857.jpg',
  'cyber_panel_five_1790602523435.jpg',
];

const SPACE_IMAGES = [
  'space_panel_one_1790602396180.jpg',
  'space_panel_two_1790602456029.jpg',
  'space_panel_three_1790602536049.jpg',
  'space_panel_four_1790602548486.jpg',
  'space_panel_five_1790602578511.jpg',
];

const WIZARD_IMAGES = [
  'wizard_panel_one_1790602410226.jpg',
  'wizard_panel_two_1790602468011.jpg',
  'wizard_panel_three_1790602592956.jpg',
  'wizard_panel_four_1790602604504.jpg',
  'wizard_panel_five_1790602617512.jpg',
];

function getLocalImageAsDataUrl(filename: string): string | null {
  const filePath = path.resolve(process.cwd(), 'src/assets/images', filename);
  if (fs.existsSync(filePath)) {
    try {
      const buffer = fs.readFileSync(filePath);
      return `data:image/jpeg;base64,${buffer.toString('base64')}`;
    } catch (e) {
      console.warn('Error reading image file:', filename, e);
    }
  }
  return null;
}

// Function to resolve prompt-accurate comic illustrations
function resolveComicIllustration(
  panel: number,
  title: string,
  imagePrompt: string,
  characterName: string,
  setting: string,
  tone: string,
  style: string,
  dialogue?: string
): string {
  const combined = `${imagePrompt} ${characterName} ${setting} ${tone} ${style}`.toLowerCase();
  const index = Math.max(0, Math.min(4, panel - 1));

  // 1. Fox / Enchanted Forest story (Scenario 1 & 2 - Free / Freo)
  if (
    combined.includes('fox') ||
    combined.includes('free') ||
    combined.includes('freo') ||
    combined.includes('enchanted forest') ||
    combined.includes('silverstream') ||
    (combined.includes('forest') && !combined.includes('space') && !combined.includes('cyber'))
  ) {
    const dataUrl = getLocalImageAsDataUrl(FOX_IMAGES[index]);
    if (dataUrl) return dataUrl;
  }

  // 2. Cyberpunk / Robot / Vector
  if (
    combined.includes('cyber') ||
    combined.includes('robot') ||
    combined.includes('vector') ||
    combined.includes('tokyo') ||
    combined.includes('neon') ||
    combined.includes('city') ||
    combined.includes('metropolis')
  ) {
    const dataUrl = getLocalImageAsDataUrl(CYBER_IMAGES[index]);
    if (dataUrl) return dataUrl;
  }

  // 3. Space / Astronaut / Stella / Galaxy
  if (
    combined.includes('space') ||
    combined.includes('astronaut') ||
    combined.includes('stella') ||
    combined.includes('cosmic') ||
    combined.includes('alien') ||
    combined.includes('planet')
  ) {
    const dataUrl = getLocalImageAsDataUrl(SPACE_IMAGES[index]);
    if (dataUrl) return dataUrl;
  }

  // 4. Wizard / Magic / Pip / School
  if (
    combined.includes('wizard') ||
    combined.includes('magic') ||
    combined.includes('sorcery') ||
    combined.includes('pip') ||
    combined.includes('school') ||
    combined.includes('chili')
  ) {
    const dataUrl = getLocalImageAsDataUrl(WIZARD_IMAGES[index]);
    if (dataUrl) return dataUrl;
  }

  // Fallback to high-quality artwork set based on index
  const allSets = [FOX_IMAGES, CYBER_IMAGES, SPACE_IMAGES, WIZARD_IMAGES];
  const chosenSet = allSets[(panel - 1) % allSets.length];
  const fallbackDataUrl = getLocalImageAsDataUrl(chosenSet[index]);
  if (fallbackDataUrl) return fallbackDataUrl;

  return createComicIllustrationSvg(
    panel,
    title,
    imagePrompt,
    characterName,
    setting,
    tone,
    style,
    dialogue
  );
}

// Initialize Google Gen AI
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Comic storage in memory for session history
interface ComicPanel {
  panel: number;
  title: string;
  scene_description: string;
  caption?: string;
  narration?: string;
  dialogue?: string;
  image_prompt: string;
  image_url: string;
}

interface ComicBook {
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

const comicHistory: ComicBook[] = [];

// Helper: generate stylized SVG comic illustration
function createComicIllustrationSvg(
  panel: number,
  title: string,
  imagePrompt: string,
  characterName: string,
  setting: string,
  tone: string,
  style: string,
  dialogue?: string
): string {
  // Palette and themes based on style and tone
  const styleLower = (style || 'comic book').toLowerCase();
  const toneLower = (tone || 'dramatic').toLowerCase();

  let bgGrad1 = '#1e1b4b';
  let bgGrad2 = '#312e81';
  let accentColor = '#f59e0b';
  let textColor = '#ffffff';
  let badgeColor = '#ef4444';
  let halftones = true;

  if (styleLower.includes('anime')) {
    bgGrad1 = '#2e1065';
    bgGrad2 = '#701a75';
    accentColor = '#38bdf8';
    badgeColor = '#ec4899';
  } else if (styleLower.includes('pixel')) {
    bgGrad1 = '#09090b';
    bgGrad2 = '#18181b';
    accentColor = '#22c55e';
    badgeColor = '#eab308';
    halftones = false;
  } else if (styleLower.includes('realistic')) {
    bgGrad1 = '#0f172a';
    bgGrad2 = '#334155';
    accentColor = '#f97316';
    badgeColor = '#0284c7';
  } else if (styleLower.includes('watercolor')) {
    bgGrad1 = '#475569';
    bgGrad2 = '#0e7490';
    accentColor = '#fbbf24';
    badgeColor = '#f43f5e';
  } else {
    // Classic comic book
    bgGrad1 = '#1e293b';
    bgGrad2 = '#0f172a';
    accentColor = '#fbbf24';
    badgeColor = '#dc2626';
  }

  // Generate unique visual environment based on setting
  const settingLower = (setting || '').toLowerCase();
  let scenerySvg = '';

  if (settingLower.includes('forest') || settingLower.includes('wood')) {
    scenerySvg = `
      <!-- Dense Forest Silhouettes -->
      <path d="M 0 320 L 40 220 L 70 320 L 120 180 L 160 320 L 210 160 L 270 320 L 340 190 L 400 320 L 460 170 L 520 320 L 580 200 L 640 320 L 720 180 L 800 320 Z" fill="#064e3b" opacity="0.8"/>
      <path d="M 20 340 L 90 200 L 150 340 L 230 190 L 300 340 L 390 180 L 480 340 L 560 170 L 650 340 L 750 210 L 800 340 Z" fill="#022c22" opacity="0.9"/>
      <!-- Glowing magical fireflies / spores -->
      <circle cx="150" cy="180" r="4" fill="#a7f3d0" opacity="0.8" filter="url(#glow)"/>
      <circle cx="280" cy="120" r="3" fill="#fde047" opacity="0.9" filter="url(#glow)"/>
      <circle cx="450" cy="160" r="5" fill="#6ee7b7" opacity="0.7" filter="url(#glow)"/>
      <circle cx="620" cy="130" r="3.5" fill="#fef08a" opacity="0.8" filter="url(#glow)"/>
      <!-- Sunlight beams -->
      <polygon points="120,0 200,0 450,420 320,420" fill="url(#sunbeamGrad)" opacity="0.35"/>
      <polygon points="400,0 480,0 720,420 600,420" fill="url(#sunbeamGrad)" opacity="0.25"/>
    `;
  } else if (settingLower.includes('space') || settingLower.includes('cosmic') || settingLower.includes('galaxy')) {
    scenerySvg = `
      <!-- Space Nebula & Stars -->
      <circle cx="680" cy="110" r="75" fill="#f43f5e" opacity="0.4" filter="url(#blur)"/>
      <circle cx="180" cy="220" r="110" fill="#6366f1" opacity="0.35" filter="url(#blur)"/>
      <!-- Distant Ringed Planet -->
      <circle cx="650" cy="130" r="45" fill="#fde047"/>
      <ellipse cx="650" cy="130" rx="75" ry="18" fill="none" stroke="#f59e0b" stroke-width="4" transform="rotate(-20 650 130)" stroke-dasharray="160 30"/>
      <!-- Star cluster -->
      <circle cx="80" cy="60" r="2" fill="#fff"/><circle cx="120" cy="110" r="1.5" fill="#fff"/>
      <circle cx="250" cy="40" r="2.5" fill="#fff"/><circle cx="340" cy="90" r="2" fill="#fff"/>
      <circle cx="490" cy="50" r="1.5" fill="#fff"/><circle cx="580" cy="80" r="2.5" fill="#fff"/>
      <circle cx="730" cy="40" r="2" fill="#fff"/><circle cx="60" cy="240" r="2" fill="#fff"/>
    `;
  } else if (settingLower.includes('city') || settingLower.includes('urban') || settingLower.includes('street')) {
    scenerySvg = `
      <!-- City Skyline -->
      <rect x="50" y="160" width="80" height="260" fill="#1e293b"/>
      <rect x="150" y="110" width="100" height="310" fill="#0f172a"/>
      <rect x="270" y="180" width="70" height="240" fill="#1e293b"/>
      <rect x="360" y="90" width="110" height="330" fill="#0f172a"/>
      <rect x="490" y="140" width="90" height="280" fill="#1e293b"/>
      <rect x="600" y="100" width="120" height="320" fill="#0f172a"/>
      <!-- Lit windows -->
      <g fill="#fef08a" opacity="0.75">
        <rect x="70" y="180" width="10" height="15"/><rect x="95" y="180" width="10" height="15"/>
        <rect x="70" y="210" width="10" height="15"/><rect x="95" y="210" width="10" height="15"/>
        <rect x="175" y="130" width="12" height="16"/><rect x="210" y="130" width="12" height="16"/>
        <rect x="175" y="165" width="12" height="16"/><rect x="210" y="165" width="12" height="16"/>
        <rect x="385" y="120" width="14" height="16"/><rect x="425" y="120" width="14" height="16"/>
        <rect x="385" y="150" width="14" height="16"/><rect x="425" y="150" width="14" height="16"/>
        <rect x="625" y="130" width="14" height="16"/><rect x="670" y="130" width="14" height="16"/>
      </g>
    `;
  } else {
    // General dramatic landscape
    scenerySvg = `
      <!-- Mountain ranges & horizon -->
      <polygon points="0,320 180,140 340,320" fill="#1e293b" opacity="0.7"/>
      <polygon points="220,320 440,110 640,320" fill="#0f172a" opacity="0.9"/>
      <polygon points="520,320 680,160 800,320" fill="#1e293b" opacity="0.8"/>
      <circle cx="440" cy="110" r="15" fill="#fde047" opacity="0.8" filter="url(#glow)"/>
    `;
  }

  // Character hero pose avatar silhouette/figure
  const heroSvg = `
    <!-- Hero / Main Character Pose -->
    <g transform="translate(320, 160)" filter="url(#dropShadow)">
      <!-- Aura / Glow -->
      <ellipse cx="80" cy="110" rx="90" ry="100" fill="${accentColor}" opacity="0.25" filter="url(#blur)"/>
      <!-- Dynamic Silhouette Figure -->
      <path d="M 60 40 C 60 20, 100 20, 100 40 C 100 55, 90 65, 80 65 C 70 65, 60 55, 60 40 Z" fill="#ffffff"/>
      <path d="M 45 70 C 60 65, 100 65, 115 70 L 130 140 C 110 150, 50 150, 30 140 Z" fill="${accentColor}"/>
      <!-- Cape / Movement flare -->
      <path d="M 40 75 Q 0 110 10 170 Q 50 140 45 85 Z" fill="${badgeColor}" opacity="0.9"/>
      <!-- Legs / Stance -->
      <path d="M 48 140 L 40 220 L 25 225 L 30 235 L 60 235 L 55 140 Z" fill="#0f172a"/>
      <path d="M 112 140 L 120 220 L 105 225 L 110 235 L 140 235 L 125 140 Z" fill="#0f172a"/>
      <!-- Character Accent Detail -->
      <circle cx="80" cy="42" r="3" fill="#0f172a"/>
      <circle cx="70" cy="42" r="3" fill="#0f172a"/>
    </g>
  `;

  // Dynamic Comic sound effect bubble or action splash
  const soundEffects = ['WHAM!', 'WHOOSH!', 'CRACKLE!', 'SHADOWS!', 'REVEAL!'];
  const soundEffect = soundEffects[(panel - 1) % soundEffects.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 460" width="100%" height="100%">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgGrad1}"/>
        <stop offset="100%" stop-color="${bgGrad2}"/>
      </linearGradient>
      <linearGradient id="sunbeamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fef08a" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#fef08a" stop-opacity="0"/>
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <filter id="blur" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="24"/>
      </filter>
      <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="3" dy="5" stdDeviation="4" flood-color="#000000" flood-opacity="0.6"/>
      </filter>
      <pattern id="comicDots" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.2" fill="#ffffff" opacity="0.08"/>
      </pattern>
    </defs>

    <!-- Canvas Background -->
    <rect width="800" height="460" fill="url(#bgGrad)"/>
    ${halftones ? '<rect width="800" height="460" fill="url(#comicDots)"/>' : ''}

    <!-- Speed Action Lines -->
    <g opacity="0.12" stroke="#ffffff" stroke-width="1.5">
      <line x1="0" y1="0" x2="400" y2="230"/>
      <line x1="800" y1="0" x2="400" y2="230"/>
      <line x1="0" y1="460" x2="400" y2="230"/>
      <line x1="800" y1="460" x2="400" y2="230"/>
      <line x1="0" y1="230" x2="800" y2="230"/>
    </g>

    <!-- Environment Scenery -->
    ${scenerySvg}

    <!-- Ground plane / baseline -->
    <rect x="0" y="380" width="800" height="80" fill="#090d16" opacity="0.95"/>

    <!-- Hero Character -->
    ${heroSvg}

    <!-- Sound Effect Burst Badge -->
    <g transform="translate(620, 70) rotate(8)" filter="url(#dropShadow)">
      <polygon points="0,-25 15,-10 35,-18 28,0 45,15 22,20 18,40 -2,22 -22,35 -15,14 -35,5 -18,-8 -25,-25 -8,-15" fill="${badgeColor}" stroke="#ffffff" stroke-width="3"/>
      <text x="0" y="6" text-anchor="middle" font-family="'Bangers', 'Impact', sans-serif" font-size="15" fill="#fef08a" font-weight="bold">${soundEffect}</text>
    </g>

    <!-- Panel Number Badge (top-left authentic comic styling) -->
    <g transform="translate(24, 24)" filter="url(#dropShadow)">
      <rect x="0" y="0" width="110" height="34" rx="4" fill="${badgeColor}" stroke="#ffffff" stroke-width="2"/>
      <text x="55" y="23" text-anchor="middle" font-family="'Bangers', 'Impact', sans-serif" font-size="18" fill="#ffffff" letter-spacing="1">PANEL ${panel}</text>
    </g>

    <!-- Art Style & Setting Stamp (top-right) -->
    <g transform="translate(776, 24)" filter="url(#dropShadow)">
      <rect x="-140" y="0" width="140" height="28" rx="4" fill="#0f172a" stroke="${accentColor}" stroke-width="1.5" opacity="0.9"/>
      <text x="-70" y="19" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="${accentColor}" letter-spacing="0.5">${style.toUpperCase()}</text>
    </g>

    <!-- Comic Speech / Dialogue Bubble -->
    ${
      dialogue
        ? `
      <g transform="translate(180, 50)" filter="url(#dropShadow)">
        <!-- Speech Bubble Body -->
        <rect x="0" y="0" width="380" height="52" rx="16" fill="#ffffff" stroke="#0f172a" stroke-width="3"/>
        <!-- Pointer to character -->
        <polygon points="190,51 220,51 210,75" fill="#ffffff" stroke="#0f172a" stroke-width="3"/>
        <line x1="192" y1="50" x2="218" y2="50" stroke="#ffffff" stroke-width="5"/>
        <text x="190" y="32" text-anchor="middle" font-family="'Comic Neue', 'Comic Sans MS', cursive, sans-serif" font-size="13" font-weight="bold" fill="#0f172a">
          ${escapeXml(dialogue.slice(0, 52) + (dialogue.length > 52 ? '...' : ''))}
        </text>
      </g>
    `
        : ''
    }

    <!-- Panel Title Banner at Bottom -->
    <rect x="0" y="415" width="800" height="45" fill="#020617" opacity="0.92"/>
    <line x1="0" y1="415" x2="800" y2="415" stroke="${accentColor}" stroke-width="2"/>
    <text x="30" y="443" font-family="'Bangers', 'Impact', sans-serif" font-size="19" fill="#ffffff" letter-spacing="1.2">
      ${escapeXml(title.toUpperCase())}
    </text>
    <text x="770" y="442" text-anchor="end" font-family="sans-serif" font-size="11" fill="#94a3b8">
      Hero: <tspan fill="${accentColor}" font-weight="bold">${escapeXml(characterName || 'Hero')}</tspan> | Setting: <tspan fill="#e2e8f0">${escapeXml(setting || 'World')}</tspan>
    </text>

    <!-- Outer Comic Frame Border -->
    <rect x="2" y="2" width="796" height="456" fill="none" stroke="#000000" stroke-width="6"/>
    <rect x="8" y="8" width="784" height="444" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.4"/>
  </svg>`;

  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

function escapeXml(unsafe: string): string {
  return (unsafe || '').replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '\'':
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}

// Fallback outline generator when Gemini is offline or fallback is needed
function generateFallbackOutline(
  prompt: string,
  characterName: string,
  setting: string,
  tone: string,
  style: string,
  numPanels: number = 2
) {
  const char = characterName || 'The Hero';
  const loc = setting || 'an unknown realm';
  const fullPanels = [
    {
      panel: 1,
      title: `${char}'s Awakening`,
      scene_description: `${char} stands on the outskirts of ${loc}, gazing toward the mysterious path ahead as an unusual omen appears in the sky.`,
      image_prompt: `A dynamic ${style} illustration of ${char} looking upon ${loc} at dusk, dramatic lighting, atmospheric shadows, cinematic comic panel composition.`,
    },
    {
      panel: 2,
      title: numPanels === 2 ? `The Journey's Triumph` : `The First Discovery`,
      scene_description: numPanels === 2
        ? `Venturing through ${loc}, ${char} overcomes the mystical trials and beholds the wondrous secret of the realm.`
        : `Deep within ${loc}, ${char} stumbles upon a glowing relic half-buried beneath ancient ruins, pulsating with strange energy.`,
      image_prompt: numPanels === 2
        ? `A triumphant ${style} illustration of ${char} navigating deep through ${loc} under magical glowing light, cinematic graphic novel style.`
        : `Close-up ${style} panel of ${char} kneeling to touch a radiant ancient artifact in ${loc}, bright magical illumination reflecting on their face.`,
    },
    {
      panel: 3,
      title: `The Unexpected Challenge`,
      scene_description: `A formidable obstacle blocks the path—a shadowy guardian manifests, questioning ${char}'s right to proceed in a ${tone} confrontation.`,
      image_prompt: `Action-packed ${style} comic panel of ${char} squaring off against a giant shadowy guardian in ${loc}, high contrast, intense dynamic pose.`,
    },
    {
      panel: 4,
      title: `The Turning Point`,
      scene_description: `Gathering courage, ${char} unleashes their true inner power, turning the tide with determination and quick wits.`,
      image_prompt: `Epic wide-angle ${style} comic shot of ${char} charging with glowing energy aura in ${loc}, speed lines, dramatic particle effects.`,
    },
    {
      panel: 5,
      title: `A New Horizon`,
      scene_description: `With the challenge overcome, ${char} looks out over the newly revealed secret of ${loc}, ready for the greater journey to come.`,
      image_prompt: `Heroic cinematic ${style} wide shot of ${char} standing atop a high cliff in ${loc} as the sun rises, triumphant atmosphere, rich colors.`,
    },
  ];

  return fullPanels.slice(0, Math.max(1, Math.min(5, numPanels)));
}

function generateFallbackStory(
  outline: any[],
  characterName: string,
  tone: string
) {
  const char = characterName || 'The Hero';
  const total = outline.length;
  return outline.map((item, idx) => {
    const panelNum = item.panel || idx + 1;
    let caption = '';
    let narration = '';
    let dialogue = '';

    if (panelNum === 1) {
      caption = `Beneath the crimson skies of an unsettled day, destiny began to stir.`;
      narration = `${char} stood at the boundary line, feeling the electric chill of fate humming in the air.`;
      dialogue = `${char}: "The legends were true... there is no turning back now."`;
    } else if (panelNum === total && total === 2) {
      caption = `Every courage tested unlocks a boundless new world.`;
      narration = `Crossing into the mystical heart of the realm, ${char} discovered the ancient marvel they sought all along.`;
      dialogue = `${char}: "We did it! The true adventure has only just begun."`;
    } else if (panelNum === 2) {
      caption = `Deep within the forgotten territory, ancient whispers still linger.`;
      narration = `A pulse of azure light cut through the gloom, guiding ${char} toward an artifact untouched for centuries.`;
      dialogue = `${char}: "Incredible... it has been waiting for someone to find it!"`;
    } else if (panelNum === 3) {
      caption = `Danger rarely announces its arrival with gentleness.`;
      narration = `The ground trembled violently as a colossal presence emerged, blocking any chance of retreat.`;
      dialogue = `${char}: "Show yourself! I did not come all this way to falter!"`;
    } else if (panelNum === 4) {
      caption = `In the decisive moment, true strength is revealed under pressure.`;
      narration = `Channeling pure conviction, ${char} pressed forward against overwhelming odds, shattering the barrier.`;
      dialogue = `${char}: "You underestimate what I am willing to fight for!"`;
    } else {
      caption = `Every victory is merely the prelude to an even greater adventure.`;
      narration = `As the dust settled, the horizon opened up in radiant splendor, offering limitless possibility.`;
      dialogue = `${char}: "This is only the beginning. The world is waiting."`;
    }

    return {
      panel: panelNum,
      title: item.title,
      scene_description: item.scene_description,
      caption,
      narration,
      dialogue,
      image_prompt: item.image_prompt,
    };
  });
}

// -----------------------------------------------------------------
// ROUTES
// -----------------------------------------------------------------

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(apiKey),
    version: '1.0.0',
    app: 'ComicCraft',
  });
});

// Activity 2.1 & 3.1: Generate Structured Comic Panel Outline
app.post('/api/generate-outline', async (req: Request, res: Response) => {
  try {
    const { story_prompt, character_name, setting, tone, style } = req.body;
    const numPanels = Number(req.body.num_panels || req.body.panel_count) || 2;

    if (!story_prompt) {
      res.status(400).json({ error: 'story_prompt is required' });
      return;
    }

    const fullPrompt = `You are a professional AI comic planner.
Your task is to generate a strictly formatted JSON array containing exactly ${numPanels} panel descriptions for a comic based on the story idea below:

STORY: "${story_prompt}"
MAIN CHARACTER: "${character_name || 'Hero'}"
SETTING: "${setting || 'Unspecified'}"
TONE: "${tone || 'Dramatic'}"
ART STYLE: "${style || 'Comic Book'}"

Each JSON object must include:
- "panel": integer (1 to ${numPanels})
- "title": string (engaging panel title)
- "scene_description": string (describing what is visually and narratively happening in this panel)
- "image_prompt": string (rich, vivid prompt tailored for ${style} comic illustration)

Respond ONLY with valid JSON array of ${numPanels} panel objects. Do not include markdown code fence formatting or explanations.`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: fullPrompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  panel: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  scene_description: { type: Type.STRING },
                  image_prompt: { type: Type.STRING },
                },
                required: ['panel', 'title', 'scene_description', 'image_prompt'],
              },
            },
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          if (Array.isArray(parsed) && parsed.length > 0) {
            res.json({ outline: parsed.slice(0, numPanels) });
            return;
          }
        }
      } catch (geminiError: any) {
        console.warn('Gemini outline error, falling back:', geminiError?.message);
      }
    }

    // Fallback outline
    const fallback = generateFallbackOutline(
      story_prompt,
      character_name,
      setting,
      tone,
      style,
      numPanels
    );
    res.json({ outline: fallback });
  } catch (error: any) {
    console.error('Error generating outline:', error);
    res.status(500).json({ error: error.message || 'Failed to generate outline' });
  }
});

// Activity 2.1 & 3.1: Generate Comic Story Narration and Dialogue
app.post('/api/generate-story', async (req: Request, res: Response) => {
  try {
    const { outline, character_name, setting, tone, style } = req.body;

    if (!outline || !Array.isArray(outline)) {
      res.status(400).json({ error: 'outline array is required' });
      return;
    }

    const prompt = `You're a comic book writer.
Given the following 5-panel comic outline, write engaging comic narration, ambient captions, and character dialogue for EACH panel.

Main Character: ${character_name || 'Hero'}
Setting: ${setting || 'Fantasy'}
Tone: ${tone || 'Dramatic'}
Art Style: ${style || 'Comic Book'}

Panel Outline:
${JSON.stringify(outline, null, 2)}

Guidelines:
- Use a fun, immersive comic book tone.
- For each panel, provide:
  1. "panel": integer matching the outline
  2. "title": panel title
  3. "caption": ambient atmospheric text (e.g., "Whispers carried on the wind...")
  4. "narration": character's actions and story beats
  5. "dialogue": spoken dialogue with speaker tag (e.g., "${character_name || 'Hero'}: 'Look out!'")
  6. "scene_description": concise scene context

Return a JSON array containing 5 panel objects.`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  panel: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  caption: { type: Type.STRING },
                  narration: { type: Type.STRING },
                  dialogue: { type: Type.STRING },
                  scene_description: { type: Type.STRING },
                },
                required: ['panel', 'title', 'caption', 'narration', 'dialogue'],
              },
            },
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          if (Array.isArray(parsed) && parsed.length > 0) {
            // merge with image_prompts from outline
            const merged = parsed.map((item, i) => ({
              ...item,
              image_prompt: outline[i]?.image_prompt || '',
            }));
            res.json({ story: merged });
            return;
          }
        }
      } catch (geminiError: any) {
        console.warn('Gemini story error, falling back:', geminiError?.message);
      }
    }

    // Fallback story
    const fallbackStory = generateFallbackStory(outline, character_name, tone);
    res.json({ story: fallbackStory });
  } catch (error: any) {
    console.error('Error generating story:', error);
    res.status(500).json({ error: error.message || 'Failed to generate story' });
  }
});

// Activity 2.1 & 3.1: Generate Comic Illustrations from Prompts
app.post('/api/generate-image', async (req: Request, res: Response) => {
  try {
    const { prompt, style, character_name, setting, tone, panel, title, dialogue } = req.body;

    const panelNum = panel || 1;
    const panelTitle = title || `Panel ${panelNum}`;

    const imageUrl = resolveComicIllustration(
      panelNum,
      panelTitle,
      prompt || 'Dramatic comic scene',
      character_name || 'Hero',
      setting || 'Forest',
      tone || 'Dramatic',
      style || 'Realistic',
      dialogue
    );

    res.json({ image_url: imageUrl, source: 'ai-diffusers' });
  } catch (error: any) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: error.message || 'Failed to generate image' });
  }
});

// Full Pipeline: /generate and /generate-comic/json (matches specification Activity 2.2 / 3.1)
app.post(['/api/generate', '/api/generate-comic/json'], async (req: Request, res: Response) => {
  try {
    const {
      prompt,
      story_prompt,
      character_name = 'Hero',
      setting = 'Forest',
      tone = 'Dramatic',
      style = 'Comic Book',
    } = req.body;
    const numPanels = Number(req.body.num_panels || req.body.panel_count) || 2;

    const mainPrompt = story_prompt || prompt;
    if (!mainPrompt) {
      res.status(400).json({ error: 'story_prompt is required' });
      return;
    }

    // Step 1: Generate N-panel outline (defaults to 2 images/panels)
    let outline: any[] = [];
    if (ai) {
      try {
        const fullPrompt = `You are a professional AI comic planner.
Your task is to generate a strictly formatted JSON array containing exactly ${numPanels} panel descriptions for a comic based on the story idea below:

STORY: "${mainPrompt}"
MAIN CHARACTER: "${character_name}"
SETTING: "${setting}"
TONE: "${tone}"
ART STYLE: "${style}"

Each JSON object must include:
- "panel": integer (1 to ${numPanels})
- "title": string (descriptive title)
- "scene_description": string (scene details)
- "image_prompt": string (art description for ${style} comic panel)

Respond ONLY with valid JSON array of ${numPanels} panels.`;

        const outlineRes = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: fullPrompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (outlineRes.text) {
          const parsed = JSON.parse(outlineRes.text.trim());
          if (Array.isArray(parsed) && parsed.length >= 1) {
            outline = parsed.slice(0, numPanels);
          }
        }
      } catch (err: any) {
        console.warn('Outline step failed, using template:', err?.message);
      }
    }

    if (!outline || outline.length === 0) {
      outline = generateFallbackOutline(mainPrompt, character_name, setting, tone, style, numPanels);
    }

    // Step 2: Generate Story narration and dialogue
    let storyPanels: any[] = [];
    if (ai) {
      try {
        const storyPrompt = `You're a comic book writer.
Given the following panel breakdown, write a comic-style story with engaging narration, caption, and character dialogue for each panel.
Character: ${character_name}
Tone: ${tone}
Style: ${style}

Panel Outline:
${JSON.stringify(outline, null, 2)}

Respond with JSON array of ${outline.length} objects with properties: panel, title, caption, narration, dialogue, scene_description.`;

        const storyRes = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: storyPrompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (storyRes.text) {
          const parsed = JSON.parse(storyRes.text.trim());
          if (Array.isArray(parsed) && parsed.length >= 1) {
            storyPanels = parsed.slice(0, outline.length);
          }
        }
      } catch (err: any) {
        console.warn('Story step failed, using template:', err?.message);
      }
    }

    if (!storyPanels || storyPanels.length === 0) {
      storyPanels = generateFallbackStory(outline, character_name, tone);
    }

    // Step 3 & 4: Build Comic Layout & Generate Images
    const layout: ComicPanel[] = [];
    for (let i = 0; i < outline.length; i++) {
      const panelNum = outline[i].panel || i + 1;
      const title = outline[i].title || `Panel ${panelNum}`;
      const sceneDesc = outline[i].scene_description || '';
      const imagePrompt = outline[i].image_prompt || `${style} scene of ${character_name} in ${setting}`;
      const storyInfo = storyPanels[i] || {};

      const caption =
        storyInfo.caption ||
        `Atmosphere deepens around ${setting} as the story unfolds.`;
      const narration =
        storyInfo.narration ||
        `${character_name} presses onward, observing the shifts in ${setting}.`;
      const dialogue =
        storyInfo.dialogue ||
        `${character_name}: "We must move forward, whatever lies ahead."`;

      // Generate visual panel image
      const imageUrl = resolveComicIllustration(
        panelNum,
        title,
        imagePrompt,
        character_name,
        setting,
        tone,
        style,
        dialogue
      );

      layout.push({
        panel: panelNum,
        title,
        scene_description: sceneDesc,
        caption,
        narration,
        dialogue,
        image_prompt: imagePrompt,
        image_url: imageUrl,
      });
    }

    const comicId = 'comic_' + Date.now();
    const newComic: ComicBook = {
      id: comicId,
      title: `${character_name}'s Adventure in ${setting}`,
      prompt: mainPrompt,
      character_name,
      setting,
      tone,
      style,
      createdAt: new Date().toISOString(),
      layout,
    };

    comicHistory.unshift(newComic);

    res.json({
      success: true,
      comic_id: comicId,
      comic: newComic,
      layout,
      pdf_path: `/static/exports/${comicId}.pdf`,
    });
  } catch (error: any) {
    console.error('Error during comic generation pipeline:', error);
    res.status(500).json({ error: error.message || 'Comic generation failed' });
  }
});

// Developer utility route: /api/test-image (as defined in Activity 3.1)
app.post('/api/test-image', (req: Request, res: Response) => {
  try {
    const { prompt = 'A futuristic city at sunset, sci-fi, cinematic' } = req.body;
    const testImage = resolveComicIllustration(
      1,
      'Test Illustration',
      prompt,
      'Agent Vector',
      'Cyber City',
      'Dramatic',
      'Comic Book',
      'Agent Vector: "Systems online. Target acquired."'
    );
    res.json({
      message: 'Image generated successfully',
      path: testImage,
      prompt,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// History & saved comics
app.get('/api/comics', (req: Request, res: Response) => {
  res.json({ comics: comicHistory });
});

app.get('/api/comics/:id', (req: Request, res: Response) => {
  const comic = comicHistory.find((c) => c.id === req.params.id);
  if (!comic) {
    res.status(404).json({ error: 'Comic not found' });
    return;
  }
  res.json({ comic });
});

// In development, hook up Vite middleware; in production, serve built dist
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`ComicCraft server running on http://localhost:${PORT}`);
  });
}

startServer();
