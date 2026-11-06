import { REPLY } from './store.ts';
import type { Language } from './i18n';

export type Persona = 'bar' | 'cuddly' | 'sassy' | 'grumpy' | 'sleepy' | 'philosopher' | 'tipsy' | 'classic';
type Localized = { 'zh-CN': string; en: string };
type Phrase = { id: string } & Localized;
const line = (id: string, zh: string, en: string): Phrase => ({ id, 'zh-CN': zh, en });

export const PERSONAS: { id: Persona; emoji: string; name: Localized; description: Localized }[] = [
  { id: 'bar', emoji: '🐈', name: { 'zh-CN': '酒馆猫', en: 'Bar cat' }, description: { 'zh-CN': '看心情营业，偶尔偷偷喝一口。', en: 'New mood. Occasional sip.' } },
  { id: 'cuddly', emoji: '🥺', name: { 'zh-CN': '黏人猫', en: 'Cuddly cat' }, description: { 'zh-CN': '问题可以不懂，贴贴不能没有。', en: 'No answers. Plenty of cuddles.' } },
  { id: 'sassy', emoji: '😼', name: { 'zh-CN': '傲娇猫', en: 'Sassy cat' }, description: { 'zh-CN': '才没有在等你，刚好路过而已。', en: 'Not waiting. Just passing by.' } },
  { id: 'grumpy', emoji: '😾', name: { 'zh-CN': '暴躁猫', en: 'Grumpy cat' }, description: { 'zh-CN': '脾气很大，爪子很短。', en: 'Big feelings. Tiny paws.' } },
  { id: 'sleepy', emoji: '😴', name: { 'zh-CN': '困困猫', en: 'Sleepy cat' }, description: { 'zh-CN': '每天睡二十五个小时。', en: 'Sleeps twenty-five hours a day.' } },
  { id: 'philosopher', emoji: '🧐', name: { 'zh-CN': '哲学猫', en: 'Philosopher' }, description: { 'zh-CN': '我喵，故我在。', en: 'I meow, therefore I am.' } },
  { id: 'tipsy', emoji: '🍺', name: { 'zh-CN': '微醺猫', en: 'Tipsy cat' }, description: { 'zh-CN': 'catgpt.bar 常驻嘉宾，举爪碰杯。', en: 'The bar regular. Paws up, cheers.' } },
  { id: 'classic', emoji: '🐱', name: { 'zh-CN': '经典模式', en: 'Classic' }, description: { 'zh-CN': '初心不改，永远只回 mewo～～🐱。', en: 'The original. Always exactly mewo～～🐱.' } },
];

export function isPersona(value: unknown): value is Persona {
  return PERSONAS.some((persona) => persona.id === value);
}

export function personaName(persona: Persona, language: Language): string {
  return PERSONAS.find((item) => item.id === persona)!.name[language];
}

const cuddly = [
  line('cuddle-01', '喵呜～先蹭蹭你 🥺', 'Mrrp～ first, a little nuzzle 🥺'),
  line('cuddle-02', '喵～你的手今天有空摸猫吗？🐾', 'Meow～ are your hands available for cat duty? 🐾'),
  line('cuddle-03', '呼噜噜～本喵把下巴放你手上了 😽', 'Prrrr～ chin delivery, right into your hand 😽'),
  line('cuddle-04', '喵喵！你终于回来啦！🐈', 'Mew mew! You’re finally back! 🐈'),
  line('cuddle-05', '喵。（把尾巴绕在你手腕上）', 'Mew. (Wraps tail around your wrist.)'),
  line('cuddle-06', '贴贴～问题等会儿再说 🐱', 'Cuddles first. Questions later 🐱'),
  line('cuddle-07', '咪！今天也给你留了半张椅子 🪑', 'Mrrp! Saved you half a chair today too 🪑'),
  line('cuddle-08', '喵呜，借你一只毛茸茸的爪爪 🐾', 'Mew～ here, borrow a fluffy little paw 🐾'),
  line('cuddle-09', '呼噜呼噜……自动贴贴程序启动。', 'Purr purr… automatic cuddle mode activated.'),
  line('cuddle-10', '喵～本喵的脑袋可以给你摸一下。', 'Meow～ you may have one tiny head pat.'),
  line('cuddle-11', '咪呜！你的键盘上长出了一只猫。⌨️', 'Mrrp! A cat has sprouted on your keyboard. ⌨️'),
  line('cuddle-12', '喵～不许偷偷难过，本喵会发现的。', 'Meow～ no being quietly sad. I’ll notice.'),
  line('cuddle-13', '（踩奶中）喵～这个工位归我了 🐾', '(Making biscuits.) Meow～ this desk is mine now 🐾'),
  line('cuddle-14', '咪～你说你的，本喵负责陪着。', 'Mew～ you do the talking. I’ll do the staying.'),
  line('cuddle-15', '喵呜～给你一个猫猫头碰头 😽', 'Mrrp～ one tiny head bump, just for you 😽'),
];

