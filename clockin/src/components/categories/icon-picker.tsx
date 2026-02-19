"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  BookOpen,
  Dumbbell,
  User,
  Code,
  Coffee,
  Music,
  Gamepad2,
  ShoppingBag,
  Home,
  Car,
  Plane,
  Heart,
  Star,
  Sun,
  Moon,
  Cloud,
  Zap,
  Flame,
  Target,
  Trophy,
  Medal,
  Award,
  Lightbulb,
  PenTool,
  Camera,
  Mic,
  Headphones,
  Tv,
  Smartphone,
  Laptop,
  Monitor,
  Wifi,
  Battery,
  Key,
  Lock,
  Unlock,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  Info,
  Search,
  Filter,
  Settings,
  Menu,
  Grid3X3,
  List,
  Layout,
  Maximize,
  Minimize,
  Plus,
  Minus,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Link,
  Paperclip,
  FileText,
  File,
  Folder,
  Image,
  MapPin,
  Globe,
  Flag,
  Bookmark,
  Tag,
  Hash,
  AtSign,
  Mail,
  MessageSquare,
  Phone,
  Calendar,
  Clock,
  Timer,
  Bell,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Upload,
  Download,
  Save,
  Printer,
  Copy,
  Scissors,
  Trash2,
  Archive,
  Edit3,
  Type,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code2,
  Terminal,
  Database,
  Server,
  Cpu,
  Layers,
  Box,
  Package,
  Gift,
  CreditCard,
  DollarSign,
  Wallet,
  ShoppingCart,
  Truck,
  Anchor,
  Map,
  Mountain,
  Leaf,
  Apple,
  Utensils,
  Pizza,
  IceCream,
  Cookie,
  Beer,
  Wine,
  GlassWater,
  Droplet,
  Thermometer,
  Wind,
  Umbrella,
  Snowflake,
  Waves,
  Bomb,
  Ghost,
  Sparkles,
  Puzzle,
  Crown,
  Gem,
  Diamond,
  Coins,
  PiggyBank,
  Calculator,
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  HeartPulse,
  Pill,
  Syringe,
  Bandage,
  Microscope,
  Telescope,
  Rocket,
  Brain,
  GraduationCap,
  School,
  Library,
  BookMarked,
  Newspaper,
  Radio,
  Megaphone,
  Ticket,
  Film,
  Palette,
  Paintbrush,
  Pencil,
  Ruler,
  Clipboard,
  ClipboardList,
  FileCheck,
  FilePlus,
  FolderPlus,
  FolderTree,
  Building,
  Building2,
  Store,
  Landmark,
  Castle,
  Tent,
  TreePine,
  Flower,
  Sprout,
  Recycle,
  Shovel,
  Hammer,
  Wrench,
  Sword,
  ShieldCheck,
  Badge,
  Fingerprint,
  Scan,
  QrCode,
  Barcode,
  Bluetooth,
  Cast,
  MonitorPlay,
  Tablet,
  Watch,
  Glasses,
  Shirt,
  ShoppingBasket,
  Inbox,
  Send,
  Reply,
  Forward,
  Link2,
  PaperclipIcon,
  Sticker,
  CalendarDays,
  Clock4,
  BellRing,
  Mic2,
  Play,
  Pause,
  StopCircle,
  SkipForward,
  SkipBack,
  Repeat,
  Shuffle,
  ListMusic,
  ListVideo,
  ListTodo,
  ListChecks,
  Kanban,
  BarChart2,
  AreaChart,
  Radar,
  TargetIcon,
  Crosshair,
  Focus,
  Aperture,
  UserIcon,
  UserPlus,
  UserMinus,
  Users,
  UsersRound,
  UserCircle,
  Baby,
  Accessibility,
  Armchair,
  Bath,
  Bed,
  BedDouble,
  Sofa,
  Lamp,
  Flashlight,
  FireExtinguisher,
  Siren,
  AlertOctagon,
  AlertCircle,
  BellDot,
  Package2,
  Container,
  Train,
  Bus,
  Bike,
  Footprints,
  Earth,
  Languages,
  BookCopy,
  BookmarkPlus,
  LibraryIcon,
  AwardIcon,
  MedalIcon,
  CrownIcon,
  TrophyIcon,
} from "lucide-react";

