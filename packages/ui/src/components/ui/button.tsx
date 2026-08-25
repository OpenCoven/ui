"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@opencoven/ui/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-transparent text-sm font-medium transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary/85 active:translate-y-px",
        presence:
          "bg-presence text-presence-foreground hover:bg-presence/85 active:translate-y-px",
        outline:
          "border-border bg-card text-card-foreground hover:bg-muted aria-expanded:bg-muted",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-accent aria-expanded:bg-accent",
        ghost: "text-foreground hover:bg-muted aria-expanded:bg-muted",
        destructive:
          "border-destructive/35 bg-destructive/12 text-destructive hover:bg-destructive/20",
        link: "text-presence underline-offset-4 hover:underline",
      },
      density: {
        default: "h-8 px-3",
        compact: "h-7 px-2 text-xs",
      },
      size: {
        default: "",
        icon: "aspect-square px-0",
      },
    },
    defaultVariants: {
      variant: "outline",
      density: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "outline",
  density = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      data-variant={variant}
      data-density={density}
      className={cn(buttonVariants({ variant, density, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
