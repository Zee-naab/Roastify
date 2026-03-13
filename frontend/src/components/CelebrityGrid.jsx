export const CELEBRITIES = [
  {
    id: "gordon ramsay",
    name: "Gordon Ramsay",
    emoji: "👨‍🍳",
    tag: "Screams at your cooking",
  },
  {
    id: "elon musk",
    name: "Elon Musk",
    emoji: "🚀",
    tag: "Tweets at 3am about Mars",
  },
  {
    id: "kanye west",
    name: "Kanye West",
    emoji: "🎤",
    tag: "Self-proclaimed genius",
  },
  {
    id: "kim kardashian",
    name: "Kim Kardashian",
    emoji: "💅",
    tag: "Famous for being famous",
  },
  {
    id: "abhishek upmanyu",
    name: "Abhishek Upmanyu",
    emoji: "🤔",
    tag: "Overthinks everything. In Hindi.",
  },
  {
    id: "tabish hashmi",
    name: "Tabish Hashmi",
    emoji: "📺",
    tag: "Politely roasts you in Urdu",
  },
  {
    id: "umer sharif",
    name: "Umer Sharif",
    emoji: "🎭",
    tag: "Legendary Urdu stage comic",
  },
  {
    id: "will smith",
    name: "Will Smith",
    emoji: "🌟",
    tag: "Fresh Prince energy",
  },
  {
    id: "jeff bezos",
    name: "Jeff Bezos",
    emoji: "📦",
    tag: "Went to space to flex",
  },
  {
    id: "anubhav singh bassi",
    name: "Anubhav Singh Bassi",
    emoji: "😎",
    tag: "Law school dropout. Epic storyteller.",
  },
  { id: "drake", name: "Drake", emoji: "🦉", tag: "Lost the beef. Still sad." },
  {
    id: "nicki minaj",
    name: "Nicki Minaj",
    emoji: "👑",
    tag: "Queen addressing peasants",
  },
  {
    id: "richard pryor",
    name: "Richard Pryor",
    emoji: "🎭",
    tag: "Raw honesty as comedy",
  },
  {
    id: "george carlin",
    name: "George Carlin",
    emoji: "💭",
    tag: "Society is stupid. He'll prove it.",
  },
  {
    id: "kevin hart",
    name: "Kevin Hart",
    emoji: "😂",
    tag: "Loud. Short. Unstoppable.",
  },
];

export default function CelebrityGrid({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {CELEBRITIES.map((celeb) => (
        <button
          key={celeb.id}
          type="button"
          onClick={() => onSelect(celeb.id)}
          className={`celeb-card rounded-xl p-3 text-left ${selected === celeb.id ? "selected" : ""}`}
        >
          <span className="text-2xl block mb-2">{celeb.emoji}</span>
          <span className="text-base font-bold text-white leading-tight block">
            {celeb.name}
          </span>
          <span className="text-sm text-white font-medium leading-tight block mt-1">
            {celeb.tag}
          </span>
        </button>
      ))}
    </div>
  );
}