// Common emojis for categories
const EMOJI_ICONS = [
  "💼", "📚", "💪", "👤", "💻", "☕", "🎵", "🎬", "🎮", "🛍️",
  "🏠", "🚗", "✈️", "❤️", "⭐", "☀️", "🌙", "☁️", "⚡", "🔥",
  "🎯", "🏆", "🥇", "🏅", "💡", "✏️", "🎨", "📷", "🎤", "🎧",
  "📺", "📱", "💻", "🖥️", "⌨️", "🖱️", "📶", "🔋", "🔌", "🔑",
  "🔒", "🔓", "🛡️", "⚠️", "✅", "❌", "❓", "ℹ️", "🔍", "🔎",
  "⚙️", "☰", "⊞", "➕", "➖", "✕", "✓", "→", "←", "↑",
  "↓", "↗", "🔗", "📎", "📄", "📁", "📂", "🖼️", "🗺️", "🧭",
  "🌍", "🚩", "🔖", "🏷️", "#️⃣", "@", "✉️", "💬", "💭", "📞",
  "📹", "🎥", "📅", "🕐", "⏱️", "⏳", "🔔", "🔕", "🔊", "🔇",
  "👁️", "🙈", "👍", "👎", "💓", "📤", "📥", "💾", "🖨️", "📋",
  "✂️", "🗑️", "📝", "🖊️", "T", "⬅", "B", "I", "U", "S",
  "⌨", "🗄️", "🖥", "💾", "🧠", "📦", "🎁", "💳", "💵", "👛",
  "🧾", "🛒", "🚚", "⚓", "⛰️", "🌲", "🌸", "🍃", "🍎", "🍽️",
  "🍕", "🍦", "🍪", "🍺", "🍷", "🥛", "💧", "🌡️", "💨", "🌧️",
  "❄️", "⚡", "☂️", "🌊", "💣", "💀", "👻", "✨", "🌈", "🧩",
  "🎲", "👑", "💎", "🪙", "💰", "🐷", "🧮", "📊", "📈", "📉",
  "💓", "💊", "💉", "🩹", "🔬", "🔭", "🚀", "🛰️", "🤖", "🧠",
  "🎓", "🏫", "📚", "🔖", "📰", "📡", "📻", "📣", "🎫", "🎬",
  "🎞️", "🍿", "🎨", "🖌️", "✏️", "📏", "🗒️", "📋", "📊", "📁",
  "💼", "🏢", "🏬", "🏭", "🏛️", "🏰", "⛪", "🕌", "🕍", "⛺",
  "🌳", "🌱", "♻️", "⛏️", "🔨", "🔧", "⚔️", "🏷️", "📮", "📨",
  "📤", "🔗", "🖼️", "📺", "📱", "⌚", "👓", "👕", "🛍️", "🧺",
  "📨", "📤", "📩", "🌍", "📖", "🔖", "🎓", "🏆", "🥇", "🏆", "👑",
];

