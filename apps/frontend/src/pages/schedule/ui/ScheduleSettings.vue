<script lang="ts" setup>
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
// import { Input } from "@/shared/ui/input";
// import { Label } from "@/shared/ui/label";
</script>
<template>
  <!-- <Button variant="outline" class="px-16 py-5">Filters</Button> -->

  <Dialog>
    <DialogTrigger as-child>
      <Button variant="outline"> Filter </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Filter for events</DialogTitle>
        <DialogDescription>
          Make changes to your schedule and click save when you're done.
        </DialogDescription>
      </DialogHeader>
      <!-- <div class="grid gap-4 py-4">
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="name" class="text-right"> Name </Label>
          <Input id="name" default-value="Pedro Duarte" class="col-span-3" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="username" class="text-right"> Username </Label>
          <Input id="username" default-value="@peduarte" class="col-span-3" />
        </div>
      </div> -->
      WIP
      <DialogFooter>
        <Button type="submit"> Save changes </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
