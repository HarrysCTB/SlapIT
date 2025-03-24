/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = 'rgba(237, 37, 78, 0.8)';
const tintColorDark = '#F7F7FF';

export const Colors = {
  light: {
    text: '#545E75',           // Un gris très foncé pour un texte lisible
    background: '#F7F7FF',     // Un fond très clair pour mettre en valeur les contenus
    tint: tintColorLight,      // Couleur d'accent pour les éléments interactifs
    icon: '#4B5563',          // Gris moyen pour les icônes
    tabIconDefault: '#9CA3AF', // Gris clair pour les icônes non sélectionnées
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#F7F7FF',           // Un texte quasi-blanc pour une bonne lisibilité sur fond sombre
    background: '#080705',     // Fond sombre (gris ardoise)
    tint: tintColorDark,       // Variante plus claire du tint en mode sombre
    icon: '#9CA3AF',           // Gris clair pour les icônes
    tabIconDefault: '#6B7280', // Gris moyen pour les icônes non sélectionnées
    tabIconSelected: tintColorDark,
  },
};
