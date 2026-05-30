import {
  Zap, Trash2, AlertTriangle, Construction, Droplets,
  Trees, Lightbulb, ShieldAlert, type LucideIcon
} from "lucide-react";

export type Category =
  | "pothole"
  | "illegal_dumping"
  | "broken_light"
  | "damaged_property"
  | "flooding"
  | "graffiti"
  | "fallen_tree"
  | "safety_hazard";

const categoryConfig: Record<Category, { label: string; icon: LucideIcon }> = {
  pothole: { label: "Pothole", icon: AlertTriangle },
  illegal_dumping: { label: "Illegal Dumping", icon: Trash2 },
  broken_light: { label: "Broken Light", icon: Lightbulb },
  damaged_property: { label: "Damaged Property", icon: Construction },
  flooding: { label: "Flooding", icon: Droplets },
  graffiti: { label: "Graffiti", icon: Zap },
  fallen_tree: { label: "Fallen Tree", icon: Trees },
  safety_hazard: { label: "Safety Hazard", icon: ShieldAlert },
};

export function CategoryPill({ category }: { category: Category }) {
  const { label, icon: Icon } = categoryConfig[category];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
      <Icon size={12} />
      {label}
    </span>
  );
}