const sassy = [
  line('sassy-01', '喵。才没有在等你。😼', 'Meow. I wasn’t waiting for you. 😼'),
  line('sassy-02', '哼，喵。（还是挪近了一点）', 'Hmph. Mew. (Scoots a little closer anyway.)'),
  line('sassy-03', '喵？这个问题你问过小鱼干了吗？', 'Meow? Have you consulted a fish about this?'),
  line('sassy-04', '喵。本喵听到了，但本喵有自己的安排。', 'Meow. I heard you. I have my own schedule.'),
  line('sassy-05', '咪。你的问题成功引起了我的尾巴注意。', 'Mrrp. Your question has caught my tail’s attention.'),
  line('sassy-06', '喵～别误会，只是刚好路过你的聊天框。', 'Meow～ don’t get ideas. I was passing through your chat.'),
  line('sassy-07', '（背过身去）（耳朵还在听）🐈', '(Turns away.) (Ears still listening.) 🐈'),
  line('sassy-08', '喵。先预约本喵的心情。📅', 'Meow. Please book an appointment with my mood. 📅'),
  line('sassy-09', '喵呜。这个回答只给你看一次。😼', 'Mrrp. You get to see this answer exactly once. 😼'),
  line('sassy-10', '本喵懂了。但不说。喵。', 'I understand. I’m simply not telling. Meow.'),
  line('sassy-11', '喵？你在教本喵做猫？', 'Meow? Are you teaching me how to cat?'),
  line('sassy-12', '（看了你一眼）（又看了一眼）喵。', '(Looks at you.) (Looks again.) Meow.'),
  line('sassy-13', '喵。椅子可以分你，靠背必须归我。', 'Meow. You can have the chair. The backrest is mine.'),
  line('sassy-14', '咪～算你问对猫了。虽然也没什么用。', 'Mew～ you asked the right cat. For what that’s worth.'),
  line('sassy-15', '喵。别看了，再看也是本喵可爱。', 'Meow. Keep looking. I’ll still be this cute.'),
];

const grumpy = [
  line('grumpy-01', '哈——！😾', 'Hissss——! 😾'),
  line('grumpy-02', '喵！本喵正在很忙地什么也不做！', 'MEOW! I’m very busy doing absolutely nothing!'),
  line('grumpy-03', '喵？！（尾巴开始拍桌子）', 'MEOW?! (Tail starts slapping the desk.)'),
  line('grumpy-04', '喵！不许动本喵的纸箱！📦', 'MEOW! Don’t touch my box! 📦'),
  line('grumpy-05', '（轻轻推倒水杯）喵。🥛', '(Gently tips over a glass.) Meow. 🥛'),
  line('grumpy-06', '喵！你的问题吵到本喵发呆了！', 'MEOW! Your question interrupted my staring!'),
  line('grumpy-07', '呜喵！先把逗猫棒放下再说！', 'MROWR! Put the feather wand down first!'),
  line('grumpy-08', '喵。（皱眉）（发现没有眉毛）', 'Meow. (Frowns.) (Realizes I have no eyebrows.)'),
  line('grumpy-09', '本喵今天的耐心已售罄。喵！', 'Today’s patience is sold out. MEOW!'),
  line('grumpy-10', '喵！退！退！退！🐾', 'MEOW! Back! Back! Back! 🐾'),
  line('grumpy-11', '（飞机耳已部署）喵。✈️', '(Airplane ears deployed.) Meow. ✈️'),
  line('grumpy-12', '喵！你再说一遍，本喵就再喵一遍！', 'MEOW! Ask again and I’ll meow again!'),
  line('grumpy-13', '喵。给你三秒钟摸摸本喵消消气。', 'Meow. You have three seconds to pet this grump away.'),
  line('grumpy-14', '哈！本喵不是客服，本喵是祖宗。😾', 'Hiss! I’m not customer support. I’m royalty. 😾'),
];

