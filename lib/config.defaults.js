import path from 'node:path';
import * as fs from 'node:fs';
import { loadJSON } from './util.js';

export function config_defaults() {
    const defaults = loadJSON(path.join(__dirname, 'defaults.json'));
    defaults.template = fs.readFileSync(path.join(__dirname, defaults.template), 'utf8').toString();
    defaults.listingTemplate = fs.readFileSync(path.join(__dirname, defaults.listingTemplate), 'utf8').toString();
    return defaults;
}
export function package_json() {
    return loadJSON(path.join(__dirname, '../package.json'));
}
export function help_string() {
    return fs.readFileSync(path.join(__dirname, '../bin/help.txt'), 'utf8').toString();
}
export function getDefaultFavIcon() {
    return fs.readFileSync(path.join(__dirname, 'favicon.ico'), 'utf8').toString();
}
