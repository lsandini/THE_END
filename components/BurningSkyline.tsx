import { useEffect, useRef, useMemo } from "react";
import { View, Animated, Platform } from "react-native";
import Svg, { Path, Defs, RadialGradient, Stop } from "react-native-svg";

// ─── Buildings ──────────────────────────────────────────────
const BUILDINGS: [number, number, number][] = [
  [0, 8, 28],  [6, 6, 16],  [11, 10, 42], [19, 7, 22],
  [25, 5, 32], [29, 9, 52],  [36, 6, 18], [41, 8, 38],
  [48, 5, 26], [52, 10, 56], [60, 6, 20], [64, 8, 35],
  [71, 5, 44], [75, 7, 24],  [80, 9, 48], [88, 6, 30],
  [93, 7, 40],
];

const SKYLINE_HEIGHT = 150;

function r(min: number, max: number) {
  return min + Math.random() * (max - min);
}

// ─── SVG flame path templates ───────────────────────────────
// Each path is drawn in a 40x60 viewBox (wide base, organic top)
// Multiple shapes for variety
const FLAME_PATHS = [
  // Classic flame — wide base, single tongue curving right
  "M20,58 C12,58 6,52 4,44 C1,34 6,22 10,16 C13,11 16,6 18,1 C19,3 20,8 22,14 C25,22 30,28 32,38 C34,48 28,58 20,58 Z",
  // Double tongue — splits at top
  "M20,58 C10,58 4,50 4,42 C4,32 8,24 12,18 C14,14 15,8 16,2 C17,6 19,12 20,16 C21,12 23,6 24,2 C25,8 28,16 30,22 C34,30 36,40 34,48 C32,56 26,58 20,58 Z",
  // Leaning flame — asymmetric, leans left
  "M22,58 C14,58 8,52 6,44 C3,34 4,24 8,16 C11,10 14,4 16,1 C17,5 18,10 20,16 C22,10 26,18 28,26 C32,36 34,48 28,56 C26,58 24,58 22,58 Z",
  // Fat flame — rounder, shorter
  "M20,58 C8,58 2,48 2,40 C2,30 8,20 14,14 C17,10 18,6 19,2 C20,6 22,12 24,16 C28,22 36,32 36,42 C36,52 30,58 20,58 Z",
  // Wispy flame — tall and thin with a curl
  "M20,58 C14,58 10,52 8,46 C5,38 6,28 10,20 C13,14 16,8 17,3 C18,1 19,0 20,2 C21,6 22,10 24,16 C27,24 30,32 30,42 C30,52 26,58 20,58 Z",
];

// ─── Flame color sets (outer, middle, inner, core) ──────────
const FLAME_GRADIENTS = [
  { outer: "#B71C1C", middle: "#E64A19", inner: "#FF9800", core: "#FFE082" },
  { outer: "#C62828", middle: "#F4511E", inner: "#FFB74D", core: "#FFF9C4" },
  { outer: "#D32F2F", middle: "#FF5722", inner: "#FFA726", core: "#FFECB3" },
];

// ─── Flame configuration ────────────────────────────────────
interface FlameConfig {
  xPct: number;
  baseHeight: number;
  width: number;
  height: number;
  pathIndex: number;
  gradientIndex: number;
  flickerSpeeds: number[];
  swaySpeeds: [number, number];
  swayRange: number;
  scaleRange: [number, number];
  delay: number;
  zFront: boolean; // render in front of buildings?
}

function generateFlames(): FlameConfig[] {
  const flames: FlameConfig[] = [];

  for (const [xPct, wPct, hPct] of BUILDINGS) {
    const bHeight = (hPct / 100) * SKYLINE_HEIGHT;
    const cx = xPct + wPct / 2;
    const flameCount = Math.max(2, Math.ceil(hPct / 12));

    for (let i = 0; i < flameCount; i++) {
      const spreadX = cx + r(-wPct * 0.6, wPct * 0.6);
      const flameH = r(20, 45);
      const flameW = flameH * r(0.5, 0.75);

      flames.push({
        xPct: spreadX - flameW / 8,
        baseHeight: bHeight - r(2, 8),
        width: flameW,
        height: flameH,
        pathIndex: Math.floor(r(0, FLAME_PATHS.length)),
        gradientIndex: Math.floor(r(0, FLAME_GRADIENTS.length)),
        flickerSpeeds: [r(300, 700), r(200, 500), r(300, 600), r(250, 500)],
        swaySpeeds: [r(800, 1500), r(800, 1500)],
        swayRange: r(2, 5),
        scaleRange: [r(0.7, 0.9), r(1.0, 1.2)],
        delay: r(0, 1000),
        zFront: Math.random() < 0.2,
      });
    }

    // small accent flames at edges
    for (let e = 0; e < 2; e++) {
      const edgeX = e === 0 ? xPct - 1 : xPct + wPct - 1;
      flames.push({
        xPct: edgeX,
        baseHeight: bHeight * 0.5,
        width: r(8, 14),
        height: r(14, 22),
        pathIndex: Math.floor(r(0, FLAME_PATHS.length)),
        gradientIndex: Math.floor(r(0, FLAME_GRADIENTS.length)),
        flickerSpeeds: [r(200, 400), r(150, 350), r(200, 400), r(150, 300)],
        swaySpeeds: [r(600, 1000), r(600, 1000)],
        swayRange: r(3, 6),
        scaleRange: [r(0.5, 0.8), r(1.0, 1.3)],
        delay: r(0, 800),
        zFront: true,
      });
    }
  }

  return flames;
}

