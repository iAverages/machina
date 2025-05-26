import type { Component, ComponentProps } from "solid-js"
import { splitProps } from "solid-js"

import { cn } from "~/utils/cn"

const Card: Component<ComponentProps<"div">> = (props) => {
  const [local, others] = splitProps(props, ["class"])
  return (
    <div
      class={cn("md:col-span-2 bg-zinc-900/70 rounded-xl border border-zinc-800 p-5", local.class)}
      {...others}
    />
  )
}

const CardHeader: Component<ComponentProps<"div">> = (props) => {
  const [local, others] = splitProps(props, ["class"])
  return <div class={cn("flex items-center justify-between mb-4", local.class)} {...others} />
}

const CardTitle: Component<ComponentProps<"h3">> = (props) => {
  const [local, others] = splitProps(props, ["class"])
  return (
    <h3 class={cn("text-xl font-bold", local.class)} {...others} />
  )
}

const CardDescription: Component<ComponentProps<"p">> = (props) => {
  const [local, others] = splitProps(props, ["class"])
  return <p class={cn("text-sm text-muted-foreground", local.class)} {...others} />
}

const CardContent: Component<ComponentProps<"div">> = (props) => {
  const [local, others] = splitProps(props, ["class"])
  return <div class={cn( local.class)} {...others} />
}

const CardFooter: Component<ComponentProps<"div">> = (props) => {
  const [local, others] = splitProps(props, ["class"])
  return <div class={cn("flex items-center p-6 pt-0", local.class)} {...others} />
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