// Map of icon names to Lucide components
const LUCIDE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  briefcase: Briefcase,
  book: BookOpen,
  dumbbell: Dumbbell,
  user: User,
  code: Code,
  coffee: Coffee,
  music: Music,
  gamepad: Gamepad2,
  shopping: ShoppingBag,
  home: Home,
  car: Car,
  plane: Plane,
  heart: Heart,
  star: Star,
  sun: Sun,
  moon: Moon,
  cloud: Cloud,
  zap: Zap,
  flame: Flame,
  target: Target,
  trophy: Trophy,
  medal: Medal,
  award: Award,
  lightbulb: Lightbulb,
  pen: PenTool,
  camera: Camera,
  mic: Mic,
  headphones: Headphones,
  tv: Tv,
  smartphone: Smartphone,
  laptop: Laptop,
  monitor: Monitor,
  wifi: Wifi,
  battery: Battery,
  key: Key,
  lock: Lock,
  unlock: Unlock,
  shield: Shield,
  alert: AlertTriangle,
  check: CheckCircle,
  x: XCircle,
  help: HelpCircle,
  info: Info,
  search: Search,
  filter: Filter,
  settings: Settings,
  menu: Menu,
  grid: Grid3X3,
  list: List,
  layout: Layout,
  maximize: Maximize,
  minimize: Minimize,
  plus: Plus,
  minus: Minus,
  xmark: X,
  checkmark: Check,
  "chevron-right": ChevronRight,
  "chevron-left": ChevronLeft,
  "arrow-right": ArrowRight,
  "arrow-left": ArrowLeft,
  "external-link": ExternalLink,
  link: Link,
  paperclip: Paperclip,
  "file-text": FileText,
  file: File,
  folder: Folder,
  image: Image,
  "map-pin": MapPin,
  globe: Globe,
  flag: Flag,
  bookmark: Bookmark,
  tag: Tag,
  hash: Hash,
  at: AtSign,
  mail: Mail,
  "message-square": MessageSquare,
  phone: Phone,
  calendar: Calendar,
  clock: Clock,
  timer: Timer,
  bell: Bell,
  "bell-ring": BellRing,
  volume: Volume2,
  mute: VolumeX,
  eye: Eye,
  "eye-off": EyeOff,
  "thumbs-up": ThumbsUp,
  "thumbs-down": ThumbsDown,
  share: Share2,
  upload: Upload,
  download: Download,
  save: Save,
  print: Printer,
  copy: Copy,
  scissors: Scissors,
  trash: Trash2,
  archive: Archive,
  edit: Edit3,
  type: Type,
  bold: Bold,
  italic: Italic,
  underline: Underline,
  strikethrough: Strikethrough,
  "code-2": Code2,
  terminal: Terminal,
  database: Database,
  server: Server,
  cpu: Cpu,
  layers: Layers,
  box: Box,
  package: Package,
  gift: Gift,
  "credit-card": CreditCard,
  "dollar-sign": DollarSign,
  wallet: Wallet,
  "shopping-cart": ShoppingCart,
  truck: Truck,
  anchor: Anchor,
  map: Map,
  mountain: Mountain,
  leaf: Leaf,
  apple: Apple,
  utensils: Utensils,
  pizza: Pizza,
  "ice-cream": IceCream,
  cookie: Cookie,
  beer: Beer,
  wine: Wine,
  "glass-water": GlassWater,
  droplet: Droplet,
  thermometer: Thermometer,
  wind: Wind,
  umbrella: Umbrella,
  snowflake: Snowflake,
  waves: Waves,
  bomb: Bomb,
  ghost: Ghost,
  sparkles: Sparkles,
  puzzle: Puzzle,
  crown: Crown,
  gem: Gem,
  diamond: Diamond,
  coins: Coins,
  "piggy-bank": PiggyBank,
  calculator: Calculator,
  "bar-chart": BarChart3,
  "line-chart": LineChart,
  "pie-chart": PieChart,
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  activity: Activity,
  pill: Pill,
  syringe: Syringe,
  bandage: Bandage,
  microscope: Microscope,
  telescope: Telescope,
  rocket: Rocket,
  brain: Brain,
  graduation: GraduationCap,
  school: School,
  library: Library,
  "book-marked": BookMarked,
  newspaper: Newspaper,
  radio: Radio,
  megaphone: Megaphone,
  ticket: Ticket,
  film: Film,
  palette: Palette,
  paintbrush: Paintbrush,
  pencil: Pencil,
  ruler: Ruler,
  clipboard: Clipboard,
  "clipboard-list": ClipboardList,
  "file-check": FileCheck,
  "file-plus": FilePlus,
  "folder-plus": FolderPlus,
  "folder-tree": FolderTree,
  building: Building,
  building2: Building2,
  store: Store,
  landmark: Landmark,
  castle: Castle,
  tent: Tent,
  "tree-pine": TreePine,
  flower: Flower,
  sprout: Sprout,
  recycle: Recycle,
  shovel: Shovel,
  hammer: Hammer,
  wrench: Wrench,
  sword: Sword,
  "shield-check": ShieldCheck,
  badge: Badge,
  fingerprint: Fingerprint,
  scan: Scan,
  "qr-code": QrCode,
  barcode: Barcode,
  bluetooth: Bluetooth,
  cast: Cast,
  "monitor-play": MonitorPlay,
  tablet: Tablet,
  watch: Watch,
  glasses: Glasses,
  shirt: Shirt,
  "shopping-basket": ShoppingBasket,
  inbox: Inbox,
  send: Send,
  reply: Reply,
  forward: Forward,
  "link-2": Link2,
  sticker: Sticker,
  play: Play,
  pause: Pause,
  "skip-forward": SkipForward,
  "skip-back": SkipBack,
  repeat: Repeat,
  shuffle: Shuffle,
  "list-music": ListMusic,
  "list-video": ListVideo,
  "list-todo": ListTodo,
  "list-checks": ListChecks,
  kanban: Kanban,
  "bar-chart-2": BarChart2,
  "area-chart": AreaChart,
  radar: Radar,
  "target-icon": TargetIcon,
  crosshair: Crosshair,
  focus: Focus,
  aperture: Aperture,
  "user-icon": UserIcon,
  "user-plus": UserPlus,
  "user-minus": UserMinus,
  users: Users,
  "users-round": UsersRound,
  "user-circle": UserCircle,
  baby: Baby,
  accessibility: Accessibility,
  armchair: Armchair,
  bath: Bath,
  bed: Bed,
  "bed-double": BedDouble,
  sofa: Sofa,
  lamp: Lamp,
  flashlight: Flashlight,
  "fire-extinguisher": FireExtinguisher,
  siren: Siren,
  "alert-octagon": AlertOctagon,
  "alert-circle": AlertCircle,
  "bell-dot": BellDot,
  "package-2": Package2,
  container: Container,
  train: Train,
  bus: Bus,
  bike: Bike,
  footprints: Footprints,
  earth: Earth,
  languages: Languages,
  "book-copy": BookCopy,
  "bookmark-plus": BookmarkPlus,
  "library-icon": LibraryIcon,
  "award-icon": AwardIcon,
  "medal-icon": MedalIcon,
  "crown-icon": CrownIcon,
  "trophy-icon": TrophyIcon,
};

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  color?: string;
}

