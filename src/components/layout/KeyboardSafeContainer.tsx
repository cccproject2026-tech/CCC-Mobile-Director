import React from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollViewProps,
  StyleProp,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewProps,
} from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type KeyboardSafeMode = "scroll" | "avoid" | "static";

export type KeyboardSafeContainerProps = {
  children: React.ReactNode;
  /** scroll: KeyboardAwareScrollView (default). avoid: KeyboardAvoidingView. static: flex View only. */
  mode?: KeyboardSafeMode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Dismiss keyboard when dragging the scroll view (scroll mode only). */
  dismissKeyboardOnTap?: boolean;
  enableOnAndroid?: boolean;
  extraScrollHeight?: number;
  extraHeight?: number;
  keyboardVerticalOffset?: number;
  keyboardShouldPersistTaps?: "always" | "never" | "handled";
  showsVerticalScrollIndicator?: boolean;
  scrollEnabled?: boolean;
  innerRef?: React.Ref<KeyboardAwareScrollView>;
  /** Adds safe-area bottom inset to scroll content padding */
  useSafeAreaBottom?: boolean;
  bottomPadding?: number;
} & Pick<ScrollViewProps, "refreshControl" | "onScroll"> &
  Pick<
    KeyboardAwareScrollViewProps,
    "enableResetScrollToCoords" | "keyboardOpeningTime"
  >;

const DEFAULT_EXTRA_SCROLL = 20;

/**
 * Reusable keyboard-safe wrapper for forms, modals, and scrollable screens.
 * Prefer mode="scroll" for long forms; mode="avoid" when using FlatList + fixed footer.
 */
export function KeyboardSafeContainer({
  children,
  mode = "scroll",
  style,
  contentContainerStyle,
  dismissKeyboardOnTap = false,
  enableOnAndroid = true,
  extraScrollHeight = DEFAULT_EXTRA_SCROLL,
  extraHeight,
  keyboardVerticalOffset,
  keyboardShouldPersistTaps = "handled",
  showsVerticalScrollIndicator = false,
  scrollEnabled = true,
  innerRef,
  useSafeAreaBottom = false,
  bottomPadding = 0,
  refreshControl,
  onScroll,
  enableResetScrollToCoords = false,
  keyboardOpeningTime = 0,
}: KeyboardSafeContainerProps) {
  const insets = useSafeAreaInsets();
  const bottomInset = useSafeAreaBottom ? insets.bottom : 0;
  const resolvedBottomPadding = bottomPadding + bottomInset;

  const wrapDismiss = (node: React.ReactNode) => {
    if (!dismissKeyboardOnTap) return node;
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ flex: 1 }}>{node}</View>
      </TouchableWithoutFeedback>
    );
  };

  if (mode === "static") {
    return wrapDismiss(<View style={[{ flex: 1 }, style]}>{children}</View>);
  }

  if (mode === "avoid") {
    const offset =
      keyboardVerticalOffset ??
      (Platform.OS === "ios" ? insets.top : 0);

    return wrapDismiss(
      <KeyboardAvoidingView
        style={[{ flex: 1 }, style]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={offset}
      >
        {children}
      </KeyboardAvoidingView>
    );
  }

  // Scroll mode: never wrap in TouchableWithoutFeedback (blocks pan/scroll on form fields).
  return (
    <KeyboardAwareScrollView
      ref={innerRef}
      style={[{ flex: 1 }, style]}
      contentContainerStyle={[
        resolvedBottomPadding > 0 && { paddingBottom: resolvedBottomPadding },
        contentContainerStyle,
      ]}
      enableOnAndroid={enableOnAndroid}
      enableAutomaticScroll
      enableResetScrollToCoords={enableResetScrollToCoords}
      keyboardOpeningTime={keyboardOpeningTime}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      keyboardDismissMode={dismissKeyboardOnTap ? "on-drag" : "none"}
      nestedScrollEnabled
      extraScrollHeight={extraScrollHeight}
      extraHeight={extraHeight ?? extraScrollHeight}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      scrollEnabled={scrollEnabled}
      refreshControl={refreshControl}
      onScroll={onScroll}
    >
      {children}
    </KeyboardAwareScrollView>
  );
}

export default KeyboardSafeContainer;
