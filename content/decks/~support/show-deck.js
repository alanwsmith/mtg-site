const t = {
  section: `
<div class="deck-section-wrapper KIND-section">
  <div class="deck-section-title">KIND</div>
  <div class="deck-section-cards">CARDS</div>
</div>`,

  card: `<div class="card" data-send="showCard" data-id="ID">
  <img 
    alt="The NAME card from Magic: The Gathering" 
    src="/images/cards/ID.jpg">
</div>
`,
  displayCard: `<img src="/images/cards/ID.jpg" alt="Current Display Card" />`,
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
      .map((card, index) => {
        const cardSubs = [
          ["ID", card.id],
          ["NAME", card.name],
        ];
        const cardEl = this.api.makeElement(t.card, cardSubs);
        cardEl.style.setProperty("--card-index", index);
        return cardEl;
      });
    const subs = [
      ["KIND", kind],
      ["CARDS", cards],
    ];
    const deckSectionWrapper = this.api.makeElement(t.section, subs);
    deckSectionWrapper.style.setProperty("--wrapper-bump", cards.length);
    return deckSectionWrapper;
  }

  hideCard(_, __) {
    document.documentElement.style.setProperty(
      "--card-state",
      `hidden`,
    );
  }

  async loadDeck(ev, el) {
    const resp = await this.api.getJSON(el.prop("deck"));
    if (resp.value) {
      this.#cards = resp.value.cards;
      console.log(this.#cards);
    } else {
      el.innerHTML = "Error fetching JSON";
    }
    this.api.trigger("deck");
  }

  sectionKinds() {
    return [
      ...new Set(
        this.#cards
          .filter((card) => card.kind !== "commander")
          .filter((card) => card.kind !== "maybeboard")
          .map((card) => card.kind),
      ),
    ].sort();
  }

  showCard(ev, el) {
    console.log(ev.target);
    const subs = [
      ["ID", ev.prop("id")],
    ];

    if (ev.target.x < 400) {
      document.documentElement.style.setProperty(
        "--card-x",
        `${ev.target.x + 138}px`,
      );
    } else {
      document.documentElement.style.setProperty(
        "--card-x",
        `${ev.target.x - 210}px`,
      );
    }

    document.documentElement.style.setProperty(
      "--card-y",
      `${ev.target.offsetTop}px`,
    );

    document.documentElement.style.setProperty(
      "--card-state",
      `visible`,
    );

    // el.innerHTML = `<pre>
    // x: ${ev.target.x};
    // y: ${ev.target.y};
    // </pre>`;

    el.replaceChildren(this.api.makeHTML(t.displayCard, subs));
  }
}