// ─── Single SVG flame ───────────────────────────────────────
function Flame({ config, id }: { config: FlameConfig; id: string }) {
  const flicker = useRef(new Animated.Value(0)).current;
  const sway = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const [d1, d2, d3, d4] = config.flickerSpeeds;
    const flickerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(flicker, { toValue: 1, duration: d1, delay: config.delay, useNativeDriver: true }),
        Animated.timing(flicker, { toValue: 0.3, duration: d2, useNativeDriver: true }),
        Animated.timing(flicker, { toValue: 0.85, duration: d3, useNativeDriver: true }),
        Animated.timing(flicker, { toValue: 0.15, duration: d4, useNativeDriver: true }),
        Animated.timing(flicker, { toValue: 0.7, duration: d1 * 0.7, useNativeDriver: true }),
      ])
    );
    flickerLoop.start();

    const swayLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sway, { toValue: 1, duration: config.swaySpeeds[0], useNativeDriver: true }),
        Animated.timing(sway, { toValue: -1, duration: config.swaySpeeds[1], useNativeDriver: true }),
      ])
    );
    swayLoop.start();

    const scaleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: config.scaleRange[1], duration: config.swaySpeeds[0] * 1.3, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: config.scaleRange[0], duration: config.swaySpeeds[1] * 1.1, useNativeDriver: true }),
      ])
    );
    scaleLoop.start();

    return () => {
      flickerLoop.stop();
      swayLoop.stop();
      scaleLoop.stop();
    };
  }, []);

  const translateX = sway.interpolate({
    inputRange: [-1, 1],
    outputRange: [-config.swayRange, config.swayRange],
  });

  const rotate = sway.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-6deg", "6deg"],
  });

  const grad = FLAME_GRADIENTS[config.gradientIndex];
  const gradId = `fg-${id}`;
  const path = FLAME_PATHS[config.pathIndex];

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: `${config.xPct}%`,
        bottom: config.baseHeight,
        width: config.width,
        height: config.height,
        opacity: flicker,
        transform: [
          { translateX },
          { scaleY: scaleAnim },
          { rotate },
        ],
      }}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 40 60"
        style={Platform.OS === "web" ? {
          // @ts-ignore
          filter: `drop-shadow(0 0 4px ${grad.middle}) drop-shadow(0 0 8px ${grad.outer}80)`,
        } : undefined}
      >
        <Defs>
          <RadialGradient id={gradId} cx="50%" cy="70%" rx="50%" ry="55%">
            <Stop offset="0%" stopColor={grad.core} stopOpacity="1" />
            <Stop offset="30%" stopColor={grad.inner} stopOpacity="0.95" />
            <Stop offset="65%" stopColor={grad.middle} stopOpacity="0.85" />
            <Stop offset="100%" stopColor={grad.outer} stopOpacity="0.7" />
          </RadialGradient>
        </Defs>
        <Path d={path} fill={`url(#${gradId})`} />
      </Svg>
    </Animated.View>
  );
}