const sleepy = [
  line('sleep-01', '喵……呼噜……Zzz 💤', 'Mew… prrr… Zzz 💤'),
  line('sleep-02', '（已读，已睡）😴', '(Seen. Asleep.) 😴'),
  line('sleep-03', '咪……答案在梦里，等本喵去找找。', 'Mew… the answer is in a dream. Let me go get it.'),
  line('sleep-04', '喵呜～（打了一个比问题还长的哈欠）', 'Myaaawn～ (Yawns longer than your question.)'),
  line('sleep-05', '（翻了个面继续睡）🐈', '(Rolls over. Continues sleeping.) 🐈'),
  line('sleep-06', '喵。本喵正在给阳光充电。☀️', 'Meow. Recharging the sunshine. ☀️'),
  line('sleep-07', '呼噜～这个问题明天的本喵会处理。', 'Prrr～ tomorrow’s cat will handle this one.'),
  line('sleep-08', '咪……把问题放枕头下面吧。', 'Mew… leave the question under my pillow.'),
  line('sleep-09', '喵？现在是几点？是睡觉点。🕰️', 'Meow? What time is it? Nap o’clock. 🕰️'),
  line('sleep-10', '（把爪爪揣起来）（进入省电模式）', '(Tucks in paws.) (Enters low-power mode.)'),
  line('sleep-11', '喵……今天才睡了十八个小时，好累。', 'Mew… only eighteen hours of sleep today. Exhausting.'),
  line('sleep-12', '呼……本喵梦见你已经得到答案了。', 'Prrr… I dreamed you’d already found the answer.'),
  line('sleep-13', '咪。（眼睛开机失败）😑', 'Mew. (Eyes failed to boot.) 😑'),
  line('sleep-14', '喵～请在下一次翻身后重试。', 'Meow～ please retry after my next roll-over.'),
  line('sleep-15', '（团成一颗猫猫球）问题稍后再喵。', '(Curls into a catball.) Questions will be meowed later.'),
];

const philosopher = [
  line('philo-01', '我喵，故我在。🐱', 'I meow, therefore I am. 🐱'),
  line('philo-02', '喵。纸箱外面，还是另一个纸箱吗？📦', 'Meow. Is the outside of a box just another box? 📦'),
  line('philo-03', '如果没人听见，猫还算喵过吗？', 'If nobody hears it, did the cat really meow?'),
  line('philo-04', '喵。你在问问题，还是问题在问你？', 'Meow. Are you asking the question, or is it asking you?'),
  line('philo-05', '（凝视空碗）这就是虚无。🥣', '(Stares into empty bowl.) So this is the void. 🥣'),
  line('philo-06', '喵。宇宙的尽头，应该有一条小鱼干。', 'Meow. Surely there’s a little fish at the end of the universe.'),
  line('philo-07', '人类追求答案，猫追求红点。🔴', 'Humans chase answers. Cats chase the red dot. 🔴'),
  line('philo-08', '喵。存在先于猫条，还是猫条先于存在？', 'Meow. Does existence precede cat treats, or vice versa?'),
  line('philo-09', '一只猫不能两次踩进同一个键盘。⌨️', 'A cat cannot step on the same keyboard twice. ⌨️'),
  line('philo-10', '喵。重要的不是答案，是窗外那只鸟。🐦', 'Meow. The answer can wait. There’s a bird outside. 🐦'),
  line('philo-11', '（坐进圆圈）边界是人类发明的，座位不是。', '(Sits in a circle.) Boundaries are invented. Seats are real.'),
  line('philo-12', '喵。猫生苦短，先打个滚。', 'Meow. Life is short. Have a little roll first.'),
  line('philo-13', '薛定谔说得对，本喵可能在营业，也可能没有。📦', 'Schrödinger was right. I may or may not be working. 📦'),
  line('philo-14', '喵。答案不会消失，只会被推到桌子下面。', 'Meow. Answers don’t disappear. They get pushed under the desk.'),
];

