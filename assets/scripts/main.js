// VARIABLES
let dragged;
let dragging = false;
let resizing = false;
let resized;
let mousePositionResize;
let resizeType;
let offsetResize = [0, 0];
let mousePosition;
let offset = [0, 0];
const windowSettings = {};
let resizedDimensions = {};

// GET ELEMENTS
let resizers = document.querySelectorAll(".window__resizer");
const desktop = document.getElementById("desktop");
let maximizers = document.querySelectorAll(".maximizer");
const sidebar = document.getElementById("sidebar");
const taskbar = document.getElementById("taskbar");
let windows = document.querySelectorAll(".window");
const newWindowButton = document.getElementById("new__window");
let closers = document.querySelectorAll(".close");
const menu = document.getElementById("menu");
const menuButton = document.getElementById("menu__button");

// EVENT LISTENERS
desktop.addEventListener("mousemove", handleDrag);
desktop.addEventListener("mouseup", dragEnd);

sidebar.addEventListener("mousemove", handleDrag);
sidebar.addEventListener("mouseup", dragEnd);

taskbar.addEventListener("mousemove", handleDrag);
taskbar.addEventListener("mouseup", dragEnd);

menuButton.addEventListener("click", toggleMenu);

processWindows();

newWindowButton.addEventListener("click", createNewWindow);

// FUNCTIONS

// MENU FUNCTIONS
function toggleMenu() {
  menu.classList.toggle("menu--hidden");
}

// DRAGGING FUNCTIONS

function dragStart(event) {
  if (event.target.classList.contains("draggable")) {
    dragged = event.target.parentNode;
    checkActive(event);
    windows.forEach(window => {
      window.classList.remove("active__window");
      window.classList.add("inactive__window");
    });
    dragged.classList.remove("inactive__window");
    dragged.classList.add("active__window");
    dragging = true;
    offset = [
      dragged.offsetLeft - event.clientX,
      dragged.offsetTop - event.clientY,
      (dragged.offsetLeft + dragged.clientWidth - event.clientX) * -1,
      (dragged.offsetTop + dragged.clientHeight - event.clientY) * -1
    ];
  }
}

