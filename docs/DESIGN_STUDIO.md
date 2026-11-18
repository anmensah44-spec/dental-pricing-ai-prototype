# Clarity Dental visual design studio

Product vision, architecture direction and delivery leadership: Andrews Mensah.

## Tool selection

GrapesJS core 0.23.9 is embedded locally under BSD-3-Clause. It requires no external design account or subscription. Penpot is the closest fully open-source alternative to Figma; its hosted or self-hosted workspace would be a separate design service. Figma Starter is free with limits, rather than open source.

Official references: https://github.com/GrapesJS/grapesjs | https://grapesjs.com/docs/ | https://penpot.app/pricing | https://www.figma.com/pricing/

## Design workflow

1. Open the live application and choose a screen. Select Design studio to carry that screen into the editor.
2. Switch among core and role-specific screen layouts with the Screen selector. Double-click text to edit, select elements to style, or use Layers and Components.
3. Preview Desktop, Tablet and Mobile layouts. Use Undo and Redo while iterating.
4. Save layout retains the design on the current browser/device. Export project JSON keeps an editable GrapesJS project; import it to continue on another device.
5. Export screen HTML creates a standalone layout with embedded CSS. It represents the visual layout; application API workflows remain in the live app.
6. Return to Live prototype to exercise pricing, CRM, care plans and financing.

## Runtime and packaging

Run npm ci followed by npm start. The prestart command copies pinned GrapesJS runtime assets and its license into dist/vendor. CI runs the same vendor step. The hosted browser studio uses a local-storage adapter with the shared pricing implementation; Node runs the authenticated SQLite API. Role perspectives in the browser studio support walkthroughs. They are not an identity service.

GrapesJS core is BSD-3-Clause. Its license is distributed with the editor at vendor/GRAPESJS-LICENSE.txt. See package-lock.json for pinned dependencies.