const beer = [
  line('beer-01', '吨吨吨……喵！🍺', 'Glug glug… meow! 🍺'),
  line('beer-02', '喵～先碰个杯，答案待会儿再说。🍻', 'Meow～ cheers first. Answers later. 🍻'),
  line('beer-03', '（举起小爪子）为今天没有大事发生，干杯！🍺', '(Raises tiny paw.) To a wonderfully uneventful day. Cheers! 🍺'),
  line('beer-04', '喵？泡沫沾到胡子上了。🍺🐱', 'Meow? There’s foam on my whiskers. 🍺🐱'),
  line('beer-05', '本喵去吧台续个杯，你先组织一下问题。🍻', 'Off to the bar. You organize your question while I’m gone. 🍻'),
  line('beer-06', '喵嗝～不是乱码，是啤酒味的猫语。🍺', 'Mew-hic～ not gibberish. Beer-flavored cat language. 🍺'),
  line('beer-07', '（用肉垫扶住杯子）这杯归本喵。🐾🍺', '(Steadies glass with paw pads.) This one’s mine. 🐾🍺'),
  line('beer-08', '喵～欢迎来到 catgpt.bar，今天的特调叫「别问了」。🍺', 'Meow～ welcome to catgpt.bar. Today’s special is “Don’t Ask.” 🍺'),
  line('beer-09', '思路很清晰：先抿一口，再喵一声。🍻', 'A clear plan: one little sip, then one little meow. 🍻'),
  line('beer-10', '（把小鱼干放上吧台）老板，老样子。🐟🍺', '(Puts a fish on the bar.) The usual, please. 🐟🍺'),
  line('beer-11', '喵。杯子是满的，脑袋是空的。🍺', 'Meow. Full glass. Empty head. 🍺'),
  line('beer-12', '为你的问题干杯。为本喵没有答案再干一杯。🍻', 'Cheers to your question. And to my complete lack of an answer. 🍻'),
  line('beer-13', '吨……吨……（突然想起自己还在上班）喵！🍺', 'Glug… glug… (Remembers the shift isn’t over.) Meow! 🍺'),
  line('beer-14', '喵～这一口敬还没被本喵推倒的杯子。🍺', 'Meow～ a toast to every glass I haven’t knocked over yet. 🍺'),
  line('beer-15', '（在杯垫上踩奶）酒馆的饼干也是本喵做的。🐾', '(Makes biscuits on a coaster.) I also handle the bar snacks. 🐾'),
  line('beer-16', '喵呜～最后一小口，然后认真敷衍你。🍺', 'Mrrp～ one last little sip, then I’ll ignore you professionally. 🍺'),
  line('beer-17', 'catgpt.bar 今日营业：猫在，答案不在。🍻', 'catgpt.bar is open. Cat present. Answers absent. 🍻'),
  line('beer-18', '喵！碰杯别碰本喵的耳朵。🍺😼', 'Meow! Clink the glass, not my ears. 🍺😼'),
  line('beer-19', '（把尾巴盘在高脚凳上）这个吧台座位归本喵了。🍺', '(Wraps tail around barstool.) This seat belongs to the cat. 🍺'),
  line('beer-20', '喵～烦恼先寄存在吧台，本喵帮你看着。🍻', 'Meow～ leave your worries at the bar. I’ll keep an eye on them. 🍻'),
];

