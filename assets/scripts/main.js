"use strict";

// APP STATE
const osState = {
  dragged: undefined, // the DOM element that is being dragged
  dragging: false, // currently dragging a window?
  resizing: false, // currently resizing a window?
  resized: undefined, // the DOM element that is being resized
  mousePositionResize: undefined, // mouse position for window resize
  resizeType: undefined, // type of resize. from the corners, side, top, bottom, etc
  offsetResize: [0, 0], // window offset for resize. used to maintain window position when resizing.
  mousePosition: undefined, // mouse position for drag
  offset: [0, 0], // window offset for drag
  windowSettings: {}, // object that stores settings for all active windows.
  resizedDimensions: {} // stores dimensions for all windows
};

// INTERACTIVE DOM ELEMENTS
const osNodes = {
  resizers: document.querySelectorAll(".window__resizer"), // top, side, corner, and bottom resizer elements on each window
  desktop: document.getElementById("desktop"), // area where all windows live
  maximizers: document.querySelectorAll(".maximizer"), // maximize/minimize button on each window
  sidebar: document.getElementById("sidebar"),
  taskbar: document.getElementById("taskbar"),
  windows: document.querySelectorAll(".window"),
  newWindowButton: document.getElementById("new__window"),
  closers: document.querySelectorAll(".close"),
  menu: document.getElementById("menu"),
  menuButton: document.getElementById("menu__button")
};

// WHAT DOES THIS DO?
processWindows();

// FUNCTIONS

// INITIALIZERS
// these run at app startup, or to initialize newly created nodes

// add event listeners to all interactive elements
// another similar function will be needed for adding event listeners to new windows.
function initializeEventListeners() {
  osNodes.desktop.addEventListener("mousemove", handleDrag);
  osNodes.desktop.addEventListener("mouseup", dragEnd);
  osNodes.sidebar.addEventListener("mousemove", handleDrag);
  osNodes.sidebar.addEventListener("mouseup", dragEnd);
  osNodes.taskbar.addEventListener("mousemove", handleDrag);
  osNodes.taskbar.addEventListener("mouseup", dragEnd);
  osNodes.newWindowButton.addEventListener("click", createNewWindow);
  osNodes.menuButton.addEventListener("click", toggleMenu);
}

initializeEventListeners();

// MENU FUNCTIONS

// open and close the menu
function toggleMenu() {
  osNodes.menu.classList.toggle("menu--hidden");
}

// DRAGGING FUNCTIONS

// process and capture data when dragging starts
function dragStart(event) {
  const selectedTaskbar = event.target; // the taskbar of the window to be dragged
  const taskbarWindow = event.target.parentNode; // the parent (window) of the taskbar
  // check to see if user is dragging a draggable element
  if (selectedTaskbar.classList.contains("draggable")) {
    // set dragged variable to currently dragging window
    osState.dragged = taskbarWindow;
    // check if the newly dragged window is the active one.
    checkActive(event);
    // loop through all windows, removing any active classes and adding inactive class
    // TODO: Target only the currently active window, speed it up
    osNodes.windows.forEach(window => {
      window.classList.remove("active__window");
      window.classList.add("inactive__window");
    });
    // make the dragged window active
    osState.dragged.classList.remove("inactive__window");
    osState.dragged.classList.add("active__window");
    osState.dragging = true;
    osState.offset = [
      osState.dragged.offsetLeft - event.clientX,
      osState.dragged.offsetTop - event.clientY,
      (osState.dragged.offsetLeft +
        osState.dragged.clientWidth -
        event.clientX) *
        -1,
      (osState.dragged.offsetTop +
        osState.dragged.clientHeight -
        event.clientY) *
        -1
    ];
  }
}