function handleDrag(event) {
  event.preventDefault();
  if (dragging) {
    mousePosition = {
      x: event.clientX,
      y: event.clientY
    };
    let windowX = mousePosition.x + offset[0];
    let windowY = mousePosition.y + offset[1];
    let windowXR =
      (mousePosition.x - offset[2] - desktop.clientWidth - 60) * -1;
    let windowYB =
      (mousePosition.y - offset[3] - desktop.clientHeight - 30) * -1;
    if (windowX < 65) {
      windowX = 65;
    }
    if (windowY < 35) {
      windowY = 35;
    }
    if (windowXR < 5) {
      windowXR = 5;
    }
    if (windowYB < 5) {
      windowYB = 5;
    }
    if (windowXR > 5) {
      dragged.style.left = windowX + "px";
      dragged.style.right = "unset";
    } else {
      dragged.style.right = windowXR + "px";
      dragged.style.left = "unset";
    }
    if (windowYB > 5) {
      dragged.style.bottom = "unset";
      dragged.style.top = windowY + "px";
    } else {
      dragged.style.bottom = windowYB + "px";
      dragged.style.top = "unset";
    }
  } else if (resizing) {
    let newHeight;
    let newWidth;
    mousePosition = {
      x: event.clientX,
      y: event.clientY
    };
    if (mousePosition.x <= 70) {
      mousePosition.x = 70;
    }
    if (mousePosition.y <= 40) {
      mousePosition.y = 40;
    }
    if (mousePosition.y > window.innerHeight - 10) {
      mousePosition.y = window.innerHeight - 10;
    }
    if (mousePosition.x > window.innerWidth - 10) {
      mousePosition.x = window.innerWidth - 10;
    }
    // BOTTOM AND BOTTOM CORNER RESIZING
    if (
      resizeType.contains("window__resizer--bottom") ||
      resizeType.contains("window__resizer--corner--right") ||
      resizeType.contains("window__resizer--corner--left")
    ) {
      let newHeight = resizedDimensions.h + (mousePosition.y - offsetResize[1]);
      let newWidth;
      if (newHeight < 200) {
        newHeight = 200;
      }
      resized.style.height = newHeight + "px";
      if (
        resizeType.contains("window__resizer--corner--right") ||
        resizeType.contains("window__resizer--corner--left")
      ) {
        if (resizeType.contains("window__resizer--corner--right")) {
          newWidth = resizedDimensions.w + (mousePosition.x - offsetResize[0]);
        } else if (resizeType.contains("window__resizer--corner--left")) {
          newWidth = resizedDimensions.w - (mousePosition.x - offsetResize[0]);
        }
        if (newWidth < 300) {
          newWidth = 300;
          if (resizeType.contains("window__resizer--corner--left")) {
            resized.style.left =
              resizedDimensions.l + (resizedDimensions.w - newWidth) + "px";
          }
        } else if (resizeType.contains("window__resizer--corner--left")) {
          resized.style.left =
            resizedDimensions.l + (mousePosition.x - offsetResize[0]) + "px";
        }
        resized.style.width = newWidth + "px";
      }
    }
    // TOP AND TOP CORNER RESIZING
    else if (
      resizeType.contains("window__resizer--top") ||
      resizeType.contains("window__resizer--corner--right--top") ||
      resizeType.contains("window__resizer--corner--left--top")
    ) {
      let newHeight = resizedDimensions.h - (mousePosition.y - offsetResize[1]);
      let newWidth;
      if (newHeight < 200) {
        newHeight = 200;
        resized.style.top =
          resizedDimensions.t + (resizedDimensions.h - newHeight) + "px";
      } else {
        resized.style.top =
          resizedDimensions.t + (mousePosition.y - offsetResize[1]) + "px";
      }
      resized.style.height = newHeight + "px";
      if (
        resizeType.contains("window__resizer--corner--right--top") ||
        resizeType.contains("window__resizer--corner--left--top")
      ) {
        if (resizeType.contains("window__resizer--corner--right--top")) {
          newWidth = resizedDimensions.w + (mousePosition.x - offsetResize[0]);
        } else if (resizeType.contains("window__resizer--corner--left--top")) {
          newWidth = resizedDimensions.w - (mousePosition.x - offsetResize[0]);
        }
        if (newWidth < 300) {
          newWidth = 300;
          if (resizeType.contains("window__resizer--corner--left--top")) {
            resized.style.left =
              resizedDimensions.l + (resizedDimensions.w - newWidth) + "px";
          }
        } else if (resizeType.contains("window__resizer--corner--left--top")) {
          resized.style.left =
            resizedDimensions.l + (mousePosition.x - offsetResize[0]) + "px";
        }
        resized.style.width = newWidth + "px";
      }
    } else if (
      resizeType.contains("window__resizer--right") ||
      resizeType.contains("window__resizer--left")
    ) {
      let newWidth;
      if (resizeType.contains("window__resizer--right")) {
        newWidth = resizedDimensions.w + (mousePosition.x - offsetResize[0]);
      } else if (resizeType.contains("window__resizer--left")) {
        newWidth = resizedDimensions.w - (mousePosition.x - offsetResize[0]);
      }
      if (newWidth <= 300) {
        newWidth = 300;
        if (resizeType.contains("window__resizer--left")) {
          resized.style.left =
            resizedDimensions.l + (resizedDimensions.w - newWidth) + "px";
        }
      } else if (resizeType.contains("window__resizer--left")) {
        resized.style.left =
          resizedDimensions.l + (mousePosition.x - offsetResize[0]) + "px";
      }
      resized.style.width = newWidth + "px";
    }
    // resized.childNodes[3].childNodes[1].innerText = resized.clientWidth;
    // resized.childNodes[3].childNodes[5].innerText = resized.clientHeight;
  }
}

function dragEnd(event) {
  dragging = false;
  dragged = undefined;
  resized = undefined;
  resizing = false;
  resizedDimensions = {};
}

// WINDOW FUNCTIONS

// MAKE WINDOW ACTIVE
function checkActive(event) {
  event.preventDefault();
  if (event.target.classList.contains("inactive__window")) {
    windows.forEach(window => {
      window.classList.remove("active__window");
      window.classList.add("inactive__window");
    });
    const indicators = document.querySelectorAll(".window__indicator");
    event.target.classList.remove("inactive__window");
    event.target.classList.add("active__window");
    indicators.forEach(indicator => {
      if (indicator.dataset.windowId === event.target.id) {
        indicator.childNodes[3].classList.add("indicator--active");
      } else {
        indicator.childNodes[3].classList.remove("indicator--active");
      }
    });
  }
  if (
    event.target.classList.contains("title__bar") ||
    event.target.classList.contains("window__content") ||
    event.target.classList.contains("window__resizer")
  ) {
    windows.forEach(window => {
      window.classList.remove("active__window");
      window.classList.add("inactive__window");
    });
    const indicators = document.querySelectorAll(".window__indicator");
    event.target.parentNode.classList.remove("inactive__window");
    event.target.parentNode.classList.add("active__window");
    indicators.forEach(indicator => {
      if (indicator.dataset.windowId === event.target.parentNode.id) {
        indicator.childNodes[3].classList.add("indicator--active");
      } else {
        indicator.childNodes[3].classList.remove("indicator--active");
      }
    });
  }
}

