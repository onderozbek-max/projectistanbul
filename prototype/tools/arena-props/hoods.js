// Per-hood street kit for the 17 hoods without a bespoke file (R1-T3, D-057). Keys are theme ids (journey.js `theme`); each hood lists
// exactly the kinds its `kit` places. Palettes are the accents proposed in docs/hood-visual-briefs.md; vendor names are the brief's
// (each carries "TR owner check"). Builders: kit-street.js, kit-goods.js, kit-vehicles.js.
'use strict';
const S = require('./kit-street'), G = require('./kit-goods'), V = require('./kit-vehicles');

const GREENS = ['#3E8A4F', '#2E6E3F'], CREAM = '#F4EBDD', IRON = '#2A2C31';
const sign = (key, text, col) => ({ key: 'sign.' + key, text, col });
const one = (kind, p) => ({ [kind]: [p] });
const kit = (...parts) => Object.assign({}, ...parts);

module.exports = {
  galata: kit(
    one('tables', S.tables({ shape: 'tavla', chair: '#5A3A20' })),
    one('bench', S.bench({ top: '#8A5A30', back: '#2E5E4E', side: '#5A3A20' })),
    one('planter', S.planter({ box: '#2E5E4E', rim: '#B5651D', leaf: ['#2E6E3F', '#4F8A4F'], flower: ['#E4A93B', '#F4EBDD'], seed: 4 })),
    one('bollard', S.bollard({ kind: 'post', body: '#6E6A60', cap: '#B5651D' }))),
  karakoy: kit(
    one('lx_stall', G.stall({ body: '#7A4A22', top: '#E8DCC6', a: '#E07A5F', b: '#D9A441', goods: 'pastry', label: sign('vapur', 'Vapur Pastanesi', '#FFE2A8') })),
    one('bollard', S.bollard({ kind: 'mooring', body: IRON, cap: '#6E7078' })),
    one('tables', S.tables({ shape: 'round', cloth: 'check', a: '#E07A5F', chair: '#6B4A2C' })),
    one('barrier', S.barrier({ a: '#E07A5F', b: '#C9C4B8', rail: '#8A8F98' }))),
  bridge: kit(
    one('bollard', S.bollard({ kind: 'mooring', body: '#A5542B', cap: '#5A2E18' })),
    one('bin', S.bin({ top: '#3A3F46', side: '#4A5058', band: '#A5542B' })),
    one('barrier', S.barrier({ a: '#A5542B', b: '#6E7078', rail: '#8A8F98' })),
    one('crates', G.crates({ kind: 'gear', crate: '#6B4A2C', a: '#D9663A', b: '#F2C94C' }))),
  eminonu: kit(
    one('cart', G.cart({ kind: 'corn', body: '#A8322D', trim: '#D9A441' })),
    one('crates', G.crates({ kind: 'spice', crate: '#8A6A44', a: '#A8322D', b: '#E4A93B' })),
    one('lx_stall', G.stall({ body: '#5A3A20', top: '#E8DCC6', a: '#A8322D', b: '#E4A93B', goods: 'spice', label: sign('karabiber', 'Karabiber Kemal', '#FFE2A8') })),
    one('tables', S.tables({ shape: 'round', cloth: 'solid', a: '#E8DCC6', items: 'plates', chair: '#5A3A20' }))),
  sirkeci: kit(
    one('bench', S.bench({ top: '#5E7A8C', back: '#46606F', side: '#2F4350', leg: '#14151F' })),
    one('bin', S.bin({ top: '#46606F', side: '#5E7A8C', band: CREAM })),
    one('kiosk', G.kiosk({ body: '#46606F', roof: '#5E7A8C', a: '#5E7A8C', b: CREAM, hatch: '#F2C46D', label: sign('bilet', 'Bilet Gişesi', '#14151F') })),
    one('planter', S.planter({ box: '#46606F', rim: '#9FB3C0', leaf: ['#4F7A62', '#6B9A7A'], flower: [CREAM, '#C9D6DD'], seed: 8 }))),
  beyazit: kit(
    one('crates', G.crates({ kind: 'books', crate: '#8A6A44', a: '#8E2B2B', b: '#2E5E4E' })),
    one('bench', S.bench({ top: '#8A5A30', back: '#4F7A3A', side: '#5E3E22' })),
    one('tree', S.tree({ kind: 'plane', leaf: ['#4F7A3A', '#6B9A4E'], seed: 6 })),
    one('bin', S.bin({ top: '#3F6B52', side: '#4F7A3A', band: '#D9A441' }))),
  kumkapi: kit(
    one('lx_boat', V.boat({ kind: 'fishing', hull: '#3A6A8A', deck: '#B07A45', stripe: '#C0392B', cabin: '#D9C9A1' })),
    one('crates', G.crates({ kind: 'fish', crate: '#7A5530' })),
    one('tables', S.tables({ shape: 'round', cloth: 'solid', a: CREAM, items: 'plates', chair: '#6B3E26' })),
    one('bollard', S.bollard({ kind: 'mooring', body: IRON, cap: '#C9A227' }))),
  laleli: kit(
    one('crates', G.crates({ kind: 'cartons', crate: '#8B6B4A' })),
    one('cart', G.cart({ kind: 'hand', body: '#8B6B4A', trim: '#C9A227', a: '#C9A66B', b: '#8B6B4A' })),
    one('lx_truck', V.truck({ box: '#D9CBB0', stripe: '#8B6B4A', cab: '#B5651D' })),
    one('bin', S.bin({ top: '#4A4F55', side: '#5A6068', band: '#8B6B4A' }))),
  aksaray: kit(
    one('dolmus', V.vehicle({ kind: 'dolmus', body: '#E8E1CF', dark: '#B8B2A0', roof: '#F4EEDC', stripe: '#E5C02A' })),
    one('taxi', V.vehicle({ kind: 'taxi', body: '#E5C02A', dark: '#B8921C', roof: '#F2D454', stripe: IRON, sign: CREAM })),
    one('barrier', S.barrier({ a: '#E5C02A', b: IRON, rail: '#C9C4B8' })),
    one('bollard', S.bollard({ kind: 'post', body: '#C9C4B8', cap: '#E5C02A' }))),
  yenikapi: kit(
    one('barrier', S.barrier({ a: '#E5A93B', b: '#6B5A44', rail: '#8A8F98' })),
    one('bench', S.bench({ top: '#7A5230', back: '#5A3A20', side: '#3E2A18', leg: '#14151F' })),
    one('bin', S.bin({ top: '#3A3F46', side: '#4A5058', band: '#E5A93B' })),
    one('bollard', S.bollard({ kind: 'post', body: '#8A8F98', cap: '#E5A93B' }))),
  samatya: kit(
    one('tables', S.tables({ shape: 'round', cloth: 'check', a: '#A8322D', chair: '#B07A45' })),
    one('bench', S.bench({ top: '#8A5A30', back: '#E7A6A0', side: '#5E3E22' })),
    one('bollard', S.bollard({ kind: 'post', body: '#8A8F98', cap: '#E7A6A0' })),
    one('planter', S.planter({ box: '#E7A6A0', rim: '#A8322D', leaf: GREENS, flower: ['#D7263D', '#F2A0A8'], seed: 12 }))),
  yedikule: kit(
    one('planter', S.planter({ box: '#B5651D', rim: '#8A4A1C', leaf: ['#2E5E4E', '#3E8A4F'], flower: ['#C0392B', '#F2A0A8'], seed: 15 })),
    one('cart', G.cart({ kind: 'garden', body: '#6B4A2C', trim: '#2E5E4E', a: '#C0392B', b: '#E4A93B' })),
    one('tree', S.tree({ kind: 'plane', leaf: ['#2E5E4E', '#3E8A4F'], seed: 9 })),
    one('bin', S.bin({ top: '#2E5E4E', side: '#3E7A5A', band: '#D9A441' }))),
  kazlicesme: kit(
    one('bench', S.bench({ top: '#9B6B3E', back: '#7FB8C9', side: '#5E3E22' })),
    one('tree', S.tree({ kind: 'plane', leaf: ['#3F6B3A', '#5E9A4F'], seed: 2 })),
    one('bin', S.bin({ top: '#2E6E4F', side: '#3E8A66', band: CREAM })),
    one('bollard', S.bollard({ kind: 'post', body: '#E8DCC6', cap: '#7FB8C9' }))),
  zeytinburnu: kit(
    one('crates', G.crates({ kind: 'bales', crate: '#7A5530', a: '#2A7F80', b: '#A8327D' })),
    one('cart', G.cart({ kind: 'fabric', body: '#4A4F55', trim: '#2A7F80', a: '#2A7F80', b: '#A8327D' })),
    one('bin', S.bin({ top: '#4A4F55', side: '#5A6068', band: '#A8327D' })),
    one('lx_truck', V.truck({ box: '#E9E5D8', stripe: '#2A7F80', cab: '#A8327D' }))),
  bakirkoy: kit(
    one('kiosk', G.kiosk({ body: '#4F7A62', roof: '#6B9A7A', a: '#4F7A62', b: CREAM, hatch: '#F2C46D', label: sign('borek', 'Börekçi Nazmiye', '#14151F') })),
    one('bench', S.bench({ top: '#A98B5E', back: '#4F7A62', side: '#5E3E22' })),
    one('planter', S.planter({ box: '#D8CBB6', rim: '#4F7A62', leaf: ['#4F8A5A', '#3E7A4A'], flower: ['#E07A9A', '#F4EBDD'], seed: 17 })),
    one('bin', S.bin({ top: '#4F7A62', side: '#6B9A7A', band: CREAM }))),
  sahil: kit(
    one('bench', S.bench({ top: '#F2B8C6', back: '#A8D8C4', side: '#7FA7B8' })),
    one('bollard', S.bollard({ kind: 'post', body: CREAM, cap: '#F2B8C6' })),
    one('bin', S.bin({ top: '#7FB8A4', side: '#A8D8C4', band: '#F2B8C6' })),
    one('tree', S.tree({ kind: 'palm', leaf: ['#3E8A4F', '#5BA86B'], trunk: '#8A6A44' }))),
  marina: kit(
    one('lx_boat', V.boat({ kind: 'yacht', hull: '#F4F7F8', deck: '#D9C9A1', stripe: '#3B9C9C', cabin: '#EFF3F5' })),
    one('bollard', S.bollard({ kind: 'mooring', body: '#C9A227', cap: '#8A6A1C' })),
    one('crates', G.crates({ kind: 'gear', crate: '#CFC6B4', a: '#F26A4B', b: '#F2C94C' })),
    one('tables', S.tables({ shape: 'parasol', cloth: 'solid', a: '#3B9C9C', b: CREAM, chair: '#EFF3F5' }))),
};
