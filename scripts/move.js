export class Move {
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

            this.power = Math.max(data.power, 40);
            this.pp = data.pp;
            this.maxpp = this.pp;
            this.priority = data.priority;
            this.type = data.type;

        } catch (error) {
            console.error('Some error occured!: ', error);
        }
    }
}
