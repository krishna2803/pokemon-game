import { toTitleCase, randomChoice } from './utils.js'
import { Move } from './move.js'

export class Pokemon {
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

    calculateBaseDamage = move => {
        const STAB = this.types.includes(move.type.name) ? 1.5 : 1;
        let damage = ((2 * this.level / 5 + 2) * move.power / 50 + 2) * STAB;
        return Math.floor(damage);
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

        const crit_chance = 0.2; // 20% chance for a critical hit
        const level = this.level;
        const power = move.power;
        const critical = Math.random() < crit_chance ? 2 : 1;
        if (critical === 2) {
            comments.push('A critical hit!');
        }

        const STAB = this.types.includes(move.type.name) ? 1.5 : 1;
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

        const ai_STAB = that.types.includes(ai_move.type.name) ? 1.5 : 1;
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

