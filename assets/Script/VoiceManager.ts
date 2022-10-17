import { _decorator, Component, director, AudioSource, AudioClip } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('VoiceManager')
export class VoiceManager extends Component {
    @property({
        type: AudioSource,
        tooltip: '音效管理'
    })
    private voice: AudioSource = null

    @property({
        type: AudioClip,
        tooltip: '点击音效'
    })
    private click: AudioClip

    @property({
        type: AudioClip,
        tooltip: '新增方块'
    })
    private show: AudioClip

    onLoad() {
        director.addPersistRootNode(this.node);

        if(this.voice == null) {
            this.voice = this.node.getComponent(AudioSource);
        }
    }

    playEffect(key: string = 'click') {
        this.voice.playOneShot(this[key])
    }
}

