const template_names = ["phase", "phases", "subPhase", "subPhases"];

export class Magic {
  #data = null;
  #templates = {};

  async loadData(_, el) {
    const response = await this.api.getJSON("/bits/magic.json");
    if (response.value) {
      await this.loadTemplates();
      this.#data = response.value;
      el.replaceChildren(this.renderPhases());
    } else {
      el.innerHTML =
        "Something broke. Alas, that happens with personal tools sometimes.";
    }
  }

  async loadTemplates() {
    for (const template of template_names) {
      const response = await this.api.getTXT(`/templates/${template}`);
      if (response.value) {
        this.#templates[template] = response.value;
      }
    }
  }

  renderPhase(phase) {
    return this.api.makeHTML(this.#templates.phase, [[
      "NAME",
      phase.name,
    ], [
      "SUBPHASES",
      this.renderSubPhases(phase.subPhases),
    ]]);
  }

  renderPhases() {
    const phaseArray = this.#data.phases.map((phase) => {
      return this.renderPhase(phase);
    });
    return this.api.makeHTML(this.#templates.phases, [["PHASES", phaseArray]]);
  }

  renderSubPhase(subPhase) {
    return subPhase.name;
  }

  renderSubPhases(subPhases) {
    const phaseArray = subPhases.map((subPhase) => {
      return this.renderSubPhase(subPhase);
    });
    return this.api.makeHTML(this.#templates.subPhases, [[
      "SUBPHASES",
      phaseArray,
    ]]);
  }
}
