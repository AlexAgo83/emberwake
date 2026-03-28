import "./SkillIcon.css";

import type { ActiveWeaponId, FusionId, PassiveItemId } from "@game";

type SkillIconId = ActiveWeaponId | PassiveItemId | FusionId;

type SkillIconProps = {
  category: "active" | "fusion" | "passive";
  id: SkillIconId;
  label: string;
  size?: "lg" | "md" | "sm";
};

const iconStrokePaths: Record<SkillIconId, string[]> = {
  "ash-lash": ["M10 34 C17 18, 31 12, 46 12", "M12 39 C23 27, 37 23, 50 24"],
  "boomerang-arc": ["M14 20 C26 10, 42 10, 50 24", "M14 44 C26 52, 42 50, 50 34"],
  "burning-trail": ["M16 18 L22 28 L16 40", "M30 16 L36 28 L30 44", "M44 18 L50 30 L44 42"],
  "chain-lightning": ["M14 18 L26 26 L20 34 L34 40 L28 48", "M34 18 L46 24 L40 34 L50 42"],
  "guided-senbon": ["M12 34 L40 16", "M32 16 L40 16 L40 24"],
  "halo-burst": ["M32 12 L32 22", "M32 42 L32 52", "M12 32 L22 32", "M42 32 L52 32", "M18 18 L24 24", "M40 40 L46 46"],
  "frost-nova": ["M32 12 L32 52", "M12 32 L52 32", "M18 18 L46 46", "M46 18 L18 46"],
  "shade-kunai": ["M14 16 L27 30 L14 44", "M28 24 L42 30 L28 36"],
  "cinder-arc": ["M12 20 C20 12, 38 12, 48 20", "M18 26 C26 33, 34 33, 42 26"],
  "orbiting-blades": ["M18 18 C24 12, 40 12, 46 18", "M46 42 C40 48, 24 48, 18 42", "M14 32 L22 32", "M42 32 L50 32"],
  "orbit-sutra": ["M16 30 C16 21, 23 14, 32 14", "M48 30 C48 39, 41 46, 32 46"],
  "null-canister": ["M18 18 L46 18 L46 42 L18 42 Z", "M22 22 L42 38", "M42 22 L22 38"],
  "vacuum-pulse": ["M16 18 C24 28, 24 36, 16 46", "M48 18 C40 28, 40 36, 48 46", "M24 32 L40 32"],
  "boss-hunter": ["M16 48 L32 14 L48 48", "M22 38 L42 38", "M28 26 L36 26"],
  "emergency-aegis": ["M20 18 L44 18 L48 30 C48 40, 40 48, 32 52 C24 48, 16 40, 16 30 Z", "M32 22 L32 40"],
  "execution-sigil": ["M18 18 L46 18 L46 46 L18 46 Z", "M22 24 L42 24", "M22 32 L36 32", "M22 40 L30 40"],
  "greed-engine": ["M18 22 C24 16, 40 16, 46 24", "M18 38 C24 46, 40 46, 46 38", "M20 30 L44 30"],
  "overclock-seal": ["M32 14 L32 24", "M32 36 L32 46", "M18 30 L26 30", "M38 30 L46 30"],
  "hardlight-sheath": ["M17 42 L32 14 L47 42", "M22 34 L42 34"],
  "thorn-mail": ["M18 44 L32 14 L46 44", "M18 22 L46 22", "M22 38 L42 38"],
  "wideband-coil": ["M16 30 C20 18, 44 18, 48 30", "M20 30 C23 22, 41 22, 44 30", "M24 30 C27 26, 37 26, 40 30"],
  "echo-thread": ["M14 20 C22 28, 22 32, 14 40", "M30 16 C38 24, 38 36, 30 44", "M46 20 C38 28, 38 32, 46 40"],
  "duplex-relay": ["M16 18 L28 30 L16 42", "M48 18 L36 30 L48 42", "M22 30 L42 30"],
  "vacuum-tabi": ["M18 32 C22 18, 42 18, 46 32", "M24 38 C27 34, 37 34, 40 38", "M32 14 L32 24"],
  "afterimage-pyre": ["M16 20 C24 10, 40 10, 48 20", "M20 30 C26 38, 38 38, 44 30", "M18 44 C24 36, 40 36, 46 44"],
  "redline-ribbon": ["M8 36 C16 14, 34 8, 52 12", "M10 44 C24 24, 40 18, 54 22", "M12 50 C28 36, 42 32, 52 34"],
  "choir-of-pins": ["M12 40 L30 12", "M24 44 L42 16", "M36 48 L52 22"],
  "blackfile-volley": ["M14 16 L30 30 L14 44", "M24 16 L40 30 L24 44", "M34 16 L50 30 L34 44"],
  "event-horizon": ["M18 18 C24 26, 24 38, 18 46", "M46 18 C40 26, 40 38, 46 46", "M24 24 C30 28, 34 28, 40 24", "M24 40 C30 36, 34 36, 40 40"],
  "temple-circuit": ["M16 30 C16 18, 24 10, 36 10", "M48 30 C48 42, 40 50, 28 50", "M21 21 L43 39", "M43 21 L21 39"]
};

