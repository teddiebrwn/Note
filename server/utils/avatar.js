const gradients = [
  "linear-gradient(135deg, blue, red)",
  "linear-gradient(135deg, green, yellow)",
  "linear-gradient(135deg, purple, pink)",
  "linear-gradient(135deg, orange, cyan)",
  "linear-gradient(135deg, navy, lime)",
  "linear-gradient(135deg, teal, magenta)",
  "linear-gradient(135deg, crimson, skyblue)",
  "linear-gradient(135deg, coral, turquoise)",
  "linear-gradient(135deg, violet, lightgreen)",
  "linear-gradient(135deg, black, white)",
];

export const getRandomGradient = () =>
  gradients[Math.floor(Math.random() * gradients.length)];
