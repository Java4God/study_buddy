import { ComponentProps } from "react";

function Card({ ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border"
      }
      {...props}
    />
  );
}

function CardHeader({ ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6"
      }
      {...props}
    />
  );
}

function CardTitle({ ...props }: ComponentProps<"div">) {
  return <h4 data-slot="card-title" className={"leading-none"} {...props} />;
}

function CardDescription({ ...props }: ComponentProps<"div">) {
  return (
    <p
      data-slot="card-description"
      className={"text-muted-foreground"}
      {...props}
    />
  );
}

function CardAction({ ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end"
      }
      {...props}
    />
  );
}

function CardContent({ ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={"px-6 [&:last-child]:pb-6"}
      {...props}
    />
  );
}

function CardFooter({ ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={"flex items-center px-6 pb-6 [.border-t]:pt-6"}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
