'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..');
const code=fs.readFileSync(path.join(root,'v10-command.js'),'utf8');
new vm.Script(code,{filename:'v10-command.js'});
for(const marker of [
  'Ocean Command Center','aquarium-v10-command','legacySnapshot','claimLegacy','emergencyProgram','window.AquariumV10',
  'aquarium-v7-deep-sea','aquarium-v8-genetics','aquarium-v9-restoration','V7–V9'
])if(!code.includes(marker))throw new Error(`Missing V10 marker: ${marker}`);
const regions=[...code.matchAll(/\n\s*(coast|reef|pelagic|polar|abyss):\{/g)].map(match=>match[1]);
if(new Set(regions).size!==5)throw new Error('Expected five command regions');
const operations=[...code.matchAll(/\n\s*(census|gene|coral|intercept|relay):\{/g)].map(match=>match[1]);
if(new Set(operations).size!==5)throw new Error('Expected five fleet operations');
const crew=[...code.matchAll(/(navigator|geneticist|ecologist|engineer|analyst):\[/g)].map(match=>match[1]);
if(new Set(crew).size!==5)throw new Error('Expected five crew specialists');
const achievements=[...code.matchAll(/\['(first-command|full-fleet|ocean-guardian|global-network|perfect-run|century)'/g)].map(match=>match[1]);
if(new Set(achievements).size!==6)throw new Error('Expected six V10 achievements');
if(!code.includes("e.key==='c'")||!code.includes("e.key==='C'"))throw new Error('Hotkey C is missing');
console.log(JSON.stringify({ok:true,regions:5,operations:5,crew:5,achievements:6,storage:'aquarium-v10-command'},null,2));
