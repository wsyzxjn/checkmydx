# CheckMyDX

Turn maimai DX prober-style score data into a shareable player card.

This project is a minimal adaptation of [CheckMyGit](https://github.com/whoisyurii/checkmygit), keeping the SvelteKit templates, export flow, and shareable profile routes while replacing the live GitHub profile fetch with mock maimai DX player data.

## Current MVP

- Player card generator at `/`
- Demo player pages at `/amatsuka`, `/rainbow14`, and `/dxstar`
- Three inherited templates: Prober Style, Bento Grid, and Minimal
- Mock DX Rating, Best 50, score-band distribution, sync heatmap, and featured scores
- PNG export, share link, and QR modal retained from the original project

## Next Steps

- Replace the mock adapter in `src/lib/server/maimai.ts` with real maimai prober API data.
- Decide the public identifier: prober username, friend code, or share token.
- Add real cover/avatar assets from the prober frontend if licensing and privacy allow it.
- Hide or adapt legacy GitHub-only routes before publishing.

## Development

```bash
npm install
npm run dev
```

## License

MIT. Original project by [whoisyurii/checkmygit](https://github.com/whoisyurii/checkmygit).
