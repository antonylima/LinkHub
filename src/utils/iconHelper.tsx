import {
  Sparkles,
  Code,
  Palette,
  Wrench,
  BookOpen,
  Tv,
  Folder,
  Globe,
  Briefcase,
  GraduationCap,
  Gamepad2,
  ShoppingBag,
  Music,
  Layers,
  Heart,
  Bookmark,
  Zap,
  Coffee,
  Terminal,
  Shield,
  Smartphone,
  Video,
  Cloud,
  FileText,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const AVAILABLE_ICONS: { name: string; label: string; icon: LucideIcon }[] = [
  { name: 'Sparkles', label: 'IA / Mágico', icon: Sparkles },
  { name: 'Code', label: 'Código', icon: Code },
  { name: 'Palette', label: 'Design', icon: Palette },
  { name: 'Wrench', label: 'Ferramentas', icon: Wrench },
  { name: 'BookOpen', label: 'Estudos', icon: BookOpen },
  { name: 'Tv', label: 'Vídeo / Streaming', icon: Tv },
  { name: 'Folder', label: 'Pasta', icon: Folder },
  { name: 'Globe', label: 'Web', icon: Globe },
  { name: 'Briefcase', label: 'Trabalho', icon: Briefcase },
  { name: 'GraduationCap', label: 'Educação', icon: GraduationCap },
  { name: 'Gamepad2', label: 'Jogos', icon: Gamepad2 },
  { name: 'ShoppingBag', label: 'Compras', icon: ShoppingBag },
  { name: 'Music', label: 'Música', icon: Music },
  { name: 'Layers', label: 'Projetos', icon: Layers },
  { name: 'Heart', label: 'Favoritos', icon: Heart },
  { name: 'Bookmark', label: 'Marcador', icon: Bookmark },
  { name: 'Zap', label: 'Rápido / Energia', icon: Zap },
  { name: 'Coffee', label: 'Lazer', icon: Coffee },
  { name: 'Terminal', label: 'Terminal', icon: Terminal },
  { name: 'Shield', label: 'Segurança', icon: Shield },
  { name: 'Smartphone', label: 'Mobile', icon: Smartphone },
  { name: 'Video', label: 'Vídeos', icon: Video },
  { name: 'Cloud', label: 'Nuvem', icon: Cloud },
  { name: 'FileText', label: 'Documentos', icon: FileText },
];

export const AVAILABLE_COLORS: { name: string; bg: string; text: string; ring: string; border: string }[] = [
  { name: 'indigo', bg: 'bg-indigo-500/10 dark:bg-indigo-500/20', text: 'text-indigo-600 dark:text-indigo-400', ring: 'ring-indigo-500/30', border: 'border-indigo-500/20' },
  { name: 'emerald', bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-500/30', border: 'border-emerald-500/20' },
  { name: 'rose', bg: 'bg-rose-500/10 dark:bg-rose-500/20', text: 'text-rose-600 dark:text-rose-400', ring: 'ring-rose-500/30', border: 'border-rose-500/20' },
  { name: 'amber', bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400', ring: 'ring-amber-500/30', border: 'border-amber-500/20' },
  { name: 'sky', bg: 'bg-sky-500/10 dark:bg-sky-500/20', text: 'text-sky-600 dark:text-sky-400', ring: 'ring-sky-500/30', border: 'border-sky-500/20' },
  { name: 'violet', bg: 'bg-violet-500/10 dark:bg-violet-500/20', text: 'text-violet-600 dark:text-violet-400', ring: 'ring-violet-500/30', border: 'border-violet-500/20' },
  { name: 'teal', bg: 'bg-teal-500/10 dark:bg-teal-500/20', text: 'text-teal-600 dark:text-teal-400', ring: 'ring-teal-500/30', border: 'border-teal-500/20' },
  { name: 'orange', bg: 'bg-orange-500/10 dark:bg-orange-500/20', text: 'text-orange-600 dark:text-orange-400', ring: 'ring-orange-500/30', border: 'border-orange-500/20' },
  { name: 'pink', bg: 'bg-pink-500/10 dark:bg-pink-500/20', text: 'text-pink-600 dark:text-pink-400', ring: 'ring-pink-500/30', border: 'border-pink-500/20' },
  { name: 'cyan', bg: 'bg-cyan-500/10 dark:bg-cyan-500/20', text: 'text-cyan-600 dark:text-cyan-400', ring: 'ring-cyan-500/30', border: 'border-cyan-500/20' },
];

export function getCategoryColor(colorName?: string) {
  const found = AVAILABLE_COLORS.find((c) => c.name === colorName);
  return found || AVAILABLE_COLORS[0];
}

export function renderCategoryIcon(iconName: string, className: string = 'w-4 h-4') {
  const item = AVAILABLE_ICONS.find((i) => i.name.toLowerCase() === iconName.toLowerCase());
  const IconComponent = item ? item.icon : Folder;
  return <IconComponent className={className} />;
}