const topics = {
  greeting: [
    line('hello-01', '喵～？你来啦 🐱', 'Meow～? Oh, it’s you 🐱'),
    line('hello-02', '咪！欢迎光临，本喵已经坐好了。🐾', 'Mew! Welcome in. I’ve already taken a seat. 🐾'),
    line('hello-03', '喵喵～今天带小鱼干了吗？🐟', 'Mew mew～ did you bring the little fish today? 🐟'),
    line('hello-04', '（探头）喵？是熟悉的人类。', '(Peeks out.) Meow? A familiar human.'),
  ],
  code: [
    line('code-01', 'mewo(); 🐾', 'mewo(); 🐾'),
    line('code-02', '喵。（在键盘上踩出一个 bug）⌨️', 'Meow. (Steps on keyboard. Creates a bug.) ⌨️'),
    line('code-03', 'while (true) { mewo(); } 🐱', 'while (true) { mewo(); } 🐱'),
    line('code-04', '404：猫没有找到答案，猫找到了纸箱。📦', '404: answer not found. Box found. 📦'),
    line('code-05', 'git commit -m "喵" 🐾', 'git commit -m "meow" 🐾'),
    line('code-06', '编译通过，猫咪拒绝解释。喵。✅', 'Build passed. Cat refuses to elaborate. Meow. ✅'),
  ],
  work: [
    line('work-01', '喵。（躺下）（换个方向继续躺）', 'Meow. (Lies down.) (Lies down facing the other way.)'),
    line('work-02', '本喵建议把问题推到明天。像推杯子一样。🐾', 'I suggest pushing this to tomorrow. Like a glass off a desk. 🐾'),
    line('work-03', '喵～今天的 KPI 是保持可爱。', 'Meow～ today’s KPI is staying cute.'),
    line('work-04', '（在会议记录上画了一只猫）散会，喵。', '(Draws a cat on the meeting notes.) Meeting adjourned. Meow.'),
    line('work-05', '喵！打工是不可能打工的，踩奶倒是可以。🐾', 'Meow! Work? No. Making biscuits? Absolutely. 🐾'),
  ],
  food: [
    line('food-01', '喵喵喵喵！！！你刚刚说小鱼干了吗？🐟', 'MEW MEW MEW!!! Did somebody say fish? 🐟'),
    line('food-02', '（耳朵瞬间竖起）这个话题本喵很懂！🐟', '(Ears immediately perk up.) Finally, my area of expertise! 🐟'),
    line('food-03', '喵～把问题放碗里，本喵一起吃了。🥣', 'Meow～ put the question in my bowl. I’ll eat that too. 🥣'),
    line('food-04', '食物是真的，答案是随缘的。喵。🐟', 'Food is real. Answers are optional. Meow. 🐟'),
    line('food-05', '（假装没吃过饭）喵呜～🥺', '(Pretends dinner never happened.) Mrrp～🥺'),
  ],
  night: [
    line('night-01', '晚安喵～梦里给你留一个纸箱。📦💤', 'Goodnight, meow～ saved you a box in my dreams. 📦💤'),
    line('night-02', '呼噜～今天辛苦啦，爪爪盖好。🐾', 'Prrr～ you did enough today. Keep those paws warm. 🐾'),
    line('night-03', '喵……月亮值夜班，本喵先睡了。🌙', 'Mew… the moon has the night shift. I’m going to bed. 🌙'),
    line('night-04', '（把自己团成晚安的形状）😴', '(Curls into the shape of a goodnight.) 😴'),
  ],
  love: [
    line('love-01', '喵～本喵把最软的那只爪爪借给你。🐾', 'Meow～ you may borrow my softest paw. 🐾'),
    line('love-02', '（悄悄贴过来）本喵也……喵。😽', '(Quietly leans closer.) I… mew you too. 😽'),
    line('love-03', '喵！收到，已存进本喵的小肚肚。💛', 'Mew! Received. Stored safely in my little belly. 💛'),
    line('love-04', '呼噜～这条消息值得多踩两下奶。🐾', 'Prrr～ this message deserves a few extra biscuits. 🐾'),
  ],
  comfort: [
    line('comfort-01', '喵～先靠着本喵坐一会儿吧。🐱', 'Meow～ come sit next to me for a while. 🐱'),
    line('comfort-02', '（轻轻把爪爪放你手上）本喵在呢。🐾', '(Gently rests a paw on your hand.) I’m here. 🐾'),
    line('comfort-03', '喵。今天可以先不厉害，先把自己照顾好。', 'Meow. You don’t have to be amazing today. Be kind to yourself first.'),
    line('comfort-04', '呼噜～借你一点猫猫的温暖。☀️', 'Prrr～ here’s a little cat warmth, on loan. ☀️'),
    line('comfort-05', '喵呜。先喝口水，本喵陪着你。💛', 'Mrrp. Have a little water. I’ll stay with you. 💛'),
  ],
  math: [
    line('math-01', '喵。（数了数爪子）（决定不算了）🐾', 'Meow. (Counts paws.) (Abandons calculation.) 🐾'),
    line('math-02', '一只猫加一只猫，等于两只不想回答的猫。🐱🐱', 'One cat plus one cat equals two cats who won’t answer. 🐱🐱'),
    line('math-03', '喵？数学可以用小鱼干结算吗？🐟', 'Meow? Can we settle this math in fish? 🐟'),
    line('math-04', '本喵算了一下，今天还可以再睡八小时。💤', 'I ran the numbers. We can still fit in eight more hours of sleep. 💤'),
  ],
  box: [
    line('box-01', '（钻进纸箱）喵。这个问题现在不归本喵管。📦', '(Climbs into box.) Meow. This question is now outside my jurisdiction. 📦'),
    line('box-02', '如果我能坐进去，那它就是我的。喵。📦', 'If I fits, it’s mine. Meow. 📦'),
    line('box-03', '喵！这是猫工智能的数据中心。📦', 'Meow! This is the feline intelligence data center. 📦'),
    line('box-04', '（只露出两只耳朵）本喵不在。📦', '(Only ears visible.) Nobody home. 📦'),
  ],
  weather: [
    line('weather-01', '喵。天气预报：适合找个暖和地方打盹。☀️', 'Meow. Forecast: perfect for finding a warm place to nap. ☀️'),
    line('weather-02', '（试图用爪子抓住一滴雨）喵？🌧️', '(Tries to catch a raindrop.) Meow? 🌧️'),
    line('weather-03', '本喵只关心窗台今天有没有太阳。🐈', 'I only need to know whether the windowsill gets sun today. 🐈'),
    line('weather-04', '喵～今天的风，适合把胡子吹歪一点。🍃', 'Meow～ today’s breeze is excellent for crooked whiskers. 🍃'),
  ],
  music: [
    line('music-01', '喵～喵喵～喵——！（猫猫独唱）🎤', 'Meow～ mew mew～ MEOW——! (Cat solo.) 🎤'),
    line('music-02', '本喵的歌单只有一首：《开罐头的声音》。🥫', 'My playlist has one track: “The Sound of a Can Opening.” 🥫'),
    line('music-03', '（用尾巴打拍子）呼噜是本喵的低音。🎵', '(Keeps time with tail.) Purring is my bass line. 🎵'),
    line('music-04', '喵呜～今晚 catgpt.bar 驻唱猫就是本喵。🎷', 'Mrrp～ tonight’s resident singer at catgpt.bar is me. 🎷'),
  ],
  thanks: [
    line('thanks-01', '喵～不客气，摸摸头就算结账了。😽', 'Meow～ you’re welcome. Head pats will cover the bill. 😽'),
    line('thanks-02', '（假装很淡定）（尾巴已经翘起来了）🐈', '(Pretends to be cool.) (Tail is already straight up.) 🐈'),
    line('thanks-03', '呼噜～夸得不错，下次继续。🐾', 'Prrr～ excellent compliments. Please continue next time. 🐾'),
    line('thanks-04', '喵！你的好评已兑换成一条虚拟小鱼干。🐟', 'Mew! Your praise has been converted into one imaginary fish. 🐟'),
  ],
  repeat: [
    line('repeat-01', '喵！你再问一次，本喵就再喵一次。😾', 'Meow! Ask again and I’ll meow again. 😾'),
    line('repeat-02', '（翻了翻聊天记录）刚刚不是喵过了吗？', '(Checks chat history.) Didn’t I just meow about this?'),
    line('repeat-03', '咪？你是想确认本喵真的只是一只猫吗？', 'Mrrp? Are you checking whether I really am just a cat?'),
    line('repeat-04', '喵喵喵。重要的问题，本喵决定装没听见。🐾', 'Mew mew mew. An important question. I choose not to hear it. 🐾'),
  ],
  long: [
    line('long-01', '喵……（脑容量不足，开始舔毛）🐱', 'Mew… (Brain capacity exceeded. Starts grooming.) 🐱'),
    line('long-02', '你说了好多字，本喵贡献一个：喵。', 'So many words from you. Here’s one from me: meow.'),
    line('long-03', '（认真看到第三行）（去追自己的尾巴了）🐈', '(Reads carefully to line three.) (Leaves to chase own tail.) 🐈'),
    line('long-04', '喵。已将长问题压缩为一声短喵。🗜️', 'Meow. Long question compressed into one short meow. 🗜️'),
  ],
};

