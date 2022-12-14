import { _decorator, Component, SpriteFrame, Sprite, CCString, Node, sys, find } from 'cc';
import { VoiceManager } from './VoiceManager';
import { Queen } from './SkinStyleMode';
const { ccclass, property } = _decorator;

const Data = {
    voice: true,
    music: true,
    style: true,
};

export default Data;

@ccclass('ClickSwitchSprite')
export class ClickSwitchSprite extends Component {
    @property({
        type: SpriteFrame,
        tooltip: '点击前的图标'
    })
    private beforeIcon: SpriteFrame = null

    @property({
        type: SpriteFrame,
        tooltip: '点击后的图标'
    })
    private afterIcon: SpriteFrame = null

    @property({
        tooltip: 'Key'
    })
    private key: string = ''

    onLoad() {
        const sprite = this.node.getComponent(Sprite);
        let voice: any = find("Voice").getComponent(VoiceManager);
        sprite.spriteFrame = Data[this.key] ? this.beforeIcon : this.afterIcon;

        this.node.on(Node.EventType.TOUCH_END, () => {
            sprite.spriteFrame = Data[this.key] ? this.afterIcon : this.beforeIcon;
            sys.localStorage.setItem(this.key, !Data[this.key] ? '1' : '0');
            Data[this.key] = !Data[this.key];

            if(Data.voice) voice.playEffect();
            
            if(this.key == 'music') {
                let bgm: any = find("BackgroundMusic").getComponent("BackgroundMusicManager");
                !Data[this.key] ? bgm.pause() : bgm.play();
            }

            if(this.key == 'style') {
                for(let i = 0;i < Queen.length;i++) {
                    if(!Queen[i].sprite) {
                        Queen.splice(i, 1);
                        i--;
                        continue;
                    }
                    
                    Queen[i].changeStyle();
                }
            }
        })
    }
}