const iconFills: Partial<Record<SkillIconId, string[]>> = {
  "ash-lash": ["M13 39 C21 27, 36 22, 50 24 L47 31 C36 30, 24 33, 15 43 Z"],
  "boomerang-arc": ["M16 22 C26 14, 40 14, 48 24 L40 28 C34 22, 24 22, 18 28 Z"],
  "burning-trail": ["M16 18 L22 28 L16 40 L22 40 L28 28 L22 18 Z"],
  "chain-lightning": ["M16 18 L28 26 L22 34 L34 40 L28 48 L40 38 L34 28 L46 20 Z"],
  "guided-senbon": ["M12 34 L40 16 L35 28 Z"],
  "halo-burst": ["M24 24 L40 24 L40 40 L24 40 Z"],
  "frost-nova": ["M28 18 L36 18 L36 46 L28 46 Z", "M18 28 L46 28 L46 36 L18 36 Z"],
  "shade-kunai": ["M16 18 L28 30 L16 42 L20 30 Z", "M30 24 L42 30 L30 36 L33 30 Z"],
  "cinder-arc": ["M18 26 C26 34, 34 34, 42 26 L38 40 C33 44, 28 44, 22 40 Z"],
  "orbiting-blades": ["M22 18 C26 14, 38 14, 42 18 C38 22, 26 22, 22 18 Z", "M22 46 C26 42, 38 42, 42 46 C38 50, 26 50, 22 46 Z"],
  "orbit-sutra": ["M18 30 C18 22, 24 16, 32 16 C40 16, 46 22, 46 30 C46 38, 40 44, 32 44 C24 44, 18 38, 18 30 Z"],
  "null-canister": ["M18 18 L46 18 L46 42 L18 42 Z"],
  "vacuum-pulse": ["M20 24 C24 30, 24 34, 20 40 L44 40 C40 34, 40 30, 44 24 Z"],
  "boss-hunter": ["M22 40 L42 40 L32 18 Z"],
  "emergency-aegis": ["M20 18 L44 18 L46 30 C46 38, 40 44, 32 48 C24 44, 18 38, 18 30 Z"],
  "execution-sigil": ["M18 18 L46 18 L46 46 L18 46 Z"],
  "greed-engine": ["M20 24 C24 20, 40 20, 44 24 L40 32 L24 32 Z"],
  "overclock-seal": ["M28 26 L36 26 L36 34 L28 34 Z"],
  "hardlight-sheath": ["M23 34 L41 34 L32 18 Z"],
  "thorn-mail": ["M22 38 L42 38 L32 18 Z"],
  "wideband-coil": ["M20 30 C23 22, 41 22, 44 30 L40 30 C37 26, 27 26, 24 30 Z"],
  "echo-thread": ["M16 20 C22 27, 22 33, 16 40 L21 40 C25 34, 25 26, 21 20 Z"],
  "duplex-relay": ["M22 30 L42 30 L38 34 L26 34 Z"],
  "vacuum-tabi": ["M20 32 C24 22, 40 22, 44 32 L39 32 C36 26, 28 26, 25 32 Z"],
  "afterimage-pyre": ["M18 24 C24 16, 40 16, 46 24 L42 34 C36 38, 28 38, 22 34 Z"],
  "redline-ribbon": ["M12 50 C24 38, 40 31, 52 34 L50 40 C40 39, 28 43, 15 54 Z"],
  "choir-of-pins": ["M36 48 L52 22 L47 32 Z"],
  "blackfile-volley": ["M36 18 L50 30 L36 42 L40 30 Z"],
  "event-horizon": ["M22 24 C26 30, 26 34, 22 40 L42 40 C38 34, 38 30, 42 24 Z"],
  "temple-circuit": ["M22 22 L42 22 L42 42 L22 42 Z"]
};

export function SkillIcon({ category, id, label, size = "md" }: SkillIconProps) {
  const strokePaths = iconStrokePaths[id] ?? [];
  const fillPaths = iconFills[id] ?? [];

  return (
    <span
      aria-hidden="true"
      className="skill-icon"
      data-category={category}
      data-size={size}
      title={label}
    >
      <svg className="skill-icon__svg" viewBox="0 0 64 64">
        <rect className="skill-icon__plate" x="7" y="7" width="50" height="50" rx="14" />
        <path className="skill-icon__grid" d="M18 14 L18 50 M32 10 L32 54 M46 14 L46 50 M14 18 L50 18 M10 32 L54 32 M14 46 L50 46" />
        {fillPaths.map((pathData) => (
          <path className="skill-icon__fill" d={pathData} key={pathData} />
        ))}
        {strokePaths.map((pathData) => (
          <path className="skill-icon__stroke" d={pathData} key={pathData} />
        ))}
      </svg>
    </span>
  );
}
