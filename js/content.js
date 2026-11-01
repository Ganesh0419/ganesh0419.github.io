// Edit this file to update the site. No other file needs to change.
// Leave a value empty ('') and its button or link stays hidden.
window.SITE = {
  reel: '',       // Showreel link, for example a YouTube URL
  github: 'https://github.com/Ganesh0419',
  linkedin: '',
  instagram: 'https://www.instagram.com/addictedtomusic86'
};

// Each project becomes one card under "Selected work".
//   colour: grey, yellow, cyan, green, magenta, red or blue
//   image:  optional picture, for example 'assets/my-project.jpg'
//   video:  optional muted clip that plays on hover, for example 'assets/my-reel.mp4'
//   link:   optional URL, shown as a button with linkText
//   seek:   optional time in the film, in seconds, to play from
//   clips:  optional list of reels, each { file, poster, label, dur }. Hover previews, click opens the player.
//   linkKey: 'instagram' or 'github' uses that link from SITE above
//   links:  optional extra buttons, each { label, url }
window.PROJECTS = [
  {
    title: 'BK Science Academy website',
    type: 'Full-stack web / live at bkscience.in',
    year: '2026',
    colour: 'cyan',
    image: 'assets/bkscience.jpg',
    text: 'The website for BK Science Academy, the society\'s JEE and NEET coaching institute in Nashik. React and Vite front end with Tailwind CSS and GSAP motion; Node.js, Express and MongoDB back end. Students apply for admission and scholarships, pay fees through Razorpay and ask an AI chatbot that raises support tickets; staff manage it all from an admin panel.',
    tags: ['React', 'Vite', 'Tailwind CSS', 'Node.js', 'Express', 'MongoDB', 'Razorpay'],
    links: [
      { label: 'Visit bkscience.in', url: 'https://bkscience.in/' },
      { label: 'Code on GitHub', url: 'https://github.com/bkgroupofeducation/BK-SCIENCE-ACADEMY-' }
    ]
  },
  {
    title: 'BK Attendance Management System',
    type: 'Web application',
    year: '2026',
    colour: 'green',
    thumb: 'Attendance',
    text: 'An attendance management system built for the society\'s classes. The code is in a private repository; ask me for a walkthrough.',
    tags: ['Web app', 'Database']
  },
  {
    title: 'BK Educational and Welfare Society',
    type: 'Instagram reels / video editing',
    colour: 'magenta',
    text: 'Reels I edited for the society: a presenter-led classroom promo, a "Your dream, your target" promo and a Ganesh festival reel. Hover a clip to preview it, click to watch it with sound.',
    tags: ['Social media', 'Education', 'Promotion', 'Events'],
    clips: [
      { file: 'assets/bk-reel-2.mp4', poster: 'assets/bk-reel-2.jpg', label: 'Classroom promo', dur: '0:12' },
      { file: 'assets/bk-reel-3.mp4', poster: 'assets/bk-reel-3.jpg', label: 'Your dream, your target', dur: '0:10' },
      { file: 'assets/bk-reel-1.mp4', poster: 'assets/bk-reel-1.jpg', label: 'Ganesh festival', dur: '0:42' }
    ],
    seek: 25,
    linkText: 'See it in the film',
    links: [{ label: 'BK Science Academy on YouTube', url: 'https://www.youtube.com/@BKScienceAcademy' }]
  },
  {
    title: 'Addicted',
    type: 'My Instagram page / anime edits',
    colour: 'red',
    text: 'My own page, where I practise fast cuts, lyric typography and colour on anime footage. Three edits for the page.',
    tags: ['Anime edits', 'Typography', 'Colour', 'Pacing'],
    clips: [
      { file: 'assets/addicted-1.mp4', poster: 'assets/addicted-1.jpg', label: 'Edit 01', dur: '0:32' },
      { file: 'assets/addicted-2.mp4', poster: 'assets/addicted-2.jpg', label: 'Edit 02', dur: '0:32' },
      { file: 'assets/addicted-3.mp4', poster: 'assets/addicted-3.jpg', label: 'Edit 03', dur: '0:22' }
    ],
    linkKey: 'instagram',
    linkText: 'Open the page'
  },
  {
    title: 'This portfolio',
    thumb: 'Film resume',
    image: 'assets/portfolio.jpg',
    type: 'Web and motion',
    year: '2026',
    colour: 'red',
    text: 'A resume cut as a 58-second film inside a working edit timeline. Every title is calculated from the playhead position, so it plays and scrubs in both directions, frame by frame. It also prints to a one-page A4 resume.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    seek: 0,
    linkText: 'Play the film'
  },
  {
    title: 'Bizunite',
    thumb: 'Bizunite',
    image: 'assets/bizunite.jpg',
    type: 'Interface and product design',
    year: '2025',
    colour: 'yellow',
    text: 'Interfaces and screen layouts for responsive web and mobile app prototypes, with posters, brand identity and product design materials.',
    tags: ['Interface design', 'Posters', 'Brand identity']
  }
];
// The "Media bin" section. cat must be Web, Design or Video. where is the line under the name.
window.SKILLS = [
  { name: 'Web development', cat: 'Web', where: 'Used on this site' },
  { name: 'HTML5 / CSS3', cat: 'Web', where: 'Used on this site' },
  { name: 'JavaScript', cat: 'Web', where: 'Used on this site' },
  { name: 'Responsive design', cat: 'Web', where: 'Web and mobile prototypes, Bizunite' },
  { name: 'Programming', cat: 'Web', where: 'B.Sc. Computer Science' },
  { name: 'React + Vite', cat: 'Web', where: 'bkscience.in' },
  { name: 'Tailwind CSS', cat: 'Web', where: 'bkscience.in' },
  { name: 'Node.js + Express', cat: 'Web', where: 'bkscience.in' },
  { name: 'MongoDB', cat: 'Web', where: 'bkscience.in, attendance system' },
  { name: 'Razorpay payments', cat: 'Web', where: 'bkscience.in' },
  { name: 'Interface design', cat: 'Design', where: 'Bizunite' },
  { name: 'Product design', cat: 'Design', where: 'Bizunite' },
  { name: 'Poster design', cat: 'Design', where: 'Bizunite' },
  { name: 'Brand identity', cat: 'Design', where: 'Bizunite' },
  { name: 'Video editing', cat: 'Video', where: 'BK Society' },
  { name: 'Adobe Premiere Pro', cat: 'Video', where: 'Editing' },
  { name: 'Adobe After Effects', cat: 'Video', where: 'Motion' },
  { name: 'CapCut', cat: 'Video', where: 'Editing' },
  { name: 'AI video generation', cat: 'Video', where: 'BK Society' },
  { name: 'Visual storytelling', cat: 'Video', where: 'Editing' }
];