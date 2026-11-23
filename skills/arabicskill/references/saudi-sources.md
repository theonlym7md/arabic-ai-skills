# سجل المصادر وحدود المراجعة

> مراجعة بتاريخ **2026-11-13** لـ **71 موقعًا ومنصةً حيّة** (**69 موقعًا بواجهة عربية + موقعين بالإنجليزية فقط** وقت الفحص: `bold-xp.com` و`wavespace.agency`) من أصل **81 نطاقًا فريدًا** بعد إزالة التكرار والعناوين المرادفة من قائمة أولية تضم 115 رابطًا، مع تعذّر فحص 9 نطاقات محجوبة أو متوقفة وقت الجلسة واقتصار `eand.ae` على `eand.com`، عبر تصفح مباشر متعدد الصفحات (الرئيسية، البحث والتصنيف، تفاصيل الخدمة أو المنتج، بوابات تسجيل الدخول المتاحة للعامة، السلة/التسعير، ونماذج التواصل)، إضافةً إلى مراجعة التأسيس الأولية بتاريخ **2026-10-04** ومراجعة القرارات التصميمية المُحدّثة في **2026-11-23** (`docs/research/site-review-2026-11-23.md` في المستودع).
> هذه الوثيقة سجل مرجعي لفهم الأنماط والحدود فقط: لا تُضمَّن في موجه الـ SDK التلقائي، ولا تُنقل منها شعارات تجارية أو أسعار أو شروط قانونية ومالية إلى منتجات أخرى.

## النطاق والمنهجية

- نُفذت المراجعة من واجهات عامة متاحة دون تجاوز بوابات الدفع، أو اختبارات التحقق من الروبوتات (CAPTCHA)، أو جدران الحماية (WAF)، ودون افتراض أي محتوى خلف تسجيل الدخول.
- ركّز التحليل على استخلاص **المبادئ القابلة للتعميم عبر المجالات** (أنماط تسجيل الدخول، السلة والتقسيط، توجيه النوايا قبل النماذج، مقارنة الرسوم، وضبط النقطة الختامية في العناوين) بدل قصر كل نمط على قطاع ضيق.

## المواقع المراجعة بنجاح عبر المتصفح الحي (71 موقعًا في موجة 2026-11-13)

### وجهات، طيران، ومؤسسات وطنية وشركات كبرى
- `webook.com` · `neom.com` · `ithra.com` + `account.ithra.com` · `experiencealula.com` · `visitsaudi.com` + `sso.visitsaudi.com`
- `redseaglobal.com` · `diriyah.sa` · `qiddiya.com` · `riyadhair.com` · `newmurabba.com` · `kafd.sa` + `portal.kafd.sa`
- `misk.org.sa` + `hub.misk.org.sa` · `saudia.com` · `iotsquared.com.sa` + `partners.iotsquared.com.sa` · `nesmapartners.com`
- `museumofthefuture.ae` · `visitdubai.com` · `qm.org.qa` · `emirates.com` · `qatarairways.com` · `aldar.com` · `eand.com` · `halasaudi.com`

### تجارة، توصيل، تمويل، ومصارف
- `salla.com` + `apps.salla.sa` + `s.salla.sa` · `zid.sa` + `dashboard.zid.sa` · `tamara.co` + `partners.tamara.co` · `tabby.ai` + `merchant.tabby.ai` · `tiqmo.com` · `resal.me`
- `floward.com` · `niceonesa.com` · `goldenscent.com` · `thechefz.co` · `namshi.com` · `ounass.com` (`saudi.ounass.com`)
- `haraj.com.sa` · `jarir.com` · `ar.shein.com` · `amazon.sa` · `homecentre.com` · `soum.sa`
- `hungerstation.com` · `mrsool.co` + `business.mrsool.co` · `talabat.com` · `careem.com` + `auth.careem.com` · `wio.io` + `business.wio.io`
- `alahli.com` · `alrajhibank.com.sa` · `alinma.com` · `riyadbank.com` + `riyadonline.com` · `stc.com.sa` (بوابة قطاف الرسمية)

