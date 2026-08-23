export type Testimonial = {
  id: string;
  text: string;
  user: {
    name: string;
    role: string;
    avatar: string;
  };
};

export const TESTIMONIALS = [
  {
    id: "maya-chen",
    text: "The motion feels considered without getting in the way.",
    user: { name: "Maya Chen", role: "Product designer", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
  },
  {
    id: "theo-alvarez",
    text: "The activity states make long-running work easy to follow.",
    user: { name: "Theo Alvarez", role: "Frontend engineer", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
  },
  {
    id: "priya-nair",
    text: "I could drop these into a production chat without rebuilding the interaction layer.",
    user: { name: "Priya Nair", role: "AI product lead", avatar: "https://randomuser.me/api/portraits/women/68.jpg" },
  },
  {
    id: "jonah-reed",
    text: "The components are polished, readable, and easy to adapt.",
    user: { name: "Jonah Reed", role: "Design engineer", avatar: "https://randomuser.me/api/portraits/men/46.jpg" },
  },
  {
    id: "samira-cole",
    text: "The interface stays clear even while a run is still moving.",
    user: { name: "Samira Cole", role: "Product engineer", avatar: "https://randomuser.me/api/portraits/women/32.jpg" },
  },
  {
    id: "leo-park",
    text: "The small transitions make the whole workspace feel alive.",
    user: { name: "Leo Park", role: "Developer experience", avatar: "https://randomuser.me/api/portraits/men/11.jpg" },
  },
  {
    id: "ada-okafor",
    text: "This is a calm starting point for an AI product surface.",
    user: { name: "Ada Okafor", role: "Founder", avatar: "https://randomuser.me/api/portraits/women/65.jpg" },
  },
  {
    id: "noor-hassan",
    text: "The spacing, states, and feedback all feel like part of one system.",
    user: { name: "Noor Hassan", role: "Staff engineer", avatar: "https://randomuser.me/api/portraits/men/52.jpg" },
  },
  {
    id: "elena-voss",
    text: "The source is easy to understand and the motion is easy to tune.",
    user: { name: "Elena Voss", role: "Product designer", avatar: "https://randomuser.me/api/portraits/women/12.jpg" },
  },
  {
    id: "marco-silva",
    text: "The previews answer the important question before I install anything.",
    user: { name: "Marco Silva", role: "Full-stack engineer", avatar: "https://randomuser.me/api/portraits/men/68.jpg" },
  },
  {
    id: "riley-kim",
    text: "The patterns feel ready to compose, not just ready to demo.",
    user: { name: "Riley Kim", role: "UI engineer", avatar: "https://randomuser.me/api/portraits/women/75.jpg" },
  },
  {
    id: "dario-brooks",
    text: "A thoughtful base for building a focused agent workspace.",
    user: { name: "Dario Brooks", role: "Technical founder", avatar: "https://randomuser.me/api/portraits/men/75.jpg" },
  },
  {
    id: "jamie-wu",
    text: "The interaction patterns are crisp without feeling over-designed.",
    user: { name: "Jamie Wu", role: "Interaction designer", avatar: "https://randomuser.me/api/portraits/women/49.jpg" },
  },
  {
    id: "soren-patel",
    text: "Streaming and tool states share the same clear visual language.",
    user: { name: "Soren Patel", role: "Frontend architect", avatar: "https://randomuser.me/api/portraits/men/41.jpg" },
  },
  {
    id: "mina-laurent",
    text: "The best part is how much of the behavior is already considered.",
    user: { name: "Mina Laurent", role: "Design systems lead", avatar: "https://randomuser.me/api/portraits/women/24.jpg" },
  },
  {
    id: "alex-rivera",
    text: "Clean enough for a first screen, flexible enough for a full workspace.",
    user: { name: "Alex Rivera", role: "Independent builder", avatar: "https://randomuser.me/api/portraits/men/22.jpg" },
  },
] satisfies Testimonial[];
