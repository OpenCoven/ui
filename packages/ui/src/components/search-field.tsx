import { Search } from "lucide-react";

import { Input, type InputProps } from "@opencoven/ui/components/ui/input";
import { cn } from "@opencoven/ui/lib/utils";

type SearchFieldProps = Omit<InputProps, "type"> & {
  shortcut?: string;
};

function SearchField({
  className,
  shortcut,
  "aria-label": ariaLabel = "Search",
  ...props
}: SearchFieldProps) {
  return (
    <label
      data-slot="search-field"
      className={cn(
        "relative flex items-center text-muted-foreground",
        className,
      )}
    >
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute start-2.5 size-3.5"
      />
      <Input
        type="search"
        aria-label={ariaLabel}
        className="ps-8 pe-12"
        {...props}
      />
      {shortcut ? (
        <kbd className="numeric pointer-events-none absolute end-2 rounded-sm border border-border bg-muted px-1 text-[0.65rem]">
          {shortcut}
        </kbd>
      ) : null}
    </label>
  );
}

export { SearchField, type SearchFieldProps };