// ─── Ember particles ────────────────────────────────────────
function Ember({ x, baseY, delay }: { x: number; baseY: number; delay: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(0)).current;
  const drift = useRef(new Animated.Value(0)).current;
  const cancelled = useRef(false);
  const riseDistance = useRef(r(20, 50)).current;
  const driftDistance = useRef(r(-10, 10)).current;
  const size = useRef(r(2, 4)).current;

  useEffect(() => {
    cancelled.current = false;
    const runCycle = () => {
      if (cancelled.current) return;
      opacity.setValue(0);
      rise.setValue(0);
      drift.setValue(0);

      const cycleDuration = r(1000, 2000);
      Animated.parallel([
        Animated.sequence([
          Animated.timing(opacity, { toValue: 1, duration: 300, delay, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: r(600, 1200), useNativeDriver: true }),
        ]),
        Animated.timing(rise, { toValue: 1, duration: cycleDuration, delay, useNativeDriver: true }),
        Animated.timing(drift, { toValue: 1, duration: cycleDuration, delay, useNativeDriver: true }),
      ]).start(() => runCycle());
    };
    runCycle();
    return () => { cancelled.current = true; };
  }, []);

  const translateY = rise.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -riseDistance],
  });

  const translateX = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, driftDistance],
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: `${x}%`,
        bottom: baseY,
        width: size,
        height: size,
        borderRadius: 2,
        backgroundColor: "#FF8F00",
        opacity,
        transform: [{ translateY }, { translateX }],
        ...(Platform.OS === "web"
          ? {
              // @ts-ignore
              boxShadow: "0 0 3px #FF8F00, 0 0 6px #FF6D0080",
            }
          : {
              shadowColor: "#FF8F00",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 3,
            }),
      }}
    />
  );
}

// ─── Main component ─────────────────────────────────────────
export default function BurningSkyline() {
  const flameConfigs = useMemo(() => generateFlames(), []);
  const backFlames = useMemo(() => flameConfigs.filter((f) => !f.zFront), [flameConfigs]);
  const frontFlames = useMemo(() => flameConfigs.filter((f) => f.zFront), [flameConfigs]);

  // generate embers
  const embers = useMemo(() => {
    const list: { x: number; baseY: number; delay: number }[] = [];
    for (const [xPct, wPct, hPct] of BUILDINGS) {
      const bHeight = (hPct / 100) * SKYLINE_HEIGHT;
      const cx = xPct + wPct / 2;
      const count = Math.ceil(hPct / 18);
      for (let i = 0; i < count; i++) {
        list.push({
          x: cx + r(-wPct * 0.5, wPct * 0.5),
          baseY: bHeight + r(5, 30),
          delay: r(0, 2000),
        });
      }
    }
    return list;
  }, []);

  const ambientPulse = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(ambientPulse, { toValue: 0.8, duration: 1800, useNativeDriver: true }),
        Animated.timing(ambientPulse, { toValue: 0.3, duration: 2200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: SKYLINE_HEIGHT }}>
      {/* Ambient glow */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: 15,
          left: "5%",
          right: "5%",
          height: 80,
          borderRadius: 60,
          backgroundColor: "#E84040",
          opacity: ambientPulse,
          ...(Platform.OS === "web"
            ? {
                // @ts-ignore
                boxShadow: "0 0 30px #FF6D00, 0 0 60px #E84040, 0 0 100px #C4302B80, 0 0 140px #B71C1C40",
                // @ts-ignore
                filter: "blur(25px)",
              }
            : {
                shadowColor: "#E84040",
                shadowOffset: { width: 0, height: -10 },
                shadowOpacity: 0.7,
                shadowRadius: 35,
              }),
        }}
      />

      {/* Back flames */}
      {backFlames.map((config, i) => (
        <Flame key={`b-${i}`} config={config} id={`b${i}`} />
      ))}

      {/* Buildings */}
      {BUILDINGS.map(([xPct, wPct, hPct], i) => {
        const bHeight = (hPct / 100) * SKYLINE_HEIGHT;
        return (
          <View
            key={`bld-${i}`}
            style={{
              position: "absolute",
              bottom: 0,
              left: `${xPct}%`,
              width: `${wPct}%`,
              height: bHeight,
              backgroundColor: "#050507",
            }}
          >
            {Array.from({ length: Math.floor(bHeight / 14) }).map((_, wi) => (
              <View
                key={wi}
                style={{
                  position: "absolute",
                  bottom: 5 + wi * 14,
                  left: "25%",
                  right: "25%",
                  height: 2,
                  backgroundColor: wi % 3 === 0 ? "#1A1A1F" : "#0C0C10",
                }}
              />
            ))}
          </View>
        );
      })}

      {/* Front flames */}
      {frontFlames.map((config, i) => (
        <Flame key={`f-${i}`} config={config} id={`f${i}`} />
      ))}

      {/* Embers */}
      {embers.map((e, i) => (
        <Ember key={`e-${i}`} {...e} />
      ))}
    </View>
  );
}
