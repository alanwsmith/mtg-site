class Deck {
  constructor(data) {
    debug("Initializing deck.");
    this._data = data;
    this._data.activeCard = null;
    if (~this._data.changes) {
      this._data.changes = [];
    }
    this.save();
  }

  activeCard() {
    return this._data.activeCard;
  }

  addCardFilterChange(id, from, to) {
    this._data.changes.push({
      type: "cardFilterChange",
      from: from,
      id: id,
      index: this.cardIndex(id),
      to: to,
    });
    this.getCard(id).filter = to;
    // debug(this._data.changes[this._data.changes.length - 1]);
    this.save();
  }

  cards() {
    return this._data.cards.map((card) => card.card.uid);
  }

  cardCategory(id) {
    return this.getCard(id).categories[0];
  }

  cardControls(id) {
    if (id === this.activeCard()) {
      return "visible";
    } else {
      return "hidden";
    }
  }

  cardQuantity(id) {
    return this.getCard(id).quantity;
  }

  cardFilter(id) {
    if (this.getCard(id).filter !== undefined) {
      return this.getCard(id).filter;
    } else {
      return 2;
    }
  }

  cardImage(id) {
    return `<img 
src="/images/large-cards/${id}.jpg"
alt="The ${this.cardName(id)} card from Magic: The Gathering" />`;
  }

  cardIndex(id) {
    return this.cardsInCategory(this.cardCategory(id))
      .map((cid, index) => {
        return { cid: cid, index: index };
      })
      .filter((card) => card.cid === id)[0].index;
  }

  cardIsVisible(id) {
    if (this.deckFilter() === 0) {
      if (this.cardFilter(id) === 0) {
        return true;
      } else {
        return false;
      }
    }
    if (this.cardFilter(id) >= this.deckFilter()) {
      return true;
    } else {
      return false;
    }
  }

  cardName(id) {
    return this.getCard(id).card.oracleCard.name;
  }

  cardPosition(id) {
    if (
      this.cardsInCategory(this.cardCategory(id)).indexOf(id) ===
        this.cardsInCategory(this.cardCategory(id)).length - 1
    ) {
      return "last";
    } else {
      return "not-last";
    }
  }

  cardsInCategory(category) {
    return this.cards().filter((id) => {
      if (this.cardCategory(id) === category) {
        return this.cardIsVisible(id);
      }
    }).sort((a, b) => {
      if (this.cardName(a) > this.cardName(b)) {
        return 1;
      } else {
        return -1;
      }
    });
  }

  cardState(id) {
    if (this.activeCard() === id) {
      return "opened";
    } else if (
      this.activeCard() === null &&
      this.cardPosition(id) === "last"
    ) {
      return "opened";
    } else if (
      this.activeCard() !== null &&
      this.cardCategory(id) !== this.cardCategory(this.activeCard()) &&
      this.cardPosition(id) === "last"
    ) {
      return "opened";
    } else {
      return "closed";
    }
  }

  categories() {
    return this._data.categories
      .map((categoryObj) => {
        return categoryObj.name.replace(" ", "_");
      })
      .sort((a, b) => {
        return a.toLowerCase() > b.toLowerCase() ? 1 : -1;
      })
      .filter((category) => {
        return this.cardsInCategory(category).length > 0;
      });
  }

  categoryCardQuantity(category) {
    if (this.deckFilter() === -1) {
      return "-";
    } else {
      return this.cards()
        .filter((id) => this.deckFilter() >= 0)
        .filter((id) => this.cardCategory(id) === category)
        .filter((id) => this.cardFilter(id) >= this.deckFilter())
        .map((id) => this.cardQuantity(id))
        .reduce((acc, cur) => acc + cur, 0);
    }
  }

  deckFilter() {
    if (!this._data.deckFilter) {
      return 0;
    } else {
      return this._data.deckFilter;
    }
  }

  deckSize() {
    if (this.deckFilter() === this.outIndex()) {
      return "-";
    } else {
      return this.categories()
        .map((category) => this.categoryCardQuantity(category))
        .reduce((acc, cur) => acc + cur, 0);
    }
  }

  getCard(id) {
    return this._data.cards.find((card) => card.card.uid === id);
  }

  outIndex() {
    return 0;
  }

  save() {
    localStorage.setItem("refinerDeck", JSON.stringify(this._data));
    debug("Saved deck to storage.");
  }

  setCardFilter(id, filter) {
    this._data.cards.forEach((card) => {
      if (id === card.card.uid) {
        if (card.filter !== filter) {
          this.addCardFilterChange(id, card.filter, filter);
        }
      }
    });
  }

  setDeckFilter(filter) {
    debug(`Set Deck Filter to ${filter}`);
    this._data.deckFilter = filter;
    this.save();
  }

  setActiveCard(id) {
    this._data.activeCard = id;
    // debug(`Active card: ${id}`);
  }
}