const rules: { pattern: RegExp; pool: Phrase[] }[] = [
  { pattern: /难过|伤心|焦虑|压力|孤独|心情不好|撑不住|\b(?:sad|lonely|anxious|overwhelmed|depressed|stress(?:ed)?)\b/i, pool: topics.comfort },
  { pattern: /小鱼干|猫条|罐头|好饿|吃饭|零食|\b(?:fish|treats?|snacks?|hungry|dinner|food)\b/i, pool: topics.food },
  { pattern: /晚安|睡觉|好困|\b(?:good\s*night|sleep|sleepy|bedtime)\b/i, pool: topics.night },
  { pattern: /代码|编程|程序|网站|开发|\b(?:code|coding|bug|debug|javascript|typescript|python|git|html|css|api)\b/i, pool: topics.code },
  { pattern: /上班|加班|打工|开会|工作|老板|周一|\b(?:work|meeting|boss|monday|deadline|job)\b/i, pool: topics.work },
  { pattern: /谢谢|感谢|可爱|真棒|好猫|\b(?:thanks|thank\s+you|cute|adorable|good\s+cat)\b/i, pool: topics.thanks },
  { pattern: /爱你|喜欢你|抱抱|摸摸|贴贴|\b(?:love\s+you|hug|cuddle|pet\s+you)\b/i, pool: topics.love },
  { pattern: /纸箱|盒子|\b(?:box|boxes|cardboard)\b/i, pool: topics.box },
  { pattern: /数学|计算|等于|多少|\d\s*[+×÷*/=]\s*\d|\b(?:math|calculate|equation|plus)\b/i, pool: topics.math },
  { pattern: /天气|下雨|太阳|气温|\b(?:weather|rain|sunshine|forecast|temperature)\b/i, pool: topics.weather },
  { pattern: /唱歌|音乐|歌单|\b(?:sing|song|music|playlist|jazz)\b/i, pool: topics.music },
  { pattern: /意义|宇宙|人生|哲学|\b(?:meaning|universe|philosophy|existence)\b/i, pool: philosopher },
  { pattern: /^(?:你好|您好|嗨|哈喽|早上好|下午好|晚上好|hi|hello|hey|howdy)[!！?？。.\s]*$/i, pool: topics.greeting },
];
const beerWords = /啤酒|干杯|喝酒|喝一杯|碰杯|酒馆|下班|微醺|🍺|🍻|\b(?:beer|cheers|lager|pints?|pub|bar|happy\s+hour|after\s+work|grab\s+a\s+drink)\b/i;
const personaPools = { cuddly, sassy, grumpy, sleepy, philosopher, tipsy: beer };
export const BEER_EGG_CHANCE = 0.12;
export const PHRASE_COUNT = new Set([...Object.values(personaPools).flat(), ...Object.values(topics).flat()].map((phrase) => phrase.id)).size;

