import Data from './ClickSwitchSpriteImage';
import { _decorator, math, Component, Animation, AnimationComponent, Node, Prefab, UIOpacity, resources, find, instantiate, director, Tween } from 'cc';
const { ccclass, property } = _decorator;
const { Vec3 } = math;

@ccclass('MainSceneEventManager')
export class MainSceneEventManager extends Component {
    @property({
        type: Node,
        tooltip: 'Main场景'
    })
    private Main: Node = null

    private _alert: Node = null


    onLoad() {
        if(this.Main === null) this.Main = this.node;
    }

    start() {
        this.Main.getChildByName("ClassicMode").once(Node.EventType.TOUCH_END, () => {
            if(this._alert !== null) return;
            
            if(Data.voice) (find("Voice").getComponent("VoiceManager") as any).playEffect();

            let tween = new Tween();
            tween.target(this.Main.getComponent(UIOpacity))
            .to(0.1, { opacity: 0 })
            .call(() => director.loadScene("Classic"))
            .start();

        })

        this.Main.getChildByName("Setting").on(Node.EventType.TOUCH_END, () => {
            if(this._alert !== null) return;

            if(Data.voice) (find("Voice").getComponent("VoiceManager") as any).playEffect();

            this._alert = new Node();
            resources.load("prefab/SettingAlert", Prefab, (error, prefab) => {
                if(error) return;

                this._alert = instantiate(prefab);
                director.getScene().addChild(this._alert);
                this._alert.parent = this.Main;

                let close = this._alert.getChildByName("Close");
                close.on(Node.EventType.TOUCH_END, () => {
                    if(Data.voice) (find("Voice").getComponent("VoiceManager") as any).playEffect();

                    if(this._alert === null) return;

                    (this._alert.getComponent("AlertManager") as any).close(() => {
                        this._alert.removeFromParent();
                        this._alert = null;
                    })
                })
            })
        })
    }
}

