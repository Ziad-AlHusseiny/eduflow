import { Anchor, Award, BarChart3, Brain, BrainCircuit, Cloud, Code2, Coffee, Compass, Crosshair, Crown, Flag, Flame, Footprints, Gem, Hammer, Layers, Map, Moon, Mountain, NotebookPen, Palette, PenTool, Repeat, Rocket, Shapes, Smartphone, Star, Sunrise, Target, Trophy, Zap } from 'lucide-react';

const ICONS = { Anchor, Award, BarChart3, Brain, BrainCircuit, Cloud, Code2, Coffee, Compass, Crosshair, Crown, Flag, Flame, Footprints, Gem, Hammer, Layers, Map, Moon, Mountain, NotebookPen, Palette, PenTool, Repeat, Rocket, Shapes, Smartphone, Star, Sunrise, Target, Trophy, Zap };

/** A lucide icon by name (data files name icons as strings). */
export default function Icon({ name, ...props }) {
  const C = ICONS[name] ?? Star;
  return <C aria-hidden="true" {...props} />;
}