function selectWindow(event) {
  event.preventDefault();
  if (event.target.classList.contains("window__indicator")) {
    document
      .querySelectorAll(".indicator")
      .forEach(indicator => indicator.classList.remove("indicator--active"));
    event.target.childNodes[3].classList.add("indicator--active");
    const windowId = event.target.dataset.windowId;
    const foundWindow = document.getElementById(windowId);
    windows.forEach(window => {
      window.classList.remove("active__window");
      window.classList.add("inactive__window");
    });
    foundWindow.classList.remove("inactive__window");
    foundWindow.classList.add("active__window");
    if (foundWindow.classList.contains("minimized")) {
      foundWindow.classList.remove("minimized");
      event.target.childNodes[1].classList.remove("fa-window-minimize");
    }
  }
}

// MAXIMIZE AND MINIMIZE WINDOW
function maximize(event) {
  event.preventDefault();
  const selectedWindow = event.target.parentNode.parentNode.parentNode;
  const windowId = selectedWindow.id;
  if (!selectedWindow.classList.contains("maximized")) {
    if (!selectedWindow.classList.contains("active__window")) {
      windows.forEach(window => {
        window.classList.remove("active__window");
        window.classList.add("inactive__window");
      });
      selectedWindow.classList.remove("inactive__window");
      selectedWindow.classList.add("active__window");
      const indicators = document.querySelectorAll(".window__indicator");
      selectedWindow.classList.remove("inactive__window");
      selectedWindow.classList.add("active__window");
      indicators.forEach(indicator => {
        if (indicator.dataset.windowId === selectedWindow.id) {
          indicator.childNodes[3].classList.add("indicator--active");
        } else {
          indicator.childNodes[3].classList.remove("indicator--active");
        }
      });
    }
    windowSettings[windowId].position = {
      left: selectedWindow.style.left,
      top: selectedWindow.style.top,
      h: selectedWindow.clientHeight,
      w: selectedWindow.clientWidth
    };
    selectedWindow.classList.add("maximized");
    selectedWindow.style.left = 65 + "px";
    selectedWindow.style.top = 35 + "px";
    selectedWindow.style.height = "calc(100vh - 40px)";
    selectedWindow.style.width = "calc(100vw - 70px)";
  } else {
    if (!selectedWindow.classList.contains("active__window")) {
      windows.forEach(window => {
        window.classList.remove("active__window");
        window.classList.add("inactive__window");
      });
      selectedWindow.classList.remove("inactive__window");
      selectedWindow.classList.add("active__window");
      const indicators = document.querySelectorAll(".window__indicator");
      selectedWindow.classList.remove("inactive__window");
      selectedWindow.classList.add("active__window");
      indicators.forEach(indicator => {
        if (indicator.dataset.windowId === selectedWindow.id) {
          indicator.childNodes[3].classList.add("indicator--active");
        } else {
          indicator.childNodes[3].classList.remove("indicator--active");
        }
      });
    }
    selectedWindow.classList.remove("maximized");
    selectedWindow.style.left = windowSettings[selectedWindow.id].position.left;
    selectedWindow.style.top = windowSettings[selectedWindow.id].position.top;
    selectedWindow.style.height =
      windowSettings[selectedWindow.id].position.h + "px";
    selectedWindow.style.width =
      windowSettings[selectedWindow.id].position.w + "px";
  }
  selectedWindow.childNodes[3].childNodes[1].innerText =
    selectedWindow.clientWidth;
  selectedWindow.childNodes[3].childNodes[5].innerText =
    selectedWindow.clientHeight;
}

function minimize(event) {
  const selectedWindow = event.target.parentNode.parentNode.parentNode;
  const windowId = selectedWindow.id;
  if (!selectedWindow.classList.contains("minimized")) {
    selectedWindow.classList.add("minimized");
    const indicators = document.querySelectorAll(".window__indicator");
    indicators.forEach(indicator => {
      console.log(indicator.childNodes);
      if (indicator.dataset.windowId === windowId) {
        indicator.childNodes[1].classList.add("fa-window-minimize");
      }
    });
  } else {
    selectedWindow.classList.remove("minimized");
    const indicators = document.querySelectorAll(".window__indicator");
    indicators.forEach(indicator => {
      console.log(indicator.childNodes);
      if (indicator.dataset.windowId === windowId) {
        indicator.childNodes[1].classList.remove("fa-window-minimize");
      }
    });
  }
}

