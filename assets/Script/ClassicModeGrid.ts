import { ClassicModeGame } from './ClassicModeGame';
import { _decorator, Component, Node, Tween, math, Sprite, Layers, Animation, AnimationComponent, UITransform, find, resources, Prefab, instantiate, Label, LabelOutline, Vec2 } from 'cc';
import Data from './ClickSwitchSpriteImage';
import { Queen } from './SkinStyleMode';
const { ccclass, property } = _decorator;
const { size, Vec3 } = math;

export type _2048 = 2 | 4 | 8 | 16 | 32 | 64 | 256 | 512 | 1024 | 2048;

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
    public sprite: Sprite = null;

    public label: Label = null;

    public number: _2048 = null;

    public change: boolean = false;

    public animation: boolean = false;

    private _: ClassicModeGame = null;

    onLoad() {
        this._ = this.node.parent.getComponent(ClassicModeGame);
    }

    setNumber(num: _2048, type: boolean = true) {
        num = Math.abs(num) as _2048;
        if(this.label && parseInt(this.label.string) == num) return;

        this.delNumber();
        let i = Sqrt2(num);
        
        this.number = num;
        let grid = new Node("Number");
        grid.layer = Layers.Enum.UI_2D;
        if(type) grid.setScale(new Vec3(0, 0, 0));
        grid.addComponent(Sprite).spriteFrame = Data.style ? this._.lightGrid[i] :  this._.darkGrid[i];
        grid.addComponent(UITransform).setContentSize(this.node.getComponent(UITransform).contentSize);

        this.sprite = grid.getComponent(Sprite);
        Queen.push(this);

        resources.load("prefab/ClassicLabel", Prefab, (error, prefab) => {
            if(error) return;

            let label = instantiate(prefab);
            this.label = label.getComponent(Label);
            this.label.string = num.toString();
            this.label.fontSize = 42 * this.node.scale.x;
            this.label.lineHeight = 32 * this.node.scale.x;

            this.label.node.parent = this.sprite.node;
        })

        this.sprite.node.parent = this.node;

        if(type) {
            let tween = new Tween();
            tween.target(this.sprite.node)
            .to(0.15, { scale: new Vec3(1.1, 1.1, 1.1) })
            .to(0.1, { scale: new Vec3(1, 1, 1) })
            .start();
        }
    }

    changeStyle() {
        if(this.number) {
            let i = Sqrt2(this.number);
            let contentSize = this.node.getComponent(UITransform).contentSize;
            this.sprite.spriteFrame = Data.style ? this._.lightGrid[i] :  this._.darkGrid[i];
            this.sprite.addComponent(UITransform).setContentSize(contentSize);
        }
    }

    delNumber() {
        if(this.label !== null) {
            this.label.node.removeFromParent();
            this.label = null;
        }

        if(this.sprite !== null) {
            this.sprite.node.removeFromParent();
            this.sprite = null;
        }

        this.number = null;
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
                    horizontal = -trans;
                    break;
                case 'right':
                    horizontal = trans;
                    break;
                case 'top':
                    vertical = trans;
                    break;
                case 'bottom':
                    vertical = -trans;
                    break;
                default:
                    break;
            }
    
            let tween = new Tween();
            tween.target(this.label.node)
            .by(0.15, { position: new Vec3(horizontal, vertical, 0) })
            .to(0.1, { position: new Vec3(0, 0, 0) })
            .call(() => this.animation = false)
            .start()

            resolve(true);
        })
    }
}

