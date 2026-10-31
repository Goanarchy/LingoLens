import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Polygon,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import { colors } from '@/theme';

/**
 * Kamu: the original mascot of LingoLens.
 *
 * A one-eyed prism chameleon hatched inside a Kyoto telephoto camera lens,
 * drawn entirely in SVG with spiral tail, spiked crest, aperture iris rings,
 * crooked fang, and an optional royal golden crown.
 */
export type KamuMood =
  | 'idle'
  | 'confused'
  | 'happy'
  | 'smug'
  | 'sleepy'
  | 'thinking'
  | 'excited'
  | 'crowned';

type Props = {
  size?: number;
  color?: string;
  mood?: KamuMood;
  /** Draws the pointing arm in the given direction. */
  pointing?: 'left' | 'right' | 'up' | null;
  /** Places a golden Word-of-the-Day crown atop Kamu's crest. */
  crowned?: boolean;
  /** Disables animations when false (useful for static share cards). */
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Kamu({
  size = 140,
  color = colors.accent,
  mood = 'idle',
  pointing = null,
  crowned = false,
  animated = true,
  style,
}: Props) {
  const bob = useMemo(() => new Animated.Value(0), []);
  const tilt = useMemo(() => new Animated.Value(0), []);
  const pulse = useMemo(() => new Animated.Value(1), []);
  const started = useRef(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (active) setReduceMotion(enabled);
      })
      .catch(() => undefined);

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      setReduceMotion(enabled);
    });

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  const shouldAnimate = animated && !reduceMotion;
  const isFast = mood === 'thinking' || mood === 'excited' || mood === 'crowned';
  const bobDuration = isFast ? 720 : 1400;
  const bobRange = isFast ? -10 : -6;
  const rotateRange: [string, string] = isFast ? ['-4deg', '4deg'] : ['-2.4deg', '2.4deg'];
  const showCrown = crowned || mood === 'crowned';

  useEffect(() => {
    if (!shouldAnimate || started.current) return;
    started.current = true;

    const bobLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: 1,
          duration: bobDuration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: bobDuration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    const tiltLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(tilt, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(tilt, {
          toValue: -1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: isFast ? 1.05 : 1.02,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    bobLoop.start();
    tiltLoop.start();
    pulseLoop.start();
    return () => {
      bobLoop.stop();
      tiltLoop.stop();
      pulseLoop.stop();
      started.current = false;
    };
  }, [shouldAnimate, bob, tilt, pulse, bobDuration, isFast]);

  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, bobRange] });
  const rotate = tilt.interpolate({ inputRange: [-1, 1], outputRange: rotateRange });

  const eyeHappyClosed = mood === 'happy' || mood === 'sleepy';
  const squint = mood === 'smug' || mood === 'confused';
  const pupilOffset =
    mood === 'confused' ? 3 : mood === 'smug' ? 4 : mood === 'thinking' ? -3 : 0;

  return (
    <Animated.View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Kamu, the LingoLens prism chameleon mascot"
      style={[
        {
          width: size,
          height: size,
          transform: [{ translateY }, { rotate }, { scale: pulse }],
        },
        style,
      ]}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Defs>
          <LinearGradient id="kamu-body" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="1" />
            <Stop offset="1" stopColor={color} stopOpacity="0.72" />
          </LinearGradient>
          <RadialGradient id="kamu-iris" cx="0.4" cy="0.35" r="0.75">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
            <Stop offset="0.45" stopColor={color} stopOpacity="1" />
            <Stop offset="1" stopColor="#071018" stopOpacity="1" />
          </RadialGradient>
          <LinearGradient id="kamu-crown" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FFE17D" stopOpacity="1" />
            <Stop offset="1" stopColor="#F59E0B" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Coiled chameleon tail */}
        <Path
          d="M70 138C52 158 26 152 27 133c1-16 22-19 24-6 2 11-12 13-13 4"
          stroke="#0A1018"
          strokeWidth="13"
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d="M70 138C52 158 26 152 27 133c1-16 22-19 24-6 2 11-12 13-13 4"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />

        {/* Legs */}
        <G stroke="#0A1018" strokeWidth="9" strokeLinecap="round">
          <Path d="M84 152v16" />
          <Path d="M116 152v16" />
        </G>
        <G stroke={color} strokeWidth="4" strokeLinecap="round">
          <Path d="M84 152v13" />
          <Path d="M116 152v13" />
        </G>

        {/* Spiked prism crest */}
        <Path
          d="M74 82 79 52l11 17 8-24 11 24 9-17 6 30"
          fill="#08101A"
          stroke="#08101A"
          strokeWidth="10"
          strokeLinejoin="round"
        />
        <Path
          d="M74 82 79 52l11 17 8-24 11 24 9-17 6 30"
          fill={color}
          stroke={color}
          strokeWidth="5"
          strokeLinejoin="round"
        />

        {/* Royal Golden Crown when crowned */}
        {showCrown ? (
          <G>
            <Polygon
              points="75,52 81,26 94,40 102,20 110,40 123,26 127,52"
              fill="url(#kamu-crown)"
              stroke="#0A1018"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <Circle cx="102" cy="38" r="3" fill="#FF4D6D" />
            <Circle cx="87" cy="43" r="2.2" fill="#8CFFB8" />
            <Circle cx="116" cy="43" r="2.2" fill="#8CFFB8" />
          </G>
        ) : null}

        {/* Torso */}
        <Path
          d="M70 82c14-16 44-18 60-1 17 18 16 52-1 69-17 17-50 16-64-2-13-17-11-51 5-66Z"
          fill="url(#kamu-body)"
          stroke="#0A1018"
          strokeWidth="5"
        />

        {/* Chromatic scale stripes on back */}
        <G stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity={0.22}>
          <Path d="M72 98c6-3 12-3 18 0" />
          <Path d="M68 112c7-3 14-3 20 0" />
        </G>

        {/* Belly highlight */}
        <Ellipse cx="102" cy="139" rx="33" ry="19" fill="#FFFFFF" opacity={0.18} />

        {/* Luminous antenna */}
        <Path d="M108 70 112 48" stroke="#0A1018" strokeWidth="4" strokeLinecap="round" />
        <Circle cx="113" cy="45" r="6" fill={showCrown ? '#FFD700' : colors.pink} />
        <Circle cx="111" cy="43" r="2.2" fill="#FFFFFF" opacity={0.9} />

        {/* Giant camera-aperture eye */}
        <Circle cx="92" cy="105" r="29" fill="#0A1018" />
        <Circle cx="92" cy="105" r="24" fill="url(#kamu-iris)" />
        {/* Optical lens ring */}
        <Circle
          cx="92"
          cy="105"
          r="19"
          stroke="#0A1018"
          strokeWidth="1.4"
          strokeDasharray="5 4"
          fill="none"
          opacity={0.45}
        />
        {!eyeHappyClosed ? (
          <>
            <Ellipse
              cx={92 + pupilOffset}
              cy="107"
              rx={mood === 'excited' || mood === 'crowned' ? 8 : 5.5}
              ry="15"
              fill="#04080E"
            />
            <Circle cx={85} cy="97" r="4.6" fill="#FFFFFF" opacity={0.92} />
            <Circle cx={99} cy="116" r="2.3" fill="#FFFFFF" opacity={0.55} />
          </>
        ) : (
          <Path
            d="M79 104c5 8 21 8 26 0"
            stroke="#04080E"
            strokeWidth="4.5"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Eyelid & expressive brow */}
        {squint ? (
          <Path d="M64 100c6-19 50-22 57-2l1-16c-8-15-48-14-58 2Z" fill="#0A1018" />
        ) : null}
        <Path
          d={
            mood === 'confused'
              ? 'M66 84c10-11 26-15 40-9'
              : mood === 'excited' || mood === 'crowned'
                ? 'M66 82c10-10 28-10 38-2'
                : 'M68 88c9-7 25-8 36-3'
          }
          stroke="#0A1018"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Secondary turret eye */}
        <Circle cx="146" cy="108" r="9.5" fill="#0A1018" />
        <Circle cx="146" cy="108" r="5.5" fill={colors.text} />
        <Circle cx={147 + (mood === 'confused' ? 2 : 0)} cy="109" r="2.4" fill="#04080E" />

        {/* Snout, crooked grin & fang */}
        <Path
          d="M124 126c11 5 26 4 38-4"
          stroke="#0A1018"
          strokeWidth="5.5"
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d={
            mood === 'happy' || mood === 'excited' || mood === 'crowned'
              ? 'M128 124c9 14 26 12 34 2-8 20-28 20-34-2Z'
              : 'M130 126c8 9 20 8 26 1-4 9-18 12-26-1Z'
          }
          fill="#0A1018"
        />
        <Path d="M146 129l5 11 4-9Z" fill="#FFFFFF" />

        {/* Pointing arm */}
        {pointing ? (
          <G>
            <Path
              d={
                pointing === 'up'
                  ? 'M136 128c10-6 16-14 18-26'
                  : pointing === 'left'
                    ? 'M70 130c-12-2-20-8-26-16'
                    : 'M134 132c12 0 24-4 34-12'
              }
              stroke="#0A1018"
              strokeWidth="13"
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d={
                pointing === 'up'
                  ? 'M136 128c10-6 16-14 18-26'
                  : pointing === 'left'
                    ? 'M70 130c-12-2-20-8-26-16'
                    : 'M134 132c12 0 24-4 34-12'
              }
              stroke={color}
              strokeWidth="7.5"
              strokeLinecap="round"
              fill="none"
            />
            <Circle
              cx={pointing === 'up' ? 156 : pointing === 'left' ? 41 : 171}
              cy={pointing === 'up' ? 98 : pointing === 'left' ? 112 : 119}
              r="7"
              fill={color}
              stroke="#0A1018"
              strokeWidth="3.5"
            />
          </G>
        ) : null}

        {/* Cheek stripes */}
        <G stroke="#0A1018" strokeWidth="3" strokeLinecap="round" opacity={0.55}>
          <Path d="M64 126l-8 3" />
          <Path d="M66 134l-8 4" />
        </G>

        {/* Question mark for confused / thinking */}
        {mood === 'confused' || mood === 'thinking' ? (
          <G>
            <Path
              d={
                mood === 'thinking'
                  ? 'M164 55c0-5 8-10 10 0 0 5-4 8-4 10'
                  : 'M164 62c0-8 12-8 12 0 0 5-6 5-6 11'
              }
              stroke={colors.amber}
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <Circle
              cx={mood === 'thinking' ? 168 : 170}
              cy={mood === 'thinking' ? 78 : 82}
              r="2.5"
              fill={colors.amber}
            />
          </G>
        ) : null}

        {/* Sleepy Zzz */}
        {mood === 'sleepy' ? (
          <G fill={colors.textMuted}>
            <Rect x="150" y="66" width="10" height="3" rx="1.5" transform="rotate(-25 155 67)" />
            <Rect x="158" y="54" width="14" height="3.5" rx="1.75" transform="rotate(-25 165 56)" />
          </G>
        ) : null}

        {/* Celebration sparkles */}
        {mood === 'happy' || mood === 'excited' || mood === 'crowned' ? (
          <G fill={colors.amber}>
            <Path d="M162 74l3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" />
            <Path d="M42 84l2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" opacity={0.85} />
          </G>
        ) : null}
      </Svg>
    </Animated.View>
  );
}
