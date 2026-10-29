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
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import { colors } from '@/theme';

/**
 * Kamu: mascota original de LingoLens.
 *
 * Camaleón de un solo ojo con cresta de púas, cola en espiral y colmillo torcido.
 * Está dibujado por completo en SVG para no depender de imágenes ni licencias.
 */
export type KamuMood = 'idle' | 'confused' | 'happy' | 'smug' | 'sleepy';

type Props = {
  size?: number;
  color?: string;
  mood?: KamuMood;
  /** Dibuja el brazo señalando hacia un lado. */
  pointing?: 'left' | 'right' | 'up' | null;
  /** Si es false, no se anima (útil en capturas de pantalla). */
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Kamu({
  size = 140,
  color = colors.accent,
  mood = 'idle',
  pointing = null,
  animated = true,
  style,
}: Props) {
  const bob = useMemo(() => new Animated.Value(0), []);
  const tilt = useMemo(() => new Animated.Value(0), []);
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

  useEffect(() => {
    if (!shouldAnimate || started.current) return;
    started.current = true;

    const bobLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    const tiltLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(tilt, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(tilt, {
          toValue: -1,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    bobLoop.start();
    tiltLoop.start();
    return () => {
      bobLoop.stop();
      tiltLoop.stop();
      started.current = false;
    };
  }, [shouldAnimate, bob, tilt]);

  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
  const rotate = tilt.interpolate({ inputRange: [-1, 1], outputRange: ['-2.2deg', '2.2deg'] });

  const eyeOpen = mood !== 'happy' && mood !== 'sleepy';
  const squint = mood === 'smug' || mood === 'confused';
  const pupilOffset = mood === 'confused' ? 3 : mood === 'smug' ? 4 : 0;

  return (
    <Animated.View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Kamu, la mascota de LingoLens"
      style={[{ width: size, height: size, transform: [{ translateY }, { rotate }] }, style]}>
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
        </Defs>

        {/* Cola en espiral */}
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

        {/* Patas */}
        <G stroke="#0A1018" strokeWidth="9" strokeLinecap="round">
          <Path d="M84 152v16" />
          <Path d="M116 152v16" />
        </G>
        <G stroke={color} strokeWidth="4" strokeLinecap="round">
          <Path d="M84 152v13" />
          <Path d="M116 152v13" />
        </G>

        {/* Cresta */}
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

        {/* Cuerpo */}
        <Path
          d="M70 82c14-16 44-18 60-1 17 18 16 52-1 69-17 17-50 16-64-2-13-17-11-51 5-66Z"
          fill="url(#kamu-body)"
          stroke="#0A1018"
          strokeWidth="5"
        />

        {/* Barriga */}
        <Ellipse cx="102" cy="139" rx="33" ry="19" fill="#FFFFFF" opacity={0.16} />

        {/* Antena con luz */}
        <Path d="M108 70 112 48" stroke="#0A1018" strokeWidth="4" strokeLinecap="round" />
        <Circle cx="113" cy="45" r="6" fill={colors.pink} />
        <Circle cx="111" cy="43" r="2.2" fill="#FFFFFF" opacity={0.85} />

        {/* Ojo grande tipo lente */}
        <Circle cx="92" cy="105" r="29" fill="#0A1018" />
        <Circle cx="92" cy="105" r="24" fill="url(#kamu-iris)" />
        {eyeOpen ? (
          <>
            <Ellipse cx={92 + pupilOffset} cy="107" rx="5.5" ry="15" fill="#04080E" />
            <Circle cx={85} cy="97" r="4.4" fill="#FFFFFF" opacity={0.9} />
            <Circle cx={99} cy="116" r="2.2" fill="#FFFFFF" opacity={0.5} />
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

        {/* Párpado y ceja */}
        {squint ? (
          <Path d="M64 100c6-19 50-22 57-2l1-16c-8-15-48-14-58 2Z" fill="#0A1018" />
        ) : null}
        <Path
          d={mood === 'confused' ? 'M66 84c10-11 26-15 40-9' : 'M68 88c9-7 25-8 36-3'}
          stroke="#0A1018"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Ojo pequeño */}
        <Circle cx="146" cy="108" r="9.5" fill="#0A1018" />
        <Circle cx="146" cy="108" r="5.5" fill={colors.text} />
        <Circle cx={147 + (mood === 'confused' ? 2 : 0)} cy="109" r="2.4" fill="#04080E" />

        {/* Hocico y sonrisa torcida */}
        <Path
          d="M124 126c11 5 26 4 38-4"
          stroke="#0A1018"
          strokeWidth="5.5"
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d={mood === 'happy' ? 'M128 124c9 14 26 12 34 2-8 20-28 20-34-2Z' : 'M130 126c8 9 20 8 26 1-4 9-18 12-26-1Z'}
          fill="#0A1018"
        />
        <Path d="M146 129l5 11 4-9Z" fill="#FFFFFF" />

        {/* Brazo señalador */}
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

        {/* Marcas de mejilla */}
        <G stroke="#0A1018" strokeWidth="3" strokeLinecap="round" opacity={0.55}>
          <Path d="M64 126l-8 3" />
          <Path d="M66 134l-8 4" />
        </G>

        {/* Signos de confusión */}
        {mood === 'confused' ? (
          <G>
            <Path
              d="M164 62c0-8 12-8 12 0 0 5-6 5-6 11"
              stroke={colors.amber}
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            <Circle cx="170" cy="82" r="3.2" fill={colors.amber} />
          </G>
        ) : null}

        {/* Zzz */}
        {mood === 'sleepy' ? (
          <G fill={colors.textMuted}>
            <Rect x="150" y="66" width="10" height="3" rx="1.5" transform="rotate(-25 155 67)" />
            <Rect x="158" y="54" width="14" height="3.5" rx="1.75" transform="rotate(-25 165 56)" />
          </G>
        ) : null}

        {/* Brillo de celebración */}
        {mood === 'happy' ? (
          <G fill={colors.amber}>
            <Path d="M162 74l3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" />
            <Path d="M42 84l2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" opacity={0.8} />
          </G>
        ) : null}
      </Svg>
    </Animated.View>
  );
}
