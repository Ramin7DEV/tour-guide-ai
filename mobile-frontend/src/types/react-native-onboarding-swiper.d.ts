declare module 'react-native-onboarding-swiper' {
  import { ComponentType, ReactNode } from 'react';
  import { ViewStyle } from 'react-native';

  export interface OnboardingPage {
    backgroundColor: string;
    image: ReactNode;
    title: string | ReactNode;
    subtitle: string | ReactNode;
  }

  export interface OnboardingProps {
    pages: OnboardingPage[];
    onSkip?: () => void;
    onDone?: () => void;
    skipLabel?: string;
    nextLabel?: string;
    controlStatusBar?: boolean;
    bottomBarHighlight?: boolean;
    bottomBarHeight?: number;
    bottomBarColor?: string;
    pageIndexCallback?: (pageIndex: number) => void;
    allowFontScaling?: boolean;
    showSkip?: boolean;
    showNext?: boolean;
    showDone?: boolean;
    skipToPage?: number;
    transitionAnimationDuration?: number;
    containerStyles?: ViewStyle;
    imageContainerStyles?: ViewStyle;
    titleStyles?: ViewStyle;
    subTitleStyles?: ViewStyle;
    DoneButtonComponent?: ComponentType<any>;
    SkipButtonComponent?: ComponentType<any>;
    NextButtonComponent?: ComponentType<any>;
    DotComponent?: ComponentType<any>;
  }

  const Onboarding: ComponentType<OnboardingProps>;

  export default Onboarding;
}
