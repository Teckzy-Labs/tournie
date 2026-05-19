This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
Viewed bracket-generator.ts:76-93
Ran command: `npm run dev`
Viewed page.tsx:1-176
Edited page.tsx

I've added a **"Show Data"** button to the top header! 

When you click it, a side panel will slide out on the right showing the full JSON representation of the currently active tournament bracket. The data updates dynamically whenever you switch tabs or change the custom bracket settings, so you can easily verify exactly what data is being fed into the `TournamentBracket` component. 

Check it out and let me know if you need any adjustments!


spliting bracket 

The View mode is quite stable .

now I need New changes

This Library Should Support Edit mode the admit mode will help to complete the tournament Offline or Online via A server 

Design Such a Class that can handle both 
for Offline Mode .

We can add No of plyer and name of player to the libray the libray will display the bracket with  tith round 1 . The user will have ability to start the match add score make progress and complete the full brackt . 

Before locking the bracket we can adkust the brackt to move player change seeding adjust brackt of BYE to anyother player of wanted and then lock the bracket and then only match could be started and clicking a match will lock the match of the brackt after declaring the score and winner the it unlocks for a new match to avaoid deadlock this will work as offline data source a similar class will have server datasource but it will have all operation from server the clint will just make api calls 





Bracket → SVG → PDF
SVG or Canvas rendering eventually becomes superio

Add Render Modes
renderMode:
- dom
- svg
- canvas

E. Convert Layout Engine to DAG-based

This is the biggest future-proofing step.

. Use ID-Based State

Avoid storing entire objects in state.

A. Split Component

Current component is too large.

Split into:

TournamentBracket
 ├── BracketToolbar
 ├── BracketCanvas
 ├── BracketGroups
 ├── BracketNodes
 ├── BracketConnectors
 ├── MatchDialog
 └── ExportHandlers