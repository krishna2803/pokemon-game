"use strict";

const fetchKantoPokemon = async () => {
    let mons = [];
    await fetch('https://pokeapi.co/api/v2/pokemon?limit=151')
        .then(res => res.json())
        .then(allpokemon => {
            allpokemon.results.forEach(pokemon => {
                mons.push(pokemon);
            })
        })
    return mons;
}
const roundRect = (ctx, x, y, width, height, radius) => {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
    return this;
}

const lerpColor = (a, b, t) => {
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


const toTitleCase = (str) => str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());

const randomChoice = (arr, numElements) => [...arr].sort(() => Math.random() - 0.5).slice(0, numElements);

let KEYDOWN = false;
let WHATKEY;

window.addEventListener('keydown', event => {
    KEYDOWN = true;
    WHATKEY = event.key;
});

window.addEventListener('keyup', event => {
    KEYDOWN = false;
    WHATKEY = undefined;
});

document.addEventListener("DOMContentLoaded", async () => {
    const canvas = document.getElementById('game');
    const pkmn_font = new FontFace('PKMN', 'url(../assets/fonts/PKMN_RBYGSC.ttf)');

    /** @type {CanvasRenderingContext2D} */
    /* pls ignore the line above, it is just for vscode to behave correctly */
    const ctx = canvas.getContext('2d');

    canvas.width = 640;
    canvas.height = 320;

    // clear the screen first
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';

    const ALL_POKEMON = [];

    fetchKantoPokemon().then(mons => mons.forEach(mon => {
        let poke = new Pokemon(mon.name);
        poke.initialize();
        ALL_POKEMON.push(poke);
    }));

    pkmn_font.load().then(async font => {
        document.fonts.add(font);
        const fontSize = 20;
        ctx.font = `bold ${fontSize}px PKMN`;

        /* Fonts and stuff */
        const write_text = (text, x, y, center_align = false) => {
            if (center_align) {
                const textWidth = ctx.measureText(text).width;
                x -= textWidth / 2;
            }
            ctx.fillText(text, x, y);
        }

        // play intro 
        const intro = new Audio('../assets/audio/intro.mp3');
        intro.loop = true;
        intro.play();

        // Loading for 1 second
        await new Promise(r => setTimeout(r, 1000.0));

        let player_pokemon = [];
        const choosePlayerPokemonScreen = async () => {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'black';
            let chosen_count = 0;

            let m_pokemon = [...ALL_POKEMON];

            let pokemon_index = 0;
            let chosen_mons = [];

            while (true) {
                // title
                const st = 'Choose three Pokemon!';
                let offset = -ctx.measureText(st).width;
                ctx.fillStyle = 'black';
                write_text("Choose ", (canvas.width + offset) / 2, canvas.height * 0.2, false);
                offset += 2 * ctx.measureText("Choose ").width;
                ctx.fillStyle = 'red';
                write_text("three", (canvas.width + offset) / 2, canvas.height * 0.2, false);
                offset += 2 * ctx.measureText('three').width;
                ctx.fillStyle = 'black';
                write_text(" Pokemon!", (canvas.width + offset) / 2, canvas.height * 0.2, false);


                ctx.font = `bold ${fontSize * 0.8}px PKMN`;
                write_text("Use arrow keys to cycle and enter to select", canvas.width / 2, canvas.height * 0.3, true);
                ctx.font = `bold ${fontSize}px PKMN`;



                // draw pokemon
                const pokemon = m_pokemon[pokemon_index];
                const w = pokemon.sprite.width;
                const h = pokemon.sprite.height;
                const s = 2.0;
                ctx.drawImage(pokemon.sprite, canvas.width / 2 - w * s / 2, canvas.height * 0.6 - h * s / 2, w * s, h * s);
                write_text(toTitleCase(pokemon.name), canvas.width / 2, canvas.height * 0.6 + h, true);

                if (KEYDOWN) {

                    ctx.fillStyle = 'white';
                    ctx.fillRect(canvas.width * 0.32, canvas.height * 0.32, canvas.width * 0.65625, canvas.height * 0.875);
                    ctx.fillStyle = 'black';

                    if (WHATKEY === 'Enter') {
                        chosen_count++;
                        chosen_mons.push(`${chosen_count}. ${toTitleCase(pokemon.name)}`);

                        const pokemon_ghost = m_pokemon.splice(pokemon_index, 1)[0];
                        player_pokemon.push(pokemon_ghost);
                        pokemon_index = pokemon_index % m_pokemon.length;
                        const w = pokemon_ghost.sprite.width;
                        const h = pokemon_ghost.sprite.height;
                        const s = 2.0;
                        // redraw so it doesn't dissapear
                        ctx.drawImage(pokemon_ghost.sprite, canvas.width / 2 - w * s / 2, canvas.height * 0.6 - h * s / 2, w * s, h * s);
                        write_text(toTitleCase(pokemon.name), canvas.width / 2, canvas.height * 0.6 + h, true);

                        // wait a tiny bit more
                        await new Promise(r => setTimeout(r, 300.0));
                    }

                    if (WHATKEY === 'ArrowRight') {
                        pokemon_index = (pokemon_index + 1) % m_pokemon.length;
                    }

                    if (WHATKEY === 'ArrowLeft') {
                        const n = m_pokemon.length;
                        pokemon_index = (pokemon_index - 1 + n) % n;
                    }
                    WHATKEY = undefined;
                    // wait a tiny bit
                    await new Promise(r => setTimeout(r, 500.0));
                    // and then clear
                    ctx.fillStyle = 'white';
                    ctx.fillRect(canvas.width * 0.32, canvas.height * 0.32, canvas.width * 0.3471875, canvas.height * 0.875);
                    ctx.fillStyle = 'black';
                }


                // selected pokemon
                ctx.font = `bold ${fontSize * 0.8}px PKMN`;
                ctx.fillStyle = 'black';
                for (let i = 0; i < chosen_count; i++) {
                    write_text(chosen_mons[i], canvas.width * 0.05, canvas.height * 0.5 + fontSize * i);
                }

                // 60 hertz
                await new Promise(r => setTimeout(r, 1000.0 / 60.0));

                if (chosen_count >= 3) {
                    // write multiple times to make it look more 'thicker'
                    let i = 2;
                    for (let j = 0; j < 3; j++)
                        write_text(chosen_mons[i], canvas.width * 0.05, canvas.height * 0.5 + fontSize * i);
                    ctx.font = `bold ${fontSize}px PKMN`;
                    break;
                }
                ctx.font = `bold ${fontSize}px PKMN`;
            }
            return m_pokemon[pokemon_index];
        }

        let ai_pokemons = [];
        const chooseAIPokemonScreen = async () => {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'black';
            let chosen_count = 0;

            let m_pokemon = [...ALL_POKEMON];

            let pokemon_index = parseInt(Math.random() * ALL_POKEMON.length);
            let chosen_mons = [];

            while (true) {
                // title
                const st = 'Now AI will choose three Pokemon!';
                write_text(st, canvas.width / 2, canvas.height * 0.2, true);

                let offset = -ctx.measureText(st).width;
                ctx.fillStyle = 'black';
                write_text("Now ", (canvas.width + offset) / 2, canvas.height * 0.2, false);
                offset += 2 * ctx.measureText("Now ").width;
                ctx.fillStyle = 'red';
                write_text("AI", (canvas.width + offset) / 2, canvas.height * 0.2, false);
                offset += 2 * ctx.measureText('AI').width;
                ctx.fillStyle = 'black';
                write_text(" will choose three Pokemon!", (canvas.width + offset) / 2, canvas.height * 0.2, false);

                // draw pokemon
                const pokemon = m_pokemon[pokemon_index];
                const w = pokemon.sprite.width;
                const h = pokemon.sprite.height;
                const s = 2.0;
                ctx.drawImage(pokemon.sprite, canvas.width / 2 - w * s / 2, canvas.height * 0.6 - h * s / 2, w * s, h * s);
                write_text(toTitleCase(pokemon.name), canvas.width / 2, canvas.height * 0.6 + h, true);

                // wait a tiny bit
                await new Promise(r => setTimeout(r, 100.0));


                ctx.fillStyle = 'white';
                ctx.fillRect(canvas.width * 0.32, canvas.height * 0.32, canvas.width * 0.3471875, canvas.height * 0.875);
                ctx.fillStyle = 'black';
                const r = Math.random();
                // 5% chance to select this pokemon
                // 90% chance
                if (r < 0.9) {
                    chosen_count++;
                    chosen_mons.push(`${chosen_count}. ${toTitleCase(pokemon.name)}`);

                    const pokemon_ghost = m_pokemon.splice(pokemon_index, 1)[0];
                    ai_pokemons.push(pokemon_ghost);
                    pokemon_index = pokemon_index % m_pokemon.length;
                    const w = pokemon_ghost.sprite.width;
                    const h = pokemon_ghost.sprite.height;
                    const s = 2.0;
                    // redraw so it doesn't dissapear
                    ctx.drawImage(pokemon_ghost.sprite, canvas.width / 2 - w * s / 2, canvas.height * 0.6 - h * s / 2, w * s, h * s);
                    write_text(toTitleCase(pokemon.name), canvas.width / 2, canvas.height * 0.6 + h, true);

                    // wait a tiny bit more
                    await new Promise(r => setTimeout(r, 200.0 + 75 * chosen_count));
                    // and then clear

                    ctx.fillStyle = 'white';
                    ctx.fillRect(canvas.width * 0.32, canvas.height * 0.32, canvas.width * 0.3471875, canvas.height * 0.875);
                    ctx.fillStyle = 'black';

                } else {
                    // else go right
                    pokemon_index = (pokemon_index + 1) % m_pokemon.length;
                }


                // selected pokemon
                ctx.font = `bold ${fontSize * 0.8}px PKMN`;
                ctx.fillStyle = 'black';
                for (let i = 0; i < chosen_count; i++) {
                    write_text(chosen_mons[i], canvas.width * 0.6671875, canvas.height * 0.5 + fontSize * i);
                }

                // 60 hertz
                await new Promise(r => setTimeout(r, 1000.0 / 60.0));

                if (chosen_count >= 3) {
                    // write multiple times to make it look more 'thicker'
                    let i = 2;
                    for (let j = 0; j < 3; j++)
                        write_text(chosen_mons[i], canvas.width * 0.6671875, canvas.height * 0.5 + fontSize * i);
                    ctx.font = `bold ${fontSize}px PKMN`;
                    // console.log(chosen_mons);
                    break;
                }
                ctx.font = `bold ${fontSize}px PKMN`;
            }
            return m_pokemon[pokemon_index];
        }

        const battleScreen = async () => {
            const battle_bg = new Image();
            battle_bg.src = '../assets/battlegrass.png';

            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'black';

            const render_move = (move, x, y) => {
                ctx.fillStyle = move.pp <= 0 ? 'red' : 'black';
                write_text(`${toTitleCase(move.name)} ${move.pp}/${move.maxpp}`, x, y);
                ctx.fillStyle = 'black';
            }

            const ball = new Image();
            ball.src = '../assets/ball.webp';

            while (true) {
                // draw background
                ctx.drawImage(battle_bg, 0, 0, canvas.width, battle_bg.height);

                // draw player pokemon
                const pokemon = player_pokemon[0];
                const w = pokemon.back_sprite.width;
                const h = pokemon.back_sprite.height;
                const s = 1.75;
                ctx.drawImage(pokemon.back_sprite, w / 4, canvas.height / 2 - h / 2, w * s, h * s);

                // draw player hp bar
                ctx.font = `${fontSize * 0.6}px PKMN`;
                ctx.fillStyle = '#151718';
                roundRect(ctx, canvas.width * 0.7, battle_bg.height - 3.5 * fontSize, canvas.width * 0.3, 3.5 * fontSize, 10);
                ctx.fill();
                ctx.fillStyle = 'white';
                write_text(`${toTitleCase(pokemon.name)}`, canvas.width * 0.75, battle_bg.height - fontSize * 2.5);
                write_text(`Lv. ${pokemon.level}`, canvas.width * 0.75, battle_bg.height - fontSize * 1.5);
                ctx.fillStyle = lerpColor('#ff2020', '#20ff20', pokemon.hp / pokemon.maxhp);
                write_text(`HP: ${pokemon.hp}/${pokemon.maxhp}`, canvas.width * 0.75, battle_bg.height - fontSize * 0.5);
                ctx.fillStyle = 'black';

                // draw remaining player pokemon balls
                for (let i = 0; i < player_pokemon.length; i++) {
                    ctx.drawImage(ball, canvas.width * 0.65 - 25 * i, battle_bg.height - fontSize, 20, 20);
                }

                // AI

                // draw ai pokemon
                const ai_pokemon = ai_pokemons[0];
                const ai_w = ai_pokemon.sprite.width;
                const ai_h = ai_pokemon.sprite.height;
                const ai_s = 1.75;
                ctx.drawImage(ai_pokemon.sprite, canvas.width - ai_w * 2, -ai_h / 4, ai_w * ai_s, 150);

                // draw ai hp bar
                ctx.font = `${fontSize * 0.6}px PKMN`;
                ctx.fillStyle = '#151718';
                roundRect(ctx, 0, 0, canvas.width * 0.3, 3.5 * fontSize, 10);
                ctx.fill();
                ctx.fillStyle = 'white';
                write_text(`${toTitleCase(ai_pokemon.name)}`, canvas.width * 0.05, fontSize);
                write_text(`Lv. ${ai_pokemon.level}`, canvas.width * 0.05, fontSize * 2);
                ctx.fillStyle = lerpColor('#ff2020', '#20ff20', ai_pokemon.hp / ai_pokemon.maxhp);
                write_text(`HP: ${ai_pokemon.hp}/${ai_pokemon.maxhp}`, canvas.width * 0.05, fontSize * 3);
                ctx.fillStyle = 'black';

                // draw move and bottom text

                ctx.fillStyle = 'white';
                ctx.fillRect(0, battle_bg.height, canvas.width, canvas.height);
                ctx.fillStyle = 'black';

                // draw ai remaining pokeball
                for (let i = 0; i < ai_pokemons.length; i++) {
                    ctx.drawImage(ball, canvas.width * 0.3 + 25 * i, 3.5 * fontSize - 20, 20, 20);
                }

                // draw moves
                ctx.font = `bold ${fontSize * 0.6}px PKMN`;
                render_move(pokemon.moveset[0], canvas.width * 0.05, battle_bg.height + fontSize * 2);
                render_move(pokemon.moveset[1], canvas.width * 0.05, battle_bg.height + fontSize * 4);
                render_move(pokemon.moveset[2], canvas.width * 0.40, battle_bg.height + fontSize * 2);
                render_move(pokemon.moveset[3], canvas.width * 0.40, battle_bg.height + fontSize * 4);

                if (KEYDOWN) {
                    let attack_result;

                    if (WHATKEY === '1') {
                        attack_result = pokemon.attack(ai_pokemon, 0, 0);
                    } else if (WHATKEY === '2') {
                        attack_result = pokemon.attack(ai_pokemon, 2, 0);
                    } else if (WHATKEY === '3') {
                        attack_result = pokemon.attack(ai_pokemon, 1, 0);
                    } else if (WHATKEY === '4') {
                        attack_result = pokemon.attack(ai_pokemon, 3, 0);
                    }
                    // console.log(attack_result);
                    KEYDOWN = false;

                    // player pp check
                    let remainingMoveCount = 0;
                    for (let move of pokemon.moveset) {
                        remainingMoveCount += move.pp;
                    }
                    if (remainingMoveCount == 0) {
                        if (ai_pokemons.length == 1) {
                            return 'ai_win';
                        }

                        ai_pokemons.splice(0, 1);
                    }

                    if (attack_result) {
                        ctx.font = `bold ${fontSize * 0.7}px PKMN`;
                        if (attack_result[0] === 'player_win') {
                            // player comments
                            for (let i = 0; i < attack_result[1].length; i++) {
                                const comment = attack_result[1][i];
                                write_text(comment, canvas.width * 0.75, battle_bg.height + fontSize * (i + 2), false);
                            }

                            // wait 1 sec
                            await new Promise(r => setTimeout(r, 1000.0));

                            ctx.fillStyle = 'white';
                            ctx.fillRect(canvas.width * 0.75, battle_bg.height, canvas.width, canvas.height);
                            ctx.fillStyle = 'black';

                            write_text(`${toTitleCase(ai_pokemon.name)} fainted!`, canvas.width * 0.75, battle_bg.height + fontSize * 2, false);

                            // wait 1 sec
                            await new Promise(r => setTimeout(r, 1000.0));

                            if (ai_pokemons.length == 1) {
                                return 'player_win';
                            }

                            ai_pokemons.splice(0, 1);

                        } else if (attack_result[0] === 'ai_win') {

                            ctx.fillStyle = 'white';
                            ctx.fillRect(canvas.width * 0.75, battle_bg.height, canvas.width, canvas.height);
                            ctx.fillStyle = 'black';

                            // ai comments
                            for (let i = 0; i < attack_result[2].length; i++) {
                                const comment = attack_result[2][i];
                                write_text(comment, canvas.width * 0.75, battle_bg.height + fontSize * (i + 2), false);
                            }

                            // wait 1 sec
                            await new Promise(r => setTimeout(r, 1000.0));


                            ctx.fillStyle = 'white';
                            ctx.fillRect(canvas.width * 0.75, battle_bg.height, canvas.width, canvas.height);
                            ctx.fillStyle = 'black';
                            write_text(`${toTitleCase(pokemon.name)} fainted!`, canvas.width * 0.75, battle_bg.height + fontSize * 2, false);

                            // wait 1 sec
                            await new Promise(r => setTimeout(r, 1000.0));

                            if (player_pokemon.length == 1) {
                                return 'ai_win';
                            }

                            player_pokemon.splice(0, 1);
                        } else {
                            // player comments
                            for (let i = 0; i < attack_result[1].length; i++) {
                                const comment = attack_result[1][i];
                                write_text(comment, canvas.width * 0.75, battle_bg.height + fontSize * (i + 2), false);
                            }

                            // wait 1 sec
                            await new Promise(r => setTimeout(r, 1000.0));

                            ctx.fillStyle = 'white';
                            ctx.fillRect(canvas.width * 0.75, battle_bg.height, canvas.width, canvas.height);
                            ctx.fillStyle = 'black';

                            // ai comments
                            for (let i = 0; i < attack_result[2].length; i++) {
                                const comment = attack_result[2][i];
                                write_text(comment, canvas.width * 0.75, battle_bg.height + fontSize * (i + 2), false);
                            }

                            ctx.font = `bold ${fontSize}px PKMN`;
                            // wait 1 sec
                            await new Promise(r => setTimeout(r, 1000.0));
                        }
                    }
                }

                // 10 Hz
                await new Promise(r => setTimeout(r, 1000.0 / 10.0));
            }
        }

        const gameOverScreen = async result => {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = 'white';
            ctx.font = `bold 40px PKMN`;
            write_text('GAME OVER', canvas.width / 2, canvas.height / 4, true);


            ctx.font = `bold 28px PKMN`;
            if (result === 'player_win') {
                write_text('You Win!', canvas.width / 2, canvas.height / 2, true);
            }

            if (result === 'ai_win') {
                write_text('You Lose!', canvas.width / 2, canvas.height / 2, true);
            }

            ctx.font = `bold 20px PKMN`;
            write_text('Refresh the page to play again.', canvas.width / 2, 3 * canvas.height / 4, true);
        }

        await choosePlayerPokemonScreen();

        // wait
        await new Promise(r => setTimeout(r, 1000.0));

        await chooseAIPokemonScreen();

        intro.pause();

        const battle = new Audio('../assets/audio/battle.mp3');
        battle.loop = true;
        battle.play();

        // wait more
        await new Promise(r => setTimeout(r, 1000.0));
        let result = await battleScreen();
        battle.pause();


        const ending = new Audio('../assets/audio/outro.mp3');
        ending.loop = true;
        ending.play();

        await gameOverScreen(result);

    });
});

