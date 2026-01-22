export class Main {
  bittyReady() {
    this.api.setProp("--load-hider", "1");
  }
}

export class ThemeSwitcher {
  #themes = [
    ["auto", "Auto"],
    ["light", "Light"],
    ["dark", "Dark"],
  ];

  #extraStyles = new CSSStyleSheet();

  bittyReady() {
    document.adoptedStyleSheets.push(this.#extraStyles);
    this.api.trigger("doUpdates");
  }

  doUpdates(_, __) {
    this.api.trigger("updateStyles syncCheckedTheme syncHighContrast");
  }

  getCurrentContrast() {
    return localStorage.getItem("contrast")
      ? localStorage.getItem("contrast")
      : "";
  }

  getCurrentTheme() {
    return localStorage.getItem("theme")
      ? localStorage.getItem("theme")
      : "auto";
  }

  setTheme(ev, _) {
    localStorage.setItem("theme", ev.prop("key"));
    switchColorStyles();
    this.api.trigger("doUpdates");
  }

  updateStyles(_, __) {
    if (
      this.getCurrentTheme() === "auto" && this.getCurrentContrast() === "hc-"
    ) {
      const content = [];
      content.push(`:root {`);
      colors.forEach((color) => {
        content.push(`--${color}-color: var(--hc-light--${color}-color);`);
        content.push(
          `--faded-${color}-color: var(--hc-light--faded-${color}-color);`,
        );
      });
      content.push("}");
      content.push(`@media (prefers-color-scheme: dark) { :root {`);
      colors.forEach((color) => {
        content.push(`--${color}-color: var(--hc-dark--${color}-color);`);
        content.push(
          `--faded-${color}-color: var(--hc-dark--faded-${color}-color);`,
        );
      });
      content.push("}}");
      this.#extraStyles.replaceSync(content.join("\n"));
    } else {
      this.#extraStyles.replaceSync("");
    }
  }

  themeSwitcher(_, el) {
    const switcher = this.api.makeElement(this.template("switcher"));
    for (let theme of this.#themes) {
      const subs = [
        ["KEY", theme[0]],
        ["NAME", theme[1]],
      ];
      const option = this.api.makeElement(this.template("item"), subs);
      switcher.appendChild(option);
    }
    switcher.appendChild(this.api.makeElement(this.template("spacer")));
    switcher.appendChild(this.api.makeElement(this.template("hc-button")));
    el.replaceChildren(switcher);
  }

  toggleHighContrast(ev, _) {
    let current = localStorage.getItem("contrast")
      ? localStorage.getItem("contrast")
      : "";
    if (current === "") {
      localStorage.setItem("contrast", "hc-");
    } else {
      localStorage.setItem("contrast", "");
    }
    switchColorStyles();
    this.api.trigger("doUpdates");
  }

  syncCheckedTheme(_, el) {
    if (el.prop("key") === this.getCurrentTheme()) {
      el.classList.add("active");
    } else {
      el.classList.remove("active");
    }
  }

  syncHighContrast(_, el) {
    if (this.getCurrentContrast() === "hc-") {
      el.classList.add("active");
    } else {
      el.classList.remove("active");
    }
  }

  template(template) {
    switch (template) {
      case "hc-button":
        return `<button
  class="contrast-button"
  data-send="toggleHighContrast"
  data-receive="syncHighContrast"
>High Contrast</button>`;

      case "item":
        return `<button
  data-key="KEY" 
  data-send="setTheme" 
  data-receive="syncCheckedTheme" 
>NAME</button>`;

      case "spacer":
        return `<span>|</span>`;

      case "switcher":
        return `<div class="theme-switcher"><span>|</span> Colors: </div>`;
    }
  }
}

export class CodeBlockControls {
  #timeouts = {};

