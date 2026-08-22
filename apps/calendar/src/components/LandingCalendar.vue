<script setup lang="ts">
const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
</script>

<template>
  <figure class="calendar-scene" aria-label="Illustrative week with classes and a Moodle deadline">
    <div class="calendar-paper" aria-hidden="true">
      <div class="calendar-heading"><span>Your week</span><span>All in one place</span></div>
      <div class="calendar-week">
        <div v-for="(day, index) in weekdays" :key="day" class="calendar-day">
          <span>{{ day }}</span
          ><strong>{{ 14 + index }}</strong>
        </div>
      </div>
      <div class="calendar-grid">
        <div class="calendar-event event-one">
          <span>09:00</span>Algorithms<small>Lecture</small>
        </div>
        <div class="calendar-event event-two">
          <span>11:00</span>Calculus<small>Practice</small>
        </div>
        <div class="calendar-event event-three">
          <span>09:00</span>Algorithms<small>Lecture</small>
        </div>
        <div class="calendar-event event-four">
          <span>14:00</span>English<small>Practice</small>
        </div>
        <div class="calendar-event event-deadline">
          <span>23:59 · Moodle</span>Assignment due<small>Algorithms</small>
        </div>
      </div>
    </div>
  </figure>
</template>

<style scoped>
.calendar-scene {
  display: grid;
  place-items: center;
  width: 100%;
  height: clamp(210px, 32svh, 270px);
  margin: 0;
  padding: 16px 24px;
  perspective: 1000px;
}
.calendar-paper {
  width: 100%;
  max-width: 450px;
  margin: 0 auto;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--background);
  box-shadow: 0 18px 40px #00000018;
  overflow: hidden;
  transform: scale(0.76) rotateX(8deg) rotateY(-4deg) rotateZ(-2deg);
}
.calendar-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border);
  font-size: 16px;
  font-weight: 600;
}
.calendar-heading span:last-child {
  font-size: 11px;
  font-weight: 400;
  color: var(--muted-foreground);
}
.calendar-week {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  border-bottom: 1px solid var(--border);
}
.calendar-day {
  display: grid;
  gap: 5px;
  padding: 12px;
  border-right: 1px solid var(--border);
  font-size: 10px;
  color: var(--muted-foreground);
}
.calendar-day:last-child {
  border: 0;
}
.calendar-day strong {
  font-size: 21px;
  font-weight: 500;
  color: var(--foreground);
}
.calendar-grid {
  position: relative;
  height: 176px;
  background-image:
    linear-gradient(to right, var(--border) 1px, transparent 1px),
    linear-gradient(to bottom, var(--border) 1px, transparent 1px);
  background-size:
    20% 100%,
    100% 48px;
  background-position: -1px -1px;
}
.calendar-event {
  position: absolute;
  display: grid;
  gap: 3px;
  width: calc(20% - 8px);
  padding: 7px;
  border-left: 2px solid #259d78;
  border-radius: 3px;
  background: #d7f3e8;
  color: #16583f;
  font-size: 10px;
  font-weight: 600;
}
.calendar-event span,
.calendar-event small {
  font-size: 8px;
  font-weight: 400;
}
.event-one {
  left: 4px;
  top: 8px;
}
.event-two {
  left: calc(20% + 4px);
  top: 62px;
}
.event-three {
  left: calc(40% + 4px);
  top: 8px;
}
.event-four {
  left: calc(60% + 4px);
  top: 108px;
}
.event-deadline {
  left: calc(80% + 4px);
  top: 74px;
  background: #eee3ff;
  border-color: #9971ce;
  color: #62418b;
}
:global(.dark) .calendar-event {
  background: #183e32;
  color: #a5e8ca;
}
:global(.dark) .event-deadline {
  background: #352840;
  color: #dec5fb;
}
@media (max-width: 480px) {
  .calendar-scene {
    padding: 12px 0;
  }
  .calendar-heading {
    padding: 14px;
  }
  .calendar-event {
    padding: 5px 3px;
    font-size: 8px;
  }
  .calendar-event span,
  .calendar-event small {
    font-size: 7px;
  }
}
</style>
