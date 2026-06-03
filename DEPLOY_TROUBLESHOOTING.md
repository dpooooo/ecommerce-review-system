# Deployment Troubleshooting

## Next.js build fails on `/404`

If `npm run build` prints both messages:

```text
You are using a non-standard "NODE_ENV" value
<Html> should not be imported outside of pages/_document
```

the server is using a non-standard `NODE_ENV` value. Next.js only supports:

- `production`
- `development`
- `test`

For Baota production deployment, use:

```bash
NODE_ENV=production
```

Check the current value:

```bash
printenv NODE_ENV
grep NODE_ENV .env .env.production 2>/dev/null
```

Fix `.env`, `.env.production`, the Baota Node project environment panel, or the PM2 environment settings. Then run:

```bash
npm run predeploy:check
npm run build
```

The predeploy check now fails fast when `NODE_ENV` is not one of the supported values.
