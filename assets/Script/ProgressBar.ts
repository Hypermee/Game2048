import Data from './ClickSwitchSpriteImage';
import { _decorator, director, find, sys, Component, Label, ProgressBar as Progress } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ProgressBar')
export class ProgressBar extends Component {
    @property({
        type: Progress,
        tooltip: '进度条'
    })
    private progressBar: Progress = null

    @property({
        type: Label,
        tooltip: '当前进度'
    })
    private text: Label = null

    private progress: number = 0

    onLoad() {
        let voice = !(sys.localStorage.getItem('voice') === '0');
        let music = !(sys.localStorage.getItem('music') === '0');

        Data.voice = voice;
        Data.music = music;
    }

    start() {
        if(this.text == null) {
            this.text = this.node.getComponentInChildren(Label);
        }

        if(this.progressBar == null) {
            this.progressBar = this.node.getComponent(Progress);
        }

        this.text.string = "0%";
        this.progressBar.progress = 0;

        director.preloadScene("Main", (completedCount : number, totalCount : number) => {
            this.progress = (completedCount / totalCount) * 0.5;
        }, () => {
            director.preloadScene("Classic", (completedCount : number, totalCount : number) => {
                this.progress = 0.5 + (completedCount / totalCount) * 0.5;
            }, () => { })
        })
    }

    update(deltaTime: number) {
        if(this.progressBar.progress < this.progress) {
            this.progressBar.progress += deltaTime * this.progress;
            this.progressBar.progress >= this.progress && (this.progressBar.progress = this.progress);

            this.text.string = Math.floor(this.progressBar.progress * 100) + "%";
        }

        if(this.progressBar.progress === 1) {
            director.loadScene("Main", () => {
                let bgm: any = find("BackgroundMusic").getComponent("BackgroundMusicManager");
                Data.music && bgm.play();
            });
        }
    }
}

