const t = {
  input: `
<div class="section-title">Archidekt List</div>
<textarea 
  class="archidekt-list" 
  data-send="archidektList"
  data-receive="archidektExampleList"
></textarea>`,
  button: `
<button 
  data-send="archidektExampleList"
  class="ui-button example-button"
>Load Example Archidekt List</button>`,
};

export class ArchidektParser {
  #errors;
  #idMap;

  async bittyInit() {
    await this.loadIdMap();
  }

  archidektInput(_, el) {
    el.replaceChildren(this.api.makeHTML(t.input));
  }

  archidektList(ev, _) {
    if (ev.value.trim() !== "") {
      console.log(parse(ev.value));
    }
  }

  archidektExampleButton(_, el) {
    el.replaceChildren(
      this.api.makeHTML(t.button),
    );
  }

  archidektExampleList(_, el) {
    el.value = "asd";
  }

  async loadIdMap() {
    const url =
      "https://raw.githubusercontent.com/alanwsmith/mtg-data/refs/heads/main/docs/v1/misc/names-to-scryfall-ids.json";
    const response = await this.api.getJSON(url);
    if (response.value) {
      this.#idMap = response.value;
    } else {
      this.#errors.push(response.error);
    }
  }

  parse(input) {
    const cardMatcher = /(\d+)x\s+(.*?)\s+\(.*?\[(\w+).*/;
    return input.split("\n")
      .map((line) => line.match(cardMatcher))
      .filter((match) => match !== null)
      .filter((match) => match[3] !== undefined)
      .map((match, index) => {
        const id = this.#idMap[match[2]];
        return {
          name: match[2],
          id: id,
          count: match[1],
          kind: match[3].toLowerCase(),
          line: match[0],
          char1: id.substring(0, 1),
          char2: id.substring(1, 2),
        };
      });
  }

  //
}
