<script lang="ts" setup>
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
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

      <div class="mt-2">
        <h1 class="mb-2 font-semibold">Toggle event types</h1>
        <div class="flex gap-8">
          <div class="flex items-center gap-2 text-center">
            <Checkbox
              default-checked
              name="toggle-lecture"
              id="toggle-lecture"
            />
            <Label for="toggle-lecture"> Lecture </Label>
          </div>
          <div class="flex items-center gap-2 text-center">
            <Checkbox
              default-checked
              name="toggle-practice"
              id="toggle-practice"
            />
            <Label for="toggle-practice"> Practice </Label>
          </div>
          <div class="flex items-center gap-2 text-center">
            <Checkbox default-checked name="toggle-learn" id="toggle-learn" />
            <Label for="toggle-learn"> Learn </Label>
          </div>
        </div>
      </div>

      <div class="mt-2">
        <h1 class="mb-2 font-semibold">Toggle event formats</h1>
        <div class="flex gap-8">
          <div class="flex items-center gap-2 text-center">
            <Checkbox default-checked name="toggle-online" id="toggle-online" />
            <Label for="toggle-online"> Online </Label>
          </div>
          <div class="flex items-center gap-2 text-center">
            <Checkbox
              default-checked
              name="toggle-offline"
              id="toggle-offline"
            />
            <Label for="toggle-offline"> Offline </Label>
          </div>
        </div>
      </div>
      WIP
      <DialogFooter>
        <Button type="submit"> Save changes </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
