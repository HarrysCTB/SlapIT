/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#DE1414';
const tintColorDark = '#FFBABA';

export const Colors = {
  light: {
    text: '#3D0D0D',
    background: '#FFE2E2',
    tint: tintColorLight,
    icon: '#A50F0F',
    tabIconDefault: '#EC5656',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#FFE2E2',
    background: '#3D0D0D',
    tint: tintColorDark,
    icon: '#FFBABA',
    tabIconDefault: '#A50F0F',
    tabIconSelected: tintColorDark,
  },
};
