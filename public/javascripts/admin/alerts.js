class AlertManager {
    constructor(clearAfter = 10000) {
        this.root = document.getElementById("alerts");
        this.types = [
            "primary",
            "secondary",
            "success",
            "danger",
            "warning",
            "info",
            "light",
            "dark",
        ];

        this.classes = ["alert", "alert-dismissible", "fade", "show"];

        this.clearAfterMs = clearAfter;

        this.refreshRate = 100; // 0.1 seconds
    }

    isLevelValid(level) {
        return this.types.indexOf(level) !== -1;
    }

    addAlert(title, message, level = "primary") {
        level = level.toLowerCase();
        level = this.isLevelValid(level) ? level : this.types[0];

        const alert = document.createElement("div");

        alert.classList.add("alert-" + level);
        for (let bsClass of this.classes) {
            alert.classList.add(bsClass);
        }

        if (title !== "") title += ":";

        alert.innerHTML = `<strong>${title}</strong> ${message}`;

        const dismissButton = document.createElement("button");

        dismissButton.type = "button";
        dismissButton.classList.add("close");
        dismissButton.setAttribute("data-dismiss", "alert");
        dismissButton.setAttribute("aria-label", "Close");
        dismissButton.setAttribute(
            "data-created-at",
            `${new Date().getTime()}`
        );

        const buttonText = document.createElement("span");
        buttonText.setAttribute("aria-hidden", "true");
        buttonText.innerHTML = "&times;";

        dismissButton.appendChild(buttonText);

        alert.appendChild(dismissButton);

        this.root.appendChild(alert);
    }

    deleteOld() {
        const alerts = this.root.getElementsByClassName(this.classes[0]);

        const timeNow = new Date().getTime();

        for (let alert of alerts) {
            let createdAt = Number(
                alert.lastChild.getAttribute("data-created-at")
            );

            if (timeNow - createdAt > this.clearAfterMs) {
                alert.lastChild.click();
            }
        }
    }

    deleteAll() {
        while (this.root.firstChild) {
            this.root.removeChild(this.root.firstChild);
        }
    }
}

const alertManager = new AlertManager(1_500 /* value in ms */);

setInterval(() => {
    alertManager.deleteOld();
}, alertManager.refreshRate);
