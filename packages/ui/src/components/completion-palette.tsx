"use client";

import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@opencoven/ui/components/ui/dropdown-menu";

type CompletionCommand = {
  id: string;
  label: string;
  description: string;
  shortcut?: string;
  disabled?: boolean;
};

type CompletionPaletteProps = {
  trigger: React.ReactElement;
  commands: CompletionCommand[];
  onSelect: (command: CompletionCommand) => void;
  label?: string;
};

function CompletionPalette({
  trigger,
  commands,
  onSelect,
  label = "Slash commands",
}: CompletionPaletteProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={trigger} />
      <DropdownMenuContent side="top" className="w-80">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        {commands.map((command) => (
          <DropdownMenuItem
            key={command.id}
            disabled={command.disabled}
            onClick={() => onSelect(command)}
          >
            <span className="numeric font-semibold text-presence">
              {command.label}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {command.description}
            </span>
            {command.shortcut ? (
              <kbd className="numeric rounded-sm border border-border bg-muted px-1 text-[0.65rem]">
                {command.shortcut}
              </kbd>
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export {
  CompletionPalette,
  type CompletionCommand,
  type CompletionPaletteProps,
};
