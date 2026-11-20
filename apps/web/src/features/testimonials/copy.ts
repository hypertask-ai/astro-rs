export const sectionTitle = "What our users say";

export const sectionLede = "Real teams. Real results.";

export const testimonialsViewportId = "testimonials-carousel";

export const pullQuoteLimit = 50;

export interface Testimonial {
  readonly image: string;
  readonly name: string;
  readonly pullQuote?: string;
  readonly rating: number;
  readonly text: string;
  readonly title: string;
}

export const testimonials: readonly Testimonial[] = [
  {
    image: "/marco_schache.avif",
    name: "Marco Schache",
    pullQuote: "Communication down by 80% for my team",
    rating: 5,
    text: "Unstructured communication between Slack, Whatsapp and Asana is down by 80% for my team of 7. Everyone actually reads and replies to their project messages now.",
    title: "Vetsak Design Lead",
  },
  {
    image: "/rana_faizan.avif",
    name: "Rana Faizan",
    pullQuote: "My digital home base - I practically live in it all day",
    rating: 5,
    text: "Auto splits are a game-changer! My 13-person team churns out hundreds of comments across 10+ projects weekly. Hypertask has become my digital home base - I practically live in it all day.",
    title: "66Loop CEO",
  },
  {
    image: "/robin_morgan.avif",
    name: "Robin Morgan",
    pullQuote: "Inbox zero mindset is a game changer",
    rating: 5,
    text: "Applying 'inbox zero' mindset to project boards is a game changer. We communicate more and are better organized.",
    title: "Independent Agency",
  },
  {
    image:
      "https://duv2gcpdgd578.cloudfront.net/tasks/attachments/1756289966053image.png",
    name: "Rodrigo Nask",
    pullQuote: "Feeling like there's a breath of fresh air in engineering",
    rating: 5,
    text: "ClickUp, Todoist, Monday... you name it, I tried it all. Some lack features and some have too many or are too slow. Hypertask gave me the capacity to DO my f*** tasks without needing to MANAGE the system or getting a degree on it. You press a key and it responds, its like magic!",
    title: "Growth Marketer",
  },
  {
    image:
      "https://duv2gcpdgd578.cloudfront.net/tasks/attachments/1756413650201image.png",
    name: "Rein Figuracion",
    pullQuote: "Game-changer for team productivity and clarity",
    rating: 5,
    text: "Hypertask.ai has been a game-changer for our team. It keeps all our tasks organized in one place and makes it way easier to stay on track and work together. Highly recommend for any team looking to boost productivity and clarity.",
    title: "Product Manager - IDA",
  },
  {
    image:
      "https://duv2gcpdgd578.cloudfront.net/tasks/attachments/1756398032844image.png",
    name: "Varun Celly",
    pullQuote: "The best task management tool I've used",
    rating: 5,
    text: "After three months with Hypertask.ai, I can say it's the best task management tool I've used. It's a huge upgrade from Asana - faster, smarter, and far more efficient. The AI feels like a real partner, anticipating my needs and streamlining tasks, while the flexible Kanban board keeps our team running smoothly. For anyone in a fast-paced environment, Hypertask.ai is a game changer.",
    title: "CRO Consultant",
  },
  {
    image: "/lewis_mudrich.avif",
    name: "Lewis Mudrich",
    pullQuote: "Like Asana and Superhuman had a baby",
    rating: 5,
    text: "Hypertask is like Asana and Superhuman had a baby. All my tasks and team communication in one tool",
    title: "Agency Owner",
  },
  {
    image:
      "https://duv2gcpdgd578.cloudfront.net/tasks/attachments/1756413633953image.png",
    name: "Denis Sotskii",
    rating: 5,
    text: "Hypertask completely streamlined our team communications. What used to take hours of back-and-forth messages now happens seamlessly in one place. The AI-powered features are incredibly helpful for keeping everyone aligned.",
    title: "Designer",
  },
  {
    image:
      "https://duv2gcpdgd578.cloudfront.net/tasks/attachments/1755172785582image.png",
    name: "Ellene Gladys",
    rating: 5,
    text: "The AI task writer is a game changer for our product development workflow. It understands our project context perfectly and generates detailed specifications that would normally take me hours to write. Our sprint planning is now 3x faster.",
    title: "Executive Assistant",
  },
  {
    image:
      "https://duv2gcpdgd578.cloudfront.net/tasks/attachments/17551628715331516903412789.jpg",
    name: "Mohsin Rohani",
    rating: 5,
    text: "As a designer, I used to spend way too much time chasing updates or rewriting the same specs in different places. With Hypertask, everything just flows. The AI actually understands context, writes tasks for me, and our whole team — design, dev, product — stays aligned without the usual back-and-forth. It's honestly made my workday way less chaotic.",
    title: "Freelance UX Designer",
  },
];

export const mobileTestimonialCount = 5;

export const columnOffsets = [0, 2, 4, 6] as const;

export const tabletColumnOffsets = [0, 4, 2] as const;

export const columnRepeat = 3;

export const displayedQuote = (testimonial: Testimonial): string =>
  testimonial.pullQuote ?? `${testimonial.text.slice(0, pullQuoteLimit)}...`;
