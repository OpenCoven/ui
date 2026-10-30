import {
  Activity,
  FileCode2,
  Layers3,
  MessageSquare,
  PenLine,
  Wand2,
} from "lucide-react";

export const labScenes = [
  {
    id: "composer",
    title: "Composer",
    subtitle: "From intent to action",
    icon: PenLine,
    source: "composer",
  },
  {
    id: "run-rail",
    title: "Run rail",
    subtitle: "Every step, accounted for",
    icon: Activity,
    source: "run-rail",
  },
  {
    id: "messages",
    title: "Messages",
    subtitle: "A familiar voice, with evidence",
    icon: MessageSquare,
    source: "transcript-turn",
  },
  {
    id: "context",
    title: "Context",
    subtitle: "The right files, within reach",
    icon: FileCode2,
    source: "resource-row",
  },
  {
    id: "actions",
    title: "Actions",
    subtitle: "Small controls, clear intent",
    icon: Wand2,
    source: "completion-palette",
  },
  {
    id: "cards",
    title: "Cards",
    subtitle: "Outcomes you can open",
    icon: Layers3,
    source: "session-header",
  },
] as const;
