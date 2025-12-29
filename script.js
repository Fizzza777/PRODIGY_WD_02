class Stopwatch {
  constructor(displayElement, lapsListElement) {
    this.display = displayElement;
    this.lapsList = lapsListElement;

    this.startTime = 0;
    this.elapsedTime = 0;
    this.timerInterval = null;
    this.isRunning = false;

    this.laps = [];
  }

  start() {
    if (!this.isRunning) {
      this.startTime = Date.now() - this.elapsedTime;
      this.timerInterval = requestAnimationFrame(this.update.bind(this));
      this.isRunning = true;
      return true; // Successfully started
    }
    return false;
  }

  pause() {
    if (this.isRunning) {
      cancelAnimationFrame(this.timerInterval);
      this.elapsedTime = Date.now() - this.startTime;
      this.isRunning = false;
      return true; // Successfully paused
    }
    return false;
  }

  reset() {
    this.pause();
    this.laps = [];
    this.elapsedTime = 0;
    this.updateDisplay(0);
    this.clearLaps();
  }

  lap() {
    if (this.isRunning) {
      const currentLapTime = this.elapsedTime;
      const previousLapTotal =
        this.laps.length > 0 ? this.laps[this.laps.length - 1].totalTime : 0;
      const splitTime = currentLapTime - previousLapTotal;

      this.laps.push({
        index: this.laps.length + 1,
        splitTime: splitTime,
        totalTime: currentLapTime,
      });

      this.renderLap(this.laps[this.laps.length - 1]);
    }
  }

  update() {
    if (this.isRunning) {
      this.elapsedTime = Date.now() - this.startTime;
      this.updateDisplay(this.elapsedTime);
      this.timerInterval = requestAnimationFrame(this.update.bind(this));
    }
  }

  updateDisplay(timeInMs) {
    this.display.textContent = this.formatTime(timeInMs);
  }

  formatTime(ms) {
    const date = new Date(ms);
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const seconds = String(date.getUTCSeconds()).padStart(2, "0");
    const milliseconds = String(
      Math.floor(date.getUTCMilliseconds() / 10)
    ).padStart(2, "0");

    return `${minutes}:${seconds}.${milliseconds}`;
  }

  renderLap(lap) {
    const li = document.createElement("li");
    li.className = "lap-item";

    li.innerHTML = `
            <span class="lap-index">#${String(lap.index).padStart(
              2,
              "0"
            )}</span>
            <span>${this.formatTime(lap.splitTime)}</span>
            <span>${this.formatTime(lap.totalTime)}</span>
        `;

    // Prepend to show newest first
    if (this.lapsList.firstChild) {
      this.lapsList.insertBefore(li, this.lapsList.firstChild);
    } else {
      this.lapsList.appendChild(li);
    }
  }

  clearLaps() {
    this.lapsList.innerHTML = "";
  }
}

// UI Controller
document.addEventListener("DOMContentLoaded", () => {
  const timeDisplay = document.getElementById("time-display");
  const startStopBtn = document.getElementById("start-stop-btn");
  const resetBtn = document.getElementById("reset-btn");
  const lapBtn = document.getElementById("lap-btn");
  const lapsList = document.getElementById("laps-list");

  const stopwatch = new Stopwatch(timeDisplay, lapsList);

  function updateControls(isRunning) {
    if (isRunning) {
      startStopBtn.innerHTML = '<span class="icon">⏸</span> Pause';
      startStopBtn.classList.add("running");
      resetBtn.disabled = true;
      lapBtn.disabled = false;
    } else {
      startStopBtn.innerHTML = '<span class="icon">▶</span> Start';
      startStopBtn.classList.remove("running");
      resetBtn.disabled = false;
      lapBtn.disabled = true;
    }
  }

  startStopBtn.addEventListener("click", () => {
    if (stopwatch.isRunning) {
      stopwatch.pause();
      updateControls(false);
    } else {
      stopwatch.start();
      updateControls(true);
    }
  });

  resetBtn.addEventListener("click", () => {
    stopwatch.reset();
    updateControls(false);
    // Also ensure lap button is disabled on reset
    lapBtn.disabled = true;
  });

  lapBtn.addEventListener("click", () => {
    stopwatch.lap();
  });
});
