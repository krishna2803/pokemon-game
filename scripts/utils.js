
export const toTitleCase = (str) => str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());

export const randomChoice = (arr, numElements) => [...arr].sort(() => Math.random() - 0.5).slice(0, numElements);

export const lerpColor = (a, b, t) => {
    const
        ah = +a.replace('#', '0x'),
        ar = ah >> 16,
        ag = ah >> 8 & 0xff,
        ab = ah & 0xff,
        bh = +b.replace('#', '0x'),
        br = bh >> 16,
        bg = bh >> 8 & 0xff,
        bb = bh & 0xff,
        rr = ar + t * (br - ar),
        rg = ag + t * (bg - ag),
        rb = ab + t * (bb - ab)
        ;
    return '#' + (0x1000000 + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
}