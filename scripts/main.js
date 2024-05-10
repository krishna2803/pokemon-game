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

        await new Promise(r => setTimeout(r, 1000.0));

        const choosePlayerPokemonScreen = async () => {
            ctx.clearRect(0,0,canvas.width, canvas.height);
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
                ctx.drawImage(pokemon.sprite, canvas.width / 2 - w*s/2, canvas.height * 0.6 - h*s/2, w*s, h*s);
                // ctx.scale(0.5, 0.5);
                write_text(toTitleCase(pokemon.name), canvas.width / 2, canvas.height * 0.6 + h, true);

                if (KEYDOWN) {
                    ctx.clearRect(canvas.width*0.32, canvas.height*0.32, canvas.width*0.65625, canvas.height*0.875);

                    if (WHATKEY === 'Enter') {
                        chosen_count++;
                        chosen_mons.push(`${chosen_count}. ${toTitleCase(pokemon.name)}`);
                        
                        const pokemon_ghost = m_pokemon.splice(pokemon_index,1)[0];
                        pokemon_index = pokemon_index % m_pokemon.length;
                        const w = pokemon_ghost.sprite.width;
                        const h = pokemon_ghost.sprite.height;
                        const s = 2.0;
                        // redraw so it doesn't dissapear
                        ctx.drawImage(pokemon_ghost.sprite, canvas.width / 2 - w*s/2, canvas.height * 0.6 - h*s/2, w*s, h*s);
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
                    ctx.clearRect(canvas.width*0.32, canvas.height*0.32, canvas.width*0.3471875, canvas.height*0.875);
                }


                // selected pokemon
                ctx.font = `bold ${fontSize*0.8}px PKMN`;
                ctx.fillStyle = 'black';
                for (let i=0; i<chosen_count; i++) {
                    write_text(chosen_mons[i], canvas.width*0.05, canvas.height*0.5+fontSize*i);
                }

                // 60 hertz
                await new Promise(r => setTimeout(r, 1000.0 / 60.0));

                if (chosen_count >= 3) {
                    // write multiple times to make it look more 'thicker'
                    let i = 2;
                    for (let j=0; j<3; j++)
                        write_text(chosen_mons[i], canvas.width*0.05, canvas.height*0.5+fontSize*i);
                    ctx.font = `bold ${fontSize}px PKMN`;
                    break;
                }
                ctx.font = `bold ${fontSize}px PKMN`;
            }
            return m_pokemon[pokemon_index];
        }

        const chooseAIPokemonScreen = async() => {
            ctx.clearRect(0,0,canvas.width, canvas.height);
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
                ctx.drawImage(pokemon.sprite, canvas.width / 2 - w*s/2, canvas.height * 0.6 - h*s/2, w*s, h*s);
                write_text(toTitleCase(pokemon.name), canvas.width / 2, canvas.height * 0.6 + h, true);

                // wait a tiny bit
                await new Promise(r => setTimeout(r, 100.0));

                
                ctx.clearRect(canvas.width*0.32, canvas.height*0.32, canvas.width*0.3471875, canvas.height*0.875);
                const r = Math.random();
                // 0.1/n chance to select this pokemon
                if (r < 0.10) {
                    chosen_count++;
                    chosen_mons.push(`${chosen_count}. ${toTitleCase(pokemon.name)}`);
                    
                    const pokemon_ghost = m_pokemon.splice(pokemon_index,1)[0];
                    pokemon_index = pokemon_index % m_pokemon.length;
                    const w = pokemon_ghost.sprite.width;
                    const h = pokemon_ghost.sprite.height;
                    const s = 2.0;
                    // redraw so it doesn't dissapear
                    ctx.drawImage(pokemon_ghost.sprite, canvas.width / 2 - w*s/2, canvas.height * 0.6 - h*s/2, w*s, h*s);
                    write_text(toTitleCase(pokemon.name), canvas.width / 2, canvas.height * 0.6 + h, true);

                    // wait a tiny bit more
                    await new Promise(r => setTimeout(r, 300.0));
                    // and then clear
                    ctx.clearRect(canvas.width*0.32, canvas.height*0.32, canvas.width*0.3471875, canvas.height*0.875);

                } else {
                    // else go right
                    pokemon_index = (pokemon_index + 1) % m_pokemon.length;
                }


                // selected pokemon
                ctx.font = `bold ${fontSize*0.8}px PKMN`;
                ctx.fillStyle = 'black';
                for (let i=0; i<chosen_count; i++) {
                    write_text(chosen_mons[i], canvas.width*0.6671875, canvas.height*0.5+fontSize*i);
                }

                // 60 hertz
                await new Promise(r => setTimeout(r, 1000.0 / 60.0));

                if (chosen_count >= 3) {
                    // write multiple times to make it look more 'thicker'
                    let i = 2;
                    for (let j=0; j<3; j++)
                        write_text(chosen_mons[i], canvas.width*0.6671875, canvas.height*0.5+fontSize*i);
                    ctx.font = `bold ${fontSize}px PKMN`;
                    console.log(chosen_mons);
                    break;
                }
                ctx.font = `bold ${fontSize}px PKMN`;
            }
            return m_pokemon[pokemon_index];
        }

        await choosePlayerPokemonScreen();

        await new Promise(r => setTimeout(r, 300.0));

        await chooseAIPokemonScreen();
    });
});

class Move {
    constructor(name, power, pp, priority) {
        this.name = name;
        this.power = power;
        this.pp = pp;
        this.priority = priority;
    }
}

class Pokemon {
    constructor(name) {
        this.name = name;
        this.sprite = new Image();
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
            } else {
                this.sprite.src = data.sprites.front_default;
            }
        } catch (error) {
            console.error('Error fetching sprite:', error);
        }
    }
}

