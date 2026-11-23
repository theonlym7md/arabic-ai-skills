"use strict";

const cases = [
  { id: "landing", number: "٠١", title: "صفحة هبوط", subtitle: "اكتشاف ورش نهاية الأسبوع" },
  { id: "payment", number: "٠٢", title: "صفحة دفع", subtitle: "انقطع الاتصال بعد محاولة الدفع" },
  {
    id: "login",
    number: "٠٣",
    title: "تسجيل دخول",
    subtitle: "البريد للتذاكر، والتصفح متاح للجميع",
  },
];

function make(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function buildScreen(scenario, mode, copy) {
  const pane = make("div", "pane");
  const modeHeading = make("h3", `mode mode--${mode}`);
  if (mode === "with") {
    modeHeading.append("بعد · مع ");
    const brand = make("bdi", null, "ArabicSkill");
    brand.dir = "ltr";
    brand.lang = "en";
    modeHeading.append(brand);
  } else {
    modeHeading.textContent = "قبل · بدون مهارة";
  }
  pane.append(modeHeading);

  const screen = make("div", `screen screen--${scenario.id}`);
  const bar = make("div", "screen-bar");
  const wordmark = make("span", "wordmark", "فسحة");
  const mark = make("span", "brand-mark");
  mark.setAttribute("aria-hidden", "true");
  wordmark.prepend(mark);
  bar.append(wordmark, make("span", "screen-meta", scenario.subtitle));
  screen.append(bar);

  const layout = make("div", "layout");
  const copyBox = make("div", "copy");
  copyBox.append(
    make("p", "eyebrow", copy.eyebrow),
    make("h4", "screen-title", copy.title),
    make("p", "body-copy", copy.body),
  );

  if (scenario.id === "payment") {
    const row = make("div", "order");
    row.append(make("span", null, "تذكرة واحدة"), make("strong", null, "١٢٠ ريالًا"));
    copyBox.append(row);
  }
  if (scenario.id === "login") {
    const email = make("div", "email");
    const example = make("bdi", null, "name@example.com");
    example.dir = "ltr";
    example.lang = "en";
    email.append(make("span", null, "البريد الإلكتروني"), example);
    copyBox.append(email);
  }

  const actions = make("ul", "actions");
  actions.append(make("li", "primary", copy.primary));
  if (copy.secondary) actions.append(make("li", "secondary", copy.secondary));
  copyBox.append(actions);
  layout.append(copyBox);
  if (scenario.id === "landing") {
    const art = make("div", "workshop-art");
    art.setAttribute("aria-hidden", "true");
    art.append(make("span", "art-orbit"), make("span", "art-cut"), make("span", "art-seed"));
    layout.append(art);
  }
  screen.append(layout);
  pane.append(screen);
  return pane;
}

const gallery = document.querySelector("#demos");
for (const scenario of cases) {
  const board = make("section", `board board--${scenario.id}`);
  board.id = scenario.id;
  const headingId = `${scenario.id}-heading`;
  board.setAttribute("aria-labelledby", headingId);
  const header = make("header", "board-head");
  const number = make("span", "board-id", scenario.number);
  number.setAttribute("aria-hidden", "true");
  const heading = make("div");
  const h2 = make("h2", null, scenario.title);
  h2.id = headingId;
  heading.append(make("p", "board-series", "مختبر الواجهات العربية"), h2);
  header.append(number, heading);
  const pair = make("div", "pair");
  for (const mode of ["without", "with"]) {
    pair.append(buildScreen(scenario, mode, demoCopy[mode][scenario.id]));
  }
  board.append(header, pair);
  gallery.append(board);
}
