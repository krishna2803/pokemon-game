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
        ctx.font = `${fontSize}px PKMN`;

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


            ctx.font = `${fontSize * 0.8}px PKMN`;
            write_text("Use arrow keys to cycle and enter to select", canvas.width / 2, canvas.height * 0.3, true);
            ctx.font = `${fontSize}px PKMN`;

            let chosen_count = 0;

            let m_pokemon = [...ALL_POKEMON];

            let player_pokemon_text = [];
            let pokemon_index = 0;
            while (chosen_count !== 3) {

                // draw pokemon
                const pokemon = m_pokemon[pokemon_index];
                const w = pokemon.sprite.width;
                const h = pokemon.sprite.height;
                const s = 2.0;
                // ctx.clearRect(canvas.width*0.3, canvas.height*)
                ctx.drawImage(pokemon.sprite, canvas.width / 2 - w*s/2, canvas.height * 0.6 - h*s/2, w*s, h*s);
                // ctx.scale(0.5, 0.5);
                write_text("Hello WOrld!", canvas.width / 2, canvas.height * 0.6 + h, true);

                if (KEYDOWN) {
                    ctx.clearRect(canvas.width*0.32, canvas.height*0.32, canvas.width*0.65625, canvas.height*0.875);

                    if (WHATKEY === 'Enter') {
                        chosen_count++;
                    }

                    if (WHATKEY === 'ArrowRight') {
                        pokemon_index = (pokemon_index + 1) % m_pokemon.length;
                    }

                    if (WHATKEY === 'ArrowLeft') {
                        const n = m_pokemon.length;
                        pokemon_index = (pokemon_index - 1 + n) % n;
                    }
                    // wait a tiny bit
                    await new Promise(r => setTimeout(r, 100.0));
                    WHATKEY = undefined;
                }

                ctx.font = `${fontSize/1.5}px PKMN`;
                
                ctx.font = `${fontSize}px PKMN`;


                // 60 hertz
                await new Promise(r => setTimeout(r, 1000.0 / 60.0));
            }
            return WHATKEY;
        }

        await choosePlayerPokemonScreen();
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

