"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { ComponentProps } from "react";

function Tabs({
  style,
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={["flex flex-col gap-2", className].filter(Boolean).join(" ")}
      style={style}
      {...props}
    />
  );
}

function TabsList({
  style,
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={[
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-xl p-[3px] flex",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      {...props}
    />
  );
}

function TabsTrigger({
  style,
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={[
        "data-[state=active]:bg-card data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      {...props}
    />
  );
}

function TabsContent({
  style,
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={["flex-1 outline-none", className].filter(Boolean).join(" ")}
      style={style}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
