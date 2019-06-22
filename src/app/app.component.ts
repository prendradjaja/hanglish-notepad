import { Component, ViewChild, ElementRef } from "@angular/core";

// todo doesn't typescript have a way of doing tagged union(?)s
const NORMAL_MODE = {
  id: "normal"
};
type NormalMode = typeof NORMAL_MODE;
type DigraphMode = {
  id: "digraph";
  previousLetter: string;
};
type Mode = NormalMode | DigraphMode;

function isNormalMode(mode: Mode) {
  return mode.id === "normal";
}

function isDigraphMode(mode: Mode) {
  return mode.id === "digraph";
}

// todo bug: select all then type a digraph (trying to replace contents) -- won't work bc it's already in digraph mode from the A from cmd-a

// todo font: (& then make sure app supports it too)
// - ai
// - oa ue oi etc
// - yo
// - wo, wu, wO, wU

// todo one-letter mappings
// - I -> i
// - <space>i -> Ni? (also <space>I?)

// todo trailing commas
const DIGRAPHS = {
  // true digraphs
  ng: "N",
  sh: "S",
  th: "T",

  ch: "c",

  // wV and yV
  // todo remaining vowel combos
  wa: "oa",
  wA: "oA", // todo shift key doesn't work for digraphs
  "w@": "o@", // todo fuck, digraphs was the wrong decision, i really want "wau" to work. also "wai"
  we: "ue",
  wi: "ui",
  wo: "?", // todo
  wu: "?", // todo

  au: "@",
  ai: "Å",

  // yu
  yu: "U"
};
const DIGRAPH_FIRSTS = makeDigraphFirsts(DIGRAPHS);

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {
  // todo static?
  @ViewChild("textbox", { static: false }) textbox: ElementRef;

  title = "hanglish-notepad";

  mode: Mode = NORMAL_MODE;

  handleBlur(event) {
    // not sure why i can't do preventDefault
    event.target.focus();
    this.mode = NORMAL_MODE;
  }

  handleKey(event) {
    // todo bug: shift key handling for digraphs
    const letter = event.key;
    if (isNormalMode(this.mode)) {
      this.handleKeyNormal(letter);
    } else if (isDigraphMode(this.mode)) {
      this.handleKeyDigraph(letter, event);
    }
  }

  handleKeyNormal(letter: string) {
    if (DIGRAPH_FIRSTS.includes(letter)) {
      this.mode = {
        id: "digraph",
        previousLetter: letter
      };
    }
  }

  handleKeyDigraph(letter: string, event) {
    const digraph = (this.mode as DigraphMode).previousLetter + letter;
    if (Object.keys(DIGRAPHS).includes(digraph)) {
      // stop the pressed letter from appearing
      event.preventDefault();
      const result = DIGRAPHS[digraph];
      const textboxEl: HTMLTextAreaElement = this.textbox.nativeElement;
      const text = textboxEl.value;

      // remove the previous letter
      // todo lol this doesn't work if you're typing in the middle of the doc not the end
      // todo should i add defensiveness for if somehow we get in an erroneous state and previous letter is not what it should be
      textboxEl.value = text.substring(0, text.length - 1);

      // add the digraph
      textboxEl.value += result;

      this.mode = NORMAL_MODE;
    } else if (DIGRAPH_FIRSTS.includes(letter)) {
      this.mode = {
        id: "digraph",
        previousLetter: letter
      };
    } else {
      this.mode = NORMAL_MODE;
    }
  }
}

function makeDigraphFirsts(digraphs: typeof DIGRAPHS) {
  // todo pipe with ramda or something?
  const firstLetters = Object.keys(digraphs).map(x => x.charAt(0));
  const uniqueFirstLetters = Array.from(new Set(firstLetters));
  return uniqueFirstLetters;
}
