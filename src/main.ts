import queryString = require('query-string');

class LangtonsAnts {
    height: number;
    width: number;
    drawPixel: (y: number, x: number, color: string) => void;
    ants: { y: number, x: number, direction: number, color: string }[];
    cell: boolean[][];

    constructor(drawPixel: (y: number, x: number, color: string) => void) {
        this.drawPixel = drawPixel;
        this.cell = [];
        this.ants = [];
        this.resize(0, 0);
    }

    resize(height: number, width: number) {
        this.height = height;
        this.width = width;
        while (this.cell.length < height) {
            this.cell.push([]);
        }
        for (let y = 0; y < height; ++ y) {
            while (this.cell[y].length < width) {
                this.cell[y].push(false);
            }
        }
        for (let y = 0; y < height; ++ y) {
            for (let x = 0; x < width; ++ x) {
                this.drawPixel(y, x, (this.cell[y][x] ? 'grey' : 'black'));
            }
        }
    }

    step() {
        for (const ant of this.ants) {
            const pred = this.flipCell(ant.y, ant.x, ant.color);
            ant.direction = (ant.direction + (pred ? 1 : -1) + 4) % 4;
            const dy = [ 0, -1, 0, 1 ][ant.direction];
            const dx = [ 1, 0, -1, 0 ][ant.direction];
            ant.y = (ant.y + dy + this.height) % this.height;
            ant.x = (ant.x + dx + this.width)  % this.width;
            this.drawPixel(ant.y, ant.x, 'white');
        }
    }

    addAnt(ant: { y: number, x: number, direction: number, color: string }) {
        this.ants.push(ant);
    }

    flipCell(y: number, x: number, color: string) {
        const pred = this.cell[y][x];
        this.cell[y][x] = ! pred;
        this.drawPixel(y, x, (pred ? 'black' : color));
        return pred;
    }
}


window.addEventListener('DOMContentLoaded', () => {
    const config = queryString.parse(location.search);
    console.log(config);
    console.log(config.hasOwnProperty);
    config.updated = false;
    if (! ('scale' in config)) {
        config.scale = '10';
        config.updated = true;
    }
    if (! ('speed' in config) || [ 'high', 'middle', 'low' ].indexOf(config.speed) == -1) {
        config.speed = 'middle';
        config.updated = true;
    }
    if (config.updated) {
        delete config.updated;
        location.search = queryString.stringify(config);
    }
    const scale = parseInt(config.scale);

    const body = document.body as HTMLBodyElement;
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const context = canvas.getContext('2d');
    const drawPixel = (y: number, x: number, color: string) => {
        context.fillStyle = color;
        context.fillRect(x * scale, y * scale, scale, scale);
    };
    const app = new LangtonsAnts(drawPixel);
    const resize = () => {
        const h = body.clientHeight;
        const w = body.clientWidth;
        console.log('resize: H = ' + h + ', W = ' + w);
        canvas.height = h;
        canvas.width = w;
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvas.width, canvas.height);
        app.resize(Math.floor(h / scale), Math.floor(w / scale));
    };
    const colors = [ 'red', 'blue', 'green', 'magenta', 'cyan', 'yellow' ];
    const getNextColor = () => {
        const color = colors.shift();
        colors.push(color);
        return color;
    };
    const addRandomAnt = () => {
        const h = body.clientHeight;
        const w = body.clientWidth;
        app.addAnt({
            'y': Math.floor(Math.random() * h / scale),
            'x': Math.floor(Math.random() * w / scale),
            'direction': Math.floor(Math.random() * 4),
            'color': getNextColor(),
        });
    };
    const click = (ev: MouseEvent) => {
        const y = Math.floor(ev.y / scale);
        const x = Math.floor(ev.x / scale);
        if (ev.shiftKey || ev.ctrlKey) {
            app.flipCell(y, x, 'grey');
        } else {
            app.addAnt({
                'y': y,
                'x': x,
                'direction': Math.floor(Math.random() * 4),
                'color': getNextColor(),
            });
        }
    };

    resize();
    addRandomAnt();
    window.addEventListener('resize', (ev: any) => { resize(); });
    window.addEventListener('click', (ev: MouseEvent) => { click(ev); });
    setInterval(() => {
        if (config.speed == 'high') for (let k = 100; k --; ) app.step();
        app.step();
    }, { 'high': 10, 'middle': 10, 'low': 400 }[config.speed]);
});
