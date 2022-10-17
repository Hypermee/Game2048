import { _decorator, Component, AudioSource, assert, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BackgroundMusicManager')
export class BackgroundMusicManager extends Component {
    @property({
        type: AudioSource,
        tooltip: '背景音乐'
    })
    private bgm: AudioSource = null

    onLoad() {
        director.addPersistRootNode(this.node);
        
        if(this.bgm == null) {
            this.bgm = this.node.getComponent(AudioSource);
        }
    }

    play() {
        this.bgm.play();
    }

    pause() {
        this.bgm.pause();
    }
}

