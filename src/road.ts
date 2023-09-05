import { Point, Segment } from "./geometrical";
import { lerp } from "./mathematical";

export class Road {
    private x: number;
    private width: number;
    private laneCount: number;
    private left: number;
    private right: number;
    private top: number;
    private bottom: number;
    private borders: Segment[];

    constructor(x: number, width: number, laneCount = 3) {
        this.x = x;
        this.width = width;
        this.laneCount = laneCount;

        this.left = x - width / 2;
        this.right = x + width / 2;

        const infinity = 1000000;
        this.top = -infinity;
        this.bottom = infinity;

        this.borders = [
            new Segment(new Point(this.left, this.top),
                new Point(this.left, this.bottom)),
            new Segment(new Point(this.right, this.top),
                new Point(this.right, this.bottom)),
        ];
    }

    getLaneCenter(laneIndex: number) {
        const laneWidth = this.width / this.laneCount;
        return this.left + laneWidth / 2 +
            Math.min(laneIndex, this.laneCount - 1) * laneWidth;
    }

    draw(ctx: CanvasRenderingContext2D ) {
        ctx.lineWidth = 5;
        ctx.strokeStyle = "white";

        for (let i = 1; i <= this.laneCount - 1; i++) {
            const x = lerp(
                this.left,
                this.right,
                i / this.laneCount
            );

            ctx.setLineDash([20, 20]);
            ctx.beginPath();
            ctx.moveTo(x, this.top);
            ctx.lineTo(x, this.bottom);
            ctx.stroke();
        }

        ctx.setLineDash([]);
        this.borders.forEach(border => {
            ctx.beginPath();
            ctx.moveTo(border.a.x, border.a.y);
            ctx.lineTo(border.b.x, border.b.y);
            ctx.stroke();
        });
    }
}