  bittyReady() {
    this.api.querySelectorAll(".code-block").forEach((codeBlock, index) => {
      if (!codeBlock.classList.contains("nobuttons")) {
        codeBlock.dataset.receive = "toggleWrap";
        const signals = codeBlock.dataset.receive
          ? [codeBlock.dataset.receive]
          : [];
        signals.push("codeBlock");
        codeBlock.dataset.receive = signals.join(" ");
        const subs = [
          ["INDEX", index],
          ["BLOCK", codeBlock],
        ];
        const newWrapper = this.api.makeElement(
          this.template("code-block-wrapper"),
          subs,
        );
        codeBlock.replaceWith(newWrapper);
      }
    });
  }

  async copyText(ev, el) {
    if (el.propMatchesSender("index")) {
      try {
        await navigator.clipboard.writeText(el.innerText);
        ev.sender.innerHTML = "Copied";
        if (this.#timeouts[el.bittyId]) {
          clearTimeout(this.#timeouts[el.bittyId]);
        }
        this.#timeouts[el.bittyId] = setTimeout(() => {
          ev.sender.innerHTML = "Copy";
        }, 1400);
      } catch (err) {
        console.error("Could not copy to clipboard");
      }
    }
  }

  template(name) {
    switch (name) {
      case "code-block-wrapper":
        return `
<div data-index="INDEX">
  <div data-receive="copyText">BLOCK</div>
  <div class="text-align-right">
    <button data-send="toggleWrap">ToggleWrap</button>
    <button data-send="copyText">Copy</button>
  </div>
</div>`;
    }
  }

  toggleWrap(_, el) {
    if (el.propMatchesSender("index")) {
      el.classList.toggle("nowrap");
    }
  }
}

export class ImageUpdater {
  bittyReady() {
    this.api.querySelectorAll("img").forEach((image, index) => {
      if (image.alt) {
        const subs = [
          ["IMAGE", image],
          ["TEXT", image.alt],
        ];
        const newWrapper = this.api.makeElement(
          this.template("image-wrapper"),
          subs,
        );
        image.replaceWith(newWrapper);
      }
    });
  }

  template(name) {
    switch (name) {
      case "image-wrapper":
        return `
<div class="image-block">
  <div class="image">IMAGE</div>
  <div class="image-details">
    <details>
      <summary>alt text</summary>
      <div>TEXT</div>
    </details>
  </div>
</div>
`;
    }
  }
}

export class DetailsOpener {
  #state;

  bittyReady() {
    this.loadState();
    this.setTagState();
    this.watchTags();
  }

  numberOfTags() {
    return document.querySelectorAll("details").length;
  }

  setTagState() {
    document.querySelectorAll("details").forEach((tag, tagIndex) => {
      if (
        this.#state.openTags.has(tagIndex)
      ) {
        tag.open = true;
      } else {
        tag.open = false;
      }
    });
  }

  loadState() {
    const storage = localStorage.getItem(this.storageName());
    this.#state = {
      numberOfTags: this.numberOfTags(),
      openTags: new Set(),
    };
    document.querySelectorAll("details").forEach((tag, tagIndex) => {
      if (tag.open === true) {
        this.#state.openTags.add(tagIndex);
      }
    });
    if (storage !== null) {
      const data = JSON.parse(storage).state;
      if (this.numberOfTags() === data.numberOfTags) {
        this.#state = {
          numberOfTags: data.numberOfTags,
          openTags: new Set(data.openTags),
        };
      }
    }
  }

  saveState() {
    localStorage.setItem(
      this.storageName(),
      JSON.stringify({
        "state": {
          numberOfTags: this.#state.numberOfTags,
          openTags: [...this.#state.openTags],
        },
      }),
    );
  }

  storageName() {
    return `details-state-${window.location.pathname}`;
  }

  watchTags() {
    document.querySelectorAll("details").forEach((tag, tagIndex) => {
      tag.addEventListener("toggle", (event) => {
        if (tag.open) {
          this.#state.openTags.add(tagIndex);
        } else {
          this.#state.openTags.delete(tagIndex);
        }
        this.saveState();
      });
    });
  }
}
