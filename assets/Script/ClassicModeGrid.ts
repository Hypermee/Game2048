import Data from './ClickSwitchSpriteImage';
import { ClassicModeGame } from './ClassicModeGame';
import { _decorator, Component, Node, Tween, math, Sprite, Layers, Animation, AnimationComponent, UITransform, find, resources, Prefab, instantiate, Label, LabelOutline, Vec2 } from 'cc';
const { ccclass, property } = _decorator;
const { size, Vec3 } = math;

type _2048 = 2 | 4 | 8 | 16 | 32 | 64 | 256 | 512 | 1024 | 2048;

const Sqrt2 = (_num: _2048): number => {
    let flag: number = 0;
    let num: number = _num / 2;
    while(num !== 1) {
        num /= 2;
        flag++;
    }

    return flag;
}

@ccclass('ClassicModeGrid')
export class ClassicModeGrid extends Component {
    private grid: Node = null;

    private label: Node = null;

    private animation: boolean = false;

    private _: ClassicModeGame = null;

    onLoad() {
        this._ = this.node.parent.getComponent("ClassicModeGame") as ClassicModeGame;
    }

    start() {
        this.setNumber(2048);

        this.node.on(Node.EventType.TOUCH_END, () => {
            this.textAnimation('left');
        })
    }

    setNumber(num: _2048, type: boolean = true) {
        this.delNumber();
        let i = Sqrt2(num);

        this.grid = new Node("Number");
        this.grid.layer = Layers.Enum.UI_2D;
        this.grid.setScale(new Vec3(0, 0, 0));
        this.grid.addComponent(Sprite).spriteFrame = type ? this._.lightGrid[i] :  this._.darkGrid[i];
        this.grid.addComponent(UITransform).setContentSize(this.node.getComponent(UITransform).contentSize);

        resources.load("prefab/ClassicLabel", Prefab, (error, prefab) => {
            if(error) return;

            this.label = instantiate(prefab);
            let label = this.label.getComponent(Label);
            label.string = num.toString();
            label.fontSize = 42 * this.node.scale.x;
            label.lineHeight = 32 * this.node.scale.x;

            this.label.parent = this.grid;
        })
        
        if(Data.voice) (find("Voice").getComponent("VoiceManager") as any).playEffect('show');

        this.grid.parent = this.node;

        let tween = new Tween();
        tween.target(this.grid)
        .to(0.15, { scale: new Vec3(1.1, 1.1, 1.1) })
        .to(0.1, { scale: new Vec3(1, 1, 1) })
        .start();
    }

    delNumber() {
        if(this.grid !== null) {
            this.grid.removeFromParent();
            this.grid = null;
        }

        if(this.label !== null) {
            this.label.removeFromParent();
            this.label = null;
        }
    }

    textAnimation(direction: string) {
        if(this.animation) return;

        return new Promise((resolve) => {
            if(this.label === null) return;

            this.animation = true;

            let trans: number = 18;
            let vertical: number = 0;
            let horizontal: number = 0;
            switch(direction) {
                case 'left':
                    vertical = trans;
                    break;
                case 'right':
                    vertical = -trans;
                    break;
                case 'top':
                    horizontal = trans;
                    break;
                case 'bottom':
                    horizontal = -trans;
                    break;
                default:
                    break;
            }
    
            let tween = new Tween();
            tween.target(this.label)
            .by(0.15, { position: new Vec3(horizontal, vertical, 0) })
            .to(0.1, { position: new Vec3(0, 0, 0) })
            .start()

            resolve(!(this.animation = false));
        })
    }
}

