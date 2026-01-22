export default class {
  #colorNames = [
    "default",
    "heading",
    "link",
    "accent",
    "info",
    "black",
    "white",
    "match",
    "reverse",
  ];

  colorLines(_, el) {
    this.#colorNames.forEach((name) => {
      const subs = [
        ["COLOR", name],
      ];
      const newEls = this.api.makeHTML(this.template("color-line"), subs);
      el.appendChild(newEls);
    });
  }

  template(name) {
    switch (name) {
      case "color-line":
        return `
  <div class="two-columns COLOR-border default-margin default-border-radius default-padding">
    <div>
      <div class="COLOR-bottom-border COLOR-color">COLOR-color</div>
      <div class="faded-COLOR-bottom-border faded-COLOR-color">faded-COLOR-color</div>
    </div>
    <div class="default-padding">
     <div class="color-block COLOR-background-color"></div> 
     <div class="color-block faded-COLOR-background-color"></div> 
    </div>
  </div>
      `;
    }
  }
}
