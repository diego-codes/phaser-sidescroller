type StateConfig = {
    name?: string;
    onEnter?: () => void;
    onExit?: () => void;
    onUpdate?: (dt: number) => void;
};

export class StateMachine<T> {
    private states = new Map<string, StateConfig>();
    private currentState: StateConfig | null = null;
    private isSwitchingState = false;
    private stateQueue: string[] = [];
    debug: boolean = false;

    constructor(private context?: T, private name: string = "fsm") {}

    addState(name: string, config?: StateConfig): StateMachine<T> {
        if (this.states.has(name)) {
            throw new Error(`State ${name} already exists.`);
        }
        this.states.set(name, {
            name,
            onEnter: config?.onEnter?.bind(this.context),
            onExit: config?.onExit?.bind(this.context),
            onUpdate: config?.onUpdate?.bind(this.context),
        });
        return this;
    }

    setState(name: string): StateMachine<T> {
        if (this.isSwitchingState) {
            this.stateQueue.push(name);
            return this;
        }
        this.isSwitchingState = true;
        this.debugLog(
            `[StateMachine (${this.name})] Switching state to ${name}`
        );
        this.currentState?.onExit?.();
        this.currentState = this.states.get(name) || null;
        this.currentState?.onEnter?.();
        this.isSwitchingState = false;
        return this;
    }

    update(dt: number) {
        if (this.stateQueue.length > 0) {
            const name = this.stateQueue.shift()!;
            this.setState(name);
        }
        this.debugLog(`Updating state: ${this.currentState?.name}`);
        this.currentState?.onUpdate?.(dt);
    }

    private log(...messages: string[]) {
        console.log(`[StateMachine (${this.name})]`, ...messages);
    }
    private debugLog(...messages: string[]) {
        if (this.debug) {
            this.log(...messages);
        }
    }

    isCurrentState(name: string): boolean {
        return this.currentState?.name === name;
    }
}

