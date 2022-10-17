import { _decorator, math, Tween, Component, Node } from 'cc';
const { ccclass, property } = _decorator;
const { Vec3 } = math;

@ccclass('SettingAlertManager')
export class SettingAlertManager extends Component {
    onLoad() {
        this.node.scale = new Vec3(0, 0, 0);
    }

    start() {
        let tween = new Tween();

        tween.target(this.node)
        .to(0.15, { scale: new Vec3(0.9, 0.9, 0.9) })
        .by(0.1, { scale: new Vec3(-0.1, -0.1, -0.1) })
        .start()
    }

    close(callback: Function) {
        let tween = new Tween();

        tween.target(this.node)
        .to(0.15, { scale: new Vec3(0, 0, 0) })
        .call(callback)
        .start()
    }
}