function createNewWindow(event) {
  event.preventDefault();
  const windowTemplate = `
    <div class="title__bar draggable">
      <span class="window__title">Window Title</span>
      <div class="controls">
        <i class="fas fa-minus control minimizer"></i>
        <i class="fas fa-arrows-alt-v control maximizer"></i>
        <i class="fas fa-times-circle control close"></i>
      </div>
    </div>
    <div class="window__content">
    </div>
    <div class="window__resizer window__resizer--corner--top window__resizer--corner--right--top"></div>
    <div class="window__resizer window__resizer--corner--top window__resizer--corner--left--top"></div>
    <div class="window__resizer window__resizer--top"></div>
    <div class="window__resizer window__resizer--corner window__resizer--corner--right"></div>
    <div class="window__resizer window__resizer--corner window__resizer--corner--left"></div>
    <div class="window__resizer window__resizer--bottom"></div>
    <div class="window__resizer window__resizer--side window__resizer--right"></div>
    <div class="window__resizer window__resizer--side window__resizer--left"></div>
  `;
  const sidebarItem = `
    <i class="far fa-window-maximize"></i>
    <div class="indicator"></div>
  `;
  const newWindow = document.createElement("div");
  newWindow.classList.add("window", "active__window");
  newWindow.id = `window__${windows.length + 1}`;
  newWindow.innerHTML = windowTemplate;
  desktop.appendChild(newWindow);

  const sideBarElement = document.createElement("div");
  sideBarElement.classList.add("open__item", "window__indicator");
  sideBarElement.id = `window__${windows.length + 1}__sidebar`;
  sideBarElement.dataset.windowId = newWindow.id;
  sideBarElement.innerHTML = sidebarItem;
  sidebar.appendChild(sideBarElement);
  const sideBarElements = document.querySelectorAll(".window__indicator");
  sideBarElements.forEach(element => {
    element.childNodes[3].classList.remove("indicator--active");
    element.addEventListener("click", selectWindow);
  });
  sideBarElement.childNodes[3].classList.add("indicator--active");

  processWindows(newWindow);
}

function closeWindow(event) {
  event.preventDefault();
  if (event.target.classList.contains("close")) {
    const removedWindow = event.target.parentNode.parentNode.parentNode;
    removedWindow.classList.add("closed");
    const indicators = document.querySelectorAll(".window__indicator");
    indicators.forEach(indicator => {
      if (indicator.dataset.windowId === removedWindow.id) {
        sidebar.removeChild(indicator);
      }
    });
    setTimeout(() => {
      desktop.removeChild(removedWindow);
      processWindows("closed");
    }, 300);
  }
}

function processWindows(newWindow) {
  windows = document.querySelectorAll(".window");
  maximizers = document.querySelectorAll(".maximizer");
  minimizers = document.querySelectorAll(".minimizer");
  closers = document.querySelectorAll(".close");

  windows.forEach(window => {
    if (!newWindow) {
      windowSettings[window.id] = {
        position: {
          left: 0,
          top: 0,
          h: 0,
          w: 0
        }
      };
    }
    window.addEventListener("click", checkActive);
    // window.childNodes[3].childNodes[1].innerText = window.clientWidth;
    // window.childNodes[3].childNodes[5].innerText = window.clientHeight;
    window.childNodes[1].addEventListener("mousedown", dragStart);
    // window.childNodes[1].addEventListener("mouseup", dragEnd);
    if (newWindow && newWindow !== "closed") {
      window.classList.remove("active__window");
      window.classList.add("inactive__window");
      windowSettings[newWindow.id] = {
        position: {
          left: newWindow.style.left,
          top: newWindow.style.top,
          h: newWindow.clientHeight,
          w: newWindow.clientWidth
        }
      };
    }

    resizers = document.querySelectorAll(".window__resizer");
    processResizers();
  });

  maximizers.forEach(maximizer =>
    maximizer.addEventListener("click", maximize)
  );

  minimizers.forEach(minimizer =>
    minimizer.addEventListener("click", minimize)
  );

  closers.forEach(closer => closer.addEventListener("click", closeWindow));

  if (newWindow && newWindow !== "closed") {
    newWindow.classList.add("active__window");
    newWindow.classList.remove("inactive__window");
  }
}

// CLOCK
const time = document.getElementById("time");
setInterval(() => {
  time.innerText = moment().format("ddd MMM Do YYYY, h:mm A");
}, 1000);

// RESIZING
function processResizers() {
  resizers.forEach(resizer => {
    resizer.addEventListener("mousedown", resizeStart);
    resizer.addEventListener("mouseup", resizeEnd);
  });
}

processResizers();

function resizeStart(event) {
  resizing = true;
  resized = event.target.parentNode;
  resizeType = event.target.classList;
  offsetResize = [event.clientX, event.clientY];
  resizedDimensions = {
    h: resized.clientHeight,
    w: resized.clientWidth,
    l: resized.offsetLeft,
    t: resized.offsetTop
  };
}

function resizeEnd() {
  resized = undefined;
  resizing = false;
  resizeType = undefined;
  resizedDimensions = {};
}
