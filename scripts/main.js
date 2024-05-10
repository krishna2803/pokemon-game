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

    const ALL_POKEMON = [];

    fetchKantoPokemon().then(mons => mons.forEach(mon => {
        let poke = new Pokemon(mon.name);
        poke.initialize();
        ALL_POKEMON.push(poke);
    }));


    // testing
    const poke = await fetch(`https://pokeapi.co/api/v2/pokemon/vulpix`);
    let data = await poke.json();
    // console.log(data);
    let __m_moves = [];
    let __moves = randomChoice(data.moves, 4);
    for (let move of __moves) {
        let m = new Move(move.move.name, move.move.url);
        await m.initialize();
        __m_moves.push(m);
    }
    // console.log(m_moves);
    // un testing

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

        // play sound
        // let intro = new Audio('../assets/audio/intro.mp3');
        // intro.loop = true;
        // intro.play();

        // Loading for 1 second
        await new Promise(r => setTimeout(r, 1000.0));

        
        // console.log(ALL_POKEMON[5]);


        let player_pokemon = [];
        const choosePlayerPokemonScreen = async () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let chosen_count = 0;

            let m_pokemon = [...ALL_POKEMON];

            let pokemon_index = 0;
            let chosen_mons = [];

            while (true) {
                // ctx.clearRect(0,0,canvas.width,canvas.height);
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
                // ctx.scale(0.5, 0.5);
                write_text(toTitleCase(pokemon.name), canvas.width / 2, canvas.height * 0.6 + h, true);

                if (KEYDOWN) {
                    ctx.clearRect(canvas.width * 0.32, canvas.height * 0.32, canvas.width * 0.65625, canvas.height * 0.875);

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
                    await new Promise(r => setTimeout(r, 100.0));
                    // and then clear
                    ctx.clearRect(canvas.width * 0.32, canvas.height * 0.32, canvas.width * 0.3471875, canvas.height * 0.875);
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

        let ai_pokemon = [];
        const chooseAIPokemonScreen = async () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let chosen_count = 0;

            let m_pokemon = [...ALL_POKEMON];

            let pokemon_index = parseInt(Math.random() * ALL_POKEMON.length);
            let chosen_mons = [];

            while (true) {
                // ctx.clearRect(0,0,canvas.width,canvas.height);
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

                // ctx.font = `bold ${fontSize * 0.8}px PKMN`;
                // write_text("Use arrow keys to cycle and enter to select", canvas.width / 2, canvas.height * 0.3, true);
                // ctx.font = `bold ${fontSize}px PKMN`;

                // draw pokemon
                const pokemon = m_pokemon[pokemon_index];
                const w = pokemon.sprite.width;
                const h = pokemon.sprite.height;
                const s = 2.0;
                ctx.drawImage(pokemon.sprite, canvas.width / 2 - w * s / 2, canvas.height * 0.6 - h * s / 2, w * s, h * s);
                write_text(toTitleCase(pokemon.name), canvas.width / 2, canvas.height * 0.6 + h, true);

                // wait a tiny bit
                await new Promise(r => setTimeout(r, 100.0));

                ctx.clearRect(canvas.width * 0.32, canvas.height * 0.32, canvas.width * 0.3471875, canvas.height * 0.875);
                const r = Math.random();
                // 5% chance to select this pokemon
                // 40% chance
                if (r < 0.4) {
                    chosen_count++;
                    chosen_mons.push(`${chosen_count}. ${toTitleCase(pokemon.name)}`);

                    const pokemon_ghost = m_pokemon.splice(pokemon_index, 1)[0];
                    ai_pokemon.push(pokemon_ghost);
                    pokemon_index = pokemon_index % m_pokemon.length;
                    const w = pokemon_ghost.sprite.width;
                    const h = pokemon_ghost.sprite.height;
                    const s = 2.0;
                    // redraw so it doesn't dissapear
                    ctx.drawImage(pokemon_ghost.sprite, canvas.width / 2 - w * s / 2, canvas.height * 0.6 - h * s / 2, w * s, h * s);
                    write_text(toTitleCase(pokemon.name), canvas.width / 2, canvas.height * 0.6 + h, true);

                    // wait a tiny bit more
                    await new Promise(r => setTimeout(r, 400.0 + 75 * chosen_count));
                    // and then clear
                    ctx.clearRect(canvas.width * 0.32, canvas.height * 0.32, canvas.width * 0.3471875, canvas.height * 0.875);

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


        const battleScreen = async() => {
            const battle_bg = new Image();
            battle_bg.src = '../assets/battlegrass.png';
            
            ctx.clearRect(0,0,canvas.width,canvas.height);

            while (true) {
                ctx.drawImage(battle_bg, 0, 0, canvas.width, battle_bg.height);

                ctx.font = `bold ${fontSize*0.6}px PKMN`;
                write_text('1 Flamethrower 20/20', canvas.width*0.05, battle_bg.height + fontSize * 2, false);
                write_text('2 Hello World!', canvas.width*0.05, battle_bg.height + fontSize * 4, false);
                write_text('3 Hello World!', canvas.width*0.4, battle_bg.height + fontSize * 2, false);
                write_text('4 Hello World!', canvas.width*0.4, battle_bg.height + fontSize * 4, false);
                
                ctx.font = `bold ${fontSize*0.5}px PKMN`;
                write_text('Someone used',  canvas.width*0.75, battle_bg.height + fontSize * 2, false);
                write_text('something', canvas.width*0.75, battle_bg.height + fontSize * 3, false);
                ctx.font = `bold ${fontSize}px PKMN`;
                // 10 Hz
                await new Promise(r => setTimeout(r, 1000.0/10.0));
            }
        }

        const gameOverScreen = async() => {

        }

        // await choosePlayerPokemonScreen();

        // await new Promise(r => setTimeout(r, 1000.0));

        // await chooseAIPokemonScreen();
        
        await battleScreen();

        // console.log(player_pokemon);
        // console.log(ai_pokemon);
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
        this.hp = Math.floor(80 + Math.random()*40);
        this.maxhp = this.hp;
        this.level = Math.floor(20 + Math.random()*5);
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
        this.moveset[player_move_index].pp -= 1;

        // damage calculation
        // https://bulbapedia.bulbagarden.net/wiki/Damage

        let comments = [];

        let move = this.moveset[player_move_index];

        const crit_chance = 0.05; // 5 % chance for critical hit
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

        const random = (217 + Math.random() * (256-217)) / 255;

        let damage = ((2 * level * critical / 5 + 2) * power / 50 + 2) * STAB * random;
        damage = Math.floor(damage);

        let ai_comments = [];
        let ai_move = that.moveset[ai_move_index];
        const ai_level = that.level;
        const ai_power = ai_move.power;
        const ai_critical = Math.random() < crit_chance ? 2 : 1;
        if (critical === 2) {
            ai_comments.push('A critical hit!');
        }

        const ai_STAB = that.types.includes(ai_move.type) ? 1.5 : 1;
        if (ai_STAB === 1.5) {
            ai_comments.push('It is very effective!');
        }

        const ai_random = (217 + Math.random() * (256-217)) / 255;
        let ai_damage = ((2 * ai_level * ai_critical / 5 + 2) * ai_power / 50 + 2) * ai_STAB * ai_random;
        ai_damage = Math.floor(damage);

        if (move.priority > ai_move.priority) {
            that.hp = Math.max(0, that.hp - damage);
            if (that.hp == 0) {
                return ['player_win', comments, null];
            }
            this.hp = Math.max(0, this.hp - ai_damage);
            if (that.hp == 0)
                return ['ai_win', comments, ai_comments];
        } else if (move.priority < ai_move.priority) {
            this.hp = Math.max(0, this.hp - ai_damage);
            if (that.hp == 0)
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
                if (that.hp == 0)
                    return ['ai_win', comments, ai_comments];
            } else {
                this.hp = Math.max(0, this.hp - ai_damage);
                if (that.hp == 0)
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