### إعلام، محتوى، تعليم، صحة، وعقار
- `thmanyah.com` + `app.thmanyah.com` + `company.thmanyah.com` · `sahamstudio.com` · `telfaz11.com` · `myrkott.com` · `kerningcultures.com` · `afikra.com` + `daftar.afikra.com` · `manshoor.com`
- `anghami.com` + `play.anghami.com` · `shahid.mbc.net` · `almentor.net` + `account.almentor.net` · `rotana.net`
- `propertyfinder.ae` · `sehhaty.sa` · `bold-xp.com` (إنجليزية فقط وقت الفحص) · `wavespace.agency` (إنجليزية فقط وقت الفحص)

### خدمات حكومية وتنظيمية
- `najiz.sa` + `auth.najiz.sa` · `balady.gov.sa` + `ssoapp.balady.gov.sa` · `my.gov.sa` · `dga.gov.sa` · `moj.gov.sa`

## نطاقات لم تُفحص أو وُجهت لنطاق بديل (بأمانة تامة دون تجاوز أو تخمين)

- **محجوبة بجدار حماية أو اختبار تحقق آلي:** `noon.com/saudi-ar` (HTTP 403 Akamai WAF)، `bayt.com` (Cloudflare Turnstile 403)، `jahez.net` (Cloudflare Turnstile؛ بينما `jahez.me` يعرض متجرًا آخر غير مرتبط).
- **أعطال صيانة أو شبكة أو نطاق متوقف/معروض للبيع:** `d360bank.com` (Cloudflare HTTP 522 صيانة)، `absher.sa` (`ERR_CONNECTION_RESET`)، `attest.sa` (`ERR_NAME_NOT_RESOLVED`)، `stcpay.com` / `stcpay.com.sa` (`ERR_NAME_NOT_RESOLVED` / timeout)، `mawid.sa` (`ERR_NAME_NOT_RESOLVED` — دُمجت الخدمة في `sehhaty.sa`)، `qitaf.com` (نطاق معروض للبيع بينما البوابة الفعلية ضمن `stc.com.sa`).
- **تعديل/إعادة توجيه نطاق رسمي أثناء المراجعة:** `iot-squared.com` فشل DNS و`iotsquared.com` محمي للداخل فتمت المراجعة على `iotsquared.com.sa`؛ `www.nesma-partners.com` -> `nesmapartners.com`؛ `najiz.gov.sa` -> `najiz.sa`؛ `mrsool.com` -> `mrsool.co`؛ `eand.ae` رفضت التصفح الآلي فاقتصرت المراجعة على `eand.com`؛ وواجه `alinma.com` إيقاف إطار التصفح عند النقر التفاعلي فاكتُفي بالفحص الساكن للشاشات العامة.

## مراجعة التأسيس الأولية (2026-10-04)

- شملت مراجعة التأسيس الأولية أسطحًا عامة إضافية مُشارًا إليها في [أنماط المجال](sector-patterns.md) بوصفها مراجع قطاعية مبكرة: `b22.games` (الألعاب والتجارب التفاعلية)، `gathern.co` (`جاذر إن` — السفر والضيافة)، و`sukuk.sa` (`صكوك` — التمويل والاستثمار).

## قيود الاستخدام

- مراجعة الواجهة العامة لا تثبت امتثالًا قانونيًا أو تقنيًا (مثل WCAG أو لوائح البنك المركزي أو التجارة)، كما قد تتغير التصاميم والباقات لاحقًا.
- تُستخلص من هذه المراجعة **الأنماط القابلة لإعادة الاستخدام** في [أنماط التجربة القابلة للاختيار](experience-patterns.md) و[أنماط المجال](sector-patterns.md)، ولا يُنسخ منها أي شعار علامة أو سعر أو نسبة عائد.
