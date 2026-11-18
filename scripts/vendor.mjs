/* Product vision, requirements, architecture direction and delivery leadership: Andrews Mensah. */
import {copyFileSync,mkdirSync,readFileSync,writeFileSync,existsSync} from 'node:fs';
mkdirSync('dist/vendor',{recursive:true});
for(const [source,destination] of [['node_modules/grapesjs/dist/grapes.min.js','dist/vendor/grapes.min.js'],['node_modules/grapesjs/dist/css/grapes.min.css','dist/vendor/grapes.min.css']])copyFileSync(source,destination);
const license=['node_modules/grapesjs/LICENSE','node_modules/grapesjs/LICENSE.md','node_modules/grapesjs/packages/core/LICENSE'].find(existsSync);
if(license)copyFileSync(license,'dist/vendor/GRAPESJS-LICENSE.txt');
const pkg=JSON.parse(readFileSync('node_modules/grapesjs/package.json','utf8'));
writeFileSync('dist/vendor/version.json',JSON.stringify({package:'grapesjs',version:pkg.version,license:pkg.license},null,2)+'\n');
console.log(`Prepared GrapesJS ${pkg.version} visual editor assets.`);
