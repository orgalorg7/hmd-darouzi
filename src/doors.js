// Door layout shared by the 3D room, the blueprint and the configurator. Positions are metres along a wall,
// measured from the wall's midpoint; front and back walls run along the room width, left and right along its length.
export const doorWidth = 1.2;
export const maxDoors = 4;
export const walls = ['front', 'right', 'back', 'left'];
export const wallNames = {
 ar:{front:'الجدار الأمامي',right:'الجدار الأيمن',back:'الجدار الخلفي',left:'الجدار الأيسر'},
 en:{front:'Front wall',right:'Right wall',back:'Back wall',left:'Left wall'}
};
const along = (wall, width, length) => wall === 'left' || wall === 'right' ? length : width;
// Keep the whole leaf on the wall with a 10 cm margin at each corner, in 5 cm steps.
export function clampDoor({wall, offset}, width, length) {
 const limit = Math.max(0, along(wall, width, length) / 2 - doorWidth / 2 - .1);
 return {wall, offset: Math.round(Math.max(-limit, Math.min(limit, offset)) * 20) / 20};
}
// Doors on one wall never overlap: a door that would cover a neighbour moves to the nearest free spot beside it.
export function separateDoor(doors, index, width, length) {
 const door = doors[index], gap = doorWidth + .1, others = doors.filter((other, i) => i !== index && other.wall === door.wall);
 const clear = offset => others.every(other => Math.abs(other.offset - offset) >= gap - .001);
 if (clear(door.offset)) return door;
 const options = others.flatMap(other => [other.offset - gap, other.offset + gap]).map(offset => clampDoor({wall:door.wall, offset}, width, length)).filter(option => clear(option.offset));
 return options.sort((a, b) => Math.abs(a.offset - door.offset) - Math.abs(b.offset - door.offset))[0] || door;
}
// A new door goes on the first wall without one, centred; otherwise on the front wall.
export function nextDoor(doors) {
 return {wall: walls.find(wall => !doors.some(door => door.wall === wall)) || 'front', offset: 0};
}