export function IconPicker({ value, onChange, color = "#6366f1" }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Check if current value is an emoji
  const isEmoji = EMOJI_ICONS.includes(value);

  // Get Lucide icon component
  const getLucideIcon = (name: string) => {
    const Icon = LUCIDE_ICONS[name];
    return Icon ? <Icon className="h-5 w-5" /> : null;
  };

  const filteredEmojis = EMOJI_ICONS.filter((emoji) =>
    search ? getEmojiName(emoji).toLowerCase().includes(search.toLowerCase()) : true
  );

  const filteredLucide = Object.keys(LUCIDE_ICONS).filter((name) =>
    search ? name.toLowerCase().includes(search.toLowerCase()) : true
  );

  // Helper to get a readable name for emoji
  function getEmojiName(emoji: string): string {
    const names: Record<string, string> = {
      "💼": "Briefcase", "📚": "Books", "💪": "Fitness", "👤": "Person",
      "💻": "Computer", "☕": "Coffee", "🎵": "Music", "🎬": "Movie",
      "🎮": "Game", "🛍️": "Shopping", "🏠": "Home", "🚗": "Car",
      "✈️": "Plane", "❤️": "Love", "⭐": "Star", "☀️": "Sun",
      "🌙": "Moon", "☁️": "Cloud", "⚡": "Lightning", "🔥": "Fire",
      "🎯": "Target", "🏆": "Trophy", "🥇": "Gold", "🏅": "Medal",
      "💡": "Idea", "✏️": "Edit", "🎨": "Art", "📷": "Camera",
      "🎤": "Mic", "🎧": "Headphones", "📺": "TV", "📱": "Phone",
    };
    return names[emoji] || "Emoji";
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 hover:bg-accent transition-colors"
        >
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-white font-medium text-lg"
            style={{ backgroundColor: color }}
          >
            {isEmoji ? value : getLucideIcon(value)}
          </div>
          <span className="text-sm text-muted-foreground capitalize">
            {isEmoji ? getEmojiName(value) : value.replace(/-/g, " ")}
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Choose Icon</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Tabs defaultValue="emoji" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="emoji">Emoji</TabsTrigger>
              <TabsTrigger value="lucide">Icons</TabsTrigger>
            </TabsList>
            <TabsContent value="emoji" className="mt-4">
              <div className="grid grid-cols-8 gap-2 max-h-[300px] overflow-y-auto p-1">
                {filteredEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      onChange(emoji);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg text-xl hover:bg-accent transition-colors",
                      value === emoji && "bg-primary/10 ring-2 ring-primary"
                    )}
                    title={getEmojiName(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="lucide" className="mt-4">
              <div className="grid grid-cols-6 gap-2 max-h-[300px] overflow-y-auto p-1">
                {filteredLucide.map((name) => {
                  const Icon = LUCIDE_ICONS[name];
                  if (!Icon) return null;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => {
                        onChange(name);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg hover:bg-accent transition-colors",
                        value === name && "bg-primary/10 ring-2 ring-primary"
                      )}
                      title={name.replace(/-/g, " ")}
                    >
                      <Icon className="h-5 w-5" />
                    </button>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper to render icon in category card
export function CategoryIcon({
  icon,
  color,
  size = "md",
}: {
  icon: string;
  color: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-12 w-12 text-lg",
  };

  // Check if it's an emoji
  const isEmoji = EMOJI_ICONS.includes(icon);

  if (isEmoji) {
    return (
      <div
        className={`flex ${sizeClasses[size]} items-center justify-center rounded-full text-white font-medium`}
        style={{ backgroundColor: color }}
      >
        {icon}
      </div>
    );
  }

  // Lucide icon
  const IconComponent = LUCIDE_ICONS[icon];
  if (IconComponent) {
    return (
      <div
        className={`flex ${sizeClasses[size]} items-center justify-center rounded-full text-white`}
        style={{ backgroundColor: color }}
      >
        <IconComponent className={size === "lg" ? "h-6 w-6" : size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
      </div>
    );
  }

  // Fallback to first letter
  return (
    <div
      className={`flex ${sizeClasses[size]} items-center justify-center rounded-full text-white font-medium`}
      style={{ backgroundColor: color }}
    >
      {icon[0]?.toUpperCase() || "?"}
    </div>
  );
}

// Helper to get icon display name
export function getIconName(icon: string): string {
  const names: Record<string, string> = {
    "💼": "Briefcase", "📚": "Books", "💪": "Fitness", "👤": "Person",
    "💻": "Computer", "☕": "Coffee", "🎵": "Music", "🎬": "Movie",
    "🎮": "Game", "🛍️": "Shopping", "🏠": "Home", "🚗": "Car",
    "✈️": "Plane", "❤️": "Love", "⭐": "Star", "☀️": "Sun",
    "🌙": "Moon", "☁️": "Cloud", "⚡": "Lightning", "🔥": "Fire",
    "🎯": "Target", "🏆": "Trophy", "🥇": "Gold", "🏅": "Medal",
    "💡": "Idea", "✏️": "Edit", "🎨": "Art", "📷": "Camera",
    "🎤": "Mic", "🎧": "Headphones", "📺": "TV", "📱": "Phone",
  };

  if (names[icon]) return names[icon];
  if (EMOJI_ICONS.includes(icon)) return "Emoji";
  return icon.replace(/-/g, " ");
}