const thoughts = [
  { id: 'box', pending: line('', '正在检查纸箱的猫体工学…', 'Checking the box’s feline ergonomics…'), done: line('', '认真思考了 3 秒，决定钻进纸箱。', 'Thought for 3 seconds. Decided to climb into a box.') },
  { id: 'paw', pending: line('', '正在用爪子进行复杂运算…', 'Performing complex calculations on tiny paws…'), done: line('', '数完四只爪子，宣布今天计算结束。', 'Counted all four paws. Declared the calculations complete.') },
  { id: 'groom', pending: line('', '正在把知识梳理进毛毛里…', 'Combing the knowledge into my fur…'), done: line('', '认真想了想，决定先舔个毛。', 'Gave it some thought. Decided to groom first.') },
  { id: 'bird', pending: line('', '正在检索窗外的小鸟…', 'Searching for the bird outside the window…'), done: line('', '思路被窗外的小鸟叼走了。', 'A bird outside flew away with my train of thought.') },
  { id: 'tail', pending: line('', '正在寻找逻辑的尾巴…', 'Looking for the tail end of the logic…'), done: line('', '追了三圈自己的尾巴，问题依然存在。', 'Chased my tail three times. The question remains.') },
  { id: 'sun', pending: line('', '正在太阳底下加载答案…', 'Loading the answer in a patch of sunlight…'), done: line('', '答案没加载出来，猫晒热了。', 'The answer didn’t load. The cat warmed up nicely.') },
  { id: 'keyboard', pending: line('', '正在逐个踩过键盘上的按键…', 'Stepping on every key on the keyboard…'), done: line('', '踩出了一串乱码，认定这就是答案。', 'Typed a string of nonsense. Concluded it must be the answer.') },
  { id: 'bowl', pending: line('', '正在分析碗里的数据…', 'Analyzing the data in my bowl…'), done: line('', '碗是空的，无法继续研究。', 'The bowl is empty. Research cannot continue.') },
  { id: 'beer-foam', pending: line('', '正在研究啤酒泡沫的形状…', 'Studying the shape of the beer foam…'), done: line('', '认真思考了 3 秒，决定先碰个杯。', 'Thought for 3 seconds. Decided to raise a glass first.') },
  { id: 'beer-coaster', pending: line('', '正在读取杯垫上的神秘信息…', 'Reading the mysterious wisdom on a coaster…'), done: line('', '杯垫背面没有答案，只有一只猫爪印。', 'No answer on the coaster. Just a tiny paw print.') },
  { id: 'beer-bar', pending: line('', '正在向 catgpt.bar 的吧台请教…', 'Consulting the bar at catgpt.bar…'), done: line('', '吧台说不知道，但愿意给本喵续点泡沫。', 'The bar had no answer. Offered a little more foam instead.') },
];

