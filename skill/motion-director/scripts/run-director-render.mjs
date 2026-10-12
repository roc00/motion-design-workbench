import {spawn} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const child=spawn('ego-browser',['nodejs'],{stdio:['pipe','inherit','inherit']});
child.stdin.end(`process.chdir(${JSON.stringify(root)});\n`+readFileSync(join(root,'scripts/render-director.mjs'),'utf8'));
child.on('exit',code=>process.exit(code??1));
