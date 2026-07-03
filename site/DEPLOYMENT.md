# Nova editable website deployment

The public website can still be built as a static Vite site, but the secure Admin Studio, inquiry inbox, media uploads, and persistent content editing require the included Node server.

## Production setup

1. Use Node.js 22 or newer.
2. Run `npm ci` and `npm run build` inside the `site` directory.
3. Configure these environment variables in the hosting control panel:

   - `ADMIN_USERNAME=Admin`
   - `ADMIN_PASSWORD=<temporary password>`
   - `HOST=0.0.0.0`
   - `PORT=<port supplied by the host>`
   - `NODE_ENV=production`

4. Start the application with `npm start`.
5. Open `/admin`, sign in, and replace the temporary password from the Security screen before sharing access.

Runtime content, uploaded media, inquiries, and password hashes are stored in `server-data/` and `public/uploads/`. Back up both directories and keep them outside public source control.
