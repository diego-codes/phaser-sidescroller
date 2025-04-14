export class ObstaclesController {
    private obstacles = new Map<string, MatterJS.BodyType>();

    private createKey(name: string, id: number): string {
        return `${name}-${id}`;
    }

    add(name: string, body: MatterJS.BodyType): void {
        this.obstacles.set(this.createKey(name, body.id), body);
    }

    is(name: string, body: MatterJS.BodyType): boolean {
        return this.obstacles.has(this.createKey(name, body.id));
    }
}

