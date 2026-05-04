"use client";

import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function QuickActionsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          New Action
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a quick action</DialogTitle>
          <DialogDescription>
            Use existing pages to continue operational flows.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <Button variant="outline" asChild>
            <Link href="/roles">Register a new participant role</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/addmed">Create a new order</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/track">Track a material batch</Link>
          </Button>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