// handle window dragging
// calculates new window position
function handleDrag(event) {
  event.preventDefault();
  if (osState.dragging) {
    osState.mousePosition = {
      x: event.clientX,
      y: event.clientY
    };
    let windowX = osState.mousePosition.x + osState.offset[0];
    let windowY = osState.mousePosition.y + osState.offset[1];
    let windowXR =
      (osState.mousePosition.x -
        osState.offset[2] -
        osNodes.desktop.clientWidth -
        60) *
      -1;
    let windowYB =
      (osState.mousePosition.y -
        osState.offset[3] -
        osNodes.desktop.clientHeight -
        30) *
      -1;
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
      osState.dragged.style.left = windowX + "px";
      osState.dragged.style.right = "unset";
    } else {
      osState.dragged.style.right = windowXR + "px";
      osState.dragged.style.left = "unset";
    }
    if (windowYB > 5) {
      osState.dragged.style.bottom = "unset";
      osState.dragged.style.top = windowY + "px";
    } else {
      osState.dragged.style.bottom = windowYB + "px";
      osState.dragged.style.top = "unset";
    }
  } else if (osState.resizing) {
    let newHeight;
    let newWidth;
    osState.mousePosition = {
      x: event.clientX,
      y: event.clientY
    };
    if (osState.mousePosition.x <= 70) {
      osState.mousePosition.x = 70;
    }
    if (osState.mousePosition.y <= 40) {
      osState.mousePosition.y = 40;
    }
    if (osState.mousePosition.y > window.innerHeight - 10) {
      osState.mousePosition.y = window.innerHeight - 10;
    }
    if (osState.mousePosition.x > window.innerWidth - 10) {
      osState.mousePosition.x = window.innerWidth - 10;
    }
    // BOTTOM AND BOTTOM CORNER RESIZING
    if (
      osState.resizeType.contains("window__resizer--bottom") ||
      osState.resizeType.contains("window__resizer--corner--right") ||
      osState.resizeType.contains("window__resizer--corner--left")
    ) {
      let newHeight =
        osState.resizedDimensions.h +
        (osState.mousePosition.y - osState.offsetResize[1]);
      let newWidth;
      if (newHeight < 200) {
        newHeight = 200;
      }
      osState.resized.style.height = newHeight + "px";
      if (
        osState.resizeType.contains("window__resizer--corner--right") ||
        osState.resizeType.contains("window__resizer--corner--left")
      ) {
        if (osState.resizeType.contains("window__resizer--corner--right")) {
          newWidth =
            osState.resizedDimensions.w +
            (osState.mousePosition.x - osState.offsetResize[0]);
        } else if (
          osState.resizeType.contains("window__resizer--corner--left")
        ) {
          newWidth =
            osState.resizedDimensions.w -
            (osState.mousePosition.x - osState.offsetResize[0]);
        }
        if (newWidth < 300) {
          newWidth = 300;
          if (osState.resizeType.contains("window__resizer--corner--left")) {
            osState.resized.style.left =
              osState.resizedDimensions.l +
              (osState.resizedDimensions.w - newWidth) +
              "px";
          }
        } else if (
          osState.resizeType.contains("window__resizer--corner--left")
        ) {
          osState.resized.style.left =
            osState.resizedDimensions.l +
            (osState.mousePosition.x - osState.offsetResize[0]) +
            "px";
        }
        osState.resized.style.width = newWidth + "px";
      }
    }
    // TOP AND TOP CORNER RESIZING
    else if (
      osState.resizeType.contains("window__resizer--top") ||
      osState.resizeType.contains("window__resizer--corner--right--top") ||
      osState.resizeType.contains("window__resizer--corner--left--top")
    ) {
      let newHeight =
        osState.resizedDimensions.h -
        (osState.mousePosition.y - osState.offsetResize[1]);
      let newWidth;
      if (newHeight < 200) {
        newHeight = 200;
        osState.resized.style.top =
          osState.resizedDimensions.t +
          (osState.resizedDimensions.h - newHeight) +
          "px";
      } else {
        osState.resized.style.top =
          osState.resizedDimensions.t +
          (osState.mousePosition.y - osState.offsetResize[1]) +
          "px";
      }
      osState.resized.style.height = newHeight + "px";
      if (
        osState.resizeType.contains("window__resizer--corner--right--top") ||
        osState.resizeType.contains("window__resizer--corner--left--top")
      ) {
        if (
          osState.resizeType.contains("window__resizer--corner--right--top")
        ) {
          newWidth =
            osState.resizedDimensions.w +
            (osState.mousePosition.x - osState.offsetResize[0]);
        } else if (
          osState.resizeType.contains("window__resizer--corner--left--top")
        ) {
          newWidth =
            osState.resizedDimensions.w -
            (osState.mousePosition.x - osState.offsetResize[0]);
        }
        if (newWidth < 300) {
          newWidth = 300;
          if (
            osState.resizeType.contains("window__resizer--corner--left--top")
          ) {
            osState.resized.style.left =
              osState.resizedDimensions.l +
              (osState.resizedDimensions.w - newWidth) +
              "px";
          }
        } else if (
          osState.resizeType.contains("window__resizer--corner--left--top")
        ) {
          osState.resized.style.left =
            osState.resizedDimensions.l +
            (osState.mousePosition.x - osState.offsetResize[0]) +
            "px";
        }
        osState.resized.style.width = newWidth + "px";
      }
    } else if (
      osState.resizeType.contains("window__resizer--right") ||
      osState.resizeType.contains("window__resizer--left")
    ) {
      let newWidth;
      if (osState.resizeType.contains("window__resizer--right")) {
        newWidth =
          osState.resizedDimensions.w +
          (osState.mousePosition.x - osState.offsetResize[0]);
      } else if (osState.resizeType.contains("window__resizer--left")) {
        newWidth =
          osState.resizedDimensions.w -
          (osState.mousePosition.x - osState.offsetResize[0]);
      }
      if (newWidth <= 300) {
        newWidth = 300;
        if (osState.resizeType.contains("window__resizer--left")) {
          osState.resized.style.left =
            osState.resizedDimensions.l +
            (osState.resizedDimensions.w - newWidth) +
            "px";
        }
      } else if (osState.resizeType.contains("window__resizer--left")) {
        osState.resized.style.left =
          osState.resizedDimensions.l +
          (osState.mousePosition.x - osState.offsetResize[0]) +
          "px";
      }
      osState.resized.style.width = newWidth + "px";
    }
    // resized.childNodes[3].childNodes[1].innerText = resized.clientWidth;
    // resized.childNodes[3].childNodes[5].innerText = resized.clientHeight;
  }
}

