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
  width: 100%;
  margin: 0;
}
.calendar-paper {
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 20px;
  background: var(--background);
  box-shadow:
    0 0 64px 8px #8b7be526,
    0 16px 48px #00000008;
  overflow: hidden;
}
:global(.dark) .calendar-paper {
  box-shadow:
    0 0 80px 12px #8b7be538,
    0 0 24px #8b7be512;
}
.calendar-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px 20px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.035em;
}
.calendar-heading span:last-child {
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0;
  color: var(--muted-foreground);
}
.calendar-week {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  border: 1px solid var(--border);
  border-radius: 7px 7px 0 0;
}
.calendar-day {
  display: grid;
  gap: 6px;
  padding: 12px 16px;
  border-right: 1px solid var(--border);
  font-size: 12px;
  color: var(--muted-foreground);
}
.calendar-day:last-child {
  border: 0;
}
.calendar-day strong {
  font-size: 18px;
  font-weight: 600;
  color: var(--foreground);
}
.calendar-grid {
  position: relative;
  height: 200px;
  border: 1px solid var(--border);
  border-top: 0;
  border-radius: 0 0 7px 7px;
  background-image:
    linear-gradient(to right, var(--border) 1px, transparent 1px),
    linear-gradient(to bottom, var(--border) 1px, transparent 1px);
  background-size:
    20% 100%,
    100% 50px;
  background-position: -1px -1px;
}
.calendar-event {
  position: absolute;
  display: grid;
  gap: 3px;
  width: calc(20% - 12px);
  padding: 9px 10px;
  border: 1px solid #a7dfcb;
  border-radius: 6px;
  background: #d7f3e8;
  color: #16583f;
  font-size: 12px;
  font-weight: 600;
}
.calendar-event span,
.calendar-event small {
  font-size: 10px;
  font-weight: 400;
}
.event-one {
  left: 6px;
  top: 0;
}
.event-two {
  left: calc(20% + 6px);
  top: 66px;
  background: #dceeff;
  border-color: #b0d6f5;
  color: #24567e;
}
.event-three {
  left: calc(40% + 6px);
  top: 0;
}
.event-four {
  left: calc(60% + 6px);
  top: 114px;
  background: #fff4d6;
  border-color: #ead6a1;
  color: #715520;
}
.event-deadline {
  left: calc(80% + 6px);
  top: 66px;
  background: #eee3ff;
  border-color: #d5bbee;
  color: #62418b;
}
@media (max-width: 600px) {
  .calendar-paper {
    padding: 8px;
    border-radius: 14px;
  }
  .calendar-heading {
    padding: 8px 6px 16px;
    font-size: 16px;
  }
  .calendar-heading span:last-child {
    font-size: 12px;
  }
  .calendar-day {
    padding: 10px 6px;
    font-size: 10px;
  }
  .calendar-day strong {
    font-size: 18px;
  }
  .calendar-event {
    width: calc(20% - 4px);
    padding: 7px 3px;
    font-size: clamp(8px, 2.2vw, 12px);
    overflow-wrap: anywhere;
  }
  .calendar-event span,
  .calendar-event small {
    font-size: clamp(7px, 1.8vw, 10px);
  }
  .event-one {
    left: 2px;
  }
  .event-two {
    left: calc(20% + 2px);
  }
  .event-three {
    left: calc(40% + 2px);
  }
  .event-four {
    left: calc(60% + 2px);
  }
  .event-deadline {
    left: calc(80% + 2px);
  }
}
</style>
