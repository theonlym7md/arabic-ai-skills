# ArabicSkill demo screenshots

These three PNGs are browser captures of the local [comparison gallery](../../demos/arabicskill-ab/index.html), captured at `1440px` desktop width (with `375px` mobile stacking verified without horizontal overflow).

To regenerate them locally after updating the gallery template:

```sh
npm install --no-save playwright && npx playwright install chromium
node docs/demos/arabicskill-ab/capture.cjs
```