class Move {
    constructor(name, url) {
        this.name = name;
        this.url = url;
    }

    initialize = async () => {
        try {
            const response = await fetch(this.url);
            if (!response.ok) {
                throw new Error('Failed to fetch move');
            }
            const data = await response.json();

            this.power = data.power;
            this.pp = data.pp;
            this.maxpp = this.pp;
            this.priority = data.priority;
            this.type = data.type;

        } catch (error) {
            console.error('Some error occured!: ', error);
        }
    }
}

class Pokemon {
    constructor(name) {
        this.name = name;
        this.sprite = new Image();
        this.back_sprite = new Image();
        this.moveset = [];
        this.types = [];
        this.hp = Math.floor(80 + Math.random() * 40);
        this.maxhp = this.hp;
        this.level = Math.floor(20 + Math.random() * 5);
    }

    initialize = async () => {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${this.name}`);
            if (!response.ok) {
                throw new Error('Failed to fetch sprite');
            }
            const data = await response.json();
            // 1% chance of shiny
            if (Math.random() < 0.01) {
                this.sprite.src = data.sprites.front_shiny || data.sprites.front_default;
                this.back_sprite.src = data.sprites.back_shiny || data.sprites.back_default;
            } else {
                this.sprite.src = data.sprites.front_default;
                this.back_sprite.src = data.sprites.back_default;
            }

            // load types
            for (let type of data.types) {
                this.types.push(type.type.name);
            }

            // load moves
            let moves = randomChoice(data.moves, 4);
            for (let move of moves) {
                let m = new Move(move.move.name, move.move.url);
                await m.initialize();
                this.moveset.push(m);
            }
        } catch (error) {
            console.error('Some error occured!: ', error);
        }
    }

    attack = (that, player_move_index, ai_move_index) => {
        if (this.moveset[player_move_index].pp <= 0) return;
        this.moveset[player_move_index].pp -= 1;

        // damage calculation
        // https://bulbapedia.bulbagarden.net/wiki/Damage

        let comments = [];

        let move = this.moveset[player_move_index];
        comments.push(`${toTitleCase(this.name)} used`);
        comments.push(`${toTitleCase(move.name)}`);

        const crit_chance = 0.1; // 10% chance for a critical hit
        const level = this.level;
        const power = move.power;
        const critical = Math.random() < crit_chance ? 2 : 1;
        if (critical === 2) {
            comments.push('A critical hit!');
        }

        const STAB = this.types.includes(move.type) ? 1.5 : 1;
        if (STAB === 1.5) {
            comments.push('It is very effective!');
        }

        const random = (217 + Math.random() * (256 - 217)) / 255;

        let damage = ((2 * level * critical / 5 + 2) * power / 50 + 2) * STAB * random;
        damage = Math.floor(damage);

        let ai_comments = [];
        let ai_move = that.moveset[ai_move_index];
        ai_comments.push(`${toTitleCase(that.name)} used`);
        ai_comments.push(`${toTitleCase(ai_move.name)}`);

        const ai_level = that.level;
        const ai_power = ai_move.power;
        const ai_critical = Math.random() < crit_chance ? 2 : 1;
        if (ai_critical === 2) {
            ai_comments.push('A critical hit!');
        }

        const ai_STAB = that.types.includes(ai_move.type) ? 1.5 : 1;
        if (ai_STAB === 1.5) {
            ai_comments.push('It is very effective!');
        }

        const ai_random = (217 + Math.random() * (256 - 217)) / 255;
        let ai_damage = ((2 * ai_level * ai_critical / 5 + 2) * ai_power / 50 + 2) * ai_STAB * ai_random;
        ai_damage = Math.floor(damage);

        if (move.priority > ai_move.priority) {
            that.hp = Math.max(0, that.hp - damage);
            if (that.hp == 0) {
                return ['player_win', comments, null];
            }
            this.hp = Math.max(0, this.hp - ai_damage);
            if (this.hp == 0)
                return ['ai_win', comments, ai_comments];
        } else if (move.priority < ai_move.priority) {
            this.hp = Math.max(0, this.hp - ai_damage);
            if (this.hp == 0)
                return ['ai_win', null, ai_comments];
            that.hp = Math.max(0, that.hp - damage);
            if (that.hp == 0) {
                return ['player_win', comments, ai_comments];
            }
        } else {
            if (Math.random() < 0.5) {
                that.hp = Math.max(0, that.hp - damage);
                if (that.hp == 0) {
                    return ['player_win', comments, null];
                }
                this.hp = Math.max(0, this.hp - ai_damage);
                if (this.hp == 0)
                    return ['ai_win', comments, ai_comments];
            } else {
                this.hp = Math.max(0, this.hp - ai_damage);
                if (this.hp == 0)
                    return ['ai_win', null, ai_comments];
                that.hp = Math.max(0, that.hp - damage);
                if (that.hp == 0) {
                    return ['player_win', comments, ai_comments];
                }
            }
        }
        return [null, comments, ai_comments];
    }
}