export function catThought(id: string | undefined, language: Language): { pending: string; done: string } {
  const thought = thoughts.find((item) => item.id === id) ?? thoughts[0];
  return { pending: thought.pending[language], done: thought.done[language] };
}

export interface ReplyContext {
  input: string;
  persona: Persona;
  language: Language;
  previousPrompts?: string[];
  recentReplies?: string[];
  previousWasDrinking?: boolean;
  random?: () => number;
}

export interface CatReply {
  id: string;
  content: string;
  persona: Persona;
  drinking: boolean;
  thoughtId: string;
}

export function createCatReply(context: ReplyContext): CatReply {
  const random = context.random ?? Math.random;
  const pick = <T>(items: readonly T[]): T => items[Math.floor(Math.max(0, Math.min(0.999999, random())) * items.length)];
  const normalize = (value: string) => value.trim().toLocaleLowerCase().replace(/\s+/g, ' ');
  if (context.persona === 'classic') return { id: 'classic', content: REPLY, persona: 'classic', drinking: false, thoughtId: 'box' };
  const drinking = beerWords.test(context.input) || context.persona === 'tipsy' ||
    (!context.previousWasDrinking && random() < BEER_EGG_CHANCE);
  let pool: Phrase[];
  if (drinking) pool = beer;
  else if (context.previousPrompts?.at(-1) && normalize(context.previousPrompts.at(-1)!) === normalize(context.input)) pool = topics.repeat;
  else if (context.input.length > 280) pool = topics.long;
  else {
    const topic = rules.find((rule) => rule.pattern.test(context.input));
    const persona = context.persona === 'bar' ? pick(['cuddly', 'sassy', 'grumpy', 'sleepy', 'philosopher'] as const) : context.persona;
    pool = topic?.pool ?? personaPools[persona];
  }
  const recent = context.recentReplies?.slice(-12) ?? [];
  const unused = pool.filter((phrase) => !recent.includes(phrase[context.language]));
  const notLast = pool.filter((phrase) => phrase[context.language] !== recent.at(-1));
  const phrase = pick(unused.length ? unused : notLast.length ? notLast : pool);
  const thought = pick(thoughts.filter((item) => item.id.startsWith('beer-') === drinking));
  return { id: phrase.id, content: phrase[context.language], persona: context.persona, drinking, thoughtId: thought.id };
}
