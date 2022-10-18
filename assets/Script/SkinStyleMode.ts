import { _decorator, Component, Sprite, SpriteFrame } from 'cc';
import { ClassicModeGrid } from './ClassicModeGrid';
import Data from './ClickSwitchSpriteImage';
const { ccclass, property } = _decorator;

export const Queen: (SkinStyleMode | ClassicModeGrid)[] = [];

@ccclass('SkinStyleMode')
export class SkinStyleMode extends Component {
    @property({
        type: Sprite,
        tooltip: '精灵'
    })
    public sprite: Sprite = null
    
    @property({
        type: SpriteFrame,
        tooltip: '亮色皮肤'
    })
    private light: SpriteFrame = null

    @property({
        type: SpriteFrame,
        tooltip: '暗色皮肤'
    })
    private night: SpriteFrame = null

    onLoad() {
        if(this.sprite == null) this.sprite = this.node.getComponent(Sprite);
    }

    start() {
        Queen.push(this);
        this.changeStyle();
    }

    changeStyle() {
        this.sprite.spriteFrame = Data.style ? this.light : this.night;
    }
}