function dragEnd(event) {
  osState.dragging = false;
  osState.dragged = undefined;
  osState.resized = undefined;
  osState.resizing = false;
  osState.resizedDimensions = {};
}

// WINDOW FUNCTIONS

// MAKE WINDOW ACTIVE
function checkActive(event) {
  event.preventDefault();
  // check if window is active
  if (event.target.classList.contains("inactive__window")) {
    osNodes.windows.forEach(window => {
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
    osNodes.windows.forEach(window => {
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
    osNodes.windows.forEach(window => {
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
    osState.windowSettings[windowId].position = {
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
    selectedWindow.style.left =
      osState.windowSettings[selectedWindow.id].position.left;
    selectedWindow.style.top =
      osState.windowSettings[selectedWindow.id].position.top;
    selectedWindow.style.height =
      osState.windowSettings[selectedWindow.id].position.h + "px";
    selectedWindow.style.width =
      osState.windowSettings[selectedWindow.id].position.w + "px";
  }
  // selectedWindow.childNodes[3].childNodes[1].innerText =
  //   selectedWindow.clientWidth;
  // selectedWindow.childNodes[3].childNodes[5].innerText =
  //   selectedWindow.clientHeight;
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
  newWindow.id = `window__${osNodes.windows.length + 1}`;
  newWindow.innerHTML = windowTemplate;
  osNodes.desktop.appendChild(newWindow);

  const sideBarElement = document.createElement("div");
  sideBarElement.classList.add("open__item", "window__indicator");
  sideBarElement.id = `window__${osNodes.windows.length + 1}__sidebar`;
  sideBarElement.dataset.windowId = newWindow.id;
  sideBarElement.innerHTML = sidebarItem;
  osNodes.sidebar.appendChild(sideBarElement);
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
      osNodes.desktop.removeChild(removedWindow);
      osNodes.resizers = document.querySelectorAll(".window__resizer");
      processResizers();
      processWindows("closed");
    }, 300);
  }
}

// add event listeners to all windows and window controls.
// used when new windows are created.
function processWindows(newWindow) {
  osNodes.windows = document.querySelectorAll(".window");
  osNodes.maximizers = document.querySelectorAll(".maximizer");
  osNodes.minimizers = document.querySelectorAll(".minimizer");
  osNodes.closers = document.querySelectorAll(".close");

  osNodes.windows.forEach(window => {
    if (!newWindow) {
      osState.windowSettings[window.id] = {
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
      osState.windowSettings[newWindow.id] = {
        position: {
          left: newWindow.style.left,
          top: newWindow.style.top,
          h: newWindow.clientHeight,
          w: newWindow.clientWidth
        }
      };
    }

    osNodes.resizers = document.querySelectorAll(".window__resizer");
    processResizers();
  });

  osNodes.maximizers.forEach(maximizer =>
    maximizer.addEventListener("click", maximize)
  );

  osNodes.minimizers.forEach(minimizer =>
    minimizer.addEventListener("click", minimize)
  );

  osNodes.closers.forEach(closer =>
    closer.addEventListener("click", closeWindow)
  );

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
  osNodes.resizers.forEach(resizer => {
    resizer.addEventListener("mousedown", resizeStart);
    resizer.addEventListener("mouseup", resizeEnd);
  });
}

processResizers();

function resizeStart(event) {
  osState.resizing = true;
  osState.resized = event.target.parentNode;
  osState.resizeType = event.target.classList;
  osState.offsetResize = [event.clientX, event.clientY];
  osState.resizedDimensions = {
    h: osState.resized.clientHeight,
    w: osState.resized.clientWidth,
    l: osState.resized.offsetLeft,
    t: osState.resized.offsetTop
  };
}

function resizeEnd() {
  osState.resized = undefined;
  osState.resizing = false;
  osState.resizeType = undefined;
  osState.resizedDimensions = {};
}
