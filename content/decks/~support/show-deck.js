const t = {
  section: `
<div class="deck-section-wrapper KIND-section">
  <div class="deck-section-title">KIND</div>
  <div class="deck-section">CARDS</div>
</div>`,

  card: `<div class="card">
  <img 
    alt="The NAME card from Magic: The Gathering" 
    src="/images/cards/ID.jpg">
</div>
`,
};

export class ShowDeck {
  #cards;

  deck(_, el) {
    el.replaceChildren(this.getCards("commander"));
    this.sectionKinds().forEach((section) =>
      el.appendChild(this.getCards(section))
    );
  }

  getCards(kind) {
    const cards = this.#cards
      .filter((card) => card.kind === kind)
      .map((card) => {
        const cardSubs = [
          ["ID", card.id],
          ["NAME", card.name],
        ];
        return this.api.makeHTML(t.card, cardSubs);
      });
    const subs = [
      ["KIND", kind],
      ["CARDS", cards],
    ];
    return this.api.makeHTML(t.section, subs);
  }

  sectionKinds() {
    return [
      ...new Set(
        this.#cards.filter((card) => card.kind !== "commander").map((card) =>
          card.kind
        ),
      ),
    ].sort();
  }

  async loadDeck(ev, el) {
    const resp = await this.api.getJSON(el.prop("deck"));
    if (resp.value) {
      this.#cards = resp.value.cards;
      console.log(this.#cards);

      // el.replaceChildren(
      //   ...response.value.cards
      //     .filter((card) => card.kind !== "mabybeboard")
      //     .map((card) => {
      //       const subs = [["ID", card.id]];
      //       return this.api.makeHTML(t.card, subs);
      //     }),
      // );
    } else {
      el.innerHTML = "Error fetching JSON";
    }
    this.api.trigger("deck");
  }
}
