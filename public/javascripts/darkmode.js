// check for saved 'darkMode' in localStorage
let darkMode = localStorage.getItem("darkMode");

const darkModeToggle = document.querySelector("#dark-mode-toggle");

const enableDarkMode = () => {
  // 1. Add the class to the body
  document.body.classList.add("darkmode");
  // 2. Update darkMode in localStorage
  localStorage.setItem("darkMode", "enabled");
  document.getElementById("dark-mode-toggle").innerHTML = "Toggle Light Mode";
};

const disableDarkMode = () => {
  // 1. Remove the class from the body
  document.body.classList.remove("darkmode");
  // 2. Update darkMode in localStorage
  localStorage.setItem("darkMode", null);
  document.getElementById("dark-mode-toggle").innerHTML = "Toggle Dark Mode";
};

// If the user already visited and enabled darkMode
// start things off with it on
if (darkMode === "enabled" || getPreference()) {
  enableDarkMode();
}

// When someone clicks the button
darkModeToggle.addEventListener("click", () => {
  console.log(darkMode);
  // get their darkMode setting
  darkMode = localStorage.getItem("darkMode");

  // if it not current enabled, enable it
  if (darkMode !== "enabled") {
    enableDarkMode();
    // if it has been enabled, turn it off
  } else {
    disableDarkMode();
  }
});

function getPreference() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
