const t = {
  section: `
<div class="deck-section-wrapper KIND-section">
  <div class="deck-section-title">KIND</div>
  <div class="deck-section-cards">CARDS</div>
</div>`,

  card: `<div class="card" data-send="showCard" data-id="ID">
  <img 
    alt="The NAME card from Magic: The Gathering" 
    src="/images/cards/ID.jpg"
    data-id="ID"
  />
</div>
`,
  displayCard: `<img src="/images/cards/ID.jpg" alt="Current Display Card" />`,
};

export class ShowDeck {
  #cards;
  #currentEl;

  bittyReady() {
    document.addEventListener("mousemove", (event) => {
      window.requestAnimationFrame(() => {
        this.update(event);
      });
    });
  }

  update(event) {
    const el = document.elementFromPoint(event.clientX, event.clientY);
    if (el.dataset.id) {
      if (this.#currentEl !== el) {
        this.#currentEl = el;
        this.api.trigger("showCard");
      }
    } else {
      document.documentElement.style.setProperty(
        "--card-state",
        `hidden`,
      );
    }
  }

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

  showCard(_, el) {
    const rect = this.#currentEl.getBoundingClientRect();

    const subs = [
      ["ID", this.#currentEl.dataset.id],
    ];

    if (rect.x < 400) {
      document.documentElement.style.setProperty(
        "--card-x",
        `${rect.x + 130}px`,
      );
    } else {
      document.documentElement.style.setProperty(
        "--card-x",
        `${rect.x - 200}px`,
      );
    }

    document.documentElement.style.setProperty(
      "--card-y",
      `${this.#currentEl.offsetTop}px`,
    );

    document.documentElement.style.setProperty(
      "--card-state",
      `visible`,
    );
    console.log(rect);

    el.innerHTML = `<pre>
    x: ${rect.x};
    y: ${rect.y};
    </pre>`;

    el.replaceChildren(this.api.makeHTML(t.displayCard, subs));
  }
}
