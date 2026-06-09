import { ViewStyle } from 'react-native';

export type HomeTileAccent = {
  icon: string;
  iconBg: string;
  tileBg: string;
  tileBorder: string;
  label: string;
};

/** Unified icon color for all Home screen icons. */
export const HOME_ICON_COLOR = '#FFFFFF';

/** Section header icon accents (matches dashboard card themes). */
export const HOME_SECTION_ICON_COLORS: Record<string, string> = {
  'At a Glance': HOME_ICON_COLOR,
  'Quick Actions': HOME_ICON_COLOR,
  RoadMaps: HOME_ICON_COLOR,
  'Assesments & CDP': HOME_ICON_COLOR,
  'Mentorship & Support': HOME_ICON_COLOR,
  'Tracking Progress': HOME_ICON_COLOR,
  'Directors Notes': HOME_ICON_COLOR,
  'New User': HOME_ICON_COLOR,
  'AI Insights': HOME_ICON_COLOR,
};

export const homeTileAccents = {
  sky: {
    icon: '#7DD3FC',
    iconBg: 'rgba(125, 211, 252, 0.28)',
    tileBg: 'rgba(125, 211, 252, 0.14)',
    tileBorder: 'rgba(125, 211, 252, 0.38)',
    label: 'rgba(224, 242, 254, 0.96)',
  },
  mint: {
    icon: '#6FD4BE',
    iconBg: 'rgba(111, 212, 190, 0.28)',
    tileBg: 'rgba(111, 212, 190, 0.14)',
    tileBorder: 'rgba(111, 212, 190, 0.38)',
    label: 'rgba(220, 252, 245, 0.96)',
  },
  gold: {
    icon: '#E8C88A',
    iconBg: 'rgba(232, 200, 138, 0.28)',
    tileBg: 'rgba(232, 200, 138, 0.14)',
    tileBorder: 'rgba(232, 200, 138, 0.38)',
    label: 'rgba(254, 249, 231, 0.96)',
  },
  violet: {
    icon: '#C4B5FD',
    iconBg: 'rgba(196, 181, 253, 0.28)',
    tileBg: 'rgba(196, 181, 253, 0.14)',
    tileBorder: 'rgba(196, 181, 253, 0.38)',
    label: 'rgba(245, 243, 255, 0.96)',
  },
  amber: {
    icon: '#FCD34D',
    iconBg: 'rgba(252, 211, 77, 0.28)',
    tileBg: 'rgba(252, 211, 77, 0.12)',
    tileBorder: 'rgba(252, 211, 77, 0.36)',
    label: 'rgba(254, 252, 232, 0.96)',
  },
  coral: {
    icon: '#FDA4AF',
    iconBg: 'rgba(253, 164, 175, 0.28)',
    tileBg: 'rgba(253, 164, 175, 0.12)',
    tileBorder: 'rgba(253, 164, 175, 0.36)',
    label: 'rgba(255, 241, 242, 0.96)',
  },
  teal: {
    icon: '#5EEAD4',
    iconBg: 'rgba(94, 234, 212, 0.26)',
    tileBg: 'rgba(94, 234, 212, 0.12)',
    tileBorder: 'rgba(94, 234, 212, 0.34)',
    label: 'rgba(240, 253, 250, 0.96)',
  },
} as const satisfies Record<string, HomeTileAccent>;

export type HomeTileAccentKey = keyof typeof homeTileAccents;

export function resolveHomeTileAccent(key?: string): HomeTileAccent {
  if (key && key in homeTileAccents) {
    return homeTileAccents[key as HomeTileAccentKey];
  }
  return homeTileAccents.sky;
}

/** Icon color only — tile/label backgrounds stay unchanged. */
export function resolveHomeTileIconColor(_key?: string): string {
  return HOME_ICON_COLOR;
}

export function resolveSectionIconColor(_sectionTitle: string): string {
  return HOME_ICON_COLOR;
}

export function tileSurfaceStyle(accent: HomeTileAccent): ViewStyle {
  return {
    backgroundColor: accent.tileBg,
    borderColor: accent.tileBorder,
  };
}